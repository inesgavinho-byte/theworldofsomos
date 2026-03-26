import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/admin/login",
  "/crianca/login",
];

const PUBLIC_PREFIXES = ["/leituras"];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Update session (refresh tokens)
  const { supabaseResponse, user, supabase } = await updateSession(request);

  // If route is public, allow through
  if (isPublicRoute(pathname)) {
    // Redirect logged-in users away from auth pages
    if (user && (pathname === "/login" || pathname === "/register")) {
      // Check user type to redirect correctly
      const { data: profile } = await supabase
        .from("profiles")
        .select("tipo")
        .eq("id", user.id)
        .single();

      if (profile?.tipo === "crianca") {
        return NextResponse.redirect(
          new URL("/crianca/dashboard", request.url)
        );
      }
      if (profile?.tipo === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
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

  // Authenticated — check role-based access
  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo")
    .eq("id", user.id)
    .single();

  const tipo = profile?.tipo;

  // /admin/* — only admin
  if (pathname.startsWith("/admin")) {
    if (tipo !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return supabaseResponse;
  }

  // /crianca/* and /licao/* — only crianca or admin
  if (pathname.startsWith("/crianca") || pathname.startsWith("/licao")) {
    if (tipo !== "crianca" && tipo !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return supabaseResponse;
  }

  // /dashboard, /onboarding and /gerar — only pai or admin
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/gerar")
  ) {
    if (tipo !== "pai" && tipo !== "admin") {
      return NextResponse.redirect(
        new URL("/crianca/dashboard", request.url)
      );
    }
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
