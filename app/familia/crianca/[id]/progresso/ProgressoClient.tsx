"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

interface Competencia {
  id: string;
  codigo_oficial: string | null;
  area: string | null;
  dominio: string | null;
  descricao: string | null;
  ano_escolar: string | null;
  curriculo: string | null;
}

interface PassoPlano {
  passo: number;
  competencia_id: string;
  codigo_oficial: string | null;
  area: string | null;
  dominio: string | null;
  descricao: string | null;
  ano_escolar: string | null;
  nivel_actual: number;
  estado: string;
  bloqueador: boolean;
  tipo_ligacao: string;
}

interface Props {
  crianca: { id: string; nome: string | null; ano_escolar: string | null };
  competencias: Competencia[];
  progressoMap: Record<string, { nivel_actual: number; estado: string }>;
  lacunasMap: Record<string, number>;
}

const CORES_NIVEL: Record<number, string> = {
  0: "rgba(160,144,128,0.18)",
  1: "rgba(239,129,109,0.25)",
  2: "rgba(250,204,21,0.28)",
  3: "rgba(134,200,150,0.3)",
  4: "rgba(96,165,250,0.32)",
};

const BORDA_NIVEL: Record<number, string> = {
  0: "rgba(160,144,128,0.35)",
  1: "rgba(239,129,109,0.55)",
  2: "rgba(250,204,21,0.55)",
  3: "rgba(74,158,100,0.55)",
  4: "rgba(96,165,250,0.55)",
};

function rotuloNivel(nivel: number, estado: string): string {
  if (estado === "nao_avaliada" && nivel === 0) return "ainda não";
  if (nivel === 0) return "a começar";
  if (nivel === 1) return "a iniciar";
  if (nivel === 2) return "a progredir";
  if (nivel === 3) return "consolidado";
  return "dominado";
}

export default function ProgressoClient({
  crianca,
  competencias,
  progressoMap,
  lacunasMap,
}: Props) {
  const [filtroLacunas, setFiltroLacunas] = useState(false);
  const [alvoSeleccionado, setAlvoSeleccionado] = useState<Competencia | null>(null);
  const [plano, setPlano] = useState<PassoPlano[] | null>(null);
  const [planoLoading, setPlanoLoading] = useState(false);
  const [planoErro, setPlanoErro] = useState<string | null>(null);

  const competenciasVisiveis = useMemo(() => {
    if (!filtroLacunas) return competencias;
    return competencias.filter((c) => (lacunasMap[c.id] ?? 0) > 0);
  }, [competencias, lacunasMap, filtroLacunas]);

  const grupos = useMemo(() => {
    const out: Record<string, Competencia[]> = {};
    competenciasVisiveis.forEach((c) => {
      const ano = c.ano_escolar ?? "—";
      if (!out[ano]) out[ano] = [];
      out[ano].push(c);
    });
    return out;
  }, [competenciasVisiveis]);

  async function abrirPlano(c: Competencia) {
    setAlvoSeleccionado(c);
    setPlano(null);
    setPlanoErro(null);
    setPlanoLoading(true);
    try {
      const res = await fetch(`/api/crianca/${crianca.id}/plano/${c.id}`);
      const body = await res.json();
      if (!res.ok) {
        setPlanoErro(body.erro ?? "Não foi possível obter o plano.");
      } else {
        setPlano(body.passos ?? []);
      }
    } catch {
      setPlanoErro("Sem ligação. Tenta novamente.");
    } finally {
      setPlanoLoading(false);
    }
  }

  function fecharPainel() {
    setAlvoSeleccionado(null);
    setPlano(null);
    setPlanoErro(null);
  }

  const totalLacunas = useMemo(
    () => competencias.filter((c) => (lacunasMap[c.id] ?? 0) > 0).length,
    [competencias, lacunasMap],
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--fundo-pai)",
        padding: "32px 24px 64px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "1040px",
          margin: "0 auto 32px",
        }}
      >
        <Link href="/familia" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--texto-secundario)",
              cursor: "none",
            }}
          >
            ← Família
          </span>
        </Link>
        <h1
          className="font-editorial"
          style={{ fontSize: "22px", fontWeight: 500, color: "var(--texto-principal)" }}
        >
          Progresso · {crianca.nome ?? "Criança"}
        </h1>
        <span style={{ width: "70px" }} />
      </div>

      <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <button
            onClick={() => setFiltroLacunas(false)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "1.5px solid rgba(160,144,128,0.35)",
              background: filtroLacunas ? "transparent" : "rgba(160,144,128,0.18)",
              fontSize: "13px",
              fontWeight: 700,
              fontFamily: "Nunito, sans-serif",
              color: "var(--texto-principal)",
              cursor: "none",
            }}
          >
            Ver tudo
          </button>
          <button
            onClick={() => setFiltroLacunas(true)}
            disabled={totalLacunas === 0}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "1.5px solid rgba(239,129,109,0.55)",
              background: filtroLacunas ? "rgba(239,129,109,0.2)" : "transparent",
              fontSize: "13px",
              fontWeight: 700,
              fontFamily: "Nunito, sans-serif",
              color: "var(--texto-principal)",
              cursor: totalLacunas === 0 ? "not-allowed" : "none",
              opacity: totalLacunas === 0 ? 0.5 : 1,
            }}
          >
            Ver apenas lacunas de base
            {totalLacunas > 0 && (
              <span style={{ marginLeft: "6px", color: "#c2573d" }}>· {totalLacunas}</span>
            )}
          </button>
        </div>

        {Object.keys(grupos).length === 0 ? (
          <p
            className="font-editorial"
            style={{
              fontSize: "16px",
              color: "var(--texto-secundario)",
              fontStyle: "italic",
              textAlign: "center",
              padding: "48px 0",
            }}
          >
            {filtroLacunas
              ? "Não há lacunas de base para mostrar. As bases estão consolidadas."
              : "Ainda não há competências disponíveis para este currículo."}
          </p>
        ) : (
          Object.entries(grupos)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([ano, lista]) => (
              <section key={ano} style={{ marginBottom: "32px" }}>
                <h2
                  className="font-editorial"
                  style={{
                    fontSize: "17px",
                    fontWeight: 500,
                    color: "var(--texto-principal)",
                    marginBottom: "12px",
                    letterSpacing: "0.02em",
                  }}
                >
                  {ano}.º ano
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {lista.map((c) => {
                    const pr = progressoMap[c.id];
                    const nivel = pr?.nivel_actual ?? 0;
                    const estado = pr?.estado ?? "nao_avaliada";
                    const lacunas = lacunasMap[c.id] ?? 0;
                    return (
                      <button
                        key={c.id}
                        onClick={() => abrirPlano(c)}
                        style={{
                          textAlign: "left",
                          position: "relative",
                          background: CORES_NIVEL[nivel] ?? CORES_NIVEL[0],
                          border: `1.5px solid ${BORDA_NIVEL[nivel] ?? BORDA_NIVEL[0]}`,
                          borderRadius: "14px",
                          padding: "14px",
                          cursor: "none",
                          fontFamily: "Nunito, sans-serif",
                        }}
                      >
                        {lacunas > 0 && (
                          <span
                            title={`Esta competência depende de ${lacunas} competência${lacunas > 1 ? "s" : ""} do 3.º ano que ainda precisa${lacunas > 1 ? "m" : ""} de consolidação. Clica para ver o plano sugerido.`}
                            aria-label="Base em falta"
                            style={{
                              position: "absolute",
                              top: "8px",
                              right: "8px",
                              width: "22px",
                              height: "22px",
                              borderRadius: "50%",
                              background: "rgba(239,129,109,0.25)",
                              border: "1px solid rgba(239,129,109,0.6)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                              <path
                                d="M5 1v8M2 6l3 3 3-3"
                                stroke="#b54a30"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        )}
                        <p
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "var(--texto-secundario)",
                            letterSpacing: "0.05em",
                            marginBottom: "4px",
                          }}
                        >
                          {c.codigo_oficial ?? "—"}
                        </p>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "var(--texto-principal)",
                            lineHeight: 1.35,
                            marginBottom: "8px",
                            paddingRight: lacunas > 0 ? "22px" : 0,
                          }}
                        >
                          {c.descricao ?? c.area ?? ""}
                        </p>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "var(--texto-secundario)",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {rotuloNivel(nivel, estado)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))
        )}
      </div>

      {alvoSeleccionado && (
        <PainelPlano
          crianca={crianca}
          alvo={alvoSeleccionado}
          passos={plano}
          loading={planoLoading}
          erro={planoErro}
          onClose={fecharPainel}
        />
      )}
    </div>
  );
}

function PainelPlano({
  crianca,
  alvo,
  passos,
  loading,
  erro,
  onClose,
}: {
  crianca: { nome: string | null; ano_escolar: string | null };
  alvo: Competencia;
  passos: PassoPlano[] | null;
  loading: boolean;
  erro: string | null;
  onClose: () => void;
}) {
  const temBase = (passos ?? []).some((p) => p.tipo_ligacao !== "alvo");
  const nomeCrianca = crianca.nome ?? "a criança";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(23,19,16,0.35)",
        zIndex: 50,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(480px, 92vw)",
          background: "var(--fundo-pai)",
          padding: "28px 24px 32px",
          overflowY: "auto",
          boxShadow: "-8px 0 24px rgba(0,0,0,0.12)",
          fontFamily: "Nunito, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            marginBottom: "16px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--texto-secundario)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Plano de consolidação
            </p>
            <h2
              className="font-editorial"
              style={{
                fontSize: "20px",
                fontWeight: 500,
                color: "var(--texto-principal)",
                marginTop: "4px",
              }}
            >
              {alvo.descricao ?? alvo.area ?? "Competência"}
            </h2>
            <p
              style={{
                fontSize: "12px",
                color: "var(--texto-secundario)",
                fontWeight: 700,
                marginTop: "4px",
                letterSpacing: "0.04em",
              }}
            >
              {alvo.codigo_oficial}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              background: "transparent",
              border: "none",
              fontSize: "22px",
              color: "var(--texto-secundario)",
              cursor: "none",
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>

        {loading && (
          <p style={{ fontSize: "13px", color: "var(--texto-secundario)" }}>A carregar...</p>
        )}

        {erro && (
          <p
            style={{
              fontSize: "13px",
              color: "#b54a30",
              background: "rgba(239,129,109,0.12)",
              padding: "12px",
              borderRadius: "10px",
            }}
          >
            {erro}
          </p>
        )}

        {!loading && !erro && passos && (
          <>
            <p
              style={{
                fontSize: "13px",
                color: "var(--texto-secundario)",
                lineHeight: 1.55,
                marginBottom: "20px",
                fontWeight: 600,
              }}
            >
              {temBase
                ? `Para a ${nomeCrianca} avançar em ${alvo.descricao ?? "esta competência"}, sugerimos trabalhar estas competências por esta ordem. As primeiras são bases do ano anterior que ainda precisam de consolidação.`
                : `A ${nomeCrianca} já tem as bases consolidadas. Pode trabalhar directamente em ${alvo.descricao ?? "esta competência"}.`}
            </p>

            <ol
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                padding: 0,
                listStyle: "none",
              }}
            >
              {passos.map((p) => (
                <CartaoPasso
                  key={p.competencia_id}
                  passo={p}
                  anoCrianca={crianca.ano_escolar}
                />
              ))}
            </ol>

            <button
              style={{
                marginTop: "24px",
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                background: "rgba(96,165,250,0.14)",
                border: "1.5px solid rgba(96,165,250,0.45)",
                color: "#185fa5",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "none",
                fontFamily: "Nunito, sans-serif",
              }}
              onClick={() =>
                alert("Em breve — exercícios em preparação.")
              }
            >
              Começar pelo passo 1 →
            </button>
          </>
        )}
      </aside>
    </div>
  );
}

function CartaoPasso({
  passo,
  anoCrianca,
}: {
  passo: PassoPlano;
  anoCrianca: string | null;
}) {
  const nivel = passo.nivel_actual ?? 0;
  const ehBase =
    anoCrianca && passo.ano_escolar && parseInt(passo.ano_escolar, 10) < parseInt(anoCrianca, 10);
  return (
    <li
      style={{
        background: "rgba(245,242,236,0.8)",
        border: `1.5px solid ${passo.bloqueador ? "rgba(239,129,109,0.55)" : "rgba(160,144,128,0.25)"}`,
        borderRadius: "14px",
        padding: "14px",
        display: "flex",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "rgba(160,144,128,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: 800,
          color: "var(--texto-principal)",
          flexShrink: 0,
        }}
      >
        {passo.passo}
      </div>
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--texto-secundario)",
            letterSpacing: "0.04em",
            marginBottom: "2px",
          }}
        >
          {passo.codigo_oficial}
          {passo.area && ` · ${passo.area}`}
          {passo.dominio && ` · ${passo.dominio}`}
        </p>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--texto-principal)",
            lineHeight: 1.4,
            marginBottom: "8px",
          }}
        >
          {passo.descricao}
        </p>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              padding: "3px 9px",
              borderRadius: "10px",
              background: CORES_NIVEL[nivel] ?? CORES_NIVEL[0],
              border: `1px solid ${BORDA_NIVEL[nivel] ?? BORDA_NIVEL[0]}`,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--texto-principal)",
            }}
          >
            {rotuloNivel(nivel, passo.estado)}
          </span>
          {ehBase && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 800,
                padding: "3px 9px",
                borderRadius: "10px",
                background: "rgba(167,139,250,0.18)",
                border: "1px solid rgba(167,139,250,0.45)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "#534ab7",
              }}
            >
              base
            </span>
          )}
          {passo.bloqueador && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 800,
                padding: "3px 9px",
                borderRadius: "10px",
                background: "rgba(239,129,109,0.2)",
                border: "1px solid rgba(239,129,109,0.55)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "#b54a30",
              }}
            >
              bloqueador
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
