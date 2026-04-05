import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { log } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json();
  const { activeRole } = body;

  if (activeRole !== "family" && activeRole !== "admin") {
    return NextResponse.json({ erro: "Role inválido." }, { status: 400 });
  }

  // Only admins can switch to admin role
  if (activeRole === "admin") {
    // Fix 8: validar server-side que o utilizador tem roles.includes('admin')
    // Fix 6: roles[] é fonte de verdade. tipo é fallback legacy durante transição.
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
  }

  // Read existing context to preserve other fields
  const cookieStore = await cookies();
  const existing = cookieStore.get("somos-context")?.value;
  let ctx: Record<string, unknown> = { activeFamilyId: null, activeChildId: null };
  if (existing) {
    try {
      ctx = JSON.parse(existing);
    } catch {
      // ignore
    }
  }

  const roleAnterior = ctx.activeRole ?? null;
  ctx.activeRole = activeRole;

  await log({
    userId: user.id,
    action: 'auth.context_switch',
    metadata: { de: roleAnterior, para: activeRole },
    request,
  });

  const response = NextResponse.json({ ok: true, activeRole });
  // Fix 2: cookie somos-context com httpOnly, secure (produção), sameSite lax
  response.cookies.set("somos-context", JSON.stringify(ctx), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response;
}
