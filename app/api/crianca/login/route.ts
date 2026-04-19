import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { log } from "@/lib/audit";
import {
  checkIpGate,
  ipFromRequest,
  recordAttempt,
} from "@/lib/pin-rate-limit";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { pin } = await req.json().catch(() => ({ pin: null }));

    if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { erro: "PIN inválido." },
        { status: 400 },
      );
    }

    const ip = ipFromRequest(req);
    const userAgent = req.headers.get("user-agent");

    const gate = await checkIpGate(ip);
    if (gate.state === "locked") {
      await log({
        action: "child.pin_lockout",
        metadata: { ip, retryAfterMinutes: gate.retryAfterMinutes },
        request: req,
      });
      return NextResponse.json(
        {
          erro: "O teu acesso está bloqueado. Pede a um adulto para te ajudar.",
          motivo: "lockout",
        },
        { status: 423, headers: { "Retry-After": String(gate.retryAfterMinutes * 60) } },
      );
    }
    if (gate.state === "rate_limited") {
      await log({
        action: "child.pin_rate_limited",
        metadata: { ip, retryAfterMinutes: gate.retryAfterMinutes },
        request: req,
      });
      return NextResponse.json(
        {
          erro: "Demasiadas tentativas deste dispositivo. Espera um pouco.",
          motivo: "rate_limited",
        },
        { status: 429, headers: { "Retry-After": String(gate.retryAfterMinutes * 60) } },
      );
    }

    const admin = createAdminClient();
    const { data: criancas } = await admin
      .from("criancas")
      .select("id, nome, pin, user_id, familia_id")
      .not("pin", "is", null)
      .not("user_id", "is", null);

    let match: { id: string; user_id: string; familia_id: string | null } | null = null;

    if (criancas && criancas.length) {
      for (const c of criancas) {
        if (!c.pin || !c.user_id) continue;
        const ok = await bcrypt.compare(pin, c.pin);
        if (ok) {
          match = { id: c.id, user_id: c.user_id, familia_id: c.familia_id };
          break;
        }
      }
    }

    if (!match) {
      await recordAttempt({ ip, userAgent, sucesso: false });
      await log({
        action: "child.pin_login_failed",
        metadata: { ip, reason: "pin_not_found" },
        request: req,
      });
      return NextResponse.json(
        { erro: "O PIN não está correcto. Tenta outra vez." },
        { status: 401 },
      );
    }

    const supabase = await createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: `pin_${pin}@somos.app`,
      password: pin,
    });

    if (authError) {
      await recordAttempt({ ip, userAgent, sucesso: false, criancaId: match.id });
      await log({
        userId: match.user_id,
        action: "child.pin_login_failed",
        entityType: "crianca",
        entityId: match.id,
        metadata: { ip, reason: "auth_failed", code: authError.status },
        request: req,
      });
      return NextResponse.json(
        { erro: "O PIN não está correcto. Tenta outra vez." },
        { status: 401 },
      );
    }

    await recordAttempt({ ip, userAgent, sucesso: true, criancaId: match.id });

    const cookieStore = await cookies();
    cookieStore.set(
      "somos-context",
      JSON.stringify({
        activeRole: "crianca",
        activeFamilyId: match.familia_id,
        activeChildId: match.id,
      }),
      {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    );

    await log({
      userId: match.user_id,
      action: "child.pin_login_success",
      entityType: "crianca",
      entityId: match.id,
      metadata: { ip },
      request: req,
    });

    return NextResponse.json({
      ok: true,
      redirect: "/crianca/dashboard",
    });
  } catch (err) {
    console.error("[api/crianca/login]", err);
    return NextResponse.json(
      { erro: "Não foi possível entrar agora. Tenta outra vez." },
      { status: 500 },
    );
  }
}
