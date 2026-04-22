"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDimensaoBySlug } from "@/lib/dimensoes";

interface Momento {
  momento_historico: string;
  titulo?: string;
  para_crianca: string;
  // Conteúdo destinado ao painel da família — NUNCA renderizar no ecrã da criança.
  para_adulto: string;
}

interface Jarro {
  numero: number;
  facto_id: number | null;
  facto: string | null;
  categoria: string | null;
  eh_primeiro: boolean;
  intro_erasmo?: string;
}

interface PageProps {
  params: { slug: string };
}

export default function MomentoPage({ params }: PageProps) {
  const { slug } = params;
  const router = useRouter();
  const dim = getDimensaoBySlug(slug);

  const [momento, setMomento] = useState<Momento | null>(null);
  const [jarros, setJarros] = useState<Jarro[]>([]);
  const [visible, setVisible] = useState(false);
  const [jaCompletou, setJaCompletou] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`momento_${slug}`);
      if (stored) setMomento(JSON.parse(stored));

      const jarrosStored = sessionStorage.getItem(`jarros_${slug}`);
      if (jarrosStored) {
        const parsed = JSON.parse(jarrosStored);
        if (Array.isArray(parsed)) setJarros(parsed);
      }

      const conclusaoStored = sessionStorage.getItem(`conclusao_${slug}`);
      if (conclusaoStored) {
        const parsed = JSON.parse(conclusaoStored);
        setJaCompletou(Boolean(parsed?.ja_completou));
      }
    } catch {
      // sessionStorage not available
    }

    // Trigger entrance animation after a brief pause
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [slug]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: dim.corCard,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px 64px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow — top */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${dim.cor}18 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />

      {/* Ambient glow — bottom */}
      <div
        style={{
          position: "absolute",
          bottom: "-60px",
          right: "-60px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${dim.cor}10 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "540px",
          width: "100%",
          position: "relative",
          zIndex: 1,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        {/* Label */}
        <p
          style={{
            fontSize: "10px",
            fontWeight: 800,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: `${dim.cor}80`,
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          Um momento da história
        </p>

        {momento ? (
          <>
            {/* Decorative line */}
            <div
              style={{
                width: "40px",
                height: "1px",
                background: `${dim.cor}40`,
                margin: "0 auto 36px",
              }}
            />

            {/* The Moment — large Cormorant italic */}
            <p
              className="font-editorial"
              style={{
                fontSize: "clamp(26px, 5vw, 34px)",
                fontStyle: "italic",
                fontWeight: 400,
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.95)",
                textAlign: "center",
                marginBottom: "36px",
                letterSpacing: "0.01em",
                whiteSpace: "pre-line",
              }}
            >
              {momento.para_crianca}
            </p>

            {/* Decorative line */}
            <div
              style={{
                width: "40px",
                height: "1px",
                background: `${dim.cor}40`,
                margin: "0 auto 28px",
              }}
            />

            {/* Historical anchor */}
            {momento.momento_historico ? (
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: `${dim.cor}70`,
                  textAlign: "center",
                }}
              >
                {momento.momento_historico}
              </p>
            ) : null}
          </>
        ) : (
          <p
            className="font-editorial"
            style={{
              fontSize: "28px",
              fontStyle: "italic",
              fontWeight: 400,
              color: "rgba(255,255,255,0.55)",
              textAlign: "center",
              marginBottom: "36px",
            }}
          >
            {jaCompletou
              ? "Já abriste este Momento antes. Continua a explorar."
              : "O teu momento está a ser procurado na história…"}
          </p>
        )}

        {/* Jarros de Pandora — um por um, em sequência */}
        {jarros.map((jarro, i) => (
          <div
            key={`${jarro.numero}-${i}`}
            style={{
              marginTop: "52px",
              padding: "28px 24px",
              border: `1px solid ${dim.cor}30`,
              borderRadius: "20px",
              background: `${dim.cor}08`,
              textAlign: "center",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: `opacity 0.9s ease ${0.4 + i * 0.2}s, transform 0.9s ease ${
                0.4 + i * 0.2
              }s`,
            }}
          >
            <p
              style={{
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: `${dim.cor}70`,
                marginBottom: "16px",
              }}
            >
              {jarro.eh_primeiro ? "O teu primeiro jarro" : "Abriste um jarro"}
            </p>

            {jarro.intro_erasmo && (
              <p
                className="font-editorial"
                style={{
                  fontSize: "16px",
                  fontStyle: "italic",
                  fontWeight: 400,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.7)",
                  marginBottom: "22px",
                  whiteSpace: "pre-line",
                  textAlign: "left",
                }}
              >
                {jarro.intro_erasmo}
              </p>
            )}

            {jarro.categoria && (
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: `${dim.cor}60`,
                  marginBottom: "10px",
                }}
              >
                {jarro.categoria}
              </p>
            )}

            {jarro.facto && (
              <p
                className="font-editorial"
                style={{
                  fontSize: "22px",
                  fontStyle: "italic",
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                {jarro.facto}
              </p>
            )}
          </div>
        ))}

        {/* Final CTA */}
        <div style={{ marginTop: "64px", display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => router.push("/crianca/dashboard")}
            style={{
              background: "transparent",
              border: `1.5px solid ${dim.cor}50`,
              borderRadius: "14px",
              padding: "14px 32px",
              fontSize: "14px",
              fontWeight: 800,
              fontFamily: "Nunito, sans-serif",
              color: "rgba(255,255,255,0.85)",
              cursor: "none",
              letterSpacing: "0.03em",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = dim.cor;
              (e.currentTarget as HTMLButtonElement).style.color = "white";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = `${dim.cor}50`;
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.85)";
            }}
          >
            Voltar ao meu mundo →
          </button>
        </div>
      </div>
    </div>
  );
}
