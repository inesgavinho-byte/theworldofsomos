import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

// PATCH /api/guilda/admin/estado — Mudar estado de candidatura (rejeitar, lista_espera, pendente)
export async function PATCH(req: Request) {
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

  const { id, estado } = await req.json();

  if (!id || !estado) {
    return NextResponse.json({ error: "Campos em falta." }, { status: 400 });
  }

  const estadosValidos = ["pendente", "aprovado", "rejeitado", "lista_espera"];
  if (!estadosValidos.includes(estado)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("guilda_candidaturas")
    .update({ estado })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Erro ao actualizar estado." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
