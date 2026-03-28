"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Exercicio {
  pergunta: string;
  opcoes: string[];
  resposta_correcta: number;
  explicacao: string;
}

interface Conteudo {
  dimensao: string;
  tema: string;
  exercicios: Exercicio[];
}

interface Props {
  desafio: {
    id: string;
    conteudo: Conteudo;
    estado: string;
    crianca_id: string;
  };
}

const DIMENSAO_CORES: Record<string, { cor: string; corTexto: string; corCard: string; nome: string }> = {
  naturalista: { cor: "#4ade80", corTexto: "#2d5c3a", corCard: "#1e3d28", nome: "Naturalista" },
  logica:      { cor: "#60a5fa", corTexto: "#185fa5", corCard: "#0f1a2e", nome: "Lógica" },
  artistica:   { cor: "#f472b6", corTexto: "#9d3270", corCard: "#3d1a2e", nome: "Artística" },
  social:      { cor: "#facc15", corTexto: "#854f0b", corCard: "#2a1f0a", nome: "Social" },
  identitaria: { cor: "#a78bfa", corTexto: "#534ab7", corCard: "#2a2250", nome: "Identitária" },
};

export default function ExerciciosIAClient({ desafio }: Props) {
  const router = useRouter();
  const { conteudo } = desafio;
  const exercicios: Exercicio[] = conteudo?.exercicios ?? [];
  const dim = DIMENSAO_CORES[conteudo?.dimensao] ?? DIMENSAO_CORES.logica;

  const [atual, setAtual] = useState(0);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [mostrarExplicacao, setMostrarExplicacao] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [concluido, setConcluido] = useState(false);
  const [aGuardar, setAGuardar] = useState(false);

  const ex = exercicios[atual];
  const total = exercicios.length;

  const handleEscolha = (idx: number) => {
    if (selecionada !== null) return;
    setSelecionada(idx);
    setMostrarExplicacao(true);
    if (idx === ex.resposta_correcta) setAcertos((a) => a + 1);
  };

  const handleProximo = async () => {
    if (atual < total - 1) {
      setAtual((a) => a + 1);
      setSelecionada(null);
      setMostrarExplicacao(false);
    } else {
      // Last exercise — mark desafio as done
      setAGuardar(true);
      const supabase = createClient();
      await supabase
        .from("desafios_familia")
        .update({ estado: "concluido" })
        .eq("id", desafio.id);
      setAGuardar(false);
      setConcluido(true);
    }
  };

  // ── Concluído ──────────────────────────────────────────────────────────────
  if (concluido) {
    const pct = Math.round((acertos / total) * 100);
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--fundo-crianca)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "20px",
          padding: "32px 24px",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: `${dim.cor}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
          }}
        >
          {pct >= 80 ? "🌟" : pct >= 60 ? "👍" : "💪"}
        </div>
        <div style={{ textAlign: "center" }}>
          <h1 className="font-editorial" style={{ fontSize: "28px", fontWeight: 500, marginBottom: "8px" }}>
            {pct >= 80 ? "Fantástico!" : pct >= 60 ? "Muito bem!" : "Continua a treinar!"}
          </h1>
          <p style={{ fontSize: "15px", fontWeight: 700, color: dim.corTexto }}>
            {acertos} de {total} respostas certas
          </p>
        </div>
        <div
          style={{
            width: "200px",
            height: "8px",
            borderRadius: "4px",
            background: "rgba(160,144,128,0.2)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: "4px",
              background: dim.cor,
              transition: "width 0.8s ease",
            }}
          />
        </div>
        <Link href="/crianca/dashboard">
          <button
            style={{
              padding: "14px 32px",
              borderRadius: "14px",
              border: "none",
              background: dim.cor,
              color: dim.corTexto,
              fontSize: "14px",
              fontWeight: 800,
              fontFamily: "Nunito, sans-serif",
              cursor: "none",
              marginTop: "8px",
            }}
          >
            Voltar ao início
          </button>
        </Link>
      </div>
    );
  }

  // ── Exercício ──────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--fundo-crianca)",
        padding: "32px 24px",
      }}
    >
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <Link href="/crianca/dashboard">
            <button
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
              ← Sair
            </button>
          </Link>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--texto-secundario)" }}>
              {conteudo?.tema ?? "Exercícios do livro"}
            </p>
          </div>
          <div
            className="badge-dimensao"
            style={{ background: `${dim.cor}18`, color: dim.corTexto }}
          >
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: dim.cor }} />
            {dim.nome}
          </div>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: "4px",
            borderRadius: "2px",
            background: "rgba(160,144,128,0.15)",
            overflow: "hidden",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${((atual) / total) * 100}%`,
              borderRadius: "2px",
              background: dim.cor,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Question counter */}
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--texto-secundario)",
            marginBottom: "16px",
          }}
        >
          Pergunta {atual + 1} de {total}
        </p>

        {/* Question card */}
        <div
          style={{
            background: "rgba(245,242,236,0.9)",
            borderRadius: "20px",
            padding: "24px",
            border: "1px solid rgba(160,144,128,0.15)",
            marginBottom: "16px",
          }}
        >
          <p style={{ fontSize: "18px", fontWeight: 700, lineHeight: 1.4, marginBottom: "24px" }}>
            {ex.pergunta}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {ex.opcoes.map((opcao, i) => {
              const isCorreta = i === ex.resposta_correcta;
              const isSelecionada = i === selecionada;
              let bg = "rgba(255,255,255,0.6)";
              let border = "1.5px solid rgba(160,144,128,0.2)";
              let cor = "inherit";

              if (selecionada !== null) {
                if (isCorreta) {
                  bg = `${dim.cor}18`;
                  border = `1.5px solid ${dim.cor}`;
                  cor = dim.corTexto;
                } else if (isSelecionada) {
                  bg = "rgba(239,68,68,0.08)";
                  border = "1.5px solid rgba(239,68,68,0.4)";
                  cor = "#dc2626";
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleEscolha(i)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border,
                    background: bg,
                    color: cor,
                    fontSize: "14px",
                    fontWeight: 600,
                    fontFamily: "Nunito, sans-serif",
                    cursor: selecionada !== null ? "default" : "none",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 800,
                      color: selecionada !== null && isCorreta ? dim.cor : "var(--texto-secundario)",
                      flexShrink: 0,
                    }}
                  >
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opcao}
                </button>
              );
            })}
          </div>
        </div>

        {/* Explicação */}
        {mostrarExplicacao && (
          <div
            style={{
              background: `${dim.cor}10`,
              border: `1px solid ${dim.cor}30`,
              borderRadius: "14px",
              padding: "14px 16px",
              marginBottom: "16px",
            }}
          >
            <p style={{ fontSize: "13px", fontWeight: 700, color: dim.corTexto, lineHeight: 1.5 }}>
              {ex.explicacao}
            </p>
          </div>
        )}

        {/* Next button */}
        {selecionada !== null && (
          <button
            onClick={handleProximo}
            disabled={aGuardar}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "16px",
              border: "none",
              background: dim.cor,
              color: dim.corTexto,
              fontSize: "15px",
              fontWeight: 800,
              fontFamily: "Nunito, sans-serif",
              cursor: "none",
            }}
          >
            {aGuardar
              ? "A guardar..."
              : atual < total - 1
              ? "Próxima →"
              : "Ver resultado →"}
          </button>
        )}
      </div>
    </div>
  );
}
