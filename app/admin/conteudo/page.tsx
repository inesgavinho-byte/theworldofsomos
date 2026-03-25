import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const LICOES = [
  { slug: "floresta-tropical", titulo: "A Floresta Tropical", dimensao: "Naturalista", cor: "#4ade80" },
  { slug: "cerebro-incrivel", titulo: "O Cérebro Incrível", dimensao: "Identitária", cor: "#a78bfa" },
  { slug: "sistema-solar", titulo: "O Sistema Solar", dimensao: "Lógica", cor: "#60a5fa" },
  { slug: "a-zona-certa", titulo: "A Zona Certa", dimensao: "Identitária", cor: "#a78bfa" },
  { slug: "cerebro-desafios", titulo: "Cérebro e Desafios", dimensao: "Identitária", cor: "#a78bfa" },
  { slug: "o-proposito", titulo: "O Propósito", dimensao: "Emocional", cor: "#facc15" },
  { slug: "como-aprender", titulo: "Como Aprender", dimensao: "Lógica", cor: "#60a5fa" },
];

export default async function AdminConteudoPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("tipo").eq("id", user.id).single();
  if (profile?.tipo !== "admin") redirect("/dashboard");

  return (
    <div style={{ minHeight: "100vh", background: "var(--fundo-pai)", position: "relative", zIndex: 1, padding: "32px 24px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <Link href="/admin">
            <button style={{ background: "transparent", border: "none", cursor: "none", fontSize: "13px", fontWeight: 700, fontFamily: "Nunito, sans-serif", color: "var(--texto-secundario)" }}>
              ← Admin
            </button>
          </Link>
          <h1 className="font-editorial" style={{ fontSize: "28px", fontWeight: 500 }}>Conteúdo</h1>
        </div>

        <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--texto-secundario)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
          Lições ({LICOES.length})
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {LICOES.map((licao) => (
            <Link key={licao.slug} href={`/licao/${licao.slug}`}>
              <div className="card-hover" style={{ background: "rgba(245,242,236,0.9)", borderRadius: "14px", padding: "16px 20px", border: "1px solid rgba(160,144,128,0.15)", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: licao.cor, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", fontWeight: 700 }}>{licao.titulo}</p>
                  <p style={{ fontSize: "12px", color: "var(--texto-secundario)", fontWeight: 600 }}>{licao.dimensao}</p>
                </div>
                <span style={{ fontSize: "12px", color: "var(--roxo-texto)", fontWeight: 700 }}>Ver →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
