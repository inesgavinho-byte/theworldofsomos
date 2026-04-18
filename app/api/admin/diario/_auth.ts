import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AdminAuthResult =
  | { ok: true; userId: string }
  | { ok: false; status: number; erro: string };

export async function assertAdmin(): Promise<AdminAuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, status: 401, erro: "Sessão expirada." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo, roles")
    .eq("id", user.id)
    .single();

  const isAdmin =
    (Array.isArray(profile?.roles) && profile!.roles.includes("admin")) ||
    profile?.tipo === "admin";

  if (!isAdmin) {
    return { ok: false, status: 403, erro: "Sem permissão." };
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get("somos-context")?.value;
  let activeRole: string | null = null;
  if (raw) {
    try {
      activeRole = JSON.parse(raw)?.activeRole ?? null;
    } catch {
      activeRole = null;
    }
  }

  if (activeRole !== "admin") {
    return {
      ok: false,
      status: 403,
      erro: "Acção disponível apenas no contexto de administração.",
    };
  }

  return { ok: true, userId: user.id };
}
