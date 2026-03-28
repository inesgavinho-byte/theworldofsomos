import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/mailbox/passar — skip current carta, get a new one
// Returns a new carta (different from the passed one)
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
    }

    const { cartaIdActual } = await req.json();

    // Fetch cartas in 'aguarda', excluding user's own and the current one
    const query = supabase
      .from("mailbox_cartas")
      .select("id, conteudo, created_at")
      .eq("estado", "aguarda")
      .neq("autor_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50);

    if (cartaIdActual) {
      query.neq("id", cartaIdActual);
    }

    const { data: cartas, error } = await query;

    if (error) {
      console.error("Erro ao buscar carta:", error);
      return NextResponse.json({ erro: "Erro ao buscar carta." }, { status: 500 });
    }

    if (!cartas || cartas.length === 0) {
      return NextResponse.json({ carta: null });
    }

    const carta = cartas[Math.floor(Math.random() * cartas.length)];

    return NextResponse.json({ carta });
  } catch (err) {
    console.error("Erro inesperado:", err);
    return NextResponse.json({ erro: "Erro inesperado." }, { status: 500 });
  }
}
