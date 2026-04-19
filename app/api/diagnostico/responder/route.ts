import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { log } from "@/lib/audit";
import { assegurarAcessoCrianca } from "@/lib/diagnostico/access";
import { carregarExercicio } from "@/lib/diagnostico/server";

export async function POST(req: Request): Promise<NextResponse> {
  const body = await req.json().catch(() => ({}));
  const {
    diagnostico_id,
    exercicio_id,
    resposta,
    tempo_ms,
  }: {
    diagnostico_id?: string;
    exercicio_id?: string;
    resposta?: number;
    tempo_ms?: number;
  } = body;

  if (!diagnostico_id || !exercicio_id || typeof resposta !== "number") {
    return NextResponse.json(
      { erro: "diagnostico_id, exercicio_id e resposta (number) são obrigatórios." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: diagnostico } = await admin
    .from("diagnosticos")
    .select("id, crianca_id, estado")
    .eq("id", diagnostico_id)
    .maybeSingle();

  if (!diagnostico) {
    return NextResponse.json({ erro: "Diagnóstico não encontrado." }, { status: 404 });
  }

  const acesso = await assegurarAcessoCrianca(diagnostico.crianca_id);
  if (!acesso.ok) return acesso.response;

  if (diagnostico.estado !== "em_curso") {
    return NextResponse.json(
      { erro: "Este diagnóstico já não está em curso." },
      { status: 409 },
    );
  }

  const exercicio = await carregarExercicio(exercicio_id);
  if (!exercicio) {
    return NextResponse.json({ erro: "Exercício não encontrado." }, { status: 404 });
  }

  const correcto = resposta === exercicio.resposta_correcta;
  const tempoNorm =
    typeof tempo_ms === "number" && isFinite(tempo_ms)
      ? Math.max(0, Math.floor(tempo_ms))
      : null;

  const { error: insertErr } = await admin.from("sessoes_diagnostico").insert({
    diagnostico_id,
    crianca_id: diagnostico.crianca_id,
    competencia_id: exercicio.competencia_id,
    exercicio_id: exercicio.id,
    correcto,
    tempo_ms: tempoNorm,
    dificuldade: exercicio.dificuldade,
  });

  if (insertErr) {
    return NextResponse.json(
      { erro: "Não conseguimos guardar esta resposta." },
      { status: 500 },
    );
  }

  // Recalcula nível (silencioso — a criança nunca vê).
  await admin.rpc("calcular_nivel_competencia", {
    p_crianca_id: diagnostico.crianca_id,
    p_competencia_id: exercicio.competencia_id,
  });

  await log({
    userId: acesso.data.userId,
    action: "diagnostico.exercicio_respondido",
    entityType: "diagnostico",
    entityId: diagnostico_id,
    metadata: {
      crianca_id: diagnostico.crianca_id,
      competencia_id: exercicio.competencia_id,
      exercicio_id: exercicio.id,
      correcto,
      dificuldade: exercicio.dificuldade,
      tempo_ms: tempoNorm,
    },
    request: req,
  });

  return NextResponse.json({ ok: true });
}
