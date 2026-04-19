import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import ProgressoClient from "./ProgressoClient";

export const dynamic = "force-dynamic";

export default async function ProgressoPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo")
    .eq("id", user.id)
    .single();

  if (!profile || profile.tipo !== "pai") {
    redirect("/dashboard");
  }

  const { data: crianca } = await supabase
    .from("criancas")
    .select("id, nome, familia_id, curriculo, ano_escolar")
    .eq("id", params.id)
    .single();

  if (!crianca) notFound();

  const { data: membro } = await supabase
    .from("familia_membros")
    .select("familia_id")
    .eq("profile_id", user.id)
    .eq("familia_id", crianca.familia_id)
    .maybeSingle();

  if (!membro) redirect("/familia");

  const { data: competencias } = await supabase
    .from("competencias")
    .select("id, codigo_oficial, area, dominio, descricao, ano_escolar, curriculo")
    .eq("curriculo", crianca.curriculo ?? "PT")
    .order("ano_escolar", { ascending: true })
    .order("area", { ascending: true })
    .order("codigo_oficial", { ascending: true });

  const { data: progresso } = await supabase
    .from("progresso")
    .select("competencia_id, nivel_actual, estado")
    .eq("crianca_id", crianca.id);

  const progressoMap: Record<string, { nivel_actual: number; estado: string }> = {};
  (progresso ?? []).forEach((row) => {
    progressoMap[row.competencia_id] = {
      nivel_actual: row.nivel_actual ?? 0,
      estado: row.estado ?? "nao_avaliada",
    };
  });

  // Lacunas de base: para cada competência avançada, contar pré-requisitos fortes
  // ainda não consolidados (nível < 3 ou não avaliados) na criança actual.
  const { data: ligacoesFortes } = await supabase
    .from("competencia_pre_requisitos")
    .select("competencia_id, pre_requisito_id")
    .eq("tipo", "forte");

  const lacunasMap: Record<string, number> = {};
  (ligacoesFortes ?? []).forEach((row) => {
    const prereq = progressoMap[row.pre_requisito_id];
    const pendente =
      !prereq || prereq.nivel_actual < 3 || prereq.estado === "nao_avaliada";
    if (pendente) {
      lacunasMap[row.competencia_id] = (lacunasMap[row.competencia_id] ?? 0) + 1;
    }
  });

  return (
    <ProgressoClient
      crianca={{ id: crianca.id, nome: crianca.nome, ano_escolar: crianca.ano_escolar }}
      competencias={competencias ?? []}
      progressoMap={progressoMap}
      lacunasMap={lacunasMap}
    />
  );
}
