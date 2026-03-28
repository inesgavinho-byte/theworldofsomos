import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CriancaDashboardClient from "./CriancaDashboardClient";

export default async function CriancaDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/crianca/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, tipo")
    .eq("id", user.id)
    .single();

  // Find the criança linked to this auth user (via PIN login)
  const { data: crianca } = await supabase
    .from("criancas")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Fetch pending AI exercise challenges sent by the parent
  let desafiosPendentes: any[] = [];
  if (crianca?.id) {
    const { data } = await supabase
      .from("desafios_familia")
      .select("id, conteudo, created_at")
      .eq("crianca_id", crianca.id)
      .eq("tipo", "exercicios_ia")
      .eq("estado", "pendente")
      .order("created_at", { ascending: false });
    desafiosPendentes = data ?? [];
  }

  return (
    <CriancaDashboardClient
      profile={profile}
      crianca={crianca}
      desafiosPendentes={desafiosPendentes}
    />
  );
}
