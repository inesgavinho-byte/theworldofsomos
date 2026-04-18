import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assegurarAcessoCrianca } from "@/lib/diagnostico/access";

export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const criancaIdParam = url.searchParams.get("crianca_id");
  const acesso = await assegurarAcessoCrianca(criancaIdParam);
  if (!acesso.ok) return acesso.response;

  const { criancaId, curriculo, anoEscolar } = acesso.data;
  const admin = createAdminClient();

  const [{ data: competencias }, { data: progresso }, { data: diagnosticos }] =
    await Promise.all([
      admin
        .from("competencias")
        .select("id, area, dominio, ordem_dominio, codigo_oficial, descricao")
        .eq("curriculo", curriculo)
        .eq("ano_escolar", anoEscolar)
        .eq("tipo", "curricular")
        .order("area")
        .order("ordem_dominio")
        .order("codigo_oficial"),
      admin
        .from("progresso")
        .select(
          "competencia_id, nivel_actual, acertos, tentativas, estado, ultima_tentativa_em",
        )
        .eq("crianca_id", criancaId),
      admin
        .from("diagnosticos")
        .select("id, tipo, estado, iniciado_em, concluido_em, competencias_avaliadas")
        .eq("crianca_id", criancaId)
        .order("iniciado_em", { ascending: false })
        .limit(5),
    ]);

  const porCompetencia = new Map<string, (typeof progresso)[number]>();
  (progresso ?? []).forEach((p) => porCompetencia.set(p.competencia_id, p));

  const mapa = (competencias ?? []).map((c) => {
    const pr = porCompetencia.get(c.id);
    return {
      id: c.id,
      area: c.area,
      dominio: c.dominio,
      ordem_dominio: c.ordem_dominio ?? 0,
      codigo_oficial: c.codigo_oficial,
      descricao: c.descricao,
      nivel: pr?.nivel_actual ?? 0,
      estado: pr?.estado ?? "nao_avaliada",
      tentativas: pr?.tentativas ?? 0,
      acertos: pr?.acertos ?? 0,
      ultima_tentativa_em: pr?.ultima_tentativa_em ?? null,
    };
  });

  const resumo = {
    total: mapa.length,
    nivel_esperado: mapa.filter((c) => c.nivel === 3).length,
    acima_esperado: mapa.filter((c) => c.nivel >= 4).length,
    em_desenvolvimento: mapa.filter((c) => c.nivel === 2).length,
    precisa_atencao: mapa.filter((c) => c.nivel === 1).length,
    em_avaliacao: mapa.filter((c) => c.estado === "em_avaliacao").length,
    nao_avaliada: mapa.filter((c) => c.estado === "nao_avaliada").length,
  };

  return NextResponse.json({
    ok: true,
    crianca_id: criancaId,
    curriculo,
    ano_escolar: anoEscolar,
    mapa,
    resumo,
    diagnosticos: diagnosticos ?? [],
  });
}
