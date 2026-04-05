"use client";

import { useState, useMemo, CSSProperties } from "react";

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  profiles?: { nome: string } | null;
}

interface Props {
  logs: AuditLog[];
}

const CATEGORIA_CORES: Record<string, { bg: string; cor: string; borda: string }> = {
  auth: { bg: "rgba(160,144,128,0.12)", cor: "#6b5f52", borda: "rgba(160,144,128,0.4)" },
  child: { bg: "rgba(167,139,250,0.12)", cor: "#7c3aed", borda: "rgba(167,139,250,0.4)" },
  ai: { bg: "rgba(96,165,250,0.12)", cor: "#1d4ed8", borda: "rgba(96,165,250,0.4)" },
  admin: { bg: "rgba(251,191,36,0.12)", cor: "#92400e", borda: "rgba(251,191,36,0.4)" },
  guilda: { bg: "rgba(74,222,128,0.12)", cor: "#15803d", borda: "rgba(74,222,128,0.4)" },
  mailbox: { bg: "rgba(244,114,182,0.12)", cor: "#be185d", borda: "rgba(244,114,182,0.4)" },
  familia: { bg: "rgba(251,191,36,0.12)", cor: "#92400e", borda: "rgba(251,191,36,0.4)" },
  session: { bg: "rgba(96,165,250,0.12)", cor: "#1e40af", borda: "rgba(96,165,250,0.4)" },
};

function getCategoria(action: string): string {
  return action.split(".")[0] ?? "outro";
}

function getCores(action: string) {
  const cat = getCategoria(action);
  return CATEGORIA_CORES[cat] ?? { bg: "rgba(160,144,128,0.1)", cor: "#6b5f52", borda: "rgba(160,144,128,0.3)" };
}

function formatData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AuditoriaClient({ logs }: Props) {
  const [filtroAccao, setFiltroAccao] = useState("");
  const [filtroUtilizador, setFiltroUtilizador] = useState("");
  const [filtroEntidade, setFiltroEntidade] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null);

  const categorias = useMemo(() => {
    const cats = new Set(logs.map((l) => getCategoria(l.action)));
    return Array.from(cats).sort();
  }, [logs]);

  const logsFiltrados = useMemo(() => {
    return logs.filter((l) => {
      if (filtroAccao && !l.action.startsWith(filtroAccao)) return false;
      if (filtroUtilizador) {
        const nome = l.profiles?.nome?.toLowerCase() ?? "";
        const uid = l.user_id?.toLowerCase() ?? "";
        const q = filtroUtilizador.toLowerCase();
        if (!nome.includes(q) && !uid.includes(q)) return false;
      }
      if (filtroEntidade && l.entity_type !== filtroEntidade) return false;
      return true;
    });
  }, [logs, filtroAccao, filtroUtilizador, filtroEntidade]);

  const tiposEntidade = useMemo(() => {
    const tipos = new Set(logs.map((l) => l.entity_type).filter(Boolean) as string[]);
    return Array.from(tipos).sort();
  }, [logs]);

  const inputStyle: CSSProperties = {
    padding: "8px 12px",
    borderRadius: "10px",
    border: "1.5px solid rgba(160,144,128,0.3)",
    background: "white",
    fontSize: "13px",
    fontFamily: "Nunito, sans-serif",
    fontWeight: 600,
    outline: "none",
    color: "var(--texto-principal)",
  };

  const selectStyle: CSSProperties = {
    ...inputStyle,
    cursor: "pointer",
  };

  return (
    <div>
      {/* Filtros */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px",
          padding: "16px",
          background: "rgba(245,242,236,0.9)",
          borderRadius: "14px",
          border: "1px solid rgba(160,144,128,0.15)",
        }}
      >
        <select
          value={filtroAccao}
          onChange={(e) => setFiltroAccao(e.target.value)}
          style={selectStyle}
        >
          <option value="">Todas as acções</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}.*
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Filtrar por utilizador..."
          value={filtroUtilizador}
          onChange={(e) => setFiltroUtilizador(e.target.value)}
          style={{ ...inputStyle, minWidth: "180px" }}
        />

        <select
          value={filtroEntidade}
          onChange={(e) => setFiltroEntidade(e.target.value)}
          style={selectStyle}
        >
          <option value="">Todas as entidades</option>
          {tiposEntidade.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {(filtroAccao || filtroUtilizador || filtroEntidade) && (
          <button
            onClick={() => {
              setFiltroAccao("");
              setFiltroUtilizador("");
              setFiltroEntidade("");
            }}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              border: "1.5px solid rgba(160,144,128,0.3)",
              background: "transparent",
              fontSize: "12px",
              fontFamily: "Nunito, sans-serif",
              fontWeight: 700,
              color: "var(--texto-secundario)",
              cursor: "pointer",
            }}
          >
            Limpar
          </button>
        )}

        <span
          style={{
            marginLeft: "auto",
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--texto-secundario)",
            alignSelf: "center",
          }}
        >
          {logsFiltrados.length} registo{logsFiltrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabela */}
      <div
        style={{
          background: "rgba(245,242,236,0.9)",
          borderRadius: "14px",
          border: "1px solid rgba(160,144,128,0.15)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "160px 140px 1fr 120px 40px",
            gap: "12px",
            padding: "12px 16px",
            borderBottom: "1px solid rgba(160,144,128,0.15)",
            fontSize: "10px",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            color: "var(--texto-secundario)",
          }}
        >
          <span>Data/hora</span>
          <span>Utilizador</span>
          <span>Acção</span>
          <span>Entidade</span>
          <span />
        </div>

        {logsFiltrados.length === 0 && (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--texto-secundario)",
            }}
          >
            Sem registos para os filtros seleccionados.
          </div>
        )}

        {logsFiltrados.map((l) => {
          const cores = getCores(l.action);
          const isOpen = expandido === l.id;
          const temMetadata = l.metadata && Object.keys(l.metadata).length > 0;

          return (
            <div key={l.id}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "160px 140px 1fr 120px 40px",
                  gap: "12px",
                  padding: "12px 16px",
                  borderBottom: "1px solid rgba(160,144,128,0.08)",
                  alignItems: "center",
                  background: isOpen ? "rgba(245,242,236,0.5)" : "transparent",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--texto-secundario)",
                    fontFamily: "monospace",
                  }}
                >
                  {formatData(l.created_at)}
                </span>

                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--texto-principal)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap" as const,
                  }}
                  title={l.profiles?.nome ?? l.user_id ?? ""}
                >
                  {l.profiles?.nome ?? (l.user_id ? `${l.user_id.slice(0, 8)}…` : "sistema")}
                </span>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      background: cores.bg,
                      color: cores.cor,
                      border: `1px solid ${cores.borda}`,
                      borderRadius: "6px",
                      padding: "2px 8px",
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                      fontFamily: "monospace",
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    {l.action}
                  </span>
                </span>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--texto-secundario)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap" as const,
                  }}
                  title={l.entity_type ?? ""}
                >
                  {l.entity_type ?? "—"}
                </span>

                <button
                  onClick={() => setExpandido(isOpen ? null : l.id)}
                  disabled={!temMetadata && !l.ip_address && !l.entity_id}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: temMetadata || l.ip_address || l.entity_id ? "pointer" : "default",
                    fontSize: "14px",
                    opacity: temMetadata || l.ip_address || l.entity_id ? 1 : 0.2,
                    padding: "4px",
                    borderRadius: "6px",
                    color: "var(--texto-secundario)",
                    transition: "transform 0.15s",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                  aria-label="Expandir detalhes"
                >
                  ▾
                </button>
              </div>

              {isOpen && (
                <div
                  style={{
                    padding: "12px 16px 16px",
                    borderBottom: "1px solid rgba(160,144,128,0.08)",
                    background: "rgba(255,255,255,0.4)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {l.entity_id && (
                    <div>
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          color: "var(--texto-secundario)",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase" as const,
                          marginBottom: "4px",
                        }}
                      >
                        Entity ID
                      </p>
                      <code
                        style={{
                          fontSize: "11px",
                          fontFamily: "monospace",
                          color: "var(--texto-principal)",
                        }}
                      >
                        {l.entity_id}
                      </code>
                    </div>
                  )}

                  {temMetadata && (
                    <div>
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          color: "var(--texto-secundario)",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase" as const,
                          marginBottom: "4px",
                        }}
                      >
                        Metadata
                      </p>
                      <pre
                        style={{
                          fontSize: "11px",
                          fontFamily: "monospace",
                          background: "rgba(160,144,128,0.08)",
                          borderRadius: "8px",
                          padding: "10px 12px",
                          margin: 0,
                          color: "var(--texto-principal)",
                          overflow: "auto",
                          maxHeight: "200px",
                        }}
                      >
                        {JSON.stringify(l.metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  {l.ip_address && (
                    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                      <div>
                        <p
                          style={{
                            fontSize: "10px",
                            fontWeight: 800,
                            color: "var(--texto-secundario)",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase" as const,
                            marginBottom: "4px",
                          }}
                        >
                          IP
                        </p>
                        <code style={{ fontSize: "11px", fontFamily: "monospace" }}>
                          {l.ip_address}
                        </code>
                      </div>
                      {l.user_agent && (
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: "10px",
                              fontWeight: 800,
                              color: "var(--texto-secundario)",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase" as const,
                              marginBottom: "4px",
                            }}
                          >
                            User Agent
                          </p>
                          <code
                            style={{
                              fontSize: "11px",
                              fontFamily: "monospace",
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap" as const,
                            }}
                            title={l.user_agent}
                          >
                            {l.user_agent}
                          </code>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
