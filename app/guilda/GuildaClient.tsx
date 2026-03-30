"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { PAISES } from "./paises";

/* ── types ─────────────────────────────────────────────────────────────── */

interface Membro {
  nome: string;
  pais: string;
  pais_codigo: string;
  perfil: string;
  created_at: string;
}

interface GuildaData {
  totalAprovados: number;
  paisCounts: Record<string, number>;
  membros: Membro[];
}

/* ── constants ─────────────────────────────────────────────────────────── */

const CG = "'Cormorant Garamond', serif";
const NU = "'Nunito', sans-serif";

const PERFIS = [
  { value: "criador_conteudo", label: "Criador de conteúdo" },
  { value: "especialista_curriculo", label: "Especialista de currículo" },
  { value: "tradutor", label: "Tradutor" },
  { value: "educador", label: "Educador" },
  { value: "pai_mae", label: "Pai ou Mãe" },
  { value: "outro", label: "Outro" },
];

const PERFIL_LABELS: Record<string, string> = {};
PERFIS.forEach((p) => (PERFIL_LABELS[p.value] = p.label));

/* ── helpers ───────────────────────────────────────────────────────────── */

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function reveal(visible: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
  };
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getInitialColor(name: string) {
  const colors = ["#a78bfa", "#4ade80", "#60a5fa", "#f472b6", "#facc15"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getBandeira(codigo: string) {
  return PAISES.find((p) => p.codigo === codigo)?.bandeira ?? "";
}

/* ── component ─────────────────────────────────────────────────────────── */

export default function GuildaClient() {
  const [data, setData] = useState<GuildaData | null>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  // Form state
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [paisCodigo, setPaisCodigo] = useState("");
  const [perfil, setPerfil] = useState("");
  const [perfilDescricao, setPerfilDescricao] = useState("");
  const [motivacao, setMotivacao] = useState("");
  const [contribuicao, setContribuicao] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [listaEspera, setListaEspera] = useState(false);

  // Sections
  const sOque = useReveal();
  const sOferece = useReveal();
  const sProcura = useReveal();
  const sMapa = useReveal();
  const sForm = useReveal();
  const sMembros = useReveal();

  // Constellation canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/guilda");
      if (res.ok) setData(await res.json());
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    setHeroVisible(true);
    fetchData();
  }, [fetchData]);

  // Constellation animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const stars: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.4 + 0.1,
      });
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0 || s.x > canvas.width) s.vx *= -1;
        if (s.y < 0 || s.y > canvas.height) s.vy *= -1;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 139, 250, ${s.o})`;
        ctx.fill();
      }

      // Lines between close stars
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(167, 139, 250, ${0.06 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const paisSelecionado = PAISES.find((p) => p.codigo === paisCodigo);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!nome || !email || !paisCodigo || !perfil || !motivacao || !contribuicao) {
      setFormError("Preenche todos os campos obrigatórios.");
      return;
    }
    if (perfil === "outro" && !perfilDescricao) {
      setFormError("Descreve o teu perfil.");
      return;
    }
    if (wordCount(motivacao) < 100) {
      setFormError(`A motivação tem ${wordCount(motivacao)} palavras — mínimo 100.`);
      return;
    }
    if (wordCount(contribuicao) < 100) {
      setFormError(`A contribuição tem ${wordCount(contribuicao)} palavras — mínimo 100.`);
      return;
    }

    setSubmitting(true);
    try {
      const pais = PAISES.find((p) => p.codigo === paisCodigo);
      const res = await fetch("/api/guilda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          pais: pais?.nome ?? "",
          pais_codigo: paisCodigo,
          perfil,
          perfil_descricao: perfilDescricao,
          motivacao,
          contribuicao,
          linkedin,
          website,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setFormError(result.error ?? "Erro ao submeter.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      if (result.estado === "lista_espera") setListaEspera(true);
      fetchData();
    } catch {
      setFormError("Erro de ligação. Tenta novamente.");
    }
    setSubmitting(false);
  }

  const totalAprovados = data?.totalAprovados ?? 0;
  const paisCounts = data?.paisCounts ?? {};

  /* ── input styles ──────────────────────────────────────────────────── */

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    fontFamily: NU,
    fontSize: "15px",
    fontWeight: 500,
    outline: "none",
    cursor: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: NU,
    fontSize: "13px",
    fontWeight: 700,
    color: "rgba(255,255,255,0.5)",
    marginBottom: "8px",
    letterSpacing: "0.02em",
  };

  return (
    <main style={{ position: "relative", zIndex: 1 }}>
      {/* ── Fixed logo ───────────────────────────────────────────────── */}
      <div style={{ position: "fixed", top: "24px", left: "32px", zIndex: 100 }}>
        <Link href="/">
          <span
            style={{
              fontFamily: CG,
              fontSize: "14px",
              fontWeight: 400,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "white",
            }}
          >
            SOMOS
          </span>
        </Link>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 24px",
          position: "relative",
          background: "#1a1714",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>
          <h1
            style={{
              fontFamily: CG,
              fontSize: "clamp(40px, 6vw, 64px)",
              fontWeight: 300,
              color: "white",
              margin: "0 0 24px",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(14px)",
              transition: "opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s",
            }}
          >
            A Guilda
          </h1>

          <p
            style={{
              fontFamily: CG,
              fontStyle: "italic",
              fontSize: "clamp(18px, 2.5vw, 24px)",
              fontWeight: 400,
              color: "rgba(255,255,255,0.6)",
              maxWidth: "560px",
              margin: "0 auto 48px",
              lineHeight: 1.6,
              opacity: heroVisible ? 1 : 0,
              transition: "opacity 0.8s ease 0.8s",
            }}
          >
            Uma comunidade de mestres que constroem
            <br />o conhecimento do mundo para as crianças do mundo.
          </p>

          {/* Live counter */}
          <div
            style={{
              opacity: heroVisible ? 1 : 0,
              transition: "opacity 0.8s ease 1.3s",
            }}
          >
            <p
              style={{
                fontFamily: NU,
                fontSize: "14px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.5)",
                marginBottom: "12px",
              }}
            >
              {totalAprovados} vagas preenchidas de 100
            </p>
            <div
              style={{
                width: "280px",
                height: "4px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "2px",
                margin: "0 auto",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min((totalAprovados / 100) * 100, 100)}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #a78bfa, #facc15)",
                  borderRadius: "2px",
                  transition: "width 1s ease",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── O QUE É A GUILDA ─────────────────────────────────────────── */}
      <section style={{ background: "#ede9e1", padding: "100px 24px", textAlign: "center" }}>
        <div
          ref={sOque.ref}
          style={{ maxWidth: "680px", margin: "0 auto", ...reveal(sOque.visible) }}
        >
          <p
            style={{
              fontFamily: NU,
              fontSize: "17px",
              fontWeight: 400,
              color: "var(--texto-principal)",
              lineHeight: 1.8,
              whiteSpace: "pre-line",
              margin: 0,
            }}
          >
            {`As guildas medievais eram comunidades de mestres.
Partilhavam conhecimento, protegiam o ofício,
formavam os que vinham a seguir.

A Guilda do SOMOS é isso — no século XXI.

100 pessoas de todo o mundo.
Cada uma especialista na sua cultura, no seu currículo, na sua língua.
Juntas, constroem o conteúdo que vai formar
a próxima geração de humanos.

No primeiro ano, a colaboração não é remunerada.
Mas o que oferecemos em troca é real — e duradouro.`}
          </p>
        </div>
      </section>

      {/* ── O QUE OFERECEMOS ──────────────────────────────────────────── */}
      <section style={{ background: "#f5f2ec", padding: "100px 24px" }}>
        <div ref={sOferece.ref} style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2
            className="font-editorial"
            style={{
              fontSize: "36px",
              fontWeight: 300,
              textAlign: "center",
              marginBottom: "48px",
              ...reveal(sOferece.visible),
            }}
          >
            O que oferecemos
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
              ...reveal(sOferece.visible, 200),
            }}
          >
            {[
              {
                titulo: "Co-autoria permanente",
                texto:
                  "O teu nome fica no conteúdo que criares — para sempre. Quando uma criança em Tóquio aprender sobre a civilização portuguesa, o teu nome está lá.",
              },
              {
                titulo: "Participação nos lucros",
                texto:
                  "Quando o SOMOS escalar, escalas connosco. Os primeiros 100 têm uma participação nos lucros futuros proporcional à contribuição.",
              },
              {
                titulo: "Acesso vitalício",
                texto:
                  "Os teus filhos crescem com o SOMOS gratuitamente. Para sempre. Sem excepções.",
              },
              {
                titulo: "Os Primeiros",
                texto:
                  "Acesso antecipado a todas as funcionalidades. Antes de qualquer utilizador. Antes de qualquer investidor. Fazes parte da história do produto.",
              },
            ].map((card) => (
              <div
                key={card.titulo}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "32px",
                  border: "1px solid rgba(160,144,128,0.15)",
                }}
              >
                <h3
                  className="font-editorial"
                  style={{
                    fontSize: "22px",
                    fontWeight: 500,
                    marginBottom: "12px",
                    color: "var(--texto-principal)",
                  }}
                >
                  {card.titulo}
                </h3>
                <p
                  style={{
                    fontFamily: NU,
                    fontSize: "15px",
                    fontWeight: 400,
                    color: "#a09080",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {card.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUEM PROCURAMOS ───────────────────────────────────────────── */}
      <section style={{ background: "#e8e4dc", padding: "80px 24px" }}>
        <div ref={sProcura.ref} style={{ maxWidth: "680px", margin: "0 auto" }}>
          <h2
            className="font-editorial"
            style={{
              fontSize: "36px",
              fontWeight: 300,
              textAlign: "center",
              marginBottom: "48px",
              ...reveal(sProcura.visible),
            }}
          >
            Perfis diversos. Uma missão comum.
          </h2>

          <div style={{ ...reveal(sProcura.visible, 200) }}>
            {[
              "Criadores de conteúdo educativo que acreditam que aprender é transformar-se, não memorizar.",
              "Especialistas de currículo que conhecem profundamente o sistema de ensino do seu país.",
              "Educadores, professores, pedagogos que querem construir algo que o sistema ainda não tem.",
              "Pais e mães que já sentiram que a escola não chega e querem fazer parte da solução.",
              "Tradutores e adaptadores culturais que entendem que o conhecimento precisa de contexto para ter impacto.",
              "Qualquer pessoa com algo genuíno para contribuir.",
            ].map((text, i) => (
              <p
                key={i}
                style={{
                  fontFamily: NU,
                  fontSize: "16px",
                  fontWeight: 400,
                  color: "var(--texto-principal)",
                  lineHeight: 1.8,
                  marginBottom: "24px",
                  opacity: sProcura.visible ? 1 : 0,
                  transform: sProcura.visible ? "translateY(0)" : "translateY(12px)",
                  transition: `opacity 0.5s ease ${300 + i * 100}ms, transform 0.5s ease ${300 + i * 100}ms`,
                }}
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAPA DA GUILDA ────────────────────────────────────────────── */}
      <section style={{ background: "#ede9e1", padding: "80px 24px" }}>
        <div ref={sMapa.ref} style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2
            className="font-editorial"
            style={{
              fontSize: "36px",
              fontWeight: 300,
              textAlign: "center",
              marginBottom: "16px",
              ...reveal(sMapa.visible),
            }}
          >
            Mapa da Guilda
          </h2>
          <p
            style={{
              fontFamily: NU,
              fontSize: "14px",
              color: "#a09080",
              textAlign: "center",
              marginBottom: "40px",
              ...reveal(sMapa.visible, 100),
            }}
          >
            Distribuição dos membros aprovados pelo mundo
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: "10px",
              ...reveal(sMapa.visible, 200),
            }}
          >
            {PAISES.filter((p) => (paisCounts[p.codigo] ?? 0) > 0).length === 0 ? (
              <p
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  fontFamily: NU,
                  fontSize: "15px",
                  color: "#a09080",
                  padding: "40px 0",
                }}
              >
                Ainda sem membros aprovados. Sê um dos primeiros.
              </p>
            ) : (
              PAISES.filter((p) => (paisCounts[p.codigo] ?? 0) > 0)
                .sort((a, b) => (paisCounts[b.codigo] ?? 0) - (paisCounts[a.codigo] ?? 0))
                .map((p) => {
                  const count = paisCounts[p.codigo] ?? 0;
                  const full = count >= 3;
                  return (
                    <div
                      key={p.codigo}
                      style={{
                        background: full ? "rgba(167,139,250,0.15)" : "white",
                        borderRadius: "12px",
                        padding: "14px",
                        border: full
                          ? "1px solid rgba(167,139,250,0.3)"
                          : "1px solid rgba(160,144,128,0.15)",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontSize: "24px" }}>{p.bandeira}</span>
                      <p
                        style={{
                          fontFamily: NU,
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "var(--texto-principal)",
                          margin: "6px 0 2px",
                        }}
                      >
                        {p.nome}
                      </p>
                      <p
                        style={{
                          fontFamily: NU,
                          fontSize: "11px",
                          fontWeight: 600,
                          color: full ? "#a78bfa" : "#a09080",
                          margin: 0,
                        }}
                      >
                        {full ? "Esgotado" : `${count}/3 vagas`}
                      </p>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </section>

      {/* ── FORMULÁRIO DE CANDIDATURA ─────────────────────────────────── */}
      <section style={{ background: "#1a1714", padding: "100px 24px" }}>
        <div ref={sForm.ref} style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: CG,
              fontStyle: "italic",
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 300,
              color: "white",
              textAlign: "center",
              marginBottom: "48px",
              ...reveal(sForm.visible),
            }}
          >
            Candidata-te à Guilda
          </h2>

          {submitted ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 24px",
                ...reveal(true),
              }}
            >
              <p
                style={{
                  fontFamily: CG,
                  fontStyle: "italic",
                  fontSize: "24px",
                  fontWeight: 400,
                  color: "white",
                  lineHeight: 1.6,
                  marginBottom: "16px",
                }}
              >
                A tua candidatura chegou.
              </p>
              <p
                style={{
                  fontFamily: NU,
                  fontSize: "15px",
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.7,
                }}
              >
                Analisamos todas com cuidado.
                <br />
                Recebes uma resposta em até 7 dias.
              </p>
              {listaEspera && (
                <p
                  style={{
                    fontFamily: NU,
                    fontSize: "14px",
                    color: "#facc15",
                    marginTop: "24px",
                    lineHeight: 1.6,
                  }}
                >
                  O teu país já atingiu o limite de 3 membros ou o limite global foi alcançado.
                  <br />
                  Foste colocado/a em lista de espera.
                </p>
              )}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "24px", ...reveal(sForm.visible, 200) }}
            >
              {/* Nome */}
              <div>
                <label style={labelStyle}>Nome completo *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  style={inputStyle}
                  placeholder="O teu nome completo"
                />
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  placeholder="email@exemplo.com"
                />
              </div>

              {/* País */}
              <div>
                <label style={labelStyle}>País *</label>
                <select
                  value={paisCodigo}
                  onChange={(e) => setPaisCodigo(e.target.value)}
                  style={{
                    ...inputStyle,
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 16px center",
                  }}
                >
                  <option value="">Seleciona o teu país</option>
                  {PAISES.map((p) => (
                    <option key={p.codigo} value={p.codigo}>
                      {p.bandeira} {p.nome}
                    </option>
                  ))}
                </select>
                {paisSelecionado && paisCounts[paisCodigo] !== undefined && (
                  <p
                    style={{
                      fontFamily: NU,
                      fontSize: "12px",
                      color:
                        (paisCounts[paisCodigo] ?? 0) >= 3
                          ? "#facc15"
                          : "rgba(255,255,255,0.4)",
                      marginTop: "6px",
                    }}
                  >
                    {(paisCounts[paisCodigo] ?? 0) >= 3
                      ? `${paisSelecionado.nome} já atingiu o limite de 3 membros. Podes candidatar-te para lista de espera.`
                      : `${paisSelecionado.nome}: ${paisCounts[paisCodigo]}/3 vagas preenchidas`}
                  </p>
                )}
              </div>

              {/* Perfil */}
              <div>
                <label style={labelStyle}>Perfil *</label>
                <select
                  value={perfil}
                  onChange={(e) => setPerfil(e.target.value)}
                  style={{
                    ...inputStyle,
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 16px center",
                  }}
                >
                  <option value="">Seleciona o teu perfil</option>
                  {PERFIS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Perfil descricao (if "outro") */}
              {perfil === "outro" && (
                <div>
                  <label style={labelStyle}>Descreve o teu perfil *</label>
                  <input
                    type="text"
                    value={perfilDescricao}
                    onChange={(e) => setPerfilDescricao(e.target.value)}
                    style={inputStyle}
                    placeholder="Em que área contribuis?"
                  />
                </div>
              )}

              {/* Motivação */}
              <div>
                <label style={labelStyle}>
                  Porque queres fazer parte da Guilda? * <span style={{ fontWeight: 400, opacity: 0.6 }}>(mín. 100 palavras)</span>
                </label>
                <textarea
                  value={motivacao}
                  onChange={(e) => setMotivacao(e.target.value)}
                  rows={6}
                  style={{ ...inputStyle, resize: "vertical", minHeight: "140px" }}
                  placeholder="Conta-nos o que te motiva..."
                />
                <p
                  style={{
                    fontFamily: NU,
                    fontSize: "11px",
                    color: wordCount(motivacao) >= 100 ? "rgba(74,222,128,0.7)" : "rgba(255,255,255,0.3)",
                    marginTop: "4px",
                    textAlign: "right",
                  }}
                >
                  {wordCount(motivacao)} palavras
                </p>
              </div>

              {/* Contribuição */}
              <div>
                <label style={labelStyle}>
                  O que trazes para a Guilda? * <span style={{ fontWeight: 400, opacity: 0.6 }}>(mín. 100 palavras)</span>
                </label>
                <textarea
                  value={contribuicao}
                  onChange={(e) => setContribuicao(e.target.value)}
                  rows={6}
                  style={{ ...inputStyle, resize: "vertical", minHeight: "140px" }}
                  placeholder="Que competências, experiências ou perspectivas trazes?"
                />
                <p
                  style={{
                    fontFamily: NU,
                    fontSize: "11px",
                    color: wordCount(contribuicao) >= 100 ? "rgba(74,222,128,0.7)" : "rgba(255,255,255,0.3)",
                    marginTop: "4px",
                    textAlign: "right",
                  }}
                >
                  {wordCount(contribuicao)} palavras
                </p>
              </div>

              {/* LinkedIn */}
              <div>
                <label style={labelStyle}>LinkedIn <span style={{ fontWeight: 400, opacity: 0.6 }}>(opcional)</span></label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  style={inputStyle}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              {/* Website */}
              <div>
                <label style={labelStyle}>Website ou portfólio <span style={{ fontWeight: 400, opacity: 0.6 }}>(opcional)</span></label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  style={inputStyle}
                  placeholder="https://..."
                />
              </div>

              {/* Error */}
              {formError && (
                <p
                  style={{
                    fontFamily: NU,
                    fontSize: "14px",
                    color: "#facc15",
                    background: "rgba(250,204,21,0.1)",
                    border: "1px solid rgba(250,204,21,0.2)",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    margin: 0,
                  }}
                >
                  {formError}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: "#a78bfa",
                  color: "#1a1714",
                  border: "none",
                  borderRadius: "8px",
                  padding: "18px 32px",
                  fontFamily: NU,
                  fontSize: "15px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  cursor: "none",
                  opacity: submitting ? 0.6 : 1,
                  transition: "opacity 0.2s",
                  marginTop: "8px",
                }}
              >
                {submitting ? "A ENVIAR..." : "CANDIDATAR-ME À GUILDA"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── MEMBROS ACTUAIS ───────────────────────────────────────────── */}
      {(data?.membros?.length ?? 0) > 0 && (
        <section style={{ background: "#ede9e1", padding: "80px 24px" }}>
          <div ref={sMembros.ref} style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h2
              className="font-editorial"
              style={{
                fontSize: "36px",
                fontWeight: 300,
                textAlign: "center",
                marginBottom: "40px",
                ...reveal(sMembros.visible),
              }}
            >
              Os membros da Guilda
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "14px",
                ...reveal(sMembros.visible, 200),
              }}
            >
              {data!.membros.map((m, i) => (
                <div
                  key={i}
                  style={{
                    background: "white",
                    borderRadius: "14px",
                    padding: "24px 20px",
                    border: "1px solid rgba(160,144,128,0.15)",
                    textAlign: "center",
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: getInitialColor(m.nome),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: CG,
                        fontSize: "20px",
                        fontWeight: 600,
                        color: "white",
                      }}
                    >
                      {m.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: NU,
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--texto-principal)",
                      margin: "0 0 4px",
                    }}
                  >
                    {m.nome}
                  </p>
                  <p
                    style={{
                      fontFamily: NU,
                      fontSize: "13px",
                      color: "#a09080",
                      margin: "0 0 4px",
                    }}
                  >
                    {getBandeira(m.pais_codigo)} {m.pais}
                  </p>
                  <p
                    style={{
                      fontFamily: NU,
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#a78bfa",
                      margin: 0,
                    }}
                  >
                    {PERFIL_LABELS[m.perfil] ?? m.perfil}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer
        style={{
          background: "#1a1714",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: NU,
            fontSize: "13px",
            fontWeight: 400,
            color: "rgba(255,255,255,0.3)",
            margin: 0,
          }}
        >
          SOMOS · 2026 · theworldofsomos.com
        </p>
      </footer>
    </main>
  );
}
