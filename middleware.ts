import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/recuperar-password",
  "/admin/login",
  "/crianca/login",
];

const PUBLIC_PREFIXES = [
  "/leituras",
  "/guilda",
  "/api/guilda",
  "/mudar-contexto", // Fix 7: evitar redirect loop ao confirmar mudança de contexto
];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Update session (refresh tokens)
  const { supabaseResponse, user, supabase } = await updateSession(request);

  if (isPublicRoute(pathname)) {
    // Redirect logged-in users away from /login
    if (user && pathname === "/login") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("tipo")
        .eq("id", user.id)
        .single();

      if (profile?.tipo === "crianca") {
        return NextResponse.redirect(new URL("/crianca/dashboard", request.url));
      }
      // Admins and parents both start in /dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return supabaseResponse;
  }

  // Not authenticated — redirect to login
  if (!user) {
    const isChildRoute = pathname.startsWith("/crianca/");
    const loginUrl = isChildRoute ? "/crianca/login" : "/login";
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  // Authenticated — fetch profile with roles
  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo, roles")
    .eq("id", user.id)
    .single();

  // Fix 6: roles[] é fonte de verdade. tipo é fallback legacy durante transição.
  // Remover fallback tipo quando Fase 1.5 estiver completa.
  const isAdmin =
    (Array.isArray(profile?.roles) && profile.roles.includes("admin")) ||
    profile?.tipo === "admin";
  const isCrianca = profile?.tipo === "crianca";

  // Fix 1: Cookie parsing seguro — try/catch com fallback completo
  // Fix 4: Fallback sempre com estrutura completa
  const DEFAULT_CONTEXT = { activeRole: "family" as const, activeFamilyId: null, activeChildId: null };
  let context: { activeRole: "family" | "admin"; activeFamilyId: string | null; activeChildId: string | null } =
    DEFAULT_CONTEXT;
  try {
    const raw = request.cookies.get("somos-context")?.value;
    if (raw) context = JSON.parse(raw);
  } catch {
    // Fix 1: cookie corrompido → fallback silencioso, não crasha
    context = { ...DEFAULT_CONTEXT };
  }

  // Child routing — /licao/* e /api/* servem criança E adulto
  if (isCrianca) {
    if (
      pathname.startsWith("/crianca") ||
      pathname.startsWith("/licao") ||
      pathname.startsWith("/api/")
    ) {
      return supabaseResponse;
    }
    return NextResponse.redirect(new URL("/crianca/dashboard", request.url));
  }

  // /admin/* — admin only, with context check
  if (pathname.startsWith("/admin")) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // If in family mode, redirect to context switch screen
    if (context.activeRole === "family") {
      const confirmUrl = new URL("/mudar-contexto", request.url);
      confirmUrl.searchParams.set("destino", pathname);
      return NextResponse.redirect(confirmUrl);
    }
    return supabaseResponse;
  }

  // Fix 9: User sem família → onboarding
  // Fix 11: cookie somos-context pode estar dessincronizado da BD (onboarding
  // cria a família via client, sem tocar em nenhuma API que escreva o cookie).
  // Antes de redirecionar para /onboarding, confirmar na BD se o user tem
  // mesmo família; se tiver, curar o cookie e deixar passar — assim evita-se
  // loop de redirects e criação duplicada de criança.
  if (
    context.activeFamilyId === null &&
    !pathname.startsWith("/onboarding") &&
    !pathname.startsWith("/api/")
  ) {
    const { data: membro } = await supabase
      .from("familia_membros")
      .select("familia_id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!membro?.familia_id) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    const novoContexto = { ...context, activeFamilyId: membro.familia_id };
    supabaseResponse.cookies.set("somos-context", JSON.stringify(novoContexto), {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  // Family/parent routes — any authenticated non-crianca user
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
