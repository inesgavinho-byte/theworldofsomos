import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { log } from "@/lib/audit";
import {
  isAutorDiario,
  isTipoDiario,
  normalizeReferencias,
  normalizeTags,
} from "@/lib/diario";
import { assertAdmin } from "./_auth";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  const auth = await assertAdmin();
  if (!auth.ok) {
    return NextResponse.json({ erro: auth.erro }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);

  const tipos = searchParams.getAll("tipo").filter(isTipoDiario);
  const autores = searchParams.getAll("autor").filter(isAutorDiario);
  const tags = searchParams
    .getAll("tag")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const q = (searchParams.get("q") ?? "").trim();

  const limitRaw = Number.parseInt(searchParams.get("limit") ?? "", 10);
  const offsetRaw = Number.parseInt(searchParams.get("offset") ?? "", 10);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;
  const offset = Number.isFinite(offsetRaw) && offsetRaw > 0 ? offsetRaw : 0;

  const admin = createAdminClient();

  let query = admin
    .from("diario_desenvolvimento")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (tipos.length) query = query.in("tipo", tipos);
  if (autores.length) query = query.in("autor", autores);
  if (tags.length) query = query.contains("tags", tags);
  if (q) {
    const escaped = q.replace(/[\\%_,()]/g, (m) => `\\${m}`);
    const pattern = `%${escaped}%`;
    query = query.or(
      [
        `titulo.ilike.${pattern}`,
        `contexto.ilike.${pattern}`,
        `conteudo.ilike.${pattern}`,
        `implicacoes.ilike.${pattern}`,
      ].join(","),
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { erro: "Não foi possível carregar o diário." },
      { status: 500 },
    );
  }

  const { data: todas } = await admin
    .from("diario_desenvolvimento")
    .select("tags");

  const tagsSet = new Set<string>();
  for (const row of todas ?? []) {
    const lista = Array.isArray(row.tags) ? (row.tags as unknown[]) : [];
    for (const t of lista) {
      if (typeof t === "string" && t.trim()) tagsSet.add(t.trim());
    }
  }

  return NextResponse.json({
    entradas: data ?? [],
    total: count ?? 0,
    limit,
    offset,
    tagsDisponiveis: Array.from(tagsSet).sort(),
  });
}

export async function POST(request: NextRequest) {
  const auth = await assertAdmin();
  if (!auth.ok) {
    return NextResponse.json({ erro: auth.erro }, { status: auth.status });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  const tipo = payload.tipo;
  const titulo = typeof payload.titulo === "string" ? payload.titulo.trim() : "";
  const conteudo =
    typeof payload.conteudo === "string" ? payload.conteudo.trim() : "";
  const contexto =
    typeof payload.contexto === "string" && payload.contexto.trim()
      ? payload.contexto.trim()
      : null;
  const implicacoes =
    typeof payload.implicacoes === "string" && payload.implicacoes.trim()
      ? payload.implicacoes.trim()
      : null;
  const referencias = normalizeReferencias(payload.referencias);
  const tags = normalizeTags(payload.tags);
  const autor = isAutorDiario(payload.autor) ? payload.autor : "ines";

  if (!isTipoDiario(tipo)) {
    return NextResponse.json(
      { erro: "Tipo inválido." },
      { status: 400 },
    );
  }
  if (!titulo) {
    return NextResponse.json(
      { erro: "Título é obrigatório." },
      { status: 400 },
    );
  }
  if (!conteudo) {
    return NextResponse.json(
      { erro: "Conteúdo é obrigatório." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("diario_desenvolvimento")
    .insert({
      tipo,
      titulo,
      contexto,
      conteudo,
      implicacoes,
      referencias,
      tags,
      autor,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { erro: "Não foi possível criar a entrada." },
      { status: 500 },
    );
  }

  await log({
    userId: auth.userId,
    action: "diario.criada",
    entityType: "diario_desenvolvimento",
    entityId: data.id,
    metadata: { tipo: data.tipo, autor: data.autor, titulo: data.titulo },
    request,
  });

  return NextResponse.json({ entrada: data }, { status: 201 });
}
