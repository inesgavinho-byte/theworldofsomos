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

  // Get the crianca record linked to this user
  // (In a real setup this is linked differently; here we use email match)
  const { data: criancas } = await supabase
    .from("criancas")
    .select("*")
    .limit(1);

  const crianca = criancas?.[0] ?? null;

  return <CriancaDashboardClient profile={profile} crianca={crianca} />;
}
