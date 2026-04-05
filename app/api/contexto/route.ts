import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

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

  ctx.activeRole = activeRole;

  const response = NextResponse.json({ ok: true, activeRole });
  response.cookies.set("somos-context", JSON.stringify(ctx), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return response;
}
