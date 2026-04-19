import { NextResponse } from "next/server";
import { autenticarCrianca } from "@/lib/licao/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { log } from "@/lib/audit";

export async function POST(req: Request): Promise<NextResponse> {
  const auth = await autenticarCrianca();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => ({}));
  const {
    licao_id,
    exercicio_id,
    slug,
    titulo,
    resposta,
    correcto,
    tempo_ms,
  }: {
    licao_id?: string;
    exercicio_id?: string;
    slug?: string;
    titulo?: string;
    resposta?: unknown;
    correcto?: boolean;
    tempo_ms?: number;
  } = body;

  if (!licao_id || !exercicio_id || typeof correcto !== "boolean") {
    return NextResponse.json(
      { erro: "licao_id, exercicio_id e correcto obrigatórios" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: sessao, error } = await admin
    .from("sessoes")
    .insert({
      crianca_id: auth.data.criancaId,
      licao_id,
      exercicio_id,
      slug_licao: slug ?? null,
      titulo_licao: titulo ?? null,
      tipo: "exercicio",
      resposta: resposta ?? null,
      correcto,
      tempo_ms: typeof tempo_ms === "number" ? Math.max(0, Math.floor(tempo_ms)) : null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[licao/responder] insert falhou:", error);
    return NextResponse.json({ erro: "Erro ao guardar resposta" }, { status: 500 });
  }

  await log({
    userId: auth.data.userId,
    action: "licao.exercicio_respondido",
    entityType: "licao",
    entityId: licao_id,
    metadata: {
      crianca_id: auth.data.criancaId,
      exercicio_id,
      correcto,
      tempo_ms: tempo_ms ?? null,
    },
    request: req,
  });

  return NextResponse.json({ ok: true, sessao_id: sessao.id });
}
