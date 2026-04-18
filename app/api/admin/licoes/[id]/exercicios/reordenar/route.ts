import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { log } from "@/lib/audit";

interface ItemReordem {
  id: string;
  ordem: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ erro: auth.erro }, { status: auth.status });
  }

  let body: { exercicios?: ItemReordem[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  const itens = Array.isArray(body.exercicios) ? body.exercicios : [];
  if (itens.length === 0) {
    return NextResponse.json(
      { erro: "Nenhum exercício para reordenar." },
      { status: 400 }
    );
  }

  for (const item of itens) {
    if (
      !item ||
      typeof item.id !== "string" ||
      !Number.isInteger(item.ordem)
    ) {
      return NextResponse.json({ erro: "Formato inválido." }, { status: 400 });
    }
  }

  const admin = createAdminClient();

  const ids = itens.map((i) => i.id);
  const { data: existentes, error: selErr } = await admin
    .from("exercicios")
    .select("id, licao_id")
    .in("id", ids);

  if (selErr || !existentes) {
    return NextResponse.json(
      { erro: "Não foi possível verificar os exercícios." },
      { status: 500 }
    );
  }

  if (existentes.length !== itens.length) {
    return NextResponse.json(
      { erro: "Um ou mais exercícios não existem." },
      { status: 404 }
    );
  }

  const forasDaLicao = existentes.filter((e) => e.licao_id !== params.id);
  if (forasDaLicao.length > 0) {
    return NextResponse.json(
      { erro: "Um ou mais exercícios não pertencem a esta lição." },
      { status: 400 }
    );
  }

  // Passo 1 — empurrar para valores temporários (evita colisões se houver unique).
  // Passo 2 — escrever valores finais.
  for (let i = 0; i < itens.length; i++) {
    const { error } = await admin
      .from("exercicios")
      .update({ ordem: 1000000 + i })
      .eq("id", itens[i].id);
    if (error) {
      return NextResponse.json(
        { erro: "Não foi possível reordenar." },
        { status: 500 }
      );
    }
  }

  for (const item of itens) {
    const { error } = await admin
      .from("exercicios")
      .update({ ordem: item.ordem })
      .eq("id", item.id);
    if (error) {
      return NextResponse.json(
        { erro: "Não foi possível reordenar." },
        { status: 500 }
      );
    }
  }

  await log({
    userId: auth.userId,
    action: "exercicio.reordenado",
    entityType: "licao",
    entityId: params.id,
    metadata: {
      licao_id: params.id,
      total: itens.length,
      ordem: itens.map((i) => ({ id: i.id, ordem: i.ordem })),
    },
    request,
  });

  return NextResponse.json({ ok: true });
}
