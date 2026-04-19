import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { log } from "@/lib/audit";
import { assegurarAcessoCrianca } from "@/lib/diagnostico/access";

export async function POST(req: Request): Promise<NextResponse> {
  const body = await req.json().catch(() => ({}));
  const diagnosticoId =
    typeof body.diagnostico_id === "string" ? body.diagnostico_id : null;
  const abandonado = body.abandonado === true;

  if (!diagnosticoId) {
    return NextResponse.json(
      { erro: "diagnostico_id obrigatório." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: diagnostico } = await admin
    .from("diagnosticos")
    .select("id, crianca_id, estado")
    .eq("id", diagnosticoId)
    .maybeSingle();
  if (!diagnostico) {
    return NextResponse.json({ erro: "Diagnóstico não encontrado." }, { status: 404 });
  }

  const acesso = await assegurarAcessoCrianca(diagnostico.crianca_id);
  if (!acesso.ok) return acesso.response;

  // Recalcula nível para todas as competências tocadas neste diagnóstico.
  const { data: tocadas } = await admin
    .from("sessoes_diagnostico")
    .select("competencia_id")
    .eq("diagnostico_id", diagnosticoId);

  const competenciaIds = Array.from(
    new Set((tocadas ?? []).map((r) => r.competencia_id).filter(Boolean)),
  ) as string[];

  for (const compId of competenciaIds) {
    await admin.rpc("calcular_nivel_competencia", {
      p_crianca_id: diagnostico.crianca_id,
      p_competencia_id: compId,
    });
  }

  const novoEstado = abandonado ? "abandonado" : "concluido";

  await admin
    .from("diagnosticos")
    .update({
      estado: novoEstado,
      concluido_em: new Date().toISOString(),
      competencias_avaliadas: competenciaIds.length,
    })
    .eq("id", diagnosticoId);

  await log({
    userId: acesso.data.userId,
    action: abandonado ? "diagnostico.abandonado" : "diagnostico.concluido",
    entityType: "diagnostico",
    entityId: diagnosticoId,
    metadata: {
      crianca_id: diagnostico.crianca_id,
      competencias_avaliadas: competenciaIds.length,
    },
    request: req,
  });

  return NextResponse.json({
    ok: true,
    competencias_avaliadas: competenciaIds.length,
  });
}
