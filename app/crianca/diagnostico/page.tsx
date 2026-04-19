import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DiagnosticoClient from "./DiagnosticoClient";

export default async function CriancaDiagnosticoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/crianca/login");

  const { data: crianca } = await supabase
    .from("criancas")
    .select("id, nome, curriculo, ano_escolar")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!crianca) redirect("/crianca/login");

  return <DiagnosticoClient nome={crianca.nome ?? ""} />;
}
