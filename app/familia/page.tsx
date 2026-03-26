import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FamiliaClient from "./FamiliaClient";

export default async function FamiliaPage() {
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

  // Família do utilizador
  const { data: membroData } = await supabase
    .from("familia_membros")
    .select("familia_id, familias(nome)")
    .eq("profile_id", user.id)
    .single();

  const familiaId = (membroData?.familia_id as string) ?? null;
  const familiaNome = ((membroData?.familias as any)?.nome as string) ?? null;

  // Crianças da família
  const { data: criancas } = familiaId
    ? await supabase
        .from("criancas")
        .select("id, nome")
        .eq("familia_id", familiaId)
    : { data: [] };

  // Desafios recentes
  const { data: desafios } = familiaId
    ? await supabase
        .from("desafios_familia")
        .select("id, modo, estado, conteudo, criado_por, created_at")
        .eq("familia_id", familiaId)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: [] };

  return (
    <FamiliaClient
      profile={profile}
      userId={user.id}
      familiaId={familiaId}
      familiaNome={familiaNome}
      criancas={criancas ?? []}
      desafios={desafios ?? []}
    />
  );
}
