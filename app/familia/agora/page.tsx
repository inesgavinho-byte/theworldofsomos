import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AgoraClient from "./AgoraClient";

export default async function AgoraPage() {
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

  if (!profile || (profile.tipo !== "pai" && profile.tipo !== "crianca")) {
    redirect("/dashboard");
  }

  const { data: membroData } = await supabase
    .from("familia_membros")
    .select("familia_id")
    .eq("profile_id", user.id)
    .single();

  const familiaId = (membroData?.familia_id as string) ?? null;

  const { data: criancas } = familiaId
    ? await supabase
        .from("criancas")
        .select("id, nome")
        .eq("familia_id", familiaId)
    : { data: [] };

  return (
    <AgoraClient
      profile={profile}
      userId={user.id}
      familiaId={familiaId}
      criancas={criancas ?? []}
    />
  );
}
