"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

const NU = "'Nunito', sans-serif";

interface Candidatura {
  id: string;
  nome: string;
  email: string;
  pais: string;
  pais_codigo: string;
  perfil: string;
  perfil_descricao: string | null;
  motivacao: string;
  contribuicao: string;
  linkedin: string | null;
  website: string | null;
  estado: string;
  created_at: string;
}

const PERFIL_LABELS: Record<string, string> = {
  criador_conteudo: "Criador de conteúdo",
  especialista_curriculo: "Especialista de currículo",
  tradutor: "Tradutor",
  educador: "Educador",
  pai_mae: "Pai ou Mãe",
  outro: "Outro",
};

const ESTADO_CORES: Record<string, { bg: string; text: string; border: string }> = {
  pendente: { bg: "rgba(250,204,21,0.1)", text: "#facc15", border: "rgba(250,204,21,0.3)" },
  aprovado: { bg: "rgba(74,222,128,0.1)", text: "#4ade80", border: "rgba(74,222,128,0.3)" },
  rejeitado: { bg: "rgba(244,114,182,0.1)", text: "#f472b6", border: "rgba(244,114,182,0.3)" },
  lista_espera: { bg: "rgba(96,165,250,0.1)", text: "#60a5fa", border: "rgba(96,165,250,0.3)" },
};

export default function AdminGuildaClient() {
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [totalAprovados, setTotalAprovados] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPais, setFiltroPais] = useState("");
  const [filtroPerfil, setFiltroPerfil] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/guilda");
      if (res.ok) {
        const data = await res.json();
        setCandidaturas(data.candidaturas);
        setTotalAprovados(data.totalAprovados);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function updateEstado(id: string, estado: string) {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin/guilda", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado }),
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error ?? "Erro ao actualizar");
      }
    } catch {
      alert("Erro de ligação");
    }
    setUpdating(null);
  }

  const filtered = candidaturas.filter((c) => {
    if (filtroEstado !== "todos" && c.estado !== filtroEstado) return false;
    if (filtroPais && !c.pais.toLowerCase().includes(filtroPais.toLowerCase())) return false;
    if (filtroPerfil && c.perfil !== filtroPerfil) return false;
    return true;
  });

  // Country distribution
  const paisDistribuicao: Record<string, number> = {};
  candidaturas
    .filter((c) => c.estado === "aprovado")
    .forEach((c) => {
      paisDistribuicao[c.pais] = (paisDistribuicao[c.pais] || 0) + 1;
    });

  const selectStyle: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(160,144,128,0.2)",
    background: "rgba(245,242,236,0.9)",
    fontFamily: NU,
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--texto-principal)",
    cursor: "none",
    outline: "none",
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--fundo-pai)",
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ fontFamily: NU, color: "var(--texto-secundario)", fontWeight: 600 }}>
          A carregar...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--fundo-pai)",
        position: "relative",
        zIndex: 1,
        padding: "32px 24px",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >
          <div>
            <h1 className="font-editorial" style={{ fontSize: "32px", fontWeight: 500 }}>
              Guilda — Admin
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "var(--texto-secundario)",
                fontWeight: 600,
                marginTop: "4px",
              }}
            >
              Gestão de candidaturas
            </p>
          </div>
          <Link href="/admin">
            <button
              style={{
                background: "transparent",
                border: "1.5px solid rgba(160,144,128,0.3)",
                borderRadius: "10px",
                padding: "7px 16px",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: NU,
                color: "var(--texto-secundario)",
                cursor: "none",
              }}
            >
              Voltar ao Admin
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "14px",
            marginBottom: "28px",
          }}
        >
          {[
            { label: "Total candidaturas", valor: candidaturas.length, cor: "#60a5fa" },
            { label: "Aprovados", valor: totalAprovados, cor: "#4ade80" },
            {
              label: "Pendentes",
              valor: candidaturas.filter((c) => c.estado === "pendente").length,
              cor: "#facc15",
            },
            {
              label: "Lista de espera",
              valor: candidaturas.filter((c) => c.estado === "lista_espera").length,
              cor: "#a78bfa",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(245,242,236,0.9)",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid rgba(160,144,128,0.15)",
              }}
            >
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: 900,
                  color: stat.cor,
                  lineHeight: 1,
                  marginBottom: "6px",
                }}
              >
                {stat.valor}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--texto-secundario)",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div
          style={{
            background: "rgba(245,242,236,0.9)",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid rgba(160,144,128,0.15)",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <p style={{ fontFamily: NU, fontSize: "13px", fontWeight: 700, color: "var(--texto-principal)" }}>
              Vagas preenchidas
            </p>
            <p style={{ fontFamily: NU, fontSize: "13px", fontWeight: 700, color: "#a78bfa" }}>
              {totalAprovados}/100
            </p>
          </div>
          <div
            style={{
              width: "100%",
              height: "8px",
              background: "rgba(160,144,128,0.15)",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min((totalAprovados / 100) * 100, 100)}%`,
                height: "100%",
                background: "linear-gradient(90deg, #a78bfa, #facc15)",
                borderRadius: "4px",
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>

        {/* Country distribution (if any approved) */}
        {Object.keys(paisDistribuicao).length > 0 && (
          <div
            style={{
              background: "rgba(245,242,236,0.9)",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid rgba(160,144,128,0.15)",
              marginBottom: "28px",
            }}
          >
            <p
              style={{
                fontFamily: NU,
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--texto-principal)",
                marginBottom: "12px",
              }}
            >
              Distribuição por país
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {Object.entries(paisDistribuicao)
                .sort((a, b) => b[1] - a[1])
                .map(([pais, count]) => (
                  <span
                    key={pais}
                    style={{
                      background: count >= 3 ? "rgba(167,139,250,0.15)" : "rgba(74,222,128,0.1)",
                      border: `1px solid ${count >= 3 ? "rgba(167,139,250,0.3)" : "rgba(74,222,128,0.3)"}`,
                      borderRadius: "8px",
                      padding: "4px 12px",
                      fontFamily: NU,
                      fontSize: "12px",
                      fontWeight: 700,
                      color: count >= 3 ? "#a78bfa" : "#4ade80",
                    }}
                  >
                    {pais} ({count}/3)
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={selectStyle}>
            <option value="todos">Todos os estados</option>
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado</option>
            <option value="rejeitado">Rejeitado</option>
            <option value="lista_espera">Lista de espera</option>
          </select>

          <input
            type="text"
            placeholder="Filtrar por país..."
            value={filtroPais}
            onChange={(e) => setFiltroPais(e.target.value)}
            style={{
              ...selectStyle,
              width: "180px",
            }}
          />

          <select value={filtroPerfil} onChange={(e) => setFiltroPerfil(e.target.value)} style={selectStyle}>
            <option value="">Todos os perfis</option>
            {Object.entries(PERFIL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <span
            style={{
              fontFamily: NU,
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--texto-secundario)",
              marginLeft: "auto",
            }}
          >
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Candidaturas list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((c) => {
            const isExpanded = expanded === c.id;
            const estadoCor = ESTADO_CORES[c.estado] ?? ESTADO_CORES.pendente;

            return (
              <div
                key={c.id}
                style={{
                  background: "rgba(245,242,236,0.9)",
                  borderRadius: "14px",
                  border: "1px solid rgba(160,144,128,0.15)",
                  overflow: "hidden",
                }}
              >
                {/* Row header */}
                <div
                  onClick={() => setExpanded(isExpanded ? null : c.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "16px 20px",
                    cursor: "none",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: NU,
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "var(--texto-principal)",
                        margin: "0 0 2px",
                      }}
                    >
                      {c.nome}
                    </p>
                    <p
                      style={{
                        fontFamily: NU,
                        fontSize: "12px",
                        color: "var(--texto-secundario)",
                        margin: 0,
                      }}
                    >
                      {c.email} · {c.pais} · {PERFIL_LABELS[c.perfil] ?? c.perfil}
                    </p>
                  </div>

                  <span
                    style={{
                      background: estadoCor.bg,
                      color: estadoCor.text,
                      border: `1px solid ${estadoCor.border}`,
                      borderRadius: "6px",
                      padding: "3px 10px",
                      fontSize: "11px",
                      fontWeight: 800,
                      fontFamily: NU,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.estado.replace("_", " ")}
                  </span>

                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--texto-secundario)",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 0.2s",
                    }}
                  >
                    ▼
                  </span>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: "1px solid rgba(160,144,128,0.1)",
                      padding: "20px",
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                      <div>
                        <p style={{ fontFamily: NU, fontSize: "11px", fontWeight: 700, color: "var(--texto-secundario)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Motivação
                        </p>
                        <p style={{ fontFamily: NU, fontSize: "13px", color: "var(--texto-principal)", lineHeight: 1.7, margin: 0 }}>
                          {c.motivacao}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontFamily: NU, fontSize: "11px", fontWeight: 700, color: "var(--texto-secundario)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Contribuição
                        </p>
                        <p style={{ fontFamily: NU, fontSize: "13px", color: "var(--texto-principal)", lineHeight: 1.7, margin: 0 }}>
                          {c.contribuicao}
                        </p>
                      </div>
                    </div>

                    {/* Links */}
                    <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                      {c.linkedin && (
                        <a
                          href={c.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontFamily: NU, fontSize: "12px", fontWeight: 700, color: "#60a5fa" }}
                        >
                          LinkedIn
                        </a>
                      )}
                      {c.website && (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontFamily: NU, fontSize: "12px", fontWeight: 700, color: "#60a5fa" }}
                        >
                          Website
                        </a>
                      )}
                      <span style={{ fontFamily: NU, fontSize: "12px", color: "var(--texto-secundario)" }}>
                        {new Date(c.created_at).toLocaleDateString("pt-PT")}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: "10px" }}>
                      {c.estado !== "aprovado" && (
                        <button
                          onClick={() => updateEstado(c.id, "aprovado")}
                          disabled={updating === c.id}
                          style={{
                            background: "rgba(74,222,128,0.15)",
                            color: "#4ade80",
                            border: "1px solid rgba(74,222,128,0.3)",
                            borderRadius: "8px",
                            padding: "8px 16px",
                            fontFamily: NU,
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "none",
                            opacity: updating === c.id ? 0.5 : 1,
                          }}
                        >
                          Aprovar
                        </button>
                      )}
                      {c.estado !== "rejeitado" && (
                        <button
                          onClick={() => updateEstado(c.id, "rejeitado")}
                          disabled={updating === c.id}
                          style={{
                            background: "rgba(244,114,182,0.15)",
                            color: "#f472b6",
                            border: "1px solid rgba(244,114,182,0.3)",
                            borderRadius: "8px",
                            padding: "8px 16px",
                            fontFamily: NU,
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "none",
                            opacity: updating === c.id ? 0.5 : 1,
                          }}
                        >
                          Rejeitar
                        </button>
                      )}
                      {c.estado !== "lista_espera" && (
                        <button
                          onClick={() => updateEstado(c.id, "lista_espera")}
                          disabled={updating === c.id}
                          style={{
                            background: "rgba(96,165,250,0.15)",
                            color: "#60a5fa",
                            border: "1px solid rgba(96,165,250,0.3)",
                            borderRadius: "8px",
                            padding: "8px 16px",
                            fontFamily: NU,
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "none",
                            opacity: updating === c.id ? 0.5 : 1,
                          }}
                        >
                          Lista de espera
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <p
              style={{
                textAlign: "center",
                fontFamily: NU,
                fontSize: "14px",
                color: "var(--texto-secundario)",
                padding: "40px 0",
              }}
            >
              Nenhuma candidatura encontrada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
