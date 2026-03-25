import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, tipo")
    .eq("id", user.id)
    .single();

  const { data: familyMember } = await supabase
    .from("familia_membros")
    .select("familia_id, familias(nome, plano)")
    .eq("profile_id", user.id)
    .single();

  const familiaId = (familyMember as any)?.familia_id;

  let criancas: any[] = [];
  if (familiaId) {
    const { data } = await supabase
      .from("criancas")
      .select("*")
      .eq("familia_id", familiaId);
    criancas = data ?? [];
  }

  return (
    <DashboardClient
      profile={profile}
      familiaId={familiaId}
      criancas={criancas}
    />
  );
}
