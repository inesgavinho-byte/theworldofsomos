import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { log } from "@/lib/audit";

type TipoExercicio = "escolha_multipla" | "escolha_unica" | "verdadeiro_falso";

const TIPOS_VALIDOS: TipoExercicio[] = [
  "escolha_multipla",
  "escolha_unica",
  "verdadeiro_falso",
];

interface ConteudoMultipla {
  pergunta: string;
  opcoes: string[];
  resposta_correcta: number;
  explicacao?: string;
}

interface ConteudoVF {
  pergunta: string;
  resposta_correcta: boolean;
  explicacao?: string;
}

function validarConteudo(
  tipo: TipoExercicio,
  body: Record<string, unknown>
): { ok: true; conteudo: ConteudoMultipla | ConteudoVF } | { ok: false; erro: string } {
  const pergunta = typeof body.pergunta === "string" ? body.pergunta.trim() : "";
  if (!pergunta) {
    return { ok: false, erro: "A pergunta é obrigatória." };
  }

  const explicacao =
    typeof body.explicacao === "string" && body.explicacao.trim()
      ? body.explicacao.trim()
      : undefined;

  if (tipo === "verdadeiro_falso") {
    if (typeof body.resposta_correcta !== "boolean") {
      return {
        ok: false,
        erro: "A resposta correcta tem de ser verdadeiro ou falso.",
      };
    }
    return {
      ok: true,
      conteudo: {
        pergunta,
        resposta_correcta: body.resposta_correcta,
        ...(explicacao ? { explicacao } : {}),
      },
    };
  }

  // escolha_multipla | escolha_unica
  const opcoesRaw = Array.isArray(body.opcoes) ? body.opcoes : [];
  const opcoes = opcoesRaw
    .map((o) => (typeof o === "string" ? o.trim() : ""))
    .filter((o) => o.length > 0);

  if (opcoes.length < 2) {
    return { ok: false, erro: "São necessárias pelo menos 2 opções." };
  }

  const resposta = Number(body.resposta_correcta);
  if (
    !Number.isInteger(resposta) ||
    resposta < 0 ||
    resposta >= opcoes.length
  ) {
    return { ok: false, erro: "A resposta correcta é inválida." };
  }

  return {
    ok: true,
    conteudo: {
      pergunta,
      opcoes,
      resposta_correcta: resposta,
      ...(explicacao ? { explicacao } : {}),
    },
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ erro: auth.erro }, { status: auth.status });
  }

  const admin = createAdminClient();

  const { data: licao, error: licaoErr } = await admin
    .from("licoes")
    .select("id, titulo")
    .eq("id", params.id)
    .single();

  if (licaoErr || !licao) {
    return NextResponse.json({ erro: "Lição não encontrada." }, { status: 404 });
  }

  const { data, error } = await admin
    .from("exercicios")
    .select("id, licao_id, tipo, conteudo, dificuldade, ordem, idioma, tipo_conteudo")
    .eq("licao_id", params.id)
    .order("ordem", { ascending: true });

  if (error) {
    return NextResponse.json(
      { erro: "Não foi possível carregar os exercícios." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    licao: { id: licao.id, titulo: licao.titulo },
    exercicios: data ?? [],
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ erro: auth.erro }, { status: auth.status });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  const tipo = body.tipo as TipoExercicio;
  if (!TIPOS_VALIDOS.includes(tipo)) {
    return NextResponse.json(
      { erro: "Tipo de exercício não suportado." },
      { status: 400 }
    );
  }

  const validacao = validarConteudo(tipo, body);
  if (!validacao.ok) {
    return NextResponse.json({ erro: validacao.erro }, { status: 400 });
  }

  const dificuldadeRaw = Number(body.dificuldade);
  const dificuldade =
    Number.isInteger(dificuldadeRaw) && dificuldadeRaw >= 1 && dificuldadeRaw <= 5
      ? dificuldadeRaw
      : 1;

  const admin = createAdminClient();

  const { data: licao, error: licaoErr } = await admin
    .from("licoes")
    .select("id, titulo, tipo")
    .eq("id", params.id)
    .single();

  if (licaoErr || !licao) {
    return NextResponse.json({ erro: "Lição não encontrada." }, { status: 404 });
  }

  let ordem: number;
  if (Number.isInteger(Number(body.ordem))) {
    ordem = Number(body.ordem);
  } else {
    const { data: max } = await admin
      .from("exercicios")
      .select("ordem")
      .eq("licao_id", params.id)
      .order("ordem", { ascending: false })
      .limit(1)
      .maybeSingle();
    ordem = (max?.ordem ?? -1) + 1;
  }

  const tipoConteudo = licao.tipo === "universal" ? "universal" : "curricular";

  const { data: inserido, error: insertErr } = await admin
    .from("exercicios")
    .insert({
      licao_id: params.id,
      tipo,
      conteudo: validacao.conteudo,
      dificuldade,
      ordem,
      idioma: "pt-PT",
      tipo_conteudo: tipoConteudo,
    })
    .select("id, licao_id, tipo, conteudo, dificuldade, ordem, idioma, tipo_conteudo")
    .single();

  if (insertErr || !inserido) {
    return NextResponse.json(
      { erro: "Não foi possível criar o exercício." },
      { status: 500 }
    );
  }

  await log({
    userId: auth.userId,
    action: "exercicio.criado",
    entityType: "exercicio",
    entityId: inserido.id,
    metadata: {
      licao_id: params.id,
      licao_titulo: licao.titulo,
      tipo,
      ordem,
    },
    request,
  });

  return NextResponse.json({ exercicio: inserido }, { status: 201 });
}
