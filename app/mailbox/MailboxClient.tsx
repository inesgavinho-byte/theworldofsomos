"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Vista =
  | "inicio"
  | "escrever"
  | "depositada"
  | "ler"
  | "responder"
  | "respondida_ok"
  | "minhas";

type Carta = {
  id: string;
  conteudo: string;
  created_at?: string;
};

type MinhaCarta = {
  id: string;
  conteudo: string;
  estado: "aguarda" | "respondida";
  resposta?: string;
  created_at: string;
  respondida_at?: string;
  expires_at?: string;
};

interface Props {
  profile: { nome: string; tipo: string } | null;
}

function useCountdown(expiresAt: string | undefined) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    if (!expiresAt) return;

    const calc = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("expirada");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setRemaining(`${h}h ${m}min`);
    };

    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}

// Envelope SVG — linha, abre suavemente
function EnvelopeIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="64"
      height="48"
      viewBox="0 0 64 48"
      fill="none"
      style={{ transition: "all 0.6s ease" }}
    >
      {/* Corpo do envelope */}
      <rect
        x="2"
        y="14"
        width="60"
        height="32"
        rx="3"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.5"
      />
      {/* Tampa — fecha ou abre */}
      <path
        d={
          open
            ? "M2 14 L32 2 L62 14"
            : "M2 14 L32 26 L62 14"
        }
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        style={{ transition: "d 0.5s ease" }}
      />
      {/* Vincos laterais */}
      <line
        x1="2"
        y1="46"
        x2="26"
        y2="26"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1"
      />
      <line
        x1="62"
        y1="46"
        x2="38"
        y2="26"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1"
      />
    </svg>
  );
}

function CartaRespondidaCard({ carta }: { carta: MinhaCarta }) {
  const [aberta, setAberta] = useState(false);
  const countdown = useCountdown(carta.expires_at);

  return (
    <div
      style={{
        background: "rgba(167,139,250,0.06)",
        border: "1px solid rgba(167,139,250,0.2)",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#a78bfa",
            flexShrink: 0,
          }}
        />
        <p
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#a78bfa",
          }}
        >
          A tua carta encontrou alguém.
        </p>
      </div>

      <p
        style={{
          fontSize: "13px",
          color: "rgba(255,255,255,0.45)",
          fontStyle: "italic",
          lineHeight: 1.6,
          marginBottom: "14px",
          borderLeft: "2px solid rgba(255,255,255,0.08)",
          paddingLeft: "12px",
        }}
      >
        {carta.conteudo.length > 120
          ? carta.conteudo.slice(0, 120) + "…"
          : carta.conteudo}
      </p>

      {!aberta ? (
        <button
          onClick={() => setAberta(true)}
          style={{
            background: "none",
            border: "1px solid rgba(167,139,250,0.35)",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: 700,
            color: "#a78bfa",
            cursor: "pointer",
            fontFamily: "Nunito, sans-serif",
          }}
        >
          Ver resposta →
        </button>
      ) : (
        <div>
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "12px",
            }}
          >
            <p
              className="font-editorial"
              style={{
                fontSize: "16px",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.9,
                whiteSpace: "pre-wrap",
              }}
            >
              {carta.resposta}
            </p>
          </div>
          {countdown && countdown !== "expirada" && (
            <p
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.25)",
                fontWeight: 600,
              }}
            >
              Esta mensagem desaparece em {countdown}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function CartaAguardaCard({ carta }: { carta: MinhaCarta }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.3)",
            flexShrink: 0,
          }}
        />
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          Aguarda resposta
        </p>
      </div>
      <p
        style={{
          fontSize: "14px",
          color: "rgba(255,255,255,0.5)",
          fontStyle: "italic",
          lineHeight: 1.7,
          borderLeft: "2px solid rgba(255,255,255,0.06)",
          paddingLeft: "12px",
        }}
      >
        {carta.conteudo.length > 180
          ? carta.conteudo.slice(0, 180) + "…"
          : carta.conteudo}
      </p>
    </div>
  );
}

export default function MailboxClient({ profile }: Props) {
  const [vista, setVista] = useState<Vista>("inicio");
  const [conteudo, setConteudo] = useState("");
  const [resposta, setResposta] = useState("");
  const [cartaActual, setCartaActual] = useState<Carta | null>(null);
  const [minhasCartas, setMinhasCartas] = useState<MinhaCarta[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [envelopeAberto, setEnvelopeAberto] = useState(false);
  const [cartaAnimada, setCartaAnimada] = useState(false);

  // Carta a aparecer com animação
  const mostrarCarta = useCallback((carta: Carta) => {
    setCartaActual(carta);
    setEnvelopeAberto(false);
    setCartaAnimada(false);
    setVista("ler");
    setTimeout(() => setEnvelopeAberto(true), 300);
    setTimeout(() => setCartaAnimada(true), 900);
  }, []);

  const carregarCarta = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const res = await fetch("/api/mailbox/carta");
      const json = await res.json();
      if (!res.ok) {
        setErro(json.erro ?? "Erro ao buscar carta.");
        return;
      }
      if (!json.carta) {
        setCartaActual(null);
        setVista("ler");
      } else {
        mostrarCarta(json.carta);
      }
    } catch {
      setErro("Erro de ligação.");
    } finally {
      setLoading(false);
    }
  }, [mostrarCarta]);

  const carregarMinhas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mailbox/minhas");
      const json = await res.json();
      if (res.ok) setMinhasCartas(json.cartas ?? []);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }, []);

  const depositar = async () => {
    if (conteudo.trim().length < 10) {
      setErro("Escreve um pouco mais antes de depositar.");
      return;
    }
    setLoading(true);
    setErro("");
    try {
      const res = await fetch("/api/mailbox/depositar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conteudo }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErro(json.erro ?? "Erro ao depositar carta.");
        return;
      }
      setConteudo("");
      setVista("depositada");
    } catch {
      setErro("Erro de ligação.");
    } finally {
      setLoading(false);
    }
  };

  const responder = async () => {
    if (!cartaActual) return;
    if (resposta.trim().length < 5) {
      setErro("Escreve um pouco mais antes de responder.");
      return;
    }
    setLoading(true);
    setErro("");
    try {
      const res = await fetch("/api/mailbox/responder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartaId: cartaActual.id, resposta }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErro(json.erro ?? "Erro ao guardar resposta.");
        return;
      }
      setResposta("");
      setCartaActual(null);
      setVista("respondida_ok");
    } catch {
      setErro("Erro de ligação.");
    } finally {
      setLoading(false);
    }
  };

  const passar = async () => {
    setLoading(true);
    setErro("");
    try {
      const res = await fetch("/api/mailbox/passar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartaIdActual: cartaActual?.id ?? null }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErro(json.erro ?? "Erro.");
        return;
      }
      if (!json.carta) {
        setCartaActual(null);
      } else {
        mostrarCarta(json.carta);
      }
    } catch {
      setErro("Erro de ligação.");
    } finally {
      setLoading(false);
    }
  };

  const cartasRespondidas = minhasCartas.filter((c) => c.estado === "respondida");
  const cartasAguarda = minhasCartas.filter((c) => c.estado === "aguarda");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1a1714",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 24px 80px",
        position: "relative",
      }}
    >
      {/* Nav topo */}
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 0",
        }}
      >
        <Link href="/dashboard">
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            ← Dashboard
          </span>
        </Link>
        {vista !== "inicio" && (
          <button
            onClick={() => {
              setVista("inicio");
              setErro("");
              setConteudo("");
              setResposta("");
            }}
            style={{
              background: "none",
              border: "none",
              fontSize: "12px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "Nunito, sans-serif",
            }}
          >
            Início
          </button>
        )}
      </div>

      {/* Título sempre visível */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "48px",
          animation: "fadeInUp 0.8s ease forwards",
        }}
      >
        <h1
          className="font-editorial"
          style={{
            fontSize: "clamp(36px, 6vw, 52px)",
            fontWeight: 300,
            color: "white",
            letterSpacing: "-0.01em",
            marginBottom: "10px",
            lineHeight: 1,
          }}
        >
          The Mail Box
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: "rgba(255,255,255,0.35)",
            fontWeight: 600,
          }}
        >
          Um lugar para o que não cabe em mais lado nenhum.
        </p>
      </div>

      {/* Conteúdo por vista */}
      <div style={{ width: "100%", maxWidth: "600px" }}>
        {/* ── INÍCIO ── */}
        {vista === "inicio" && (
          <div
            style={{
              animation: "fadeInUp 0.6s ease forwards",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              {/* Escrever carta */}
              <button
                onClick={() => setVista("escrever")}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  padding: "32px 24px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "Nunito, sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>✉️</div>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.8)",
                    marginBottom: "6px",
                  }}
                >
                  Escrever uma carta
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.35)",
                    fontWeight: 600,
                    lineHeight: 1.5,
                  }}
                >
                  Deposita o que carregas
                </p>
              </button>

              {/* Responder a uma carta */}
              <button
                onClick={carregarCarta}
                disabled={loading}
                style={{
                  background: "rgba(167,139,250,0.08)",
                  border: "1px solid rgba(167,139,250,0.2)",
                  borderRadius: "16px",
                  padding: "32px 24px",
                  textAlign: "center",
                  cursor: loading ? "wait" : "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "Nunito, sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(167,139,250,0.13)";
                  e.currentTarget.style.borderColor = "rgba(167,139,250,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(167,139,250,0.08)";
                  e.currentTarget.style.borderColor = "rgba(167,139,250,0.2)";
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>📬</div>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#a78bfa",
                    marginBottom: "6px",
                  }}
                >
                  Responder a uma carta
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.35)",
                    fontWeight: 600,
                    lineHeight: 1.5,
                  }}
                >
                  {loading ? "A abrir…" : "Alguém precisa de ser ouvido"}
                </p>
              </button>
            </div>

            {/* Link para as minhas cartas */}
            <button
              onClick={() => {
                setVista("minhas");
                carregarMinhas();
              }}
              style={{
                background: "none",
                border: "none",
                width: "100%",
                padding: "14px",
                fontSize: "13px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.25)",
                letterSpacing: "0.04em",
                cursor: "pointer",
                fontFamily: "Nunito, sans-serif",
                textAlign: "center",
              }}
            >
              As minhas cartas →
            </button>

            {erro && (
              <p
                style={{
                  fontSize: "13px",
                  color: "#f87171",
                  textAlign: "center",
                  marginTop: "12px",
                  fontWeight: 600,
                }}
              >
                {erro}
              </p>
            )}
          </div>
        )}

        {/* ── ESCREVER CARTA ── */}
        {vista === "escrever" && (
          <div style={{ animation: "fadeInUp 0.5s ease forwards" }}>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="O que carregas hoje que precisas de deixar algures?"
              style={{
                width: "100%",
                minHeight: "280px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "28px",
                fontSize: "18px",
                fontFamily: "Cormorant Garamond, Georgia, serif",
                fontStyle: "italic",
                color: "rgba(255,255,255,0.82)",
                lineHeight: 1.8,
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
                caretColor: "#a78bfa",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(167,139,250,0.3)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.08)";
              }}
              autoFocus
            />

            <div
              style={{
                marginTop: "6px",
                marginBottom: "20px",
                textAlign: "right",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color:
                    conteudo.length > 4800
                      ? "#f87171"
                      : "rgba(255,255,255,0.2)",
                  fontWeight: 600,
                }}
              >
                {conteudo.length} / 5000
              </span>
            </div>

            {erro && (
              <p
                style={{
                  fontSize: "13px",
                  color: "#f87171",
                  marginBottom: "12px",
                  fontWeight: 600,
                }}
              >
                {erro}
              </p>
            )}

            <button
              onClick={depositar}
              disabled={loading || conteudo.trim().length < 10}
              style={{
                width: "100%",
                padding: "16px",
                background:
                  loading || conteudo.trim().length < 10
                    ? "rgba(167,139,250,0.3)"
                    : "#a78bfa",
                color: "#1a1714",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 800,
                fontFamily: "Nunito, sans-serif",
                cursor:
                  loading || conteudo.trim().length < 10
                    ? "not-allowed"
                    : "pointer",
                transition: "all 0.2s ease",
                letterSpacing: "0.02em",
              }}
            >
              {loading ? "A depositar…" : "Depositar"}
            </button>
          </div>
        )}

        {/* ── DEPOSITADA ── */}
        {vista === "depositada" && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              animation: "fadeInUp 0.6s ease forwards",
            }}
          >
            <div style={{ marginBottom: "32px" }}>
              <EnvelopeIcon open={false} />
            </div>

            <h2
              className="font-editorial"
              style={{
                fontSize: "28px",
                fontWeight: 300,
                color: "rgba(255,255,255,0.9)",
                lineHeight: 1.5,
                marginBottom: "10px",
              }}
            >
              A tua carta está na caixa.
            </h2>
            <p
              className="font-editorial"
              style={{
                fontSize: "20px",
                fontStyle: "italic",
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.6,
              }}
            >
              Alguém vai encontrá-la.
            </p>

            <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={() => {
                  setVista("inicio");
                  setErro("");
                }}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "12px 24px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  fontFamily: "Nunito, sans-serif",
                }}
              >
                Voltar ao início
              </button>
            </div>
          </div>
        )}

        {/* ── LER CARTA ── */}
        {vista === "ler" && (
          <div style={{ animation: "fadeInUp 0.5s ease forwards" }}>
            {!cartaActual ? (
              /* Caixa vazia */
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ marginBottom: "28px", opacity: 0.4 }}>
                  <EnvelopeIcon open={false} />
                </div>
                <h2
                  className="font-editorial"
                  style={{
                    fontSize: "22px",
                    fontWeight: 300,
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.6,
                    marginBottom: "6px",
                  }}
                >
                  A caixa está vazia por agora.
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.3)",
                    fontWeight: 600,
                    marginBottom: "36px",
                  }}
                >
                  Volta mais tarde — ou deixa a tua carta.
                </p>
                <button
                  onClick={() => setVista("escrever")}
                  style={{
                    background: "none",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "10px",
                    padding: "12px 24px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    fontFamily: "Nunito, sans-serif",
                  }}
                >
                  Escrever uma carta
                </button>
              </div>
            ) : (
              /* Carta a ser lida */
              <div>
                {/* Envelope animado */}
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "24px",
                    opacity: envelopeAberto ? 1 : 0,
                    transform: envelopeAberto ? "translateY(0)" : "translateY(10px)",
                    transition: "all 0.6s ease",
                  }}
                >
                  <EnvelopeIcon open={envelopeAberto} />
                </div>

                {/* Conteúdo da carta */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "4px",
                    padding: "40px",
                    marginBottom: "28px",
                    opacity: cartaAnimada ? 1 : 0,
                    transform: cartaAnimada ? "translateY(0)" : "translateY(16px)",
                    transition: "all 0.5s ease",
                  }}
                >
                  <p
                    className="font-editorial"
                    style={{
                      fontSize: "20px",
                      fontStyle: "italic",
                      color: "rgba(255,255,255,0.85)",
                      lineHeight: 1.8,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {cartaActual.conteudo}
                  </p>
                </div>

                {/* Acções */}
                {cartaAnimada && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      animation: "fadeInUp 0.4s ease forwards",
                    }}
                  >
                    <button
                      onClick={() => setVista("responder")}
                      style={{
                        width: "100%",
                        padding: "16px",
                        background: "#a78bfa",
                        color: "#1a1714",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "15px",
                        fontWeight: 800,
                        fontFamily: "Nunito, sans-serif",
                        cursor: "pointer",
                        transition: "opacity 0.2s",
                      }}
                    >
                      Responder
                    </button>
                    <button
                      onClick={passar}
                      disabled={loading}
                      style={{
                        background: "none",
                        border: "none",
                        padding: "12px",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.3)",
                        cursor: loading ? "wait" : "pointer",
                        fontFamily: "Nunito, sans-serif",
                        textAlign: "center",
                      }}
                    >
                      {loading ? "A procurar…" : "Passar"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── RESPONDER ── */}
        {vista === "responder" && cartaActual && (
          <div style={{ animation: "fadeInUp 0.5s ease forwards" }}>
            {/* Carta original em resumo */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
                padding: "20px 24px",
                marginBottom: "20px",
                borderLeft: "3px solid rgba(167,139,250,0.3)",
              }}
            >
              <p
                className="font-editorial"
                style={{
                  fontSize: "16px",
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.7,
                }}
              >
                {cartaActual.conteudo.length > 200
                  ? cartaActual.conteudo.slice(0, 200) + "…"
                  : cartaActual.conteudo}
              </p>
            </div>

            <textarea
              value={resposta}
              onChange={(e) => setResposta(e.target.value)}
              placeholder="Escreve a tua resposta com cuidado…"
              style={{
                width: "100%",
                minHeight: "220px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "24px",
                fontSize: "16px",
                fontFamily: "Cormorant Garamond, Georgia, serif",
                fontStyle: "italic",
                color: "rgba(255,255,255,0.82)",
                lineHeight: 1.8,
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
                caretColor: "#a78bfa",
                marginBottom: "16px",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(167,139,250,0.3)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.08)";
              }}
              autoFocus
            />

            {erro && (
              <p
                style={{
                  fontSize: "13px",
                  color: "#f87171",
                  marginBottom: "12px",
                  fontWeight: 600,
                }}
              >
                {erro}
              </p>
            )}

            <button
              onClick={responder}
              disabled={loading || resposta.trim().length < 5}
              style={{
                width: "100%",
                padding: "16px",
                background:
                  loading || resposta.trim().length < 5
                    ? "rgba(167,139,250,0.3)"
                    : "#a78bfa",
                color: "#1a1714",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 800,
                fontFamily: "Nunito, sans-serif",
                cursor:
                  loading || resposta.trim().length < 5
                    ? "not-allowed"
                    : "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {loading ? "A enviar…" : "Enviar resposta"}
            </button>

            <button
              onClick={() => setVista("ler")}
              style={{
                background: "none",
                border: "none",
                width: "100%",
                padding: "12px",
                marginTop: "8px",
                fontSize: "13px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.25)",
                cursor: "pointer",
                fontFamily: "Nunito, sans-serif",
                textAlign: "center",
              }}
            >
              Voltar à carta
            </button>
          </div>
        )}

        {/* ── RESPONDIDA OK ── */}
        {vista === "respondida_ok" && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              animation: "fadeInUp 0.6s ease forwards",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(167,139,250,0.15)",
                border: "1px solid rgba(167,139,250,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 28px",
                fontSize: "28px",
              }}
            >
              ✓
            </div>

            <h2
              className="font-editorial"
              style={{
                fontSize: "26px",
                fontWeight: 300,
                color: "rgba(255,255,255,0.9)",
                lineHeight: 1.5,
                marginBottom: "10px",
              }}
            >
              A tua resposta chegou a alguém.
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.35)",
                fontWeight: 600,
                marginBottom: "40px",
              }}
            >
              A carta encontrou o seu destino.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={carregarCarta}
                disabled={loading}
                style={{
                  background: "rgba(167,139,250,0.12)",
                  border: "1px solid rgba(167,139,250,0.2)",
                  borderRadius: "10px",
                  padding: "14px 24px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#a78bfa",
                  cursor: loading ? "wait" : "pointer",
                  fontFamily: "Nunito, sans-serif",
                }}
              >
                {loading ? "A procurar…" : "Ler outra carta"}
              </button>
              <button
                onClick={() => setVista("inicio")}
                style={{
                  background: "none",
                  border: "none",
                  padding: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.3)",
                  cursor: "pointer",
                  fontFamily: "Nunito, sans-serif",
                }}
              >
                Voltar ao início
              </button>
            </div>
          </div>
        )}

        {/* ── MINHAS CARTAS ── */}
        {vista === "minhas" && (
          <div style={{ animation: "fadeInUp 0.5s ease forwards" }}>
            <h2
              className="font-editorial"
              style={{
                fontSize: "24px",
                fontWeight: 300,
                color: "rgba(255,255,255,0.7)",
                marginBottom: "28px",
              }}
            >
              As minhas cartas
            </h2>

            {loading && (
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>
                A carregar…
              </p>
            )}

            {!loading && minhasCartas.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p
                  style={{
                    fontSize: "15px",
                    color: "rgba(255,255,255,0.3)",
                    fontWeight: 600,
                    marginBottom: "24px",
                  }}
                >
                  Ainda não escreveste nenhuma carta.
                </p>
                <button
                  onClick={() => setVista("escrever")}
                  style={{
                    background: "none",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "10px",
                    padding: "12px 20px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.45)",
                    cursor: "pointer",
                    fontFamily: "Nunito, sans-serif",
                  }}
                >
                  Escrever a primeira carta
                </button>
              </div>
            )}

            {/* Cartas respondidas */}
            {cartasRespondidas.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
                {cartasRespondidas.map((c) => (
                  <CartaRespondidaCard key={c.id} carta={c} />
                ))}
              </div>
            )}

            {/* Cartas em aguarda */}
            {cartasAguarda.length > 0 && (
              <div>
                {cartasAguarda.length > 0 && (
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.2)",
                      marginBottom: "12px",
                    }}
                  >
                    Em espera
                  </p>
                )}
                {cartasAguarda.map((c) => (
                  <CartaAguardaCard key={c.id} carta={c} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
