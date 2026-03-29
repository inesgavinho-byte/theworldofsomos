"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ── helpers ──────────────────────────────────────────────────────────── */

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

function useTypewriter(
  text: string,
  started: boolean,
  delay = 40,
  prefersReduced = false
) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (prefersReduced) {
      setDisplayed(text);
      return;
    }
    if (!started) return;
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(id);
      }
    }, delay);
    return () => clearInterval(id);
  }, [text, started, delay, prefersReduced]);

  return displayed;
}

/* ── constants ────────────────────────────────────────────────────────── */

const PILARES = [
  "Sei onde estou.",
  "Descubro quem sou.",
  "Tenho quem me apoie.",
  "Sei de onde venho.",
];

const MOMENTO_TEXT =
  '"Há 2500 anos, Sócrates foi condenado\nà morte por fazer perguntas.\n\nHoje fizeste o mesmo."';

/* ── styles ───────────────────────────────────────────────────────────── */

const CG = "'Cormorant Garamond', serif";
const NU = "'Nunito', sans-serif";

/* ── component ────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  const s2 = useReveal();
  const s3 = useReveal();
  const s4 = useReveal();
  const s5 = useReveal();
  const s6 = useReveal();

  const momentoText = useTypewriter(
    MOMENTO_TEXT,
    s5.visible,
    40,
    prefersReduced
  );
  const momentoDone = momentoText.length >= MOMENTO_TEXT.length;

  useEffect(() => {
    setHeroVisible(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
  }, []);

  function reveal(
    visible: boolean,
    delay = 0
  ): React.CSSProperties {
    if (prefersReduced) return {};
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    };
  }

  return (
    <main
      style={{
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* ── fixed logo ──────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          top: "24px",
          left: "32px",
          zIndex: 100,
        }}
      >
        <Link href="/login">
          <span
            style={{
              fontFamily: CG,
              fontSize: "14px",
              fontWeight: 400,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "var(--texto-principal)",
            }}
          >
            SOMOS
          </span>
        </Link>
      </div>

      {/* ── fixed "Entrar" button ────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          top: "16px",
          right: "32px",
          zIndex: 100,
        }}
      >
        <Link href="/login">
          <button
            style={{
              background: "transparent",
              border: "1px solid #1a1714",
              borderRadius: "2px",
              padding: "8px 20px",
              fontFamily: NU,
              fontWeight: 700,
              fontSize: "13px",
              color: "var(--texto-principal)",
              cursor: "none",
              letterSpacing: "0.05em",
            }}
          >
            Entrar
          </button>
        </Link>
      </div>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 24px",
          position: "relative",
          background: "transparent",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            marginBottom: "56px",
            opacity: heroVisible ? 1 : 0,
            transition: prefersReduced ? "none" : "opacity 0.8s ease",
          }}
        >
          <span
            style={{
              fontFamily: CG,
              fontSize: "14px",
              fontWeight: 400,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "var(--texto-principal)",
            }}
          >
            SOMOS
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            marginBottom: "28px",
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(14px)",
            transition: prefersReduced
              ? "none"
              : "opacity 0.8s ease 1.2s, transform 0.8s ease 1.2s",
          }}
        >
          <h1
            style={{
              fontFamily: CG,
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 300,
              fontStyle: "italic",
              lineHeight: 1.4,
              color: "var(--texto-principal)",
              maxWidth: "600px",
              margin: 0,
            }}
          >
            Os nossos filhos vão herdar um mundo
            <br />
            que não conseguimos prever.
          </h1>
        </div>

        {/* Sub-headline */}
        <div
          style={{
            opacity: heroVisible ? 1 : 0,
            transition: prefersReduced ? "none" : "opacity 0.8s ease 2s",
          }}
        >
          <p
            style={{
              fontFamily: NU,
              fontSize: "16px",
              fontWeight: 400,
              color: "var(--texto-secundario)",
              maxWidth: "420px",
              margin: 0,
              lineHeight: 1.75,
            }}
          >
            Há 300 000 anos que sobrevivemos a tudo.
            <br />
            Desta vez não vai ser diferente.
          </p>
        </div>

        {/* Scroll arrow */}
        <div
          className="scroll-arrow"
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            opacity: heroVisible ? 1 : 0,
            transition: prefersReduced ? "none" : "opacity 0.8s ease 2.6s",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--texto-secundario)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="5 13 12 19 19 13" />
          </svg>
        </div>
      </section>

      {/* ── SECTION 2 — A VERDADE ───────────────────────────────────── */}
      <section
        style={{
          background: "#ede9e1",
          padding: "120px 24px",
          textAlign: "center",
        }}
      >
        <div
          ref={s2.ref}
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            ...reveal(s2.visible),
          }}
        >
          <p
            style={{
              fontFamily: CG,
              fontStyle: "italic",
              fontSize: "13px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--texto-secundario)",
              margin: "0 0 24px",
            }}
          >
            A ESCOLA NÃO É O PROBLEMA
          </p>

          <h2
            style={{
              fontFamily: CG,
              fontSize: "36px",
              fontWeight: 300,
              color: "var(--texto-principal)",
              lineHeight: 1.35,
              margin: "0 0 40px",
            }}
          >
            O problema é acreditarmos
            <br />
            que a escola chega.
          </h2>

          <p
            style={{
              fontFamily: NU,
              fontSize: "17px",
              fontWeight: 400,
              color: "var(--texto-secundario)",
              lineHeight: 1.85,
              margin: 0,
            }}
          >
            A escola prepara para os exames.
            <br />
            Nós preparamos para a vida.
            <br />
            Não como alternativa — como complemento.
            <br />
            O que a escola não tem tempo de ensinar:
            <br />
            quem és, de onde vens, para onde podes ir.
          </p>
        </div>
      </section>

      {/* ── SECTION 3 — OS QUATRO PILARES ──────────────────────────── */}
      <section
        style={{
          background: "#e8e4dc",
          padding: "100px 24px",
          textAlign: "center",
        }}
      >
        <div ref={s3.ref}>
          <p
            style={{
              fontFamily: CG,
              fontStyle: "italic",
              fontSize: "13px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--texto-secundario)",
              margin: "0 0 56px",
              ...reveal(s3.visible),
            }}
          >
            QUATRO PERGUNTAS. UMA PLATAFORMA.
          </p>

          <div style={{ maxWidth: "560px", margin: "0 auto" }}>
            {PILARES.map((linha, i) => (
              <p
                key={i}
                style={{
                  fontFamily: CG,
                  fontStyle: "italic",
                  fontSize: "clamp(22px, 4vw, 32px)",
                  fontWeight: 300,
                  lineHeight: 1.6,
                  color: "var(--texto-principal)",
                  margin: "0 0 4px",
                  opacity: s3.visible ? 1 : 0,
                  transform: s3.visible ? "translateY(0)" : "translateY(20px)",
                  transition: prefersReduced
                    ? "none"
                    : `opacity 0.7s ease ${300 + i * 120}ms, transform 0.7s ease ${300 + i * 120}ms`,
                }}
              >
                {linha}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4 — O SONHO ─────────────────────────────────────── */}
      <section
        style={{
          background: "#ede9e1",
          padding: "120px 24px",
          textAlign: "center",
        }}
      >
        <div
          ref={s4.ref}
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            ...reveal(s4.visible),
          }}
        >
          <p
            style={{
              fontFamily: CG,
              fontStyle: "italic",
              fontSize: "13px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--texto-secundario)",
              margin: "0 0 16px",
            }}
          >
            A ÚNICA COISA QUE A MÁQUINA NÃO FAZ
          </p>

          <h2
            style={{
              fontFamily: CG,
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 300,
              color: "var(--texto-principal)",
              margin: "0 0 40px",
            }}
          >
            Sonhar.
          </h2>

          <p
            style={{
              fontFamily: NU,
              fontSize: "17px",
              fontWeight: 400,
              color: "var(--texto-secundario)",
              lineHeight: 1.85,
              margin: 0,
              whiteSpace: "pre-line",
            }}
          >
            {`A inteligência artificial calcula.\nAprende. Optimiza. Executa.\n\nMas não sonha. Nunca sonhou.\nProvavelmente nunca vai sonhar.\n\nÉ a única capacidade irreplicável\nque os nossos filhos têm.\n\nO SOMOS existe para a proteger.\nE para a ampliar.`}
          </p>
        </div>
      </section>

      {/* ── SECTION 5 — O MOMENTO ───────────────────────────────────── */}
      <section
        style={{
          background: "#1a1714",
          padding: "100px 24px",
          textAlign: "center",
        }}
      >
        <div
          ref={s5.ref}
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            ...reveal(s5.visible),
          }}
        >
          <p
            style={{
              fontFamily: CG,
              fontStyle: "italic",
              fontSize: "13px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              margin: "0 0 24px",
            }}
          >
            NO FIM DE CADA SESSÃO
          </p>

          <h2
            style={{
              fontFamily: CG,
              fontStyle: "italic",
              fontSize: "38px",
              fontWeight: 300,
              color: "white",
              margin: "0 0 40px",
            }}
          >
            Os nossos filhos recebem um Momento.
          </h2>

          {/* Typewriter card */}
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "4px",
              padding: "32px",
              marginBottom: "24px",
              textAlign: "left",
              minHeight: "168px",
            }}
          >
            <p
              style={{
                fontFamily: CG,
                fontStyle: "italic",
                fontSize: "20px",
                color: "white",
                lineHeight: 1.7,
                margin: 0,
                whiteSpace: "pre-line",
              }}
            >
              {momentoText}
              {s5.visible && !momentoDone && (
                <span
                  style={{
                    display: "inline-block",
                    width: "1px",
                    height: "1.1em",
                    background: "#a78bfa",
                    marginLeft: "2px",
                    verticalAlign: "text-bottom",
                    animation: "cursorBlink 0.7s ease-in-out infinite",
                  }}
                />
              )}
            </p>
          </div>

          <p
            style={{
              fontFamily: NU,
              fontSize: "14px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.4)",
              margin: 0,
              lineHeight: 1.65,
            }}
          >
            Um fragmento real da história humana,
            <br />
            ligado ao que acabaram de aprender.
          </p>
        </div>
      </section>

      {/* ── SECTION 6 — CTA FINAL ───────────────────────────────────── */}
      <section
        style={{
          background: "#ede9e1",
          padding: "140px 24px",
          textAlign: "center",
        }}
      >
        <div
          ref={s6.ref}
          style={{ ...reveal(s6.visible) }}
        >
          <h2
            style={{
              fontFamily: CG,
              fontSize: "clamp(34px, 5vw, 52px)",
              fontWeight: 300,
              color: "var(--texto-principal)",
              margin: "0 0 16px",
            }}
          >
            O fio 101 começa aqui.
          </h2>

          <p
            style={{
              fontFamily: NU,
              fontSize: "16px",
              fontWeight: 400,
              color: "var(--texto-secundario)",
              margin: "0 0 40px",
            }}
          >
            7 dias gratuitos. Sem cartão de crédito.
          </p>

          <Link href="/register">
            <button
              className="cta-btn"
              style={{
                background: "#1a1714",
                color: "white",
                border: "none",
                borderRadius: "2px",
                padding: "16px 40px",
                fontSize: "15px",
                fontWeight: 700,
                fontFamily: NU,
                letterSpacing: "0.1em",
                cursor: "none",
              }}
            >
              COMEÇAR
            </button>
          </Link>

          <p
            style={{
              fontFamily: NU,
              fontSize: "13px",
              fontWeight: 400,
              color: "var(--texto-secundario)",
              margin: "24px 0 0",
            }}
          >
            Já somos família em Portugal, Brasil, Reino Unido e além.
          </p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
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
          SOMOS · 2026 · theworldofsomos.netlify.app
        </p>
      </footer>
    </main>
  );
}
