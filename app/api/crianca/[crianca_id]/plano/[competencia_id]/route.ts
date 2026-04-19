import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { log } from "@/lib/audit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  req: Request,
  { params }: { params: { crianca_id: string; competencia_id: string } },
): Promise<NextResponse> {
  const { crianca_id, competencia_id } = params;

  if (!UUID_RE.test(crianca_id) || !UUID_RE.test(competencia_id)) {
    return NextResponse.json({ erro: "Identificador inválido." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("obter_plano_consolidacao", {
    p_crianca_id: crianca_id,
    p_competencia_id: competencia_id,
  });

  if (error) {
    if (error.code === "42501") {
      return NextResponse.json({ erro: "Não tens acesso a esta criança." }, { status: 403 });
    }
    console.error("[api/crianca/plano]", error);
    return NextResponse.json(
      { erro: "Não foi possível obter o plano agora." },
      { status: 500 },
    );
  }

  const passos = data ?? [];

  await log({
    userId: user.id,
    action: "plano.consultado",
    entityType: "competencia",
    entityId: competencia_id,
    metadata: {
      crianca_id,
      competencia_id,
      passos_retornados: passos.length,
    },
    request: req,
  });

  return NextResponse.json({ passos });
}
