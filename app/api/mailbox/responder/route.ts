import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { log } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
    }

    const { cartaId, resposta } = await req.json();

    if (!cartaId || typeof cartaId !== "string") {
      return NextResponse.json({ erro: "ID da carta inválido." }, { status: 400 });
    }

    if (!resposta || typeof resposta !== "string" || resposta.trim().length < 5) {
      return NextResponse.json(
        { erro: "A resposta precisa de ter pelo menos 5 caracteres." },
        { status: 400 }
      );
    }

    // Verify the carta exists, is in aguarda, and doesn't belong to the user
    const { data: carta, error: fetchError } = await supabase
      .from("mailbox_cartas")
      .select("id, estado, autor_id")
      .eq("id", cartaId)
      .single();

    if (fetchError || !carta) {
      return NextResponse.json({ erro: "Carta não encontrada." }, { status: 404 });
    }

    if (carta.estado !== "aguarda") {
      return NextResponse.json({ erro: "Esta carta já foi respondida." }, { status: 409 });
    }

    if (carta.autor_id === user.id) {
      return NextResponse.json({ erro: "Não podes responder à tua própria carta." }, { status: 403 });
    }

    // Calculate expires_at: 48 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const { error: updateError } = await supabase
      .from("mailbox_cartas")
      .update({
        estado: "respondida",
        respondida_por: user.id,
        resposta: resposta.trim(),
        respondida_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq("id", cartaId)
      .eq("estado", "aguarda");

    if (updateError) {
      console.error("Erro ao responder carta:", updateError);
      return NextResponse.json({ erro: "Erro ao guardar a resposta." }, { status: 500 });
    }

    await log({
      userId: user.id,
      action: 'mailbox.letter_responded',
      entityType: 'mailbox_carta',
      entityId: cartaId,
      request: req,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro inesperado:", err);
    return NextResponse.json({ erro: "Erro inesperado." }, { status: 500 });
  }
}
