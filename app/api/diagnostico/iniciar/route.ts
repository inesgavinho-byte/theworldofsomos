import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { log } from "@/lib/audit";
import { assegurarAcessoCrianca } from "@/lib/diagnostico/access";
import {
  competenciasPrioritarias,
  selecionarExerciciosParaDiagnostico,
} from "@/lib/diagnostico/server";

export async function POST(req: Request): Promise<NextResponse> {
  const body = await req.json().catch(() => ({}));
  const criancaIdPedido = typeof body.crianca_id === "string" ? body.crianca_id : null;

  const acesso = await assegurarAcessoCrianca(criancaIdPedido);
  if (!acesso.ok) return acesso.response;

  const { userId, criancaId, curriculo, anoEscolar } = acesso.data;
  const admin = createAdminClient();

  // Se já houver diagnóstico em curso, reaproveita-o.
  const { data: emCurso } = await admin
    .from("diagnosticos")
    .select("id, tipo")
    .eq("crianca_id", criancaId)
    .eq("estado", "em_curso")
    .maybeSingle();

  let diagnosticoId: string;
  if (emCurso?.id) {
    diagnosticoId = emCurso.id;
  } else {
    const { data, error } = await admin
      .from("diagnosticos")
      .insert({
        crianca_id: criancaId,
        curriculo,
        ano_escolar: anoEscolar,
        tipo: "inicial",
        estado: "em_curso",
      })
      .select("id")
      .single();
    if (error || !data) {
      return NextResponse.json(
        { erro: "Não foi possível iniciar o diagnóstico." },
        { status: 500 },
      );
    }
    diagnosticoId = data.id;
  }

  const competencias = await competenciasPrioritarias(criancaId, curriculo, anoEscolar);
  const { exercicios, competencias_sem_exercicios } =
    await selecionarExerciciosParaDiagnostico(competencias, 12);

  await log({
    userId,
    action: "diagnostico.iniciado",
    entityType: "diagnostico",
    entityId: diagnosticoId,
    metadata: {
      crianca_id: criancaId,
      curriculo,
      ano_escolar: anoEscolar,
      competencias_candidatas: competencias.length,
      exercicios_servidos: exercicios.length,
      competencias_sem_exercicios: competencias_sem_exercicios.length,
    },
    request: req,
  });

  return NextResponse.json({
    ok: true,
    diagnostico_id: diagnosticoId,
    curriculo,
    ano_escolar: anoEscolar,
    competencias_disponiveis: competencias.length,
    exercicios: exercicios.map((e) => ({
      id: e.id,
      competencia_id: e.competencia_id,
      codigo_oficial: e.codigo_oficial,
      area: e.area,
      dominio: e.dominio,
      dificuldade: e.dificuldade,
      pergunta: e.pergunta,
      opcoes: e.opcoes,
    })),
  });
}
