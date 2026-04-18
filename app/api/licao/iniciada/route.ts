import { NextResponse } from "next/server";
import { autenticarCrianca } from "@/lib/licao/server";
import { log } from "@/lib/audit";

export async function POST(req: Request): Promise<NextResponse> {
  const auth = await autenticarCrianca();
  if (!auth.ok) return auth.response;

  const { slug, licao_id } = await req.json().catch(() => ({}));
  if (!slug || !licao_id) {
    return NextResponse.json({ erro: "slug e licao_id obrigatórios" }, { status: 400 });
  }

  await log({
    userId: auth.data.userId,
    action: "licao.iniciada",
    entityType: "licao",
    entityId: licao_id,
    metadata: {
      crianca_id: auth.data.criancaId,
      slug,
    },
    request: req,
  });

  return NextResponse.json({ ok: true });
}
