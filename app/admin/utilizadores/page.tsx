import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminUtilizadoresPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("tipo").eq("id", user.id).single();
  if (profile?.tipo !== "admin") redirect("/dashboard");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nome, tipo, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div style={{ minHeight: "100vh", background: "var(--fundo-pai)", position: "relative", zIndex: 1, padding: "32px 24px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <Link href="/admin">
            <button style={{ background: "transparent", border: "none", cursor: "none", fontSize: "13px", fontWeight: 700, fontFamily: "Nunito, sans-serif", color: "var(--texto-secundario)" }}>
              ← Admin
            </button>
          </Link>
          <h1 className="font-editorial" style={{ fontSize: "28px", fontWeight: 500 }}>Utilizadores</h1>
        </div>

        <div style={{ background: "rgba(245,242,236,0.9)", borderRadius: "16px", border: "1px solid rgba(160,144,128,0.15)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(160,144,128,0.15)" }}>
                {["Nome", "Tipo", "Data de registo"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--texto-secundario)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(profiles ?? []).map((p: any) => (
                <tr key={p.id} style={{ borderBottom: "1px solid rgba(160,144,128,0.08)" }}>
                  <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 600 }}>{p.nome ?? "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "3px 10px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: p.tipo === "admin" ? "rgba(167,139,250,0.15)" : p.tipo === "crianca" ? "rgba(74,222,128,0.15)" : "rgba(96,165,250,0.15)",
                      color: p.tipo === "admin" ? "var(--roxo-texto)" : p.tipo === "crianca" ? "var(--verde-texto)" : "var(--azul-texto)",
                    }}>
                      {p.tipo ?? "—"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--texto-secundario)", fontWeight: 600 }}>
                    {p.created_at ? new Date(p.created_at).toLocaleDateString("pt-PT") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
