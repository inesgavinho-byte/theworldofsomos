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

type EstadoLicao = "rascunho" | "publicada";

interface Licao {
  id: string;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  dimensao: string;
  cor: string;
  curriculo: CodigoCurriculo | null;
  tipo: TipoConteudo;
  ordem: number;
  estado: EstadoLicao;
}

const ESTADO_CORES: Record<EstadoLicao, { bg: string; texto: string; borda: string }> = {
  rascunho:  { bg: "rgba(160,144,128,0.14)", texto: "#5d4f3e", borda: "rgba(160,144,128,0.35)" },
  publicada: { bg: "rgba(74,222,128,0.14)",  texto: "#2d5c3a", borda: "rgba(74,222,128,0.4)"  },
};

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
  const [emMudanca, setEmMudanca] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const recarregarLicoes = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("licoes")
      .select("id, slug, titulo, subtitulo, dimensao, cor, curriculo, tipo, ordem, estado")
      .eq("ativo", true)
      .order("ordem", { ascending: true });
    if (!error && data) {
      setLicoes(data as Licao[]);
    }
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      supabase.from("profiles").select("tipo").eq("id", user.id).single().then(({ data: profile }) => {
        if (profile?.tipo !== "admin") { router.push("/dashboard"); return; }
        setAuthChecked(true);
        recarregarLicoes().finally(() => setLoading(false));
      });
    });
  }, [router]);

  const alternarEstado = async (licao: Licao) => {
    if (emMudanca) return;
    setEmMudanca(licao.id);
    setAviso(null);

    const estadoOptimista: EstadoLicao =
      licao.estado === "publicada" ? "rascunho" : "publicada";

    setLicoes((prev) =>
      prev.map((l) => (l.id === licao.id ? { ...l, estado: estadoOptimista } : l))
    );

    try {
      const res = await fetch(`/api/admin/licoes/${licao.id}/estado`, {
        method: "POST",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setAviso(json?.erro ?? "Não foi possível actualizar o estado.");
        // Reverter estado optimista
        setLicoes((prev) =>
          prev.map((l) => (l.id === licao.id ? { ...l, estado: licao.estado } : l))
        );
      } else {
        await recarregarLicoes();
      }
    } catch {
      setAviso("Não foi possível actualizar o estado.");
      setLicoes((prev) =>
        prev.map((l) => (l.id === licao.id ? { ...l, estado: licao.estado } : l))
      );
    } finally {
      setEmMudanca(null);
    }
  };

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

            {aviso && (
              <p
                role="alert"
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#7a2a2a",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "12px",
                }}
              >
                {aviso}
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {licoesFiltradas.map((licao) => {
                const tipoCores = TIPO_CORES[licao.tipo];
                const curriculoCores = licao.curriculo ? CURRICULO_CORES[licao.curriculo] : null;
                const estadoCores = ESTADO_CORES[licao.estado];
                const aAlterar = emMudanca === licao.id;
                return (
                  <div
                    key={licao.slug}
                    className="card-hover"
                    style={{ background: "rgba(245,242,236,0.9)", borderRadius: "14px", padding: "16px 20px", border: "1px solid rgba(160,144,128,0.15)", display: "flex", alignItems: "center", gap: "14px" }}
                  >
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: licao.cor, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <p style={{ fontSize: "14px", fontWeight: 700 }}>{licao.titulo}</p>
                        <span
                          aria-label={`Estado: ${licao.estado}`}
                          style={{
                            padding: "2px 9px",
                            borderRadius: "999px",
                            background: estadoCores.bg,
                            color: estadoCores.texto,
                            border: `1px solid ${estadoCores.borda}`,
                            fontSize: "10px",
                            fontWeight: 800,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            flexShrink: 0,
                          }}
                        >
                          {licao.estado}
                        </span>
                      </div>
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
                    <button
                      onClick={() => alternarEstado(licao)}
                      disabled={aAlterar}
                      aria-label={licao.estado === "publicada" ? "Despublicar lição" : "Publicar lição"}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "10px",
                        border: `1.5px solid ${licao.estado === "publicada" ? "rgba(160,144,128,0.35)" : "rgba(74,222,128,0.5)"}`,
                        background: licao.estado === "publicada" ? "rgba(245,242,236,0.9)" : "rgba(74,222,128,0.15)",
                        color: licao.estado === "publicada" ? "#5d4f3e" : "#2d5c3a",
                        fontFamily: "Nunito, sans-serif",
                        fontSize: "11px",
                        fontWeight: 800,
                        letterSpacing: "0.04em",
                        cursor: aAlterar ? "not-allowed" : "none",
                        opacity: aAlterar ? 0.6 : 1,
                        flexShrink: 0,
                      }}
                    >
                      {aAlterar ? "A actualizar…" : licao.estado === "publicada" ? "Despublicar" : "Publicar"}
                    </button>
                    <Link href={`/admin/licoes/${licao.id}/exercicios`} style={{ flexShrink: 0 }}>
                      <span style={{ fontSize: "12px", color: "var(--roxo-texto)", fontWeight: 700 }}>
                        Gerir exercícios →
                      </span>
                    </Link>
                    <Link href={`/licao/${licao.slug}`} style={{ flexShrink: 0 }}>
                      <span style={{ fontSize: "12px", color: "var(--roxo-texto)", fontWeight: 700 }}>Ver →</span>
                    </Link>
                  </div>
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
