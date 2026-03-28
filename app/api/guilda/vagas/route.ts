import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const [{ data: vagasPais }, { count: totalAprovados }] = await Promise.all([
    supabase.from("guilda_vagas_pais").select("pais_codigo, aprovados"),
    supabase
      .from("guilda_candidaturas")
      .select("*", { count: "exact", head: true })
      .eq("estado", "aprovado"),
  ]);

  // Mapa: pais_codigo -> aprovados
  const porPais: Record<string, number> = {};
  if (vagasPais) {
    for (const row of vagasPais) {
      porPais[row.pais_codigo] = Number(row.aprovados);
    }
  }

  return NextResponse.json({
    total: totalAprovados ?? 0,
    porPais,
  });
}
