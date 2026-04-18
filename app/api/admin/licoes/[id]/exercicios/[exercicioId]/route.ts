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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; exercicioId: string } }
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

  const { data: existente, error: selErr } = await admin
    .from("exercicios")
    .select("id, licao_id, ordem, tipo")
    .eq("id", params.exercicioId)
    .single();

  if (selErr || !existente) {
    return NextResponse.json({ erro: "Exercício não encontrado." }, { status: 404 });
  }

  if (existente.licao_id !== params.id) {
    return NextResponse.json(
      { erro: "Este exercício não pertence a esta lição." },
      { status: 400 }
    );
  }

  const ordem =
    Number.isInteger(Number(body.ordem)) ? Number(body.ordem) : existente.ordem;

  const { data: actualizado, error: updErr } = await admin
    .from("exercicios")
    .update({
      tipo,
      conteudo: validacao.conteudo,
      dificuldade,
      ordem,
    })
    .eq("id", params.exercicioId)
    .select("id, licao_id, tipo, conteudo, dificuldade, ordem, idioma, tipo_conteudo")
    .single();

  if (updErr || !actualizado) {
    return NextResponse.json(
      { erro: "Não foi possível actualizar o exercício." },
      { status: 500 }
    );
  }

  await log({
    userId: auth.userId,
    action: "exercicio.editado",
    entityType: "exercicio",
    entityId: params.exercicioId,
    metadata: {
      licao_id: params.id,
      tipo_anterior: existente.tipo,
      tipo_novo: tipo,
    },
    request,
  });

  return NextResponse.json({ exercicio: actualizado });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; exercicioId: string } }
) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ erro: auth.erro }, { status: auth.status });
  }

  const admin = createAdminClient();

  const { data: existente, error: selErr } = await admin
    .from("exercicios")
    .select("id, licao_id, tipo, ordem")
    .eq("id", params.exercicioId)
    .single();

  if (selErr || !existente) {
    return NextResponse.json({ erro: "Exercício não encontrado." }, { status: 404 });
  }

  if (existente.licao_id !== params.id) {
    return NextResponse.json(
      { erro: "Este exercício não pertence a esta lição." },
      { status: 400 }
    );
  }

  const { error: delErr } = await admin
    .from("exercicios")
    .delete()
    .eq("id", params.exercicioId);

  if (delErr) {
    return NextResponse.json(
      { erro: "Não foi possível apagar o exercício." },
      { status: 500 }
    );
  }

  await log({
    userId: auth.userId,
    action: "exercicio.apagado",
    entityType: "exercicio",
    entityId: params.exercicioId,
    metadata: {
      licao_id: params.id,
      tipo: existente.tipo,
      ordem: existente.ordem,
    },
    request,
  });

  return NextResponse.json({ ok: true });
}
