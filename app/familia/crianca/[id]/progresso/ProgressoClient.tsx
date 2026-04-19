"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export interface MapaCompetencia {
  id: string;
  area: string;
  dominio: string | null;
  ordem_dominio: number;
  codigo_oficial: string | null;
  descricao: string | null;
  nivel: number;
  estado: string;
  tentativas: number;
  acertos: number;
  ultima_tentativa_em: string | null;
}

interface Diagnostico {
  id: string;
  tipo: string;
  estado: string;
  iniciado_em: string;
  concluido_em: string | null;
  competencias_avaliadas: number;
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
  crianca: {
    id: string;
    nome: string;
    curriculo: string;
    anoEscolar: string;
    dataNascimento: string | null;
  };
  mapa: MapaCompetencia[];
  ultimoDiagnostico: Diagnostico | null;
  lacunasMap: Record<string, number>;
}

const NIVEL_COR: Record<number, { bg: string; border: string; texto: string; label: string }> = {
  0: {
    bg: "rgba(160,144,128,0.1)",
    border: "rgba(160,144,128,0.28)",
    texto: "#6b5f52",
    label: "Por avaliar",
  },
  1: {
    bg: "rgba(244,114,182,0.14)",
    border: "rgba(244,114,182,0.4)",
    texto: "#993556",
    label: "Precisa de atenção",
  },
  2: {
    bg: "rgba(250,204,21,0.18)",
    border: "rgba(250,204,21,0.5)",
    texto: "#854f0b",
    label: "Em desenvolvimento",
  },
  3: {
    bg: "rgba(74,222,128,0.2)",
    border: "rgba(74,222,128,0.5)",
    texto: "#2d5c3a",
    label: "No nível esperado",
  },
  4: {
    bg: "rgba(74,222,128,0.32)",
    border: "rgba(74,222,128,0.65)",
    texto: "#18532a",
    label: "Acima do esperado",
  },
  5: {
    bg: "rgba(45,160,90,0.4)",
    border: "rgba(29,120,60,0.8)",
    texto: "#0d3a1e",
    label: "Mestria",
  },
};

const ESTADO_LABEL: Record<string, string> = {
  nao_avaliada: "por avaliar",
  em_avaliacao: "em avaliação",
  avaliada: "avaliada",
};

function idadeDe(nascimento: string | null): number | null {
  if (!nascimento) return null;
  const d = new Date(nascimento);
  if (Number.isNaN(d.getTime())) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - d.getFullYear();
  const m = hoje.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < d.getDate())) idade -= 1;
  return idade;
}

function formatData(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const meses = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

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
  mapa,
  ultimoDiagnostico,
  lacunasMap,
}: Props) {
  const idade = idadeDe(crianca.dataNascimento);

  const resumo = useMemo(() => {
    return {
      total: mapa.length,
      esperado: mapa.filter((c) => c.nivel === 3).length,
      acimaEsperado: mapa.filter((c) => c.nivel >= 4).length,
      desenvolvimento: mapa.filter((c) => c.nivel === 2).length,
      precisaAtencao: mapa.filter((c) => c.nivel === 1).length,
      emAvaliacao: mapa.filter((c) => c.estado === "em_avaliacao").length,
      naoAvaliada: mapa.filter((c) => c.estado === "nao_avaliada").length,
    };
  }, [mapa]);

  const porArea = useMemo(() => {
    const m = new Map<string, Map<string, MapaCompetencia[]>>();
    for (const c of mapa) {
      const areaMap = m.get(c.area) ?? new Map<string, MapaCompetencia[]>();
      const dominio = c.dominio ?? "Outros";
      const arr = areaMap.get(dominio) ?? [];
      arr.push(c);
      areaMap.set(dominio, arr);
      m.set(c.area, areaMap);
    }
    return m;
  }, [mapa]);

  const sugestoes = useMemo(() => {
    const prioridade = [...mapa]
      .filter((c) => c.nivel >= 1 && c.nivel <= 2)
      .sort((a, b) => a.nivel - b.nivel)
      .slice(0, 5);
    return prioridade;
  }, [mapa]);

  const totalLacunas = useMemo(
    () => mapa.filter((c) => (lacunasMap[c.id] ?? 0) > 0).length,
    [mapa, lacunasMap],
  );

  const [areasAbertas, setAreasAbertas] = useState<Set<string>>(
    () => new Set(Array.from(porArea.keys())),
  );

  const toggleArea = (area: string) => {
    setAreasAbertas((prev) => {
      const next = new Set(prev);
      if (next.has(area)) next.delete(area);
      else next.add(area);
      return next;
    });
  };

  const [aPedir, setAPedir] = useState(false);
  const [pedidoMensagem, setPedidoMensagem] = useState<string | null>(null);

  const [alvoSeleccionado, setAlvoSeleccionado] = useState<MapaCompetencia | null>(null);
  const [plano, setPlano] = useState<PassoPlano[] | null>(null);
  const [planoLoading, setPlanoLoading] = useState(false);
  const [planoErro, setPlanoErro] = useState<string | null>(null);

  const pedirNovoDiagnostico = async () => {
    setAPedir(true);
    setPedidoMensagem(null);
    try {
      const res = await fetch("/api/diagnostico/iniciar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crianca_id: crianca.id }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setPedidoMensagem(
          data?.erro ?? "Não conseguimos preparar um novo diagnóstico agora.",
        );
      } else {
        setPedidoMensagem(
          `Novo diagnóstico preparado. Quando ${crianca.nome} entrar, vai encontrá-lo à espera.`,
        );
      }
    } catch {
      setPedidoMensagem("Não conseguimos preparar um novo diagnóstico agora.");
    } finally {
      setAPedir(false);
    }
  };

  async function abrirPlano(c: MapaCompetencia) {
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--fundo-pai)",
        padding: "32px 20px 64px",
      }}
    >
      <div style={{ maxWidth: "920px", margin: "0 auto" }}>
        <div style={{ marginBottom: "16px" }}>
          <Link
            href="/familia"
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--texto-secundario)",
              letterSpacing: "0.03em",
            }}
          >
            ← Família
          </Link>
        </div>

        <header style={{ marginBottom: "32px" }}>
          <h1
            className="font-editorial"
            style={{
              fontSize: "36px",
              fontWeight: 500,
              marginBottom: "8px",
              color: "var(--texto-principal)",
            }}
          >
            Progresso de {crianca.nome}
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
            }}
          >
            {idade !== null ? `${idade} anos · ` : ""}Currículo {crianca.curriculo} ·{" "}
            {crianca.anoEscolar}.º ano
          </p>
          {ultimoDiagnostico && (
            <p
              style={{
                fontSize: "13px",
                color: "var(--texto-secundario)",
                fontWeight: 600,
                marginTop: "4px",
              }}
            >
              {ultimoDiagnostico.estado === "concluido"
                ? `Último diagnóstico concluído em ${formatData(ultimoDiagnostico.concluido_em)}.`
                : `Diagnóstico ${ultimoDiagnostico.estado === "em_curso" ? "em curso" : "interrompido"} — iniciado em ${formatData(ultimoDiagnostico.iniciado_em)}.`}
            </p>
          )}
        </header>

        <section
          style={{
            background: "rgba(255,255,255,0.7)",
            borderRadius: "20px",
            padding: "24px",
            marginBottom: "28px",
            border: "1px solid rgba(160,144,128,0.15)",
          }}
        >
          <p
            style={{
              fontSize: "15px",
              color: "var(--texto-principal)",
              fontWeight: 600,
              lineHeight: 1.8,
            }}
          >
            {crianca.nome} tem{" "}
            <strong>{resumo.esperado} competências no nível esperado</strong>
            {resumo.acimaEsperado > 0 ? (
              <>
                , <strong>{resumo.acimaEsperado} acima do esperado</strong>
              </>
            ) : null}
            , <strong>{resumo.desenvolvimento} em desenvolvimento</strong>,{" "}
            <strong>{resumo.precisaAtencao} precisam de atenção</strong>
            {resumo.emAvaliacao > 0 ? (
              <>
                , <strong>{resumo.emAvaliacao} em avaliação</strong>
              </>
            ) : null}{" "}
            e <strong>{resumo.naoAvaliada} por avaliar</strong> (total: {resumo.total}).
          </p>
          {totalLacunas > 0 && (
            <p
              style={{
                fontSize: "13px",
                color: "#b54a30",
                fontWeight: 700,
                marginTop: "12px",
              }}
            >
              {totalLacunas} {totalLacunas === 1 ? "competência tem" : "competências têm"} lacunas
              de base — clica num cartão marcado para ver o plano de consolidação.
            </p>
          )}
        </section>

        <section style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "20px",
              fontSize: "12px",
              color: "var(--texto-secundario)",
              fontWeight: 700,
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: NIVEL_COR[n].bg,
                  border: `1px solid ${NIVEL_COR[n].border}`,
                  color: NIVEL_COR[n].texto,
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: NIVEL_COR[n].texto,
                  }}
                />
                {NIVEL_COR[n].label}
              </span>
            ))}
          </div>

          {Array.from(porArea.entries()).map(([area, dominios]) => {
            const aberta = areasAbertas.has(area);
            const todasCompetencias = Array.from(dominios.values()).flat();
            return (
              <div
                key={area}
                style={{
                  background: "rgba(255,255,255,0.7)",
                  borderRadius: "20px",
                  padding: "0",
                  marginBottom: "14px",
                  border: "1px solid rgba(160,144,128,0.15)",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => toggleArea(area)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 22px",
                    cursor: "none",
                    fontFamily: "inherit",
                  }}
                >
                  <div>
                    <h2
                      className="font-editorial"
                      style={{
                        fontSize: "22px",
                        fontWeight: 500,
                        textAlign: "left",
                        color: "var(--texto-principal)",
                      }}
                    >
                      {area}
                    </h2>
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "var(--texto-secundario)",
                        marginTop: "2px",
                        textAlign: "left",
                      }}
                    >
                      {todasCompetencias.length} competências
                    </p>
                  </div>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{
                      transform: aberta ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 0.2s",
                    }}
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="var(--texto-secundario)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {aberta && (
                  <div style={{ padding: "0 22px 22px" }}>
                    {Array.from(dominios.entries()).map(([dominio, comps]) => (
                      <div key={dominio} style={{ marginBottom: "18px" }}>
                        <p
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "var(--texto-secundario)",
                            marginBottom: "10px",
                          }}
                        >
                          {dominio}
                        </p>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(220px, 1fr))",
                            gap: "10px",
                          }}
                        >
                          {comps.map((c) => {
                            const nivelCor = NIVEL_COR[c.nivel] ?? NIVEL_COR[0];
                            const lacunas = lacunasMap[c.id] ?? 0;
                            const tooltip = `Nível ${c.nivel} · ${ESTADO_LABEL[c.estado] ?? c.estado} · ${c.tentativas} ${c.tentativas === 1 ? "tentativa" : "tentativas"}`;
                            return (
                              <button
                                key={c.id}
                                onClick={() => abrirPlano(c)}
                                title={tooltip}
                                style={{
                                  position: "relative",
                                  textAlign: "left",
                                  background: nivelCor.bg,
                                  border: `1.5px solid ${nivelCor.border}`,
                                  borderRadius: "12px",
                                  padding: "10px 12px",
                                  cursor: "none",
                                  fontFamily: "inherit",
                                }}
                              >
                                {lacunas > 0 && (
                                  <span
                                    aria-label="Base em falta"
                                    title={`Depende de ${lacunas} competência${lacunas > 1 ? "s" : ""} por consolidar.`}
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
                                {c.codigo_oficial && (
                                  <p
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: 800,
                                      letterSpacing: "0.04em",
                                      color: nivelCor.texto,
                                      marginBottom: "3px",
                                    }}
                                  >
                                    {c.codigo_oficial}
                                  </p>
                                )}
                                <p
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: "var(--texto-principal)",
                                    lineHeight: 1.4,
                                    paddingRight: lacunas > 0 ? "22px" : 0,
                                  }}
                                >
                                  {c.descricao ?? "—"}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {sugestoes.length > 0 && (
          <section
            style={{
              background: "rgba(255,255,255,0.7)",
              borderRadius: "20px",
              padding: "24px",
              marginBottom: "28px",
              border: "1px solid rgba(160,144,128,0.15)",
            }}
          >
            <h2
              className="font-editorial"
              style={{ fontSize: "22px", fontWeight: 500, marginBottom: "12px" }}
            >
              Sugestões de reforço
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "var(--texto-secundario)",
                fontWeight: 600,
                marginBottom: "18px",
              }}
            >
              As áreas que pedem mais atenção neste momento — ordenadas por prioridade.
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {sugestoes.map((s) => (
                <li
                  key={s.id}
                  style={{
                    background: "rgba(167,139,250,0.08)",
                    border: "1px solid rgba(167,139,250,0.22)",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: NIVEL_COR[s.nivel].texto,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 800,
                        color: "var(--texto-principal)",
                      }}
                    >
                      Reforço sugerido:{" "}
                      <span style={{ color: "#534ab7" }}>
                        {s.area}
                        {s.dominio ? ` — ${s.dominio}` : ""}
                      </span>
                      .
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--texto-secundario)",
                        fontWeight: 600,
                      }}
                    >
                      {s.descricao ?? "—"}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: NIVEL_COR[s.nivel].texto,
                      background: NIVEL_COR[s.nivel].bg,
                      padding: "4px 10px",
                      borderRadius: "999px",
                    }}
                  >
                    {NIVEL_COR[s.nivel].label}
                  </span>
                </li>
              ))}
            </ul>
            <p
              style={{
                fontSize: "12px",
                color: "var(--texto-secundario)",
                fontWeight: 600,
                fontStyle: "italic",
                marginTop: "16px",
              }}
            >
              Em breve: sugestões de lições e momentos para aprofundar cada uma destas
              competências.
            </p>
          </section>
        )}

        <section
          style={{
            background: "rgba(255,255,255,0.6)",
            borderRadius: "18px",
            padding: "20px",
            border: "1px dashed rgba(160,144,128,0.3)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            Se quiseres voltar a conhecer o que {crianca.nome} sabe daqui a alguns meses,
            podes pedir um novo diagnóstico.
          </p>
          <button
            onClick={pedirNovoDiagnostico}
            disabled={aPedir}
            style={{
              background: "transparent",
              border: "1.5px solid rgba(167,139,250,0.5)",
              color: "#534ab7",
              borderRadius: "12px",
              padding: "10px 22px",
              fontSize: "13px",
              fontWeight: 800,
              cursor: "none",
              fontFamily: "Nunito, sans-serif",
              opacity: aPedir ? 0.6 : 1,
            }}
          >
            {aPedir ? "A preparar…" : "Pedir novo diagnóstico"}
          </button>
          {pedidoMensagem && (
            <p
              style={{
                marginTop: "14px",
                fontSize: "12px",
                color: "var(--texto-secundario)",
                fontWeight: 600,
              }}
            >
              {pedidoMensagem}
            </p>
          )}
        </section>
      </div>

      {alvoSeleccionado && (
        <PainelPlano
          crianca={{ nome: crianca.nome, ano_escolar: crianca.anoEscolar }}
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
  alvo: MapaCompetencia;
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
  const nivelCor = NIVEL_COR[nivel] ?? NIVEL_COR[0];
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
              background: nivelCor.bg,
              border: `1px solid ${nivelCor.border}`,
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
