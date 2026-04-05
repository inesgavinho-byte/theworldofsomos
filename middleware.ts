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

const PUBLIC_PREFIXES = ["/leituras", "/guilda", "/api/guilda"];

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
    const isChildRoute =
      pathname.startsWith("/crianca/") || pathname.startsWith("/licao/");
    const loginUrl = isChildRoute ? "/crianca/login" : "/login";
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  // Authenticated — fetch profile with roles
  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo, roles")
    .eq("id", user.id)
    .single();

  const isAdmin =
    (Array.isArray(profile?.roles) && profile.roles.includes("admin")) ||
    profile?.tipo === "admin";
  const isCrianca = profile?.tipo === "crianca";

  // Read somos-context cookie (default to family mode)
  const contextCookie = request.cookies.get("somos-context")?.value;
  let context: { activeRole: "family" | "admin" } = { activeRole: "family" };
  if (contextCookie) {
    try {
      context = JSON.parse(contextCookie);
    } catch {
      // malformed cookie — treat as default
    }
  }

  // Initialize cookie in response if missing
  const needsCookieInit = !contextCookie;

  // Child routing
  if (isCrianca) {
    if (pathname.startsWith("/crianca") || pathname.startsWith("/licao")) {
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

  // Family/parent routes — any authenticated non-crianca user
  const response = needsCookieInit ? (() => {
    const r = NextResponse.next({ request });
    // Copy Supabase auth cookies from supabaseResponse
    supabaseResponse.cookies.getAll().forEach(({ name, value, ...opts }) => {
      r.cookies.set(name, value, opts);
    });
    r.cookies.set("somos-context", JSON.stringify({ activeRole: "family", activeFamilyId: null, activeChildId: null }), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    return r;
  })() : supabaseResponse;

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
