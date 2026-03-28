import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
    }

    const { conteudo } = await req.json();

    if (!conteudo || typeof conteudo !== "string" || conteudo.trim().length < 10) {
      return NextResponse.json(
        { erro: "A carta precisa de ter pelo menos 10 caracteres." },
        { status: 400 }
      );
    }

    if (conteudo.length > 5000) {
      return NextResponse.json(
        { erro: "A carta não pode ter mais de 5000 caracteres." },
        { status: 400 }
      );
    }

    const { data: carta, error } = await supabase
      .from("mailbox_cartas")
      .insert({
        autor_id: user.id,
        conteudo: conteudo.trim(),
        estado: "aguarda",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Erro ao depositar carta:", error);
      return NextResponse.json({ erro: "Erro ao guardar a carta." }, { status: 500 });
    }

    return NextResponse.json({ id: carta.id });
  } catch (err) {
    console.error("Erro inesperado:", err);
    return NextResponse.json({ erro: "Erro inesperado." }, { status: 500 });
  }
}
