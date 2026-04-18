import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { log } from "@/lib/audit";

const DIMENSOES_VALIDAS = new Set([
  "Identitária",
  "Social",
  "Lógica",
  "Narrativa",
  "Naturalista",
  "Artística",
]);

const CURRICULOS_VALIDOS = new Set(["PT", "BNCC", "Cambridge", "IB", "FR"]);
const TIPOS_VALIDOS = new Set(["universal", "curricular"]);
const ESTADOS_VALIDOS = new Set(["rascunho", "publicada"]);

function campoAlterado(
  atual: unknown,
  novo: unknown
): boolean {
  return JSON.stringify(atual ?? null) !== JSON.stringify(novo ?? null);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ erro: "Sessão expirada." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo, roles")
    .eq("id", user.id)
    .single();

  const isAdmin =
    (Array.isArray(profile?.roles) && profile.roles.includes("admin")) ||
    profile?.tipo === "admin";

  if (!isAdmin) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get("somos-context")?.value;
  let activeRole: string | null = null;
  if (raw) {
    try {
      activeRole = JSON.parse(raw)?.activeRole ?? null;
    } catch {
      activeRole = null;
    }
  }

  if (activeRole !== "admin") {
    return NextResponse.json(
      { erro: "Acção disponível apenas no contexto de administração." },
      { status: 403 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: actual, error: selectError } = await admin
    .from("licoes")
    .select(
      "id, titulo, subtitulo, narrativa, descricao, dimensao, cor, tipo, curriculo, ordem, duracao_min, idade_min, idade_max, estado, conteudo, reflexao, momento, perguntas_porta"
    )
    .eq("id", id)
    .single();

  if (selectError || !actual) {
    return NextResponse.json({ erro: "Lição não encontrada." }, { status: 404 });
  }

  // Validação de obrigatórios
  const titulo = typeof body.titulo === "string" ? body.titulo.trim() : "";
  const dimensao = typeof body.dimensao === "string" ? body.dimensao.trim() : "";
  const tipo = typeof body.tipo === "string" ? body.tipo.trim() : "";
  const estado = typeof body.estado === "string" ? body.estado.trim() : "";
  const cor = typeof body.cor === "string" ? body.cor.trim() : "";

  if (!titulo) {
    return NextResponse.json({ erro: "O título é obrigatório." }, { status: 400 });
  }
  if (!DIMENSOES_VALIDAS.has(dimensao)) {
    return NextResponse.json(
      { erro: "Dimensão inválida." },
      { status: 400 }
    );
  }
  if (!TIPOS_VALIDOS.has(tipo)) {
    return NextResponse.json({ erro: "Tipo inválido." }, { status: 400 });
  }
  if (!ESTADOS_VALIDOS.has(estado)) {
    return NextResponse.json({ erro: "Estado inválido." }, { status: 400 });
  }
  if (!cor) {
    return NextResponse.json({ erro: "A cor é obrigatória." }, { status: 400 });
  }

  const curriculoRaw = body.curriculo;
  let curriculo: string | null = null;
  if (curriculoRaw !== null && curriculoRaw !== undefined && curriculoRaw !== "") {
    if (typeof curriculoRaw !== "string" || !CURRICULOS_VALIDOS.has(curriculoRaw)) {
      return NextResponse.json({ erro: "Currículo inválido." }, { status: 400 });
    }
    curriculo = curriculoRaw;
  }

  if (tipo === "curricular" && !curriculo) {
    return NextResponse.json(
      { erro: "Lições curriculares exigem um currículo." },
      { status: 400 }
    );
  }

  const asIntOrNull = (v: unknown): number | null => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : parseInt(String(v), 10);
    return Number.isFinite(n) ? n : null;
  };

  const ordem = asIntOrNull(body.ordem);
  if (ordem === null) {
    return NextResponse.json({ erro: "Ordem inválida." }, { status: 400 });
  }

  const duracao_min = asIntOrNull(body.duracao_min);
  const idade_min = asIntOrNull(body.idade_min);
  const idade_max = asIntOrNull(body.idade_max);

  const asTextOrNull = (v: unknown): string | null => {
    if (typeof v !== "string") return null;
    const t = v.trim();
    return t === "" ? null : t;
  };

  const subtitulo = asTextOrNull(body.subtitulo);
  const narrativa = asTextOrNull(body.narrativa);
  const descricao = asTextOrNull(body.descricao);

  // JSONB — deixamos passar o que vier, mas aceitamos null para limpar.
  const jsonOrNull = (v: unknown): unknown => {
    if (v === null || v === undefined) return null;
    return v;
  };

  const conteudo = jsonOrNull(body.conteudo);
  const reflexao = jsonOrNull(body.reflexao);
  const momento = jsonOrNull(body.momento);
  const perguntas_porta = jsonOrNull(body.perguntas_porta);

  const update = {
    titulo,
    subtitulo,
    narrativa,
    descricao,
    dimensao,
    cor,
    tipo,
    curriculo,
    ordem,
    duracao_min,
    idade_min,
    idade_max,
    estado,
    conteudo,
    reflexao,
    momento,
    perguntas_porta,
    updated_at: new Date().toISOString(),
  };

  const campos_alterados: string[] = [];
  for (const [chave, valor] of Object.entries(update)) {
    if (chave === "updated_at") continue;
    const anterior = (actual as Record<string, unknown>)[chave];
    if (campoAlterado(anterior, valor)) {
      campos_alterados.push(chave);
    }
  }

  const { error: updateError } = await admin
    .from("licoes")
    .update(update)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { erro: "Não foi possível guardar as alterações." },
      { status: 500 }
    );
  }

  if (campos_alterados.length > 0) {
    await log({
      userId: user.id,
      action: "licao.editada",
      entityType: "licao",
      entityId: id,
      metadata: {
        licao_id: id,
        titulo,
        campos_alterados,
      },
      request,
    });
  }

  return NextResponse.json({ ok: true, campos_alterados });
}
