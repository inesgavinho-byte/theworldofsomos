"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Crianca {
  id: string;
  nome: string;
}

interface Desafio {
  id: string;
  modo: string | null;
  estado: string | null;
  conteudo: any;
  criado_por: string | null;
  created_at: string | null;
}

interface Props {
  profile: { nome: string; tipo: string };
  userId: string;
  familiaId: string | null;
  familiaNome: string | null;
  criancas: Crianca[];
  desafios: Desafio[];
}

const MODO_LABELS: Record<string, string> = {
  tempo_real: "Desafio Agora",
  assincrono: "Desafio Deixado",
  fisico: "Aventura Física",
};

const MODO_CORES: Record<string, string> = {
  tempo_real: "#60a5fa",
  assincrono: "#a78bfa",
  fisico: "#4ade80",
};

const ESTADO_LABELS: Record<string, string> = {
  pendente: "A aguardar",
  em_curso: "Em curso",
  concluido: "Concluído",
  aguardando: "A aguardar criança",
};

function formatData(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${d.getDate()} ${meses[d.getMonth()]}`;
}

export default function FamiliaClient({
  profile,
  userId,
  familiaId,
  familiaNome,
  criancas,
  desafios,
}: Props) {
  const router = useRouter();
  const tipo = profile.tipo;

  const handleLogout = async () => {
    // Fix 10: usar API route para apagar cookie somos-context no logout
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(tipo === "crianca" ? "/crianca/login" : "/login");
  };

  const dashboardHref = tipo === "crianca" ? "/crianca/dashboard" : "/dashboard";

  const totalEstesMes = desafios.filter((d) => {
    if (!d.created_at) return false;
    const now = new Date();
    const created = new Date(d.created_at);
    return (
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--fundo-pai)",
        position: "relative",
        zIndex: 1,
        padding: "32px 24px 64px",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "860px",
          margin: "0 auto 40px",
        }}
      >
        <Link href={dashboardHref} style={{ textDecoration: "none" }}>
          <h1
            className="font-editorial"
            style={{ fontSize: "26px", fontWeight: 500, color: "var(--texto-principal)", cursor: "none" }}
          >
            SOMOS
          </h1>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "13px", color: "var(--texto-secundario)", fontWeight: 600 }}>
            {profile.nome}
          </span>
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
      </div>

      {/* Main content */}
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* Hero header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "48px",
            animation: "fadeIn 0.6s ease",
          }}
        >
          {/* Constellation SVG */}
          <div style={{ marginBottom: "16px", opacity: 0.4 }}>
            <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
              <circle cx="20" cy="20" r="2" fill="#a78bfa" />
              <circle cx="50" cy="10" r="1.5" fill="#4ade80" />
              <circle cx="80" cy="25" r="2" fill="#60a5fa" />
              <circle cx="100" cy="8" r="1.5" fill="#facc15" />
              <line x1="20" y1="20" x2="50" y2="10" stroke="rgba(160,144,128,0.3)" strokeWidth="0.8" />
              <line x1="50" y1="10" x2="80" y2="25" stroke="rgba(160,144,128,0.3)" strokeWidth="0.8" />
              <line x1="80" y1="25" x2="100" y2="8" stroke="rgba(160,144,128,0.3)" strokeWidth="0.8" />
            </svg>
          </div>

          <h2
            className="font-editorial"
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 500,
              color: "var(--texto-principal)",
              lineHeight: 1.15,
              marginBottom: "12px",
            }}
          >
            A nossa família aprende junta
          </h2>
          {familiaNome && (
            <p
              style={{
                fontSize: "15px",
                color: "var(--texto-secundario)",
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              Família {familiaNome}
            </p>
          )}
        </div>

        {/* Three mode cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            marginBottom: "48px",
          }}
        >
          {/* Mode 1: Desafio Agora */}
          <Link href="/familia/agora" style={{ textDecoration: "none" }}>
            <div
              className="card-hover"
              style={{
                background: "rgba(96,165,250,0.08)",
                border: "1.5px solid rgba(96,165,250,0.25)",
                borderRadius: "20px",
                padding: "28px 24px",
                cursor: "none",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "14px",
                  background: "rgba(96,165,250,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                }}
              >
                ⚡
              </div>
              <div>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#185fa5",
                    marginBottom: "6px",
                    fontFamily: "Nunito, sans-serif",
                  }}
                >
                  Desafio Agora
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--texto-secundario)",
                    lineHeight: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Jogar juntos neste momento — ambos respondem ao mesmo tempo
                </p>
              </div>
              <div
                style={{
                  marginTop: "auto",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#60a5fa",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                Tempo real →
              </div>
            </div>
          </Link>

          {/* Mode 2: Deixar Desafio */}
          <Link href="/familia/desafio" style={{ textDecoration: "none" }}>
            <div
              className="card-hover"
              style={{
                background: "rgba(167,139,250,0.08)",
                border: "1.5px solid rgba(167,139,250,0.25)",
                borderRadius: "20px",
                padding: "28px 24px",
                cursor: "none",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "14px",
                  background: "rgba(167,139,250,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                }}
              >
                ✉️
              </div>
              <div>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#534ab7",
                    marginBottom: "6px",
                    fontFamily: "Nunito, sans-serif",
                  }}
                >
                  {tipo === "pai" ? "Deixar um Desafio" : "Desafios Pendentes"}
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--texto-secundario)",
                    lineHeight: 1.5,
                    fontWeight: 600,
                  }}
                >
                  {tipo === "pai"
                    ? "Para quando não estão juntos — a criança responde quando quiser"
                    : "Vê os desafios que a tua família te deixou"}
                </p>
              </div>
              <div
                style={{
                  marginTop: "auto",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#a78bfa",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                Assíncrono →
              </div>
            </div>
          </Link>

          {/* Mode 3: Aventura Física */}
          <Link href="/familia/aventura" style={{ textDecoration: "none" }}>
            <div
              className="card-hover"
              style={{
                background: "rgba(74,222,128,0.08)",
                border: "1.5px solid rgba(74,222,128,0.25)",
                borderRadius: "20px",
                padding: "28px 24px",
                cursor: "none",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "14px",
                  background: "rgba(74,222,128,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                }}
              >
                🌿
              </div>
              <div>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#2d5c3a",
                    marginBottom: "6px",
                    fontFamily: "Nunito, sans-serif",
                  }}
                >
                  Aventura Física
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--texto-secundario)",
                    lineHeight: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Sair do ecrã e explorar o mundo juntos com uma actividade sugerida
                </p>
              </div>
              <div
                style={{
                  marginTop: "auto",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#4ade80",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                Sem ecrã →
              </div>
            </div>
          </Link>
        </div>

        {/* Histórico */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h3
              className="font-editorial"
              style={{ fontSize: "20px", fontWeight: 500 }}
            >
              Histórico
            </h3>
            {totalEstesMes > 0 && (
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--texto-secundario)",
                  background: "rgba(160,144,128,0.12)",
                  padding: "4px 12px",
                  borderRadius: "20px",
                }}
              >
                {totalEstesMes} desafio{totalEstesMes !== 1 ? "s" : ""} este mês
              </span>
            )}
          </div>

          {desafios.length === 0 ? (
            <div
              style={{
                background: "rgba(245,242,236,0.8)",
                borderRadius: "16px",
                padding: "32px",
                textAlign: "center",
                border: "1px solid rgba(160,144,128,0.15)",
              }}
            >
              <p
                className="font-editorial"
                style={{ fontSize: "18px", color: "var(--texto-secundario)", fontStyle: "italic" }}
              >
                O primeiro desafio está à vossa espera.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {desafios.map((d) => {
                const cor = MODO_CORES[d.modo ?? ""] ?? "#a09080";
                const modoLabel = MODO_LABELS[d.modo ?? ""] ?? d.modo ?? "—";
                const estadoLabel = ESTADO_LABELS[d.estado ?? ""] ?? d.estado ?? "—";
                const tema = d.conteudo?.dimensao ?? d.conteudo?.tema ?? "—";

                return (
                  <div
                    key={d.id}
                    style={{
                      background: "rgba(245,242,236,0.8)",
                      borderRadius: "14px",
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      border: "1px solid rgba(160,144,128,0.12)",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: cor,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--texto-principal)" }}>
                        {modoLabel}
                        {tema !== "—" && (
                          <span style={{ fontWeight: 600, color: "var(--texto-secundario)" }}>
                            {" "}· {tema}
                          </span>
                        )}
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--texto-secundario)", fontWeight: 600 }}>
                        {estadoLabel}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--texto-secundario)",
                        fontWeight: 600,
                      }}
                    >
                      {formatData(d.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer note */}
        <p
          className="font-editorial"
          style={{
            textAlign: "center",
            marginTop: "48px",
            fontSize: "16px",
            color: "var(--texto-secundario)",
            fontStyle: "italic",
          }}
        >
          "A família que aprende junta, fica junta."
        </p>
      </div>
    </div>
  );
}
