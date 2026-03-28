"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Crianca {
  id: string;
  nome: string;
}

interface Props {
  profile: { nome: string; tipo: string };
  userId: string;
  familiaId: string | null;
  criancas: Crianca[];
}

const DIMENSOES = [
  { key: "naturalista", label: "Naturalista", emoji: "🌿", cor: "#4ade80", corTexto: "#2d5c3a", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.25)" },
  { key: "logica", label: "Lógica", emoji: "⚡", cor: "#60a5fa", corTexto: "#185fa5", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.25)" },
  { key: "artistica", label: "Artística", emoji: "🎨", cor: "#f472b6", corTexto: "#9d3270", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.25)" },
  { key: "social", label: "Social", emoji: "☀️", cor: "#facc15", corTexto: "#854f0b", bg: "rgba(250,204,21,0.08)", border: "rgba(250,204,21,0.25)" },
  { key: "identitaria", label: "Identitária", emoji: "✨", cor: "#a78bfa", corTexto: "#534ab7", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.25)" },
];

interface Pergunta {
  pergunta: string;
  contexto: string;
}

export default function AgoraClient({ profile, familiaId, criancas }: Props) {
  const router = useRouter();
  const tipo = profile.tipo;

  const [passo, setPasso] = useState<"configurar" | "responder" | "revelar">("configurar");
  const [criancaId, setCriancaId] = useState<string>(criancas[0]?.id ?? "");
  const [dimensao, setDimensao] = useState<string | null>(null);
  const [pergunta, setPergunta] = useState<Pergunta | null>(null);
  const [respostaPai, setRespostaPai] = useState("");
  const [respostaCrianca, setRespostaCrianca] = useState("");
  const [respostaAtiva, setRespostaAtiva] = useState<"pai" | "crianca">("pai");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(tipo === "crianca" ? "/crianca/login" : "/login");
  };

  const dimensaoAtual = DIMENSOES.find((d) => d.key === dimensao);
  const criancaAtual = criancas.find((c) => c.id === criancaId);

  const gerarPergunta = async () => {
    if (!dimensao) return;
    setCarregando(true);
    setErro(null);

    try {
      const res = await fetch("/api/agora", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dimensao }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro ?? "Erro ao gerar pergunta");
      }

      const data = await res.json();
      setPergunta(data.pergunta);
      setRespostaPai("");
      setRespostaCrianca("");
      setRespostaAtiva("pai");
      setPasso("responder");
    } catch (err: any) {
      setErro(err.message ?? "Erro inesperado");
    } finally {
      setCarregando(false);
    }
  };

  const revelar = async () => {
    setPasso("revelar");

    if (!familiaId || !pergunta) return;

    try {
      const supabase = createClient();
      await supabase.from("desafios").insert({
        familia_id: familiaId,
        crianca_id: criancaId || null,
        modo: "tempo_real",
        estado: "concluido",
        conteudo: {
          dimensao,
          pergunta: pergunta.pergunta,
          contexto: pergunta.contexto,
          resposta_pai: respostaPai,
          resposta_crianca: respostaCrianca,
        },
      });
      setGuardado(true);
    } catch {
      // silently fail — the experience already happened
    }
  };

  const reiniciar = () => {
    setPasso("configurar");
    setDimensao(null);
    setPergunta(null);
    setRespostaPai("");
    setRespostaCrianca("");
    setGuardado(false);
    setErro(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--fundo-pai)",
        padding: "32px 24px 64px",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "680px",
          margin: "0 auto 40px",
        }}
      >
        <Link href="/familia" style={{ textDecoration: "none" }}>
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

      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚡</div>
          <h2
            className="font-editorial"
            style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 500, color: "var(--texto-principal)", marginBottom: "8px" }}
          >
            Desafio Agora
          </h2>
          <p style={{ fontSize: "14px", color: "var(--texto-secundario)", fontWeight: 600 }}>
            Ambos respondem à mesma pergunta — ao mesmo tempo
          </p>
        </div>

        {/* PASSO: configurar */}
        {passo === "configurar" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* Selecionar criança (apenas para pais) */}
            {tipo === "pai" && criancas.length > 1 && (
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--texto-secundario)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Com quem jogas?
                </p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {criancas.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCriancaId(c.id)}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "20px",
                        border: criancaId === c.id ? "2px solid #60a5fa" : "1.5px solid rgba(160,144,128,0.3)",
                        background: criancaId === c.id ? "rgba(96,165,250,0.12)" : "transparent",
                        fontSize: "13px",
                        fontWeight: 700,
                        fontFamily: "Nunito, sans-serif",
                        color: criancaId === c.id ? "#185fa5" : "var(--texto-secundario)",
                        cursor: "none",
                      }}
                    >
                      {c.nome}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selecionar dimensão */}
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--texto-secundario)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Escolhe um tema
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                {DIMENSOES.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setDimensao(d.key)}
                    style={{
                      background: dimensao === d.key ? d.bg : "rgba(245,242,236,0.8)",
                      border: dimensao === d.key ? `2px solid ${d.border}` : "1.5px solid rgba(160,144,128,0.15)",
                      borderRadius: "16px",
                      padding: "16px 18px",
                      textAlign: "left",
                      cursor: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>{d.emoji}</span>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        fontFamily: "Nunito, sans-serif",
                        color: dimensao === d.key ? d.corTexto : "var(--texto-principal)",
                      }}
                    >
                      {d.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {erro && (
              <p style={{ fontSize: "13px", color: "#ef4444", fontWeight: 600, textAlign: "center" }}>
                {erro}
              </p>
            )}

            <button
              onClick={gerarPergunta}
              disabled={!dimensao || carregando}
              style={{
                background: dimensao ? "#185fa5" : "rgba(160,144,128,0.2)",
                color: dimensao ? "#fff" : "var(--texto-secundario)",
                border: "none",
                borderRadius: "14px",
                padding: "16px 32px",
                fontSize: "15px",
                fontWeight: 800,
                fontFamily: "Nunito, sans-serif",
                cursor: dimensao ? "none" : "not-allowed",
                width: "100%",
                transition: "background 0.2s",
              }}
            >
              {carregando ? "A preparar desafio..." : "Começar desafio ⚡"}
            </button>
          </div>
        )}

        {/* PASSO: responder */}
        {passo === "responder" && pergunta && dimensaoAtual && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Pergunta */}
            <div
              style={{
                background: dimensaoAtual.bg,
                border: `1.5px solid ${dimensaoAtual.border}`,
                borderRadius: "20px",
                padding: "28px 24px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: dimensaoAtual.corTexto,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "12px",
                }}
              >
                {dimensaoAtual.emoji} {dimensaoAtual.label}
              </p>
              <p
                className="font-editorial"
                style={{
                  fontSize: "clamp(18px, 3vw, 24px)",
                  fontWeight: 500,
                  color: "var(--texto-principal)",
                  lineHeight: 1.4,
                  marginBottom: "12px",
                }}
              >
                {pergunta.pergunta}
              </p>
              {pergunta.contexto && (
                <p style={{ fontSize: "13px", color: "var(--texto-secundario)", fontWeight: 600, lineHeight: 1.5 }}>
                  {pergunta.contexto}
                </p>
              )}
            </div>

            {/* Tabs pai / criança */}
            <div style={{ display: "flex", gap: "8px", background: "rgba(245,242,236,0.8)", borderRadius: "14px", padding: "4px" }}>
              <button
                onClick={() => setRespostaAtiva("pai")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  background: respostaAtiva === "pai" ? "#fff" : "transparent",
                  fontSize: "13px",
                  fontWeight: 700,
                  fontFamily: "Nunito, sans-serif",
                  color: respostaAtiva === "pai" ? "var(--texto-principal)" : "var(--texto-secundario)",
                  cursor: "none",
                  boxShadow: respostaAtiva === "pai" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {tipo === "pai" ? "A minha resposta" : profile.nome}
              </button>
              <button
                onClick={() => setRespostaAtiva("crianca")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  background: respostaAtiva === "crianca" ? "#fff" : "transparent",
                  fontSize: "13px",
                  fontWeight: 700,
                  fontFamily: "Nunito, sans-serif",
                  color: respostaAtiva === "crianca" ? "var(--texto-principal)" : "var(--texto-secundario)",
                  cursor: "none",
                  boxShadow: respostaAtiva === "crianca" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {criancaAtual?.nome ?? "Criança"}
              </button>
            </div>

            {/* Área de resposta */}
            {respostaAtiva === "pai" ? (
              <div>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--texto-secundario)", marginBottom: "8px" }}>
                  {tipo === "pai" ? "A tua resposta" : profile.nome}
                </p>
                <textarea
                  value={respostaPai}
                  onChange={(e) => setRespostaPai(e.target.value)}
                  placeholder="Escreve aqui a tua resposta..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: "1.5px solid rgba(160,144,128,0.25)",
                    background: "rgba(245,242,236,0.8)",
                    fontSize: "14px",
                    fontFamily: "Nunito, sans-serif",
                    fontWeight: 600,
                    color: "var(--texto-principal)",
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ) : (
              <div>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--texto-secundario)", marginBottom: "8px" }}>
                  Resposta de {criancaAtual?.nome ?? "criança"}
                </p>
                <textarea
                  value={respostaCrianca}
                  onChange={(e) => setRespostaCrianca(e.target.value)}
                  placeholder="A criança escreve aqui a sua resposta..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: "1.5px solid rgba(160,144,128,0.25)",
                    background: "rgba(245,242,236,0.8)",
                    fontSize: "14px",
                    fontFamily: "Nunito, sans-serif",
                    fontWeight: 600,
                    color: "var(--texto-principal)",
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}

            <button
              onClick={revelar}
              disabled={!respostaPai || !respostaCrianca}
              style={{
                background: respostaPai && respostaCrianca ? "#185fa5" : "rgba(160,144,128,0.2)",
                color: respostaPai && respostaCrianca ? "#fff" : "var(--texto-secundario)",
                border: "none",
                borderRadius: "14px",
                padding: "16px 32px",
                fontSize: "15px",
                fontWeight: 800,
                fontFamily: "Nunito, sans-serif",
                cursor: respostaPai && respostaCrianca ? "none" : "not-allowed",
                width: "100%",
              }}
            >
              Revelar as respostas ✨
            </button>
          </div>
        )}

        {/* PASSO: revelar */}
        {passo === "revelar" && pergunta && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              style={{
                textAlign: "center",
                marginBottom: "8px",
              }}
            >
              <p
                className="font-editorial"
                style={{ fontSize: "20px", color: "var(--texto-principal)", fontStyle: "italic" }}
              >
                "{pergunta.pergunta}"
              </p>
            </div>

            {/* Resposta pai */}
            <div
              style={{
                background: "rgba(96,165,250,0.08)",
                border: "1.5px solid rgba(96,165,250,0.2)",
                borderRadius: "16px",
                padding: "20px",
              }}
            >
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#185fa5", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                {tipo === "pai" ? profile.nome : "Adulto"}
              </p>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--texto-principal)", lineHeight: 1.6 }}>
                {respostaPai || <em style={{ color: "var(--texto-secundario)" }}>Sem resposta</em>}
              </p>
            </div>

            {/* Resposta criança */}
            <div
              style={{
                background: "rgba(167,139,250,0.08)",
                border: "1.5px solid rgba(167,139,250,0.2)",
                borderRadius: "16px",
                padding: "20px",
              }}
            >
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#534ab7", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                {criancaAtual?.nome ?? "Criança"}
              </p>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--texto-principal)", lineHeight: 1.6 }}>
                {respostaCrianca || <em style={{ color: "var(--texto-secundario)" }}>Sem resposta</em>}
              </p>
            </div>

            {guardado && (
              <p style={{ fontSize: "12px", color: "var(--texto-secundario)", fontWeight: 600, textAlign: "center" }}>
                Desafio guardado no histórico da família ✓
              </p>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={reiniciar}
                style={{
                  flex: 1,
                  background: "#185fa5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "14px",
                  padding: "14px",
                  fontSize: "14px",
                  fontWeight: 800,
                  fontFamily: "Nunito, sans-serif",
                  cursor: "none",
                }}
              >
                Novo desafio
              </button>
              <Link
                href="/familia"
                style={{
                  flex: 1,
                  background: "rgba(245,242,236,0.8)",
                  border: "1.5px solid rgba(160,144,128,0.25)",
                  borderRadius: "14px",
                  padding: "14px",
                  fontSize: "14px",
                  fontWeight: 800,
                  fontFamily: "Nunito, sans-serif",
                  color: "var(--texto-secundario)",
                  cursor: "none",
                  textAlign: "center",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Início
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
