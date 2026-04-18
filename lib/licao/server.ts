import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AuthedCrianca {
  userId: string;
  criancaId: string;
}

// Autentica o pedido e devolve crianca_id. Retorna NextResponse de erro se falhar.
export async function autenticarCrianca(): Promise<
  { ok: true; data: AuthedCrianca } | { ok: false; response: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, response: NextResponse.json({ erro: "Não autenticado" }, { status: 401 }) };
  }

  const admin = createAdminClient();
  const { data: crianca } = await admin
    .from("criancas")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!crianca) {
    return {
      ok: false,
      response: NextResponse.json({ erro: "Criança não encontrada" }, { status: 403 }),
    };
  }

  return { ok: true, data: { userId: user.id, criancaId: crianca.id } };
}
