import { createAdminClient } from "@/lib/supabase/admin";

export const LOCKOUT_THRESHOLD = 5;
export const LOCKOUT_WINDOW_MINUTES = 10;
export const LOCKOUT_DURATION_MINUTES = 30;

export const RATE_LIMIT_THRESHOLD = 10;
export const RATE_LIMIT_WINDOW_MINUTES = 60;

export type IpGate =
  | { state: "ok" }
  | { state: "locked"; retryAfterMinutes: number }
  | { state: "rate_limited"; retryAfterMinutes: number };

export function ipFromRequest(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function checkIpGate(ip: string): Promise<IpGate> {
  const admin = createAdminClient();
  const now = Date.now();

  const rateSince = new Date(now - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();
  const { count: hourly } = await admin
    .from("pin_tentativas")
    .select("id", { count: "exact", head: true })
    .eq("ip_address", ip)
    .gte("created_at", rateSince);

  if ((hourly ?? 0) >= RATE_LIMIT_THRESHOLD) {
    return { state: "rate_limited", retryAfterMinutes: RATE_LIMIT_WINDOW_MINUTES };
  }

  const lockoutSince = new Date(now - LOCKOUT_DURATION_MINUTES * 60_000).toISOString();
  const { data: recent } = await admin
    .from("pin_tentativas")
    .select("created_at, sucesso")
    .eq("ip_address", ip)
    .gte("created_at", lockoutSince)
    .order("created_at", { ascending: false })
    .limit(50);

  if (recent && recent.length) {
    const windowSince = now - LOCKOUT_WINDOW_MINUTES * 60_000;
    const recentFails = recent.filter(
      (r) => !r.sucesso && new Date(r.created_at).getTime() >= windowSince,
    );

    if (recentFails.length >= LOCKOUT_THRESHOLD) {
      const lastFail = new Date(recentFails[0].created_at).getTime();
      const unlockAt = lastFail + LOCKOUT_DURATION_MINUTES * 60_000;
      if (unlockAt > now) {
        return {
          state: "locked",
          retryAfterMinutes: Math.ceil((unlockAt - now) / 60_000),
        };
      }
    }
  }

  return { state: "ok" };
}

export async function recordAttempt(params: {
  ip: string;
  userAgent: string | null;
  sucesso: boolean;
  criancaId?: string | null;
}): Promise<void> {
  const admin = createAdminClient();
  await admin.from("pin_tentativas").insert({
    ip_address: params.ip,
    user_agent: params.userAgent,
    sucesso: params.sucesso,
    crianca_id: params.criancaId ?? null,
  });
}

export async function clearFailuresForIp(ip: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("pin_tentativas")
    .delete()
    .eq("ip_address", ip)
    .eq("sucesso", false);
}
