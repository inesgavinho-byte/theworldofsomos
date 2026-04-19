import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import ProgressoClient, { type MapaCompetencia } from "./ProgressoClient";

interface PageProps {
  params: { id: string };
}

export default async function ProgressoCriancaPage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: crianca } = await admin
    .from("criancas")
    .select("id, nome, curriculo, ano_escolar, familia_id, data_nascimento, user_id")
    .eq("id", params.id)
    .maybeSingle();

  if (!crianca) notFound();

  // Acesso: própria criança ou membro da família.
  let autorizado = crianca.user_id === user.id;
  if (!autorizado) {
    const { data: membro } = await admin
      .from("familia_membros")
      .select("familia_id")
      .eq("profile_id", user.id)
      .eq("familia_id", crianca.familia_id)
      .maybeSingle();
    autorizado = Boolean(membro);
  }
  if (!autorizado) {
    return (
      <div style={{ padding: "64px 24px", textAlign: "center" }}>
        <h1 className="font-editorial" style={{ fontSize: "26px", marginBottom: "12px" }}>
          Sem acesso a esta criança.
        </h1>
        <p style={{ fontSize: "14px", color: "var(--texto-secundario)", fontWeight: 600 }}>
          Esta área está reservada à família desta criança.
        </p>
      </div>
    );
  }

  const curriculo = crianca.curriculo ?? "PT";
  const anoEscolar = crianca.ano_escolar ?? "4";

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
        .eq("crianca_id", crianca.id),
      admin
        .from("diagnosticos")
        .select("id, tipo, estado, iniciado_em, concluido_em, competencias_avaliadas")
        .eq("crianca_id", crianca.id)
        .order("iniciado_em", { ascending: false })
        .limit(3),
    ]);

  const porCompetencia = new Map<string, (typeof progresso)[number]>();
  (progresso ?? []).forEach((p) => porCompetencia.set(p.competencia_id, p));

  const mapa: MapaCompetencia[] = (competencias ?? []).map((c) => {
    const pr = porCompetencia.get(c.id);
    return {
      id: c.id,
      area: c.area ?? "",
      dominio: c.dominio ?? null,
      ordem_dominio: c.ordem_dominio ?? 0,
      codigo_oficial: c.codigo_oficial ?? null,
      descricao: c.descricao ?? null,
      nivel: pr?.nivel_actual ?? 0,
      estado: pr?.estado ?? "nao_avaliada",
      tentativas: pr?.tentativas ?? 0,
      acertos: pr?.acertos ?? 0,
      ultima_tentativa_em: pr?.ultima_tentativa_em ?? null,
    };
  });

  const ultimoDiagnostico =
    (diagnosticos ?? []).find((d) => d.estado === "concluido") ??
    (diagnosticos ?? [])[0] ??
    null;

  return (
    <ProgressoClient
      crianca={{
        id: crianca.id,
        nome: crianca.nome ?? "",
        curriculo,
        anoEscolar,
        dataNascimento: crianca.data_nascimento ?? null,
      }}
      mapa={mapa}
      ultimoDiagnostico={ultimoDiagnostico}
    />
  );
}
