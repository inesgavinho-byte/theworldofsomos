"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { CodigoCurriculo } from "@/lib/curriculo";

const LICOES: {
  slug: string;
  titulo: string;
  dimensao: string;
  cor: string;
  curriculo: CodigoCurriculo;
}[] = [
  { slug: "floresta-tropical",  titulo: "A Floresta Tropical",   dimensao: "Naturalista", cor: "#4ade80", curriculo: "PT" },
  { slug: "cerebro-incrivel",   titulo: "O Cérebro Incrível",    dimensao: "Identitária", cor: "#a78bfa", curriculo: "PT" },
  { slug: "sistema-solar",      titulo: "O Sistema Solar",       dimensao: "Lógica",      cor: "#60a5fa", curriculo: "PT" },
  { slug: "a-zona-certa",       titulo: "A Zona Certa",          dimensao: "Identitária", cor: "#a78bfa", curriculo: "PT" },
  { slug: "cerebro-desafios",   titulo: "Cérebro e Desafios",    dimensao: "Identitária", cor: "#a78bfa", curriculo: "PT" },
  { slug: "o-proposito",        titulo: "O Propósito",           dimensao: "Social",      cor: "#facc15", curriculo: "PT" },
  { slug: "como-aprender",      titulo: "Como Aprender",         dimensao: "Lógica",      cor: "#60a5fa", curriculo: "PT" },
];

const CURRICULO_CORES: Record<string, { bg: string; texto: string }> = {
  PT:        { bg: "rgba(96,165,250,0.12)",  texto: "#185fa5" },
  BNCC:      { bg: "rgba(74,222,128,0.12)",  texto: "#2d5c3a" },
  Cambridge: { bg: "rgba(167,139,250,0.12)", texto: "#534ab7" },
  IB:        { bg: "rgba(244,114,182,0.12)", texto: "#9d174d" },
  FR:        { bg: "rgba(250,204,21,0.12)",  texto: "#854f0b" },
};

type FiltroTab = "Todos" | CodigoCurriculo;
const TABS: FiltroTab[] = ["Todos", "PT", "BNCC", "Cambridge", "IB", "FR"];

export default function AdminConteudoPage() {
  const router = useRouter();
  const [filtro, setFiltro] = useState<FiltroTab>("Todos");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      supabase.from("profiles").select("tipo").eq("id", user.id).single().then(({ data: profile }) => {
        if (profile?.tipo !== "admin") { router.push("/dashboard"); return; }
        setAuthChecked(true);
      });
    });
  }, [router]);

  if (!authChecked) return null;

  const licoesFiltradas = filtro === "Todos"
    ? LICOES
    : LICOES.filter((l) => l.curriculo === filtro);

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

        {/* Tabs de filtro por currículo */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
          {TABS.map((tab) => {
            const isActive = filtro === tab;
            const corCurriculo = tab !== "Todos" ? CURRICULO_CORES[tab] : null;
            return (
              <button
                key={tab}
                onClick={() => setFiltro(tab)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  border: isActive
                    ? "1.5px solid var(--roxo-tint)"
                    : "1.5px solid rgba(160,144,128,0.25)",
                  background: isActive
                    ? (corCurriculo?.bg ?? "rgba(167,139,250,0.12)")
                    : "rgba(245,242,236,0.9)",
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "none",
                  color: isActive
                    ? (corCurriculo?.texto ?? "var(--roxo-texto)")
                    : "var(--texto-secundario)",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--texto-secundario)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
          Lições ({licoesFiltradas.length})
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {licoesFiltradas.map((licao) => {
            const cores = CURRICULO_CORES[licao.curriculo] ?? CURRICULO_CORES["PT"];
            return (
              <Link key={licao.slug} href={`/licao/${licao.slug}`}>
                <div className="card-hover" style={{ background: "rgba(245,242,236,0.9)", borderRadius: "14px", padding: "16px 20px", border: "1px solid rgba(160,144,128,0.15)", display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: licao.cor, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "14px", fontWeight: 700 }}>{licao.titulo}</p>
                    <p style={{ fontSize: "12px", color: "var(--texto-secundario)", fontWeight: 600 }}>{licao.dimensao}</p>
                  </div>
                  {/* Badge currículo */}
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "999px",
                      background: cores.bg,
                      color: cores.texto,
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                      flexShrink: 0,
                    }}
                  >
                    {licao.curriculo}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--roxo-texto)", fontWeight: 700 }}>Ver →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
