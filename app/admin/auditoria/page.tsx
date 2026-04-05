import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import AuditoriaClient from "./AuditoriaClient";

export const metadata = { title: "Auditoria — SOMOS Admin" };

export default async function AuditoriaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo")
    .eq("id", user.id)
    .single();

  if (profile?.tipo !== "admin") redirect("/dashboard");

  const admin = createAdminClient();

  const { data: logs } = await admin
    .from("audit_logs")
    .select("*, profiles(nome)")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--fundo-pai)",
        position: "relative",
        zIndex: 1,
        padding: "32px 24px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
              <Link
                href="/admin"
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--texto-secundario)",
                  textDecoration: "none",
                }}
              >
                ← Admin
              </Link>
            </div>
            <h1
              className="font-editorial"
              style={{ fontSize: "32px", fontWeight: 500 }}
            >
              Auditoria
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "var(--texto-secundario)",
                fontWeight: 600,
                marginTop: "4px",
              }}
            >
              Registo de acções no sistema — últimos 500 eventos
            </p>
          </div>

          {/* Legenda de categorias */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", maxWidth: "400px", justifyContent: "flex-end" }}>
            {[
              { cat: "auth", label: "auth" },
              { cat: "child", label: "child" },
              { cat: "ai", label: "ai" },
              { cat: "admin", label: "admin" },
              { cat: "guilda", label: "guilda" },
              { cat: "mailbox", label: "mailbox" },
            ].map(({ cat, label }) => {
              const CORES: Record<string, { bg: string; cor: string; borda: string }> = {
                auth: { bg: "rgba(160,144,128,0.12)", cor: "#6b5f52", borda: "rgba(160,144,128,0.4)" },
                child: { bg: "rgba(167,139,250,0.12)", cor: "#7c3aed", borda: "rgba(167,139,250,0.4)" },
                ai: { bg: "rgba(96,165,250,0.12)", cor: "#1d4ed8", borda: "rgba(96,165,250,0.4)" },
                admin: { bg: "rgba(251,191,36,0.12)", cor: "#92400e", borda: "rgba(251,191,36,0.4)" },
                guilda: { bg: "rgba(74,222,128,0.12)", cor: "#15803d", borda: "rgba(74,222,128,0.4)" },
                mailbox: { bg: "rgba(244,114,182,0.12)", cor: "#be185d", borda: "rgba(244,114,182,0.4)" },
              };
              const c = CORES[cat];
              return (
                <span
                  key={cat}
                  style={{
                    background: c.bg,
                    color: c.cor,
                    border: `1px solid ${c.borda}`,
                    borderRadius: "6px",
                    padding: "2px 8px",
                    fontSize: "10px",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                  }}
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>

        <AuditoriaClient logs={logs ?? []} />
      </div>
    </div>
  );
}
