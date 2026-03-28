import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/mailbox/minhas — returns the current user's cartas
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
    }

    const { data: cartas, error } = await supabase
      .from("mailbox_cartas")
      .select("id, conteudo, estado, resposta, created_at, respondida_at, expires_at")
      .eq("autor_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar cartas:", error);
      return NextResponse.json({ erro: "Erro ao buscar cartas." }, { status: 500 });
    }

    return NextResponse.json({ cartas: cartas ?? [] });
  } catch (err) {
    console.error("Erro inesperado:", err);
    return NextResponse.json({ erro: "Erro inesperado." }, { status: 500 });
  }
}
