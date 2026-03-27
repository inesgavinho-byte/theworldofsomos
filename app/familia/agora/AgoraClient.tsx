"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  { id: "identitaria", label: "Identitária", cor: "#a78bfa", corCard: "#2a2250" },
  { id: "naturalista", label: "Naturalista", cor: "#4ade80", corCard: "#1e3d28" },
  { id: "logica", label: "Lógica", cor: "#60a5fa", corCard: "#0f1a2e" },
  { id: "artistica", label: "Artística", cor: "#f472b6", corCard: "#3d1a2e" },
  { id: "social", label: "Social", cor: "#facc15", corCard: "#2a1f0a" },
];

const PERGUNTAS: Record<string, string[]> = {
  identitaria: [
    "O que faz de ti único em relação a toda a gente que conheces?",
    "Se pudesses mudar uma coisa no mundo, o que escolhias e porquê?",
    "Qual é a tua memória favorita e o que ela diz sobre ti?",
  ],
  naturalista: [
    "Qual é o teu lugar favorito na natureza? O que sentes quando lá estás?",
    "Se fosses um animal, qual serias? O que isso diz sobre ti?",
    "O que achas que o planeta precisa mais de nós, humanos?",
  ],
  logica: [
    "Como explicarias a inteligência artificial a um avô de 80 anos?",
    "Se tivesses de inventar uma regra nova para a escola, qual seria?",
    "Qual é a diferença entre saber uma coisa e perceber uma coisa?",
  ],
  artistica: [
    "Se a tua vida fosse uma música, como seria o refrão?",
    "O que é a beleza para ti? Dá um exemplo que não seja óbvio.",
    "Se pudesses criar uma obra de arte sobre este momento, o que representavas?",
  ],
  social: [
    "O que é que achas que toda a gente precisa mas poucas pessoas pedem?",
    "Qual foi a última vez que ajudaste alguém sem que te pedissem?",
    "O que significa para ti ser um bom amigo?",
  ],
};

type Fase = "setup" | "pergunta" | "aguardando" | "resultado";

export default function AgoraClient({ profile, userId, familiaId, criancas }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const tipo = profile.tipo;
  const dashboardHref = tipo === "crianca" ? "/crianca/dashboard" : "/dashboard";

  const [fase, setFase] = useState<Fase>("setup");
  const [criancaSelecionada, setCriancaSelecionada] = useState<string>(
    criancas[0]?.id ?? ""
  );
  const [dimensaoSelecionada, setDimensaoSelecionada] = useState<string>("identitaria");
  const [perguntaAtual, setPerguntaAtual] = useState<string>("");
  const [respostaPai, setRespostaPai] = useState<string>("");
  const [respostaCrianca, setRespostaCrianca] = useState<string>("");
  const [desafioId, setDesafioId] = useState<string | null>(null);
  const [a_guardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(tipo === "crianca" ? "/crianca/login" : "/login");
  };

  const dimAtual = DIMENSOES.find((d) => d.id === dimensaoSelecionada) ?? DIMENSOES[0];

  const iniciarDesafio = async () => {
    if (!familiaId) return;
    const lista = PERGUNTAS[dimensaoSelecionada] ?? [];
    const pergunta = lista[Math.floor(Math.random() * lista.length)];
    setPerguntaAtual(pergunta);
    setAGuardar(true);
    setErro(null);

    const { data, error } = await supabase
      .from("desafios_familia")
      .insert({
        familia_id: familiaId,
        crianca_id: criancaSelecionada || null,
        tipo: "tempo_real",
        modo: "tempo_real",
        estado: "em_curso",
        criado_por: userId,
        conteudo: { dimensao: dimAtual.label, pergunta },
      })
      .select("id")
      .single();

    setAGuardar(false);
    if (error || !data) {
      setErro("Não foi possível criar o desafio. Tenta novamente.");
      return;
    }
    setDesafioId(data.id);
    setFase("pergunta");
  };

  const submeterResposta = async () => {
    if (!desafioId) return;
    const resposta = tipo === "pai" ? respostaPai : respostaCrianca;
    if (!resposta.trim()) return;
    setAGuardar(true);
    setErro(null);

    const campo = tipo === "pai" ? "respostas_pai" : "respostas_crianca";
    const { error } = await supabase
      .from("desafios_familia")
      .update({ [campo]: { texto: resposta }, estado: "aguardando" })
      .eq("id", desafioId);

    setAGuardar(false);
    if (error) {
      setErro("Não foi possível guardar a resposta. Tenta novamente.");
      return;
    }
    setFase("aguardando");
  };

  const verResultados = async () => {
    if (!desafioId) return;
    await supabase
      .from("desafios_familia")
      .update({ estado: "concluido" })
      .eq("id", desafioId);
    setFase("resultado");
  };

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
          maxWidth: "720px",
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

      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <p style={{ fontSize: "13px", color: "var(--texto-secundario)", fontWeight: 600, marginBottom: "32px" }}>
          <Link href="/familia" style={{ color: "var(--texto-secundario)" }}>Família</Link>
          {" "}·{" "}
          <span style={{ color: "var(--texto-principal)" }}>Desafio Agora</span>
        </p>

        {erro && (
          <div
            style={{
              background: "rgba(244,114,182,0.1)",
              border: "1px solid rgba(244,114,182,0.3)",
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "24px",
              fontSize: "13px",
              color: "#993556",
              fontWeight: 600,
            }}
          >
            {erro}
          </div>
        )}

        {/* ── FASE: SETUP ─────────────────────────────────────────────── */}
        {fase === "setup" && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "18px",
                  background: "rgba(96,165,250,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h2
                className="font-editorial"
                style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 500, marginBottom: "10px" }}
              >
                Desafio Agora
              </h2>
              <p style={{ fontSize: "15px", color: "var(--texto-secundario)", fontWeight: 600, lineHeight: 1.5 }}>
                Uma pergunta. Dois pontos de vista.
                <br />
                Respondem ao mesmo tempo — sem ver a resposta do outro.
              </p>
            </div>

            {!familiaId ? (
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
                  Precisas de pertencer a uma família para usar este modo.
                </p>
                <Link href={dashboardHref}>
                  <button
                    style={{
                      marginTop: "16px",
                      background: "var(--texto-principal)",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 24px",
                      fontSize: "13px",
                      fontWeight: 700,
                      fontFamily: "Nunito, sans-serif",
                      cursor: "none",
                    }}
                  >
                    Ir para o dashboard
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {/* Select criança (only for pai) */}
                {tipo === "pai" && criancas.length > 0 && (
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--texto-secundario)", marginBottom: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      Com quem?
                    </p>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {criancas.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setCriancaSelecionada(c.id)}
                          style={{
                            padding: "10px 20px",
                            borderRadius: "12px",
                            border: "1.5px solid",
                            borderColor: criancaSelecionada === c.id ? "var(--texto-principal)" : "rgba(160,144,128,0.3)",
                            background: criancaSelecionada === c.id ? "var(--texto-principal)" : "transparent",
                            color: criancaSelecionada === c.id ? "white" : "var(--texto-principal)",
                            fontSize: "14px",
                            fontWeight: 700,
                            fontFamily: "Nunito, sans-serif",
                            cursor: "none",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {c.nome}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Select dimensão */}
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--texto-secundario)", marginBottom: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    Dimensão
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                    {DIMENSOES.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setDimensaoSelecionada(d.id)}
                        style={{
                          padding: "14px 12px",
                          borderRadius: "14px",
                          border: "1.5px solid",
                          borderColor: dimensaoSelecionada === d.id ? d.cor : "rgba(160,144,128,0.2)",
                          background: dimensaoSelecionada === d.id ? `${d.cor}18` : "transparent",
                          cursor: "none",
                          transition: "all 0.2s ease",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: d.cor,
                            margin: "0 auto 8px",
                          }}
                        />
                        <p style={{ fontSize: "13px", fontWeight: 700, fontFamily: "Nunito, sans-serif", color: "var(--texto-principal)", margin: 0 }}>
                          {d.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start button */}
                <button
                  onClick={iniciarDesafio}
                  disabled={a_guardar}
                  style={{
                    background: "var(--texto-principal)",
                    color: "white",
                    border: "none",
                    borderRadius: "14px",
                    padding: "18px 32px",
                    fontSize: "15px",
                    fontWeight: 800,
                    fontFamily: "Nunito, sans-serif",
                    cursor: "none",
                    opacity: a_guardar ? 0.6 : 1,
                    transition: "opacity 0.2s",
                    width: "100%",
                  }}
                >
                  {a_guardar ? "A preparar..." : "Começar o desafio"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── FASE: PERGUNTA ──────────────────────────────────────────── */}
        {fase === "pergunta" && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            {/* Dimension badge */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
              <span
                className="badge-dimensao"
                style={{
                  background: `${dimAtual.cor}20`,
                  color: dimAtual.cor,
                  border: `1px solid ${dimAtual.cor}40`,
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: dimAtual.cor, display: "inline-block" }} />
                {dimAtual.label}
              </span>
            </div>

            {/* Question card */}
            <div
              style={{
                background: "rgba(245,242,236,0.8)",
                border: "1px solid rgba(160,144,128,0.15)",
                borderRadius: "20px",
                padding: "40px 32px",
                textAlign: "center",
                marginBottom: "40px",
              }}
            >
              <p
                className="font-editorial"
                style={{
                  fontSize: "clamp(20px, 4vw, 28px)",
                  fontWeight: 500,
                  fontStyle: "italic",
                  lineHeight: 1.45,
                  color: "var(--texto-principal)",
                  margin: 0,
                }}
              >
                {perguntaAtual}
              </p>
            </div>

            {/* Answer area */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--texto-secundario)", margin: 0, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                A tua resposta
              </p>
              <textarea
                value={tipo === "pai" ? respostaPai : respostaCrianca}
                onChange={(e) =>
                  tipo === "pai"
                    ? setRespostaPai(e.target.value)
                    : setRespostaCrianca(e.target.value)
                }
                placeholder="Escreve aqui o que pensas..."
                rows={5}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "14px",
                  border: "1.5px solid rgba(160,144,128,0.3)",
                  background: "rgba(245,242,236,0.6)",
                  fontSize: "16px",
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 500,
                  color: "var(--texto-principal)",
                  lineHeight: 1.6,
                  resize: "vertical",
                  outline: "none",
                  cursor: "none",
                }}
              />
              <button
                onClick={submeterResposta}
                disabled={
                  a_guardar ||
                  (tipo === "pai" ? !respostaPai.trim() : !respostaCrianca.trim())
                }
                style={{
                  background: dimAtual.cor,
                  color: "#1a1714",
                  border: "none",
                  borderRadius: "14px",
                  padding: "16px 32px",
                  fontSize: "15px",
                  fontWeight: 800,
                  fontFamily: "Nunito, sans-serif",
                  cursor: "none",
                  opacity:
                    a_guardar ||
                    (tipo === "pai" ? !respostaPai.trim() : !respostaCrianca.trim())
                      ? 0.5
                      : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {a_guardar ? "A guardar..." : "Entregar resposta"}
              </button>
            </div>
          </div>
        )}

        {/* ── FASE: AGUARDANDO ────────────────────────────────────────── */}
        {fase === "aguardando" && (
          <div style={{ animation: "fadeIn 0.5s ease", textAlign: "center" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: `${dimAtual.cor}20`,
                border: `2px solid ${dimAtual.cor}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: dimAtual.cor,
                  animation: "pulseSoft 1.8s ease-in-out infinite",
                }}
              />
            </div>

            <h2
              className="font-editorial"
              style={{ fontSize: "32px", fontWeight: 500, marginBottom: "12px" }}
            >
              Resposta entregue.
            </h2>
            <p style={{ fontSize: "16px", color: "var(--texto-secundario)", fontWeight: 600, marginBottom: "40px", lineHeight: 1.55 }}>
              {tipo === "pai"
                ? "Aguarda que a criança termine a resposta."
                : "Aguarda que a tua família termine a resposta."}
              <br />
              Quando estiverem prontos, revelem juntos.
            </p>

            <button
              onClick={verResultados}
              style={{
                background: "var(--texto-principal)",
                color: "white",
                border: "none",
                borderRadius: "14px",
                padding: "16px 32px",
                fontSize: "15px",
                fontWeight: 800,
                fontFamily: "Nunito, sans-serif",
                cursor: "none",
              }}
            >
              Revelar respostas
            </button>
          </div>
        )}

        {/* ── FASE: RESULTADO ─────────────────────────────────────────── */}
        {fase === "resultado" && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2
                className="font-editorial"
                style={{ fontSize: "36px", fontWeight: 500, marginBottom: "10px" }}
              >
                Revelação
              </h2>
              <p style={{ fontSize: "15px", color: "var(--texto-secundario)", fontWeight: 600 }}>
                Dois pontos de vista sobre a mesma pergunta.
              </p>
            </div>

            {/* Question recap */}
            <div
              style={{
                background: `${dimAtual.cor}10`,
                border: `1px solid ${dimAtual.cor}30`,
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              <p
                className="font-editorial"
                style={{ fontSize: "20px", fontStyle: "italic", fontWeight: 500, color: "var(--texto-principal)", margin: 0, lineHeight: 1.45 }}
              >
                {perguntaAtual}
              </p>
            </div>

            {/* Responses */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "40px" }}>
              {respostaPai && (
                <div
                  style={{
                    background: "rgba(245,242,236,0.8)",
                    border: "1px solid rgba(160,144,128,0.15)",
                    borderRadius: "16px",
                    padding: "24px",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--texto-secundario)", marginBottom: "10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Família
                  </p>
                  <p style={{ fontSize: "16px", lineHeight: 1.65, color: "var(--texto-principal)", margin: 0, fontWeight: 500 }}>
                    {respostaPai}
                  </p>
                </div>
              )}
              {respostaCrianca && (
                <div
                  style={{
                    background: "rgba(245,242,236,0.8)",
                    border: "1px solid rgba(160,144,128,0.15)",
                    borderRadius: "16px",
                    padding: "24px",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--texto-secundario)", marginBottom: "10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {criancas.find((c) => c.id === criancaSelecionada)?.nome ?? "Criança"}
                  </p>
                  <p style={{ fontSize: "16px", lineHeight: 1.65, color: "var(--texto-principal)", margin: 0, fontWeight: 500 }}>
                    {respostaCrianca}
                  </p>
                </div>
              )}

              {!respostaPai && !respostaCrianca && (
                <p
                  className="font-editorial"
                  style={{ textAlign: "center", fontSize: "18px", color: "var(--texto-secundario)", fontStyle: "italic" }}
                >
                  As respostas serão visíveis quando ambos submeterem.
                </p>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  setFase("setup");
                  setDesafioId(null);
                  setPerguntaAtual("");
                  setRespostaPai("");
                  setRespostaCrianca("");
                }}
                style={{
                  background: "var(--texto-principal)",
                  color: "white",
                  border: "none",
                  borderRadius: "14px",
                  padding: "14px 28px",
                  fontSize: "14px",
                  fontWeight: 800,
                  fontFamily: "Nunito, sans-serif",
                  cursor: "none",
                }}
              >
                Novo desafio
              </button>
              <Link href="/familia">
                <button
                  style={{
                    background: "transparent",
                    color: "var(--texto-principal)",
                    border: "1.5px solid rgba(160,144,128,0.3)",
                    borderRadius: "14px",
                    padding: "14px 28px",
                    fontSize: "14px",
                    fontWeight: 700,
                    fontFamily: "Nunito, sans-serif",
                    cursor: "none",
                  }}
                >
                  Voltar à família
                </button>
              </Link>
            </div>

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
              "Conhecer-se é o começo de toda a sabedoria."
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
