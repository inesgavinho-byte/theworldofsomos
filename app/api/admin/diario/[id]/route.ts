import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { log } from "@/lib/audit";
import {
  isAutorDiario,
  isTipoDiario,
  normalizeReferencias,
  normalizeTags,
} from "@/lib/diario";
import { assertAdmin } from "../_auth";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await assertAdmin();
  if (!auth.ok) {
    return NextResponse.json({ erro: auth.erro }, { status: auth.status });
  }
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ erro: "Identificador inválido." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("diario_desenvolvimento")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ erro: "Entrada não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ entrada: data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await assertAdmin();
  if (!auth.ok) {
    return NextResponse.json({ erro: auth.erro }, { status: auth.status });
  }
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ erro: "Identificador inválido." }, { status: 400 });
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
  const autor = isAutorDiario(payload.autor) ? payload.autor : null;

  if (!isTipoDiario(tipo)) {
    return NextResponse.json({ erro: "Tipo inválido." }, { status: 400 });
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
  if (!autor) {
    return NextResponse.json({ erro: "Autor inválido." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: existente } = await admin
    .from("diario_desenvolvimento")
    .select("id")
    .eq("id", params.id)
    .single();

  if (!existente) {
    return NextResponse.json({ erro: "Entrada não encontrada." }, { status: 404 });
  }

  const { data, error } = await admin
    .from("diario_desenvolvimento")
    .update({
      tipo,
      titulo,
      contexto,
      conteudo,
      implicacoes,
      referencias,
      tags,
      autor,
    })
    .eq("id", params.id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { erro: "Não foi possível guardar a entrada." },
      { status: 500 },
    );
  }

  await log({
    userId: auth.userId,
    action: "diario.editada",
    entityType: "diario_desenvolvimento",
    entityId: data.id,
    metadata: { tipo: data.tipo, autor: data.autor, titulo: data.titulo },
    request,
  });

  return NextResponse.json({ entrada: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await assertAdmin();
  if (!auth.ok) {
    return NextResponse.json({ erro: auth.erro }, { status: auth.status });
  }
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ erro: "Identificador inválido." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: existente } = await admin
    .from("diario_desenvolvimento")
    .select("id, tipo, titulo, autor")
    .eq("id", params.id)
    .single();

  if (!existente) {
    return NextResponse.json({ erro: "Entrada não encontrada." }, { status: 404 });
  }

  const { error } = await admin
    .from("diario_desenvolvimento")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json(
      { erro: "Não foi possível apagar a entrada." },
      { status: 500 },
    );
  }

  await log({
    userId: auth.userId,
    action: "diario.apagada",
    entityType: "diario_desenvolvimento",
    entityId: existente.id,
    metadata: {
      tipo: existente.tipo,
      autor: existente.autor,
      titulo: existente.titulo,
    },
    request,
  });

  return NextResponse.json({ ok: true });
}
