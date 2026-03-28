import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import ExerciciosIAClient from "./ExerciciosIAClient";

export default async function ExerciciosIAPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/crianca/login");

  const { data: desafio } = await supabase
    .from("desafios_familia")
    .select("id, conteudo, estado, crianca_id")
    .eq("id", params.id)
    .single();

  if (!desafio) notFound();

  return <ExerciciosIAClient desafio={desafio} />;
}
