import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { log } from "@/lib/audit";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ erro: "Sessão expirada." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo, roles")
    .eq("id", user.id)
    .single();

  const isAdmin =
    (Array.isArray(profile?.roles) && profile.roles.includes("admin")) ||
    profile?.tipo === "admin";

  if (!isAdmin) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get("somos-context")?.value;
  let activeRole: string | null = null;
  if (raw) {
    try {
      activeRole = JSON.parse(raw)?.activeRole ?? null;
    } catch {
      activeRole = null;
    }
  }

  if (activeRole !== "admin") {
    return NextResponse.json(
      { erro: "Acção disponível apenas no contexto de administração." },
      { status: 403 }
    );
  }

  const admin = createAdminClient();

  const { data: licao, error: selectError } = await admin
    .from("licoes")
    .select("id, titulo, estado")
    .eq("id", id)
    .single();

  if (selectError || !licao) {
    return NextResponse.json({ erro: "Lição não encontrada." }, { status: 404 });
  }

  const estadoAnterior = licao.estado as "rascunho" | "publicada";
  const estadoNovo: "rascunho" | "publicada" =
    estadoAnterior === "publicada" ? "rascunho" : "publicada";

  const { error: updateError } = await admin
    .from("licoes")
    .update({ estado: estadoNovo })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { erro: "Não foi possível actualizar o estado." },
      { status: 500 }
    );
  }

  await log({
    userId: user.id,
    action: estadoNovo === "publicada" ? "licao.publicada" : "licao.despublicada",
    entityType: "licao",
    entityId: id,
    metadata: {
      licao_id: id,
      titulo: licao.titulo,
      estado_anterior: estadoAnterior,
      estado_novo: estadoNovo,
    },
    request,
  });

  return NextResponse.json({ estado: estadoNovo });
}
