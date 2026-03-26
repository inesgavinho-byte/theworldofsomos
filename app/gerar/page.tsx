import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GerarClient from "./GerarClient";

export default async function GerarPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: familyMember } = await supabase
    .from("familia_membros")
    .select("familia_id")
    .eq("profile_id", user.id)
    .single();

  const familiaId = (familyMember as any)?.familia_id ?? null;

  let criancas: any[] = [];
  if (familiaId) {
    const { data } = await supabase
      .from("criancas")
      .select("*")
      .eq("familia_id", familiaId);
    criancas = data ?? [];
  }

  return <GerarClient familiaId={familiaId} criancas={criancas} />;
}
