"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DIMENSOES, getDimensaoBySlug } from "@/lib/dimensoes";
import {
  getLicaoCompleta,
  normalizarDimensao,
  type LicaoCompleta,
} from "@/lib/licoes/supabase";
import { editorial } from "@/lib/tom";
import { Suspense } from "react";

const EMOCOES = [
  {
    nome: "Desafiada",
    svg: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L14.5 9H21.5L16 13.5L18 20.5L12 16.5L6 20.5L8 13.5L2.5 9H9.5L12 2Z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    nome: "Tranquila",
    svg: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8.5 14.5C9.5 16 10.5 16.5 12 16.5C13.5 16.5 14.5 16 15.5 14.5"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="9" cy="10.5" r="1" fill="currentColor"/>
        <circle cx="15" cy="10.5" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    nome: "Curiosa",
    svg: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M11 8V11M11 14V14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    nome: "Confusa",
    svg: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 9C9 7.34 10.34 6 12 6C13.66 6 15 7.34 15 9C15 10.66 12 11.5 12 13"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="0.8" fill="currentColor"/>
      </svg>
    ),
  },
];

interface Momento {
  momento_historico: string;
  para_crianca: string;
  para_adulto: string;
}

interface PageProps {
  params: { slug: string };
}

function ReflexaoContent({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [licao, setLicao] = useState<LicaoCompleta | null>(null);

  const dim = licao
    ? DIMENSOES[normalizarDimensao(licao.dimensao)]
    : getDimensaoBySlug(slug);

  const respostasStr = searchParams.get("respostas") ?? "";
  const estrelasTotal = parseInt(searchParams.get("estrelas") ?? "0");
  const tempoTotalMs = parseInt(searchParams.get("tempo_total") ?? "0");

  const respostas = respostasStr.split("").map((c) => c === "1");
  const certas = respostas.filter(Boolean).length;
  const total = respostas.length || 5;

  const [emocaoSelecionada, setEmocaoSelecionada] = useState<string | null>(null);
  const [reflexao, setReflexao] = useState("");
  const [guardado, setGuardado] = useState(false);

  const [momento, setMomento] = useState<Momento | null>(null);
  const [momentoLoading, setMomentoLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;
    getLicaoCompleta(slug).then((l) => {
      if (!cancelado) setLicao(l);
    });
    return () => {
      cancelado = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!licao) return;

    // Se a lição já tem momento curado na BD, usa-o directamente.
    const momentoBD = licao.momento?.crianca;
    if (momentoBD?.texto) {
      const adaptado: Momento = {
        momento_historico: momentoBD.data ?? momentoBD.titulo ?? "",
        para_crianca: momentoBD.texto,
        para_adulto:
          licao.momento?.adulto?.resumo_aprendizagem ??
          licao.momento?.adulto?.sugestao ??
          "",
      };
      setMomento(adaptado);
      setMomentoLoading(false);
      try {
        sessionStorage.setItem(`momento_${slug}`, JSON.stringify(adaptado));
      } catch {
        // sessionStorage indisponível — ecrã do Momento renderiza sem armazenamento.
      }
      return;
    }

    let cancelado = false;
    async function fetchMomento() {
      try {
        const res = await fetch("/api/momento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo_licao: licao!.titulo,
            tema: licao!.subtitulo ?? licao!.titulo,
            dimensao: licao!.dimensao,
          }),
        });
        const json = await res.json();
        if (cancelado) return;
        if (json.sucesso && json.momento) {
          setMomento(json.momento);
          try {
            sessionStorage.setItem(`momento_${slug}`, JSON.stringify(json.momento));
          } catch {
            // sessionStorage indisponível — continuamos sem armazenar.
          }
        }
      } catch {
        // Falha silenciosa — o bloco simplesmente não renderiza.
      } finally {
        if (!cancelado) setMomentoLoading(false);
      }
    }
    fetchMomento();
    return () => {
      cancelado = true;
    };
  }, [slug, licao]);

  const promptReflexao =
    licao?.reflexao?.prompts?.[0] ?? "O que aprendeste hoje?";
  const introReflexao = licao?.reflexao?.introducao ?? null;

  const handleGuardar = async () => {
    if (!licao) return;
    setGuardado(true);

    try {
      const res = await fetch("/api/licao/completa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licao_id: licao.id,
          slug,
          titulo: licao.titulo,
          correctos: certas,
          total,
          tempo_total_ms: tempoTotalMs || null,
          reflexao_emocao: emocaoSelecionada,
          reflexao_texto: reflexao.trim() ? reflexao.trim() : null,
          momento: momento ?? null,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        try {
          if (json.momento_entregue && momento) {
            sessionStorage.setItem(`momento_${slug}`, JSON.stringify(momento));
          } else {
            sessionStorage.removeItem(`momento_${slug}`);
          }
          if (Array.isArray(json.jarros) && json.jarros.length > 0) {
            sessionStorage.setItem(`jarros_${slug}`, JSON.stringify(json.jarros));
          } else {
            sessionStorage.removeItem(`jarros_${slug}`);
          }
          sessionStorage.setItem(
            `conclusao_${slug}`,
            JSON.stringify({
              ja_completou: json.ja_completou,
              estrelas_ganhas: json.estrelas_ganhas,
              total_apos: json.total_apos,
            }),
          );
        } catch {
          // sessionStorage pode não estar disponível — seguimos na mesma.
        }
      }
    } catch {
      // Non-blocking — navegar à mesma.
    }

    setTimeout(() => {
      router.push(`/licao/${slug}/momento`);
    }, 600);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--fundo-crianca)", position: "relative", zIndex: 1 }}>
      {/* Topo colorido */}
      <div
        style={{
          background: dim.corCard,
          padding: "36px 24px 48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${dim.cor}20 0%, transparent 70%)`,
          }}
        />

        {/* Dimension SVG illustration */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "16px",
            opacity: 0.6,
          }}
        >
          <svg width="56" height="56" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 28C16 28 4 20 4 12C4 7.58 7.58 4 12 4C13.8 4 15.46 4.6 16.8 5.6"
              stroke={dim.cor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M16 28C16 28 28 20 28 12C28 7.58 24.42 4 20 4C18.2 4 16.54 4.6 15.2 5.6"
              stroke={dim.cor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line x1="16" y1="8" x2="16" y2="28" stroke={dim.cor} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Editorial phrase */}
        <p
          className="font-editorial"
          style={{
            fontSize: "24px",
            fontStyle: "italic",
            fontWeight: 400,
            color: "white",
            textAlign: "center",
            lineHeight: 1.4,
            maxWidth: "340px",
            margin: "0 auto",
          }}
        >
          {editorial.fraseFinal}
        </p>
      </div>

      {/* Conteúdo */}
      <div style={{ maxWidth: "540px", margin: "0 auto", padding: "0 20px 60px" }}>
        {/* Pull down from colored top */}
        <div
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(12px)",
            borderRadius: "20px",
            padding: "20px",
            marginTop: "-20px",
            marginBottom: "20px",
            border: "1px solid rgba(160,144,128,0.12)",
            animation: "slideUp 0.4s ease",
          }}
        >
          {/* Score */}
          <p
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--texto-secundario)",
              textAlign: "center",
              marginBottom: "16px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {certas} de {total} certas
          </p>

          {/* Circles summary */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "12px",
            }}
          >
            {respostas.length > 0
              ? respostas.map((certa, i) => (
                  <div
                    key={i}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: certa ? "rgba(74,222,128,0.15)" : "rgba(250,204,21,0.15)",
                      border: `2px solid ${certa ? "#4ade80" : "rgba(250,204,21,0.6)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      fontWeight: 900,
                      color: certa ? "#2d5c3a" : "#854f0b",
                    }}
                  >
                    {certa ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12L10 17L19 7" stroke="#2d5c3a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      "~"
                    )}
                  </div>
                ))
              : Array.from({ length: total }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: i < 3 ? "rgba(74,222,128,0.15)" : "rgba(250,204,21,0.15)",
                      border: `2px solid ${i < 3 ? "#4ade80" : "rgba(250,204,21,0.6)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {i < 3 ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12L10 17L19 7" stroke="#2d5c3a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <span style={{ fontWeight: 900, color: "#854f0b" }}>~</span>
                    )}
                  </div>
                ))}
          </div>

          {/* Stars earned */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            {Array.from({ length: estrelasTotal || certas }).map((_, i) => (
              <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L14.09 8.26L20.82 8.27L15.45 12.14L17.54 18.4L12 14.53L6.46 18.4L8.55 12.14L3.18 8.27L9.91 8.26L12 2Z"
                  stroke="#facc15"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  fill="#facc15"
                />
              </svg>
            ))}
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#854f0b",
                marginLeft: "4px",
              }}
            >
              +{estrelasTotal || certas} estrelas ganhas
            </span>
          </div>
        </div>

        {/* Como te sentiste? */}
        <div
          style={{
            background: "rgba(255,255,255,0.6)",
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "16px",
            border: "1px solid rgba(160,144,128,0.12)",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              fontWeight: 700,
              marginBottom: "16px",
            }}
          >
            Como te sentiste nesta lição?
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            {EMOCOES.map((emocao) => {
              const selecionada = emocaoSelecionada === emocao.nome;
              return (
                <button
                  key={emocao.nome}
                  onClick={() => setEmocaoSelecionada(emocao.nome)}
                  style={{
                    background: selecionada ? `${dim.cor}15` : "rgba(255,255,255,0.5)",
                    border: selecionada
                      ? `1.5px solid ${dim.cor}60`
                      : "1.5px solid rgba(160,144,128,0.2)",
                    borderRadius: "14px",
                    padding: "14px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "none",
                    fontFamily: "Nunito, sans-serif",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: selecionada ? dim.corTexto : "var(--texto-principal)",
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ color: selecionada ? dim.cor : "var(--texto-secundario)" }}>
                    {emocao.svg}
                  </span>
                  {emocao.nome}
                </button>
              );
            })}
          </div>
        </div>

        {/* Open question */}
        <div
          style={{
            background: "rgba(255,255,255,0.6)",
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "20px",
            border: "1px solid rgba(160,144,128,0.12)",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              fontWeight: 700,
              marginBottom: "4px",
            }}
          >
            {promptReflexao}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            {introReflexao ?? "Escreve uma coisa, por pequena que seja."}
          </p>
          <textarea
            value={reflexao}
            onChange={(e) => setReflexao(e.target.value)}
            placeholder="Hoje aprendi que..."
            rows={3}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "1.5px solid rgba(160,144,128,0.25)",
              background: "white",
              fontSize: "14px",
              fontFamily: "Nunito, sans-serif",
              fontWeight: 600,
              outline: "none",
              resize: "none",
              cursor: "none",
              lineHeight: 1.5,
            }}
          />
        </div>

        {/* UM MOMENTO DA HISTÓRIA */}
        {(momentoLoading || momento) && (
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            {/* Separador */}
            <div
              style={{
                height: "1px",
                background: "rgba(160,144,128,0.2)",
                marginBottom: "20px",
              }}
            />

            {momentoLoading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  padding: "24px",
                  opacity: 0.5,
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    border: `2px solid ${dim.cor}40`,
                    borderTop: `2px solid ${dim.cor}`,
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--texto-secundario)",
                  }}
                >
                  A procurar na história...
                </p>
              </div>
            ) : momento ? (
              <div>
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--texto-secundario)",
                    marginBottom: "14px",
                    opacity: 0.6,
                  }}
                >
                  Um momento da história
                </p>

                <p
                  className="font-editorial"
                  style={{
                    fontSize: "22px",
                    fontStyle: "italic",
                    fontWeight: 400,
                    lineHeight: 1.5,
                    color: "var(--texto-principal)",
                    marginBottom: "14px",
                  }}
                >
                  {momento.para_crianca}
                </p>

                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--texto-secundario)",
                    lineHeight: 1.6,
                  }}
                >
                  {momento.para_adulto}
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleGuardar}
          disabled={guardado}
          style={{
            width: "100%",
            background: dim.corCard,
            color: "white",
            border: "none",
            borderRadius: "14px",
            padding: "16px",
            fontSize: "15px",
            fontWeight: 800,
            fontFamily: "Nunito, sans-serif",
            cursor: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            opacity: guardado ? 0.7 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {guardado ? "A guardar..." : "Ver o teu Momento →"}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function ReflexaoPage({ params }: PageProps) {
  const { slug } = params;
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--fundo-crianca)" }} />}>
      <ReflexaoContent slug={slug} />
    </Suspense>
  );
}
