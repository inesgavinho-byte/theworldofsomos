import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminEstatisticasPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("tipo").eq("id", user.id).single();
  if (profile?.tipo !== "admin") redirect("/dashboard");

  const [
    { count: totalSessoes },
    { count: sessoesSemana },
  ] = await Promise.all([
    supabase.from("sessoes").select("*", { count: "exact", head: true }),
    supabase.from("sessoes").select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--fundo-pai)", position: "relative", zIndex: 1, padding: "32px 24px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <Link href="/admin">
            <button style={{ background: "transparent", border: "none", cursor: "none", fontSize: "13px", fontWeight: 700, fontFamily: "Nunito, sans-serif", color: "var(--texto-secundario)" }}>
              ← Admin
            </button>
          </Link>
          <h1 className="font-editorial" style={{ fontSize: "28px", fontWeight: 500 }}>Estatísticas</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {[
            { label: "Total de sessões", valor: totalSessoes ?? 0, cor: "#a78bfa" },
            { label: "Sessões esta semana", valor: sessoesSemana ?? 0, cor: "#4ade80" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "rgba(245,242,236,0.9)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(160,144,128,0.15)" }}>
              <p style={{ fontSize: "40px", fontWeight: 900, color: stat.cor, lineHeight: 1, marginBottom: "8px" }}>{stat.valor}</p>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--texto-secundario)" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
