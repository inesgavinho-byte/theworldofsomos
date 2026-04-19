import { createAdminClient } from "@/lib/supabase/admin";
import GuildaClient from "./GuildaClient";

export const revalidate = 60; // Revalida a cada 60s

export default async function GuildaPage() {
  const supabase = createAdminClient();

  const [{ data: vagasPais }, { count: totalAprovados }, { data: membros }] =
    await Promise.all([
      supabase.from("guilda_vagas_pais").select("pais_codigo, aprovados"),
      supabase
        .from("guilda_candidaturas")
        .select("*", { count: "exact", head: true })
        .eq("estado", "aprovado"),
      supabase
        .from("guilda_candidaturas")
        .select("id, nome, pais, pais_codigo, perfil")
        .eq("estado", "aprovado")
        .order("created_at", { ascending: true }),
    ]);

  const porPais: Record<string, number> = {};
  if (vagasPais) {
    for (const row of vagasPais) {
      porPais[row.pais_codigo] = Number(row.aprovados);
    }
  }

  return (
    <GuildaClient
      initialTotal={totalAprovados ?? 0}
      initialPorPais={porPais}
      initialMembros={membros ?? []}
    />
  );
}
