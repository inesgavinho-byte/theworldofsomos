import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: membros } = await supabase
    .from("guilda_candidaturas")
    .select("id, nome, pais, pais_codigo, perfil, created_at")
    .eq("estado", "aprovado")
    .order("updated_at", { ascending: true });

  return NextResponse.json({ membros: membros ?? [] });
}
