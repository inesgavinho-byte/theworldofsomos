import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

// GET /api/guilda/admin/candidaturas — Lista todas as candidaturas (admin only)
export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo")
    .eq("id", user.id)
    .single();

  if (profile?.tipo !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const url = new URL(req.url);
  const estado = url.searchParams.get("estado");
  const pais = url.searchParams.get("pais");
  const perfil = url.searchParams.get("perfil");

  const supabaseAdmin = createAdminClient();

  let query = supabaseAdmin
    .from("guilda_candidaturas")
    .select("*")
    .order("created_at", { ascending: false });

  if (estado) query = query.eq("estado", estado);
  if (pais) query = query.eq("pais_codigo", pais);
  if (perfil) query = query.eq("perfil", perfil);

  const { data: candidaturas, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Erro ao carregar candidaturas." }, { status: 500 });
  }

  return NextResponse.json({ candidaturas: candidaturas ?? [] });
}
