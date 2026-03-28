"use client";

/**
 * SOMOS — Arquitectura de Conteúdo
 *
 * Conteúdo Universal: pertence à condição humana.
 * Não tem currículo, não tem fronteiras, não tem validade.
 * Uma criança em Lisboa e uma criança em Tóquio têm as mesmas
 * perguntas sobre quem são e para que estão aqui.
 *
 * Conteúdo Curricular: pertence à escola que a criança frequenta.
 * Respeita a sequência, o vocabulário e os objectivos de cada sistema.
 *
 * O SOMOS é ambos — mas o Universal é o coração.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { CodigoCurriculo } from "@/lib/curriculo";

type TipoConteudo = "universal" | "curricular";

interface Licao {
  slug: string;
  titulo: string;
  subtitulo: string | null;
  dimensao: string;
  cor: string;
  curriculo: CodigoCurriculo | null;
  tipo: TipoConteudo;
  ordem: number;
}

const CURRICULO_CORES: Record<string, { bg: string; texto: string }> = {
  PT:        { bg: "rgba(96,165,250,0.12)",  texto: "#185fa5" },
  BNCC:      { bg: "rgba(74,222,128,0.12)",  texto: "#2d5c3a" },
  Cambridge: { bg: "rgba(167,139,250,0.12)", texto: "#534ab7" },
  IB:        { bg: "rgba(244,114,182,0.12)", texto: "#9d174d" },
  FR:        { bg: "rgba(250,204,21,0.12)",  texto: "#854f0b" },
};

const TIPO_CORES = {
  universal:  { bg: "rgba(167,139,250,0.12)", texto: "#534ab7" },
  curricular: { bg: "rgba(96,165,250,0.12)",  texto: "#185fa5" },
};

type FiltroTab = "Todos" | "Universal" | CodigoCurriculo;
const TABS: FiltroTab[] = ["Todos", "Universal", "PT", "BNCC", "Cambridge", "IB", "FR"];

export default function AdminConteudoPage() {
  const router = useRouter();
  const [filtro, setFiltro] = useState<FiltroTab>("Todos");
  const [authChecked, setAuthChecked] = useState(false);
  const [licoes, setLicoes] = useState<Licao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      supabase.from("profiles").select("tipo").eq("id", user.id).single().then(({ data: profile }) => {
        if (profile?.tipo !== "admin") { router.push("/dashboard"); return; }
        setAuthChecked(true);
        // Fetch lessons from database
        supabase
          .from("licoes")
          .select("slug, titulo, subtitulo, dimensao, cor, curriculo, tipo, ordem")
          .eq("ativo", true)
          .order("ordem", { ascending: true })
          .then(({ data, error }) => {
            if (!error && data) {
              setLicoes(data as Licao[]);
            }
            setLoading(false);
          });
      });
    });
  }, [router]);

  if (!authChecked) return null;

  const licoesFiltradas = filtro === "Todos"
    ? licoes
    : filtro === "Universal"
    ? licoes.filter((l) => l.tipo === "universal")
    : licoes.filter((l) => l.curriculo === filtro);

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

        {/* Tabs de filtro */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
          {TABS.map((tab) => {
            const isActive = filtro === tab;
            const isUniversalTab = tab === "Universal";
            return (
              <button
                key={tab}
                onClick={() => setFiltro(tab)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  border: isActive
                    ? `1.5px solid ${isUniversalTab ? "#a78bfa" : "var(--roxo-tint)"}`
                    : "1.5px solid rgba(160,144,128,0.25)",
                  background: isActive
                    ? (isUniversalTab ? "rgba(167,139,250,0.12)" : (tab !== "Todos" ? CURRICULO_CORES[tab]?.bg : "rgba(167,139,250,0.12)"))
                    : "rgba(245,242,236,0.9)",
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "none",
                  color: isActive
                    ? (isUniversalTab ? "#534ab7" : (tab !== "Todos" ? CURRICULO_CORES[tab]?.texto : "var(--roxo-texto)"))
                    : "var(--texto-secundario)",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {loading ? (
          <p style={{ fontSize: "13px", color: "var(--texto-secundario)", fontWeight: 600 }}>
            A carregar lições...
          </p>
        ) : (
          <>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--texto-secundario)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
              Lições ({licoesFiltradas.length})
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {licoesFiltradas.map((licao) => {
                const tipoCores = TIPO_CORES[licao.tipo];
                const curriculoCores = licao.curriculo ? CURRICULO_CORES[licao.curriculo] : null;
                return (
                  <Link key={licao.slug} href={`/licao/${licao.slug}`}>
                    <div className="card-hover" style={{ background: "rgba(245,242,236,0.9)", borderRadius: "14px", padding: "16px 20px", border: "1px solid rgba(160,144,128,0.15)", display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: licao.cor, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "14px", fontWeight: 700 }}>{licao.titulo}</p>
                        <p style={{ fontSize: "12px", color: "var(--texto-secundario)", fontWeight: 600 }}>
                          {licao.dimensao}{licao.subtitulo ? ` · ${licao.subtitulo}` : ""}
                        </p>
                      </div>
                      {/* Badge tipo */}
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "999px",
                          background: tipoCores.bg,
                          color: tipoCores.texto,
                          fontSize: "11px",
                          fontWeight: 800,
                          letterSpacing: "0.04em",
                          flexShrink: 0,
                        }}
                      >
                        {licao.tipo === "universal" ? "Universal" : "Curricular"}
                      </span>
                      {/* Badge currículo (só se curricular) */}
                      {curriculoCores && (
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: "999px",
                            background: curriculoCores.bg,
                            color: curriculoCores.texto,
                            fontSize: "11px",
                            fontWeight: 800,
                            letterSpacing: "0.04em",
                            flexShrink: 0,
                          }}
                        >
                          {licao.curriculo}
                        </span>
                      )}
                      <span style={{ fontSize: "12px", color: "var(--roxo-texto)", fontWeight: 700 }}>Ver →</span>
                    </div>
                  </Link>
                );
              })}

              {licoesFiltradas.length === 0 && (
                <p style={{ fontSize: "13px", color: "var(--texto-secundario)", fontWeight: 600, padding: "20px 0" }}>
                  Nenhuma lição encontrada para este filtro.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
