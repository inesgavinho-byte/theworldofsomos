import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CriancaContexto {
  userId: string;
  criancaId: string;
  curriculo: string;
  anoEscolar: string;
  papel: "crianca" | "familia";
}

/**
 * Autentica o pedido e garante que o utilizador actual tem acesso
 * à criança alvo: ou é a própria criança (user_id == auth.uid()),
 * ou é membro da mesma família.
 */
export async function assegurarAcessoCrianca(
  criancaId: string | null,
): Promise<{ ok: true; data: CriancaContexto } | { ok: false; response: NextResponse }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ erro: "Sessão expirada." }, { status: 401 }),
    };
  }

  const admin = createAdminClient();

  // Se o pedido não vier com crianca_id (fluxo da criança), descobre.
  if (!criancaId) {
    const { data: crianca } = await admin
      .from("criancas")
      .select("id, curriculo, ano_escolar")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!crianca) {
      return {
        ok: false,
        response: NextResponse.json(
          { erro: "Criança não encontrada neste contexto." },
          { status: 403 },
        ),
      };
    }
    return {
      ok: true,
      data: {
        userId: user.id,
        criancaId: crianca.id,
        curriculo: crianca.curriculo ?? "PT",
        anoEscolar: crianca.ano_escolar ?? "4",
        papel: "crianca",
      },
    };
  }

  // Caso contrário, valida acesso via família.
  const { data: crianca } = await admin
    .from("criancas")
    .select("id, curriculo, ano_escolar, familia_id, user_id")
    .eq("id", criancaId)
    .maybeSingle();
  if (!crianca) {
    return {
      ok: false,
      response: NextResponse.json({ erro: "Criança não encontrada." }, { status: 404 }),
    };
  }

  if (crianca.user_id === user.id) {
    return {
      ok: true,
      data: {
        userId: user.id,
        criancaId: crianca.id,
        curriculo: crianca.curriculo ?? "PT",
        anoEscolar: crianca.ano_escolar ?? "4",
        papel: "crianca",
      },
    };
  }

  const { data: membro } = await admin
    .from("familia_membros")
    .select("familia_id")
    .eq("profile_id", user.id)
    .eq("familia_id", crianca.familia_id)
    .maybeSingle();

  if (!membro) {
    return {
      ok: false,
      response: NextResponse.json({ erro: "Sem acesso a esta criança." }, { status: 403 }),
    };
  }

  return {
    ok: true,
    data: {
      userId: user.id,
      criancaId: crianca.id,
      curriculo: crianca.curriculo ?? "PT",
      anoEscolar: crianca.ano_escolar ?? "4",
      papel: "familia",
    },
  };
}
