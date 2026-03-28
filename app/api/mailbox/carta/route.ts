import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/mailbox/carta — returns a random carta in 'aguarda' state (not the user's own)
// Does NOT expose autor_id
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
    }

    // Fetch cartas in 'aguarda' that don't belong to the current user
    // Order randomly by using a random offset strategy
    const { data: cartas, error } = await supabase
      .from("mailbox_cartas")
      .select("id, conteudo, created_at")
      .eq("estado", "aguarda")
      .neq("autor_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) {
      console.error("Erro ao buscar carta:", error);
      return NextResponse.json({ erro: "Erro ao buscar carta." }, { status: 500 });
    }

    if (!cartas || cartas.length === 0) {
      return NextResponse.json({ carta: null });
    }

    // Pick a random one
    const carta = cartas[Math.floor(Math.random() * cartas.length)];

    return NextResponse.json({ carta });
  } catch (err) {
    console.error("Erro inesperado:", err);
    return NextResponse.json({ erro: "Erro inesperado." }, { status: 500 });
  }
}
