"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { primeiroNome } from "@/lib/primeiro-nome";

const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const HOJE_IDX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

const COR_FALLBACK = "#a78bfa";

export type LicaoStatus = "nao_comecada" | "em_curso" | "completa";

export interface LicaoDashboard {
  id: string;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  tipo: string;
  curriculo: string | null;
  dimensao: string;
  cor: string | null;
  duracao_min: number | null;
  ordem: number | null;
  status: LicaoStatus;
  num_exercicios: number;
}

export interface MissaoDoDia {
  slug: string;
  titulo: string;
  dimensao: string;
  cor: string | null;
  num_exercicios: number;
  status: LicaoStatus;
}

interface Props {
  profile: { nome: string; tipo: string } | null;
  crianca: any;
  licoes: LicaoDashboard[];
  missaoDoDia: MissaoDoDia | null;
  streak: number;
  diasEstaSemana: number[];
  estrelasSemana: number;
  desafiosPendentes?: any[];
  diagnosticoPendente?: boolean;
}

function safeCor(cor: string | null | undefined): string {
  return cor && cor.trim().length > 0 ? cor : COR_FALLBACK;
}

const MISSAO_CARD_BG = "#1a1714";

export default function CriancaDashboardClient({
  profile,
  crianca,
  licoes,
  missaoDoDia,
  streak,
  diasEstaSemana,
  estrelasSemana,
  desafiosPendentes = [],
  diagnosticoPendente = false,
}: Props) {
  const router = useRouter();
  const nome = crianca?.nome ?? profile?.nome ?? "Explorador";
  const estrelasTotal = Number(crianca?.estrelas_total ?? 0);

  const licoesUniversais = licoes.filter((l) => l.tipo === "universal");
  const licoesCurriculares = licoes.filter((l) => l.tipo === "curricular");
  const diasSet = new Set(diasEstaSemana);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/crianca/login");
  };

  const missaoCor = safeCor(missaoDoDia?.cor ?? null);
  const missaoCardBg = MISSAO_CARD_BG;

  return (
    <div
      className="crianca-dashboard"
      style={{
        minHeight: "100vh",
        background: "var(--fundo-crianca)",
        position: "relative",
        zIndex: 1,
        overflowY: "auto",
      }}
    >
      <style>{`
        .crianca-dashboard {
          padding: 48px clamp(16px, 4vw, 56px) 80px;
        }
        @media (max-width: 768px) {
          .crianca-dashboard {
            padding: 24px 16px 64px;
          }
        }
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .dashboard-hero {
          max-width: 900px;
          margin: 0 auto 32px;
        }
        .licoes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        @media (max-width: 768px) {
          .licoes-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }
        .licao-card {
          position: relative;
          aspect-ratio: 1 / 1;
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(160,144,128,0.16);
          border-radius: 16px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          cursor: none;
          overflow: hidden;
        }
        @media (max-width: 768px) {
          .licao-card {
            aspect-ratio: auto;
            min-height: 140px;
          }
        }
        .licao-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px -16px rgba(26,23,20,0.18);
        }
        .licao-card.completa {
          background: rgba(74,222,128,0.08);
          border-color: rgba(74,222,128,0.28);
        }
        .licao-card-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .secao-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 40px 0 18px;
        }
        @media (max-width: 768px) {
          .secao-header {
            margin: 28px 0 14px;
          }
        }
        .secao-header-linha {
          flex: 1;
          height: 1px;
          background: rgba(160,144,128,0.18);
        }
        .metrics-row {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }
        .metric-card {
          background: rgba(255,255,255,0.6);
          border-radius: 14px;
          padding: 14px 20px;
          border: 1px solid rgba(160,144,128,0.12);
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        .semana-pills {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .semana-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          min-width: 44px;
        }
        .semana-pill-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
        }
      `}</style>

      <div className="dashboard-container">
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "40px",
          }}
        >
          <h1 className="font-editorial" style={{ fontSize: "24px", fontWeight: 500 }}>
            SOMOS
          </h1>
          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "1.5px solid rgba(160,144,128,0.3)",
              borderRadius: "10px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "Nunito, sans-serif",
              color: "var(--texto-secundario)",
              cursor: "none",
            }}
          >
            Sair
          </button>
        </div>

        {/* Avatar + saudação */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "28px",
            animation: "fadeIn 0.5s ease",
          }}
        >
          <div
            style={{
              width: "84px",
              height: "84px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #a78bfa 0%, #4ade80 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "14px",
              fontSize: "32px",
              fontWeight: 900,
              color: "white",
            }}
          >
            {nome.charAt(0).toUpperCase()}
          </div>
          <h2
            className="font-editorial"
            style={{ fontSize: "34px", fontWeight: 500, marginBottom: "4px" }}
          >
            Olá, {primeiroNome(nome)}
          </h2>
          <p style={{ fontSize: "14px", color: "var(--texto-secundario)", fontWeight: 600 }}>
            O que vamos descobrir hoje?
          </p>
          {streak > 0 && (
            <p
              style={{
                marginTop: "10px",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--roxo-texto)",
                letterSpacing: "0.02em",
              }}
            >
              🔥 {streak} {streak === 1 ? "dia seguido" : "dias seguidos"}
            </p>
          )}
        </div>

        {/* Métricas — só verdade */}
        <div className="metrics-row" style={{ justifyContent: "center" }}>
          <div className="metric-card">
            <span style={{ fontSize: "22px", fontWeight: 900, color: "#facc15" }}>
              {estrelasTotal}
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--texto-secundario)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Estrelas
            </span>
          </div>
          <div className="metric-card">
            <span style={{ fontSize: "22px", fontWeight: 900, color: "#4ade80" }}>
              {licoes.length}
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--texto-secundario)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Lições disponíveis
            </span>
          </div>
        </div>

        {/* Diagnóstico pendente */}
        {diagnosticoPendente && (
          <Link href="/crianca/diagnostico" style={{ textDecoration: "none" }}>
            <div
              className="card-hover dashboard-hero"
              style={{
                background: "rgba(167,139,250,0.1)",
                border: "1.5px solid rgba(167,139,250,0.28)",
                borderRadius: "18px",
                padding: "18px 20px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                cursor: "none",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "rgba(167,139,250,0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#534ab7" strokeWidth="1.5" />
                  <path
                    d="M12 7V12L15 14"
                    stroke="#534ab7"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "14px", fontWeight: 800, color: "#534ab7", marginBottom: "2px" }}>
                  Fazer o diagnóstico inicial
                </p>
                <p style={{ fontSize: "12px", color: "var(--texto-secundario)", fontWeight: 600 }}>
                  15 min · Ajuda-nos a conhecer-te melhor
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18L15 12L9 6"
                  stroke="var(--texto-secundario)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Link>
        )}

        {/* Desafios IA enviados pelo pai/mãe */}
        {desafiosPendentes.length > 0 && (
          <div className="dashboard-hero" style={{ marginBottom: "16px" }}>
            {desafiosPendentes.map((desafio) => (
              <Link key={desafio.id} href={`/crianca/exercicios-ia/${desafio.id}`}>
                <div
                  className="card-hover"
                  style={{
                    background: "rgba(96,165,250,0.12)",
                    border: "1.5px solid rgba(96,165,250,0.35)",
                    borderRadius: "20px",
                    padding: "18px 20px",
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    cursor: "none",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "rgba(96,165,250,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      flexShrink: 0,
                    }}
                  >
                    📚
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "14px", fontWeight: 800, color: "#185fa5", marginBottom: "2px" }}>
                      A tua mãe enviou-te exercícios novos!
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--texto-secundario)", fontWeight: 600 }}>
                      {desafio.conteudo?.tema ?? "Exercícios do livro"} · Toca para começar
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12H19M13 6L19 12L13 18"
                      stroke="#185fa5"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Missão do dia ou bloco "Completaste tudo" */}
        {missaoDoDia ? (
          <Link href={`/licao/${missaoDoDia.slug}/exercicios`}>
            <div
              className="card-hover dashboard-hero"
              style={{
                background: missaoCardBg,
                borderRadius: "22px",
                padding: "28px",
                marginBottom: "16px",
                color: "white",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "260px",
                  height: "260px",
                  background: `radial-gradient(circle at 80% 20%, ${missaoCor}28 0%, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  opacity: 0.5,
                  marginBottom: "10px",
                }}
              >
                Missão do dia
              </p>
              <div
                className="badge-dimensao"
                style={{
                  background: `${missaoCor}25`,
                  color: missaoCor,
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: missaoCor,
                  }}
                />
                {missaoDoDia.dimensao}
              </div>
              <h3
                className="font-editorial"
                style={{ fontSize: "32px", fontWeight: 500, marginBottom: "16px", lineHeight: 1.1 }}
              >
                {missaoDoDia.titulo}
              </h3>

              {missaoDoDia.num_exercicios > 0 && (
                <p style={{ fontSize: "12px", opacity: 0.55, marginBottom: "16px" }}>
                  {missaoDoDia.num_exercicios} exercícios
                  {missaoDoDia.status === "em_curso" ? " · Retomar" : ""}
                </p>
              )}

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: missaoCor,
                  color: missaoCardBg,
                  padding: "10px 20px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 800,
                }}
              >
                {missaoDoDia.status === "em_curso" ? "Continuar" : "Começar"}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12H19M13 6L19 12L13 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </Link>
        ) : licoes.length > 0 ? (
          <div
            className="dashboard-hero"
            style={{
              background: "rgba(74,222,128,0.1)",
              border: "1.5px solid rgba(74,222,128,0.3)",
              borderRadius: "22px",
              padding: "28px",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#2d5c3a",
                marginBottom: "8px",
              }}
            >
              Missão do dia
            </p>
            <h3
              className="font-editorial"
              style={{ fontSize: "26px", fontWeight: 500, color: "#2d5c3a", marginBottom: "6px" }}
            >
              Completaste tudo
            </h3>
            <p style={{ fontSize: "14px", color: "var(--texto-secundario)", fontWeight: 600 }}>
              Vem explorar amanhã — há mais à tua espera.
            </p>
          </div>
        ) : null}

        {/* O Teu Mundo Interior — universais */}
        {licoesUniversais.length > 0 && (
          <>
            <div className="secao-header">
              <p
                className="font-editorial"
                style={{ fontSize: "22px", fontWeight: 500, whiteSpace: "nowrap" }}
              >
                O Teu Mundo Interior
              </p>
              <div className="secao-header-linha" />
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: "999px",
                  background: "rgba(167,139,250,0.12)",
                  color: "#534ab7",
                  fontSize: "10px",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Universal
              </span>
            </div>
            <div className="licoes-grid">
              {licoesUniversais.map((licao) => (
                <LicaoCard key={licao.id} licao={licao} />
              ))}
            </div>
          </>
        )}

        {/* As Tuas Matérias — curriculares */}
        {licoesCurriculares.length > 0 && (
          <>
            <div className="secao-header">
              <p
                className="font-editorial"
                style={{ fontSize: "22px", fontWeight: 500, whiteSpace: "nowrap" }}
              >
                As Tuas Matérias
              </p>
              <div className="secao-header-linha" />
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: "999px",
                  background: "rgba(96,165,250,0.12)",
                  color: "#185fa5",
                  fontSize: "10px",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {crianca?.curriculo ?? "Curricular"}
              </span>
            </div>
            <div className="licoes-grid">
              {licoesCurriculares.map((licao) => (
                <LicaoCard key={licao.id} licao={licao} />
              ))}
            </div>
          </>
        )}

        {/* Esta semana */}
        <div className="secao-header">
          <p
            className="font-editorial"
            style={{ fontSize: "22px", fontWeight: 500, whiteSpace: "nowrap" }}
          >
            Esta semana
          </p>
          <div className="secao-header-linha" />
          {estrelasSemana > 0 && (
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#854f0b",
                background: "rgba(250,204,21,0.16)",
                padding: "3px 10px",
                borderRadius: "999px",
                letterSpacing: "0.02em",
              }}
            >
              ★ {estrelasSemana}
            </span>
          )}
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.6)",
            borderRadius: "18px",
            padding: "18px 22px",
            border: "1px solid rgba(160,144,128,0.12)",
          }}
        >
          <div className="semana-pills">
            {DIAS_SEMANA.map((dia, i) => {
              const isToday = i === HOJE_IDX;
              const isDone = diasSet.has(i);
              return (
                <div key={dia} className="semana-pill">
                  <div
                    className="semana-pill-circle"
                    style={{
                      background: isDone
                        ? "#4ade80"
                        : isToday
                        ? "rgba(167,139,250,0.18)"
                        : "rgba(160,144,128,0.12)",
                      color: isDone
                        ? "white"
                        : isToday
                        ? "var(--roxo-texto)"
                        : "var(--texto-secundario)",
                      border: isToday && !isDone ? "1.5px solid rgba(167,139,250,0.45)" : "none",
                    }}
                  >
                    {isDone ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 12L10 17L19 7"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      ""
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: isToday ? "var(--roxo-texto)" : "var(--texto-secundario)",
                    }}
                  >
                    {dia}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function LicaoCard({ licao }: { licao: LicaoDashboard }) {
  const cor = safeCor(licao.cor);
  const completa = licao.status === "completa";
  const emCurso = licao.status === "em_curso";

  return (
    <Link href={`/licao/${licao.slug}/exercicios`} style={{ textDecoration: "none" }}>
      <div className={`licao-card ${completa ? "completa" : ""}`}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: cor,
            opacity: completa ? 0.55 : 1,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="licao-card-dot" style={{ background: cor }} />
            <span
              style={{
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--texto-secundario)",
              }}
            >
              {licao.dimensao}
            </span>
          </div>
          {licao.duracao_min ? (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "var(--texto-secundario)",
                background: "rgba(160,144,128,0.1)",
                padding: "3px 8px",
                borderRadius: "999px",
              }}
            >
              {licao.duracao_min} min
            </span>
          ) : null}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h4
            className="font-editorial"
            style={{
              fontSize: "22px",
              fontWeight: 500,
              lineHeight: 1.15,
              marginTop: "10px",
              marginBottom: "6px",
              color: "var(--texto-principal)",
            }}
          >
            {licao.titulo}
          </h4>
          {licao.subtitulo ? (
            <p
              style={{
                fontSize: "12px",
                color: "var(--texto-secundario)",
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              {licao.subtitulo}
            </p>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {completa ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                fontWeight: 800,
                color: "#2d5c3a",
                letterSpacing: "0.04em",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12L10 17L19 7"
                  stroke="#2d5c3a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Completa
            </span>
          ) : emCurso ? (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: cor,
                letterSpacing: "0.04em",
              }}
            >
              Em curso
            </span>
          ) : (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--texto-secundario)",
                letterSpacing: "0.04em",
              }}
            >
              Começar
            </span>
          )}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18L15 12L9 6"
              stroke={completa ? "#2d5c3a" : "var(--texto-secundario)"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
