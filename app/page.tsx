"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CosmosBackground from "@/components/CosmosBackground";

const CG = "'Cormorant Garamond', serif";
const NU = "'Nunito', sans-serif";

const TEXT_PRIMARY = "#1a1714";
const TEXT_SECONDARY = "#7a7570";
const TEXT_TERTIARY = "#a09890";

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function LandingPage() {
  const [heroReady, setHeroReady] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    setHeroReady(true);
    setPrefersReduced(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  const s3 = useReveal();
  const s4 = useReveal();
  const s5 = useReveal();
  const s6 = useReveal();
  const s7 = useReveal();
  const s8 = useReveal();

  const reveal = (v: boolean, delay = 0): React.CSSProperties =>
    prefersReduced
      ? {}
      : {
          opacity: v ? 1 : 0,
          transform: v ? "translateY(0)" : "translateY(16px)",
          transition: `opacity .7s ease ${delay}ms, transform .7s ease ${delay}ms`,
        };

  return (
    <CosmosBackground>
      {/* NAV */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(245,242,236,0.94)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          padding: "16px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: CG,
            fontSize: 14,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: TEXT_PRIMARY,
          }}
        >
          SOMOS
        </span>
        <Link href="/login">
          <button
            style={{
              background: "transparent",
              border: `1px solid ${TEXT_PRIMARY}`,
              borderRadius: 2,
              padding: "8px 20px",
              fontFamily: NU,
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: "0.08em",
              color: TEXT_PRIMARY,
              cursor: "none",
            }}
          >
            Entrar
          </button>
        </Link>
      </nav>

      {/* HERO */}
      <section
        style={{
          padding: "120px 24px 96px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          background: "transparent",
        }}
      >
        <div
          style={{
            ...(prefersReduced
              ? {}
              : {
                  opacity: heroReady ? 1 : 0,
                  transform: heroReady ? "translateY(0)" : "translateY(10px)",
                  transition: "opacity .8s ease, transform .8s ease",
                }),
            marginBottom: 28,
          }}
        >
          <span
            style={{
              display: "inline-block",
              background: "rgba(167,139,250,0.16)",
              color: "#6b4fcf",
              border: "1px solid rgba(167,139,250,0.32)",
              padding: "6px 14px",
              borderRadius: 999,
              fontFamily: NU,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            Beta privado · Vagas limitadas
          </span>
        </div>

        <h1
          style={{
            fontFamily: CG,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(34px, 5.2vw, 50px)",
            lineHeight: 1.18,
            letterSpacing: "-0.01em",
            color: TEXT_PRIMARY,
            maxWidth: 660,
            margin: "0 0 24px",
            ...(prefersReduced
              ? {}
              : {
                  opacity: heroReady ? 1 : 0,
                  transform: heroReady ? "translateY(0)" : "translateY(14px)",
                  transition: "opacity .8s ease .15s, transform .8s ease .15s",
                }),
          }}
        >
          Sabes o que o teu filho estudou esta semana.
          <br />
          Mas sabes o que ele percebeu mesmo?
        </h1>

        <p
          style={{
            fontFamily: NU,
            fontSize: 15,
            lineHeight: 1.7,
            color: TEXT_SECONDARY,
            maxWidth: 390,
            margin: "0 0 36px",
            ...(prefersReduced
              ? {}
              : {
                  opacity: heroReady ? 1 : 0,
                  transition: "opacity .8s ease .35s",
                }),
          }}
        >
          Acompanhamento real do percurso escolar do teu filho — ligado ao
          currículo, visível para ti, construído com ele.
        </p>

        <Link
          href="/register"
          style={{
            ...(prefersReduced
              ? {}
              : {
                  opacity: heroReady ? 1 : 0,
                  transition: "opacity .8s ease .55s",
                }),
          }}
        >
          <button
            className="cta-btn"
            style={{
              background: TEXT_PRIMARY,
              color: "#fff",
              border: "none",
              borderRadius: 3,
              padding: "14px 28px",
              fontFamily: NU,
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.08em",
              cursor: "none",
            }}
          >
            Experimentar 7 dias grátis
          </button>
        </Link>

        <p
          style={{
            fontFamily: NU,
            fontSize: 12,
            color: TEXT_TERTIARY,
            marginTop: 16,
            ...(prefersReduced
              ? {}
              : {
                  opacity: heroReady ? 1 : 0,
                  transition: "opacity .8s ease .75s",
                }),
          }}
        >
          Sem cartão de crédito · Cancela quando quiseres
        </p>
      </section>

      {/* Divider */}
      <div
        style={{
          width: 40,
          height: 1,
          background: "rgba(26,23,20,0.18)",
          margin: "0 auto",
        }}
      />

      {/* SECTION — Três coisas */}
      <section
        style={{
          padding: "96px 24px",
          background: "rgba(245,242,236,0.72)",
        }}
      >
        <div
          ref={s3.ref}
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            textAlign: "center",
            ...reveal(s3.visible),
          }}
        >
          <p
            style={{
              fontFamily: NU,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: TEXT_TERTIARY,
              margin: "0 0 14px",
            }}
          >
            O que acontece em cada sessão
          </p>
          <h2
            style={{
              fontFamily: CG,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(28px, 4vw, 38px)",
              color: TEXT_PRIMARY,
              margin: "0 0 48px",
              lineHeight: 1.25,
            }}
          >
            Em cada sessão, a criança aprende, é avaliada e cresce.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
              textAlign: "left",
              marginBottom: 48,
            }}
          >
            {[
              {
                n: "01",
                t: "Aprende e é avaliada",
                d: "Exercícios alinhados com o que está a estudar na escola. Cada erro é registado e reforçado automaticamente.",
              },
              {
                n: "02",
                t: "Recebe um Momento",
                d: "Um fragmento real da história humana, ligado ao que acabou de aprender.",
              },
              {
                n: "03",
                t: "Tu vês tudo",
                d: "O estado real do teu filho — o que percebeu, onde falhou, o que precisa de reforço. Em tempo real.",
              },
            ].map((card, i) => (
              <div
                key={card.n}
                style={{
                  background: "rgba(245,242,236,0.82)",
                  border: "1px solid rgba(26,23,20,0.06)",
                  borderRadius: 6,
                  padding: "28px 26px",
                  ...reveal(s3.visible, 120 + i * 100),
                }}
              >
                <div
                  style={{
                    fontFamily: CG,
                    fontSize: 14,
                    letterSpacing: "0.18em",
                    color: "#a78bfa",
                    marginBottom: 14,
                  }}
                >
                  {card.n}
                </div>
                <h3
                  style={{
                    fontFamily: CG,
                    fontStyle: "italic",
                    fontWeight: 400,
                    fontSize: 22,
                    color: TEXT_PRIMARY,
                    margin: "0 0 10px",
                  }}
                >
                  {card.t}
                </h3>
                <p
                  style={{
                    fontFamily: NU,
                    fontSize: 13.5,
                    lineHeight: 1.65,
                    color: TEXT_SECONDARY,
                    margin: 0,
                  }}
                >
                  {card.d}
                </p>
              </div>
            ))}
          </div>

          {/* Product preview */}
          <div
            style={{
              background: "rgba(237,234,226,0.88)",
              border: "1px solid rgba(26,23,20,0.06)",
              borderRadius: 8,
              padding: "22px 24px",
              maxWidth: 640,
              margin: "0 auto",
              textAlign: "left",
              ...reveal(s3.visible, 400),
            }}
          >
            <div
              style={{
                fontFamily: NU,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: TEXT_TERTIARY,
                marginBottom: 16,
              }}
            >
              O que a Val vê hoje
            </div>
            {[
              {
                dot: "#a78bfa",
                title: "As Emoções são Dados",
                meta: "Identitária · 10 min · 5 questões",
              },
              {
                dot: "#facc15",
                title: "Biografias",
                meta: "Cambridge Year 4 · English · 25 min",
              },
              {
                dot: "#60a5fa",
                title: "Números com Forma",
                meta: "Cambridge Year 4 · Maths · 28 min",
              },
            ].map((row, i) => (
              <div
                key={row.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 0",
                  borderTop: i === 0 ? "none" : "1px solid rgba(26,23,20,0.06)",
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: row.dot,
                    marginRight: 14,
                    flexShrink: 0,
                    boxShadow: `0 0 8px ${row.dot}66`,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: CG,
                      fontStyle: "italic",
                      fontSize: 17,
                      color: TEXT_PRIMARY,
                    }}
                  >
                    {row.title}
                  </div>
                  <div
                    style={{
                      fontFamily: NU,
                      fontSize: 12,
                      color: TEXT_TERTIARY,
                      marginTop: 2,
                    }}
                  >
                    {row.meta}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION — O Momento (dark, semi-transparent) */}
      <section
        style={{
          padding: "96px 24px",
          background: "rgba(26,23,20,0.87)",
        }}
      >
        <div
          ref={s4.ref}
          style={{
            maxWidth: 620,
            margin: "0 auto",
            textAlign: "center",
            ...reveal(s4.visible),
          }}
        >
          <p
            style={{
              fontFamily: NU,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.48)",
              margin: "0 0 18px",
            }}
          >
            No fim de cada sessão
          </p>
          <h2
            style={{
              fontFamily: CG,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(30px, 4vw, 40px)",
              color: "#fff",
              margin: "0 0 36px",
              lineHeight: 1.25,
            }}
          >
            Os nossos filhos recebem um Momento.
          </h2>

          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              padding: "28px 28px",
              textAlign: "left",
              marginBottom: 22,
            }}
          >
            <p
              style={{
                fontFamily: CG,
                fontStyle: "italic",
                fontSize: 19,
                lineHeight: 1.7,
                color: "#fff",
                margin: "0 0 16px",
              }}
            >
              &ldquo;Há 500 anos, Leonardo da Vinci enchia cadernos de perguntas
              sobre tudo o que via. Hoje fizeste o mesmo.&rdquo;
            </p>
            <p
              style={{
                fontFamily: NU,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.42)",
                margin: 0,
              }}
            >
              Ligado ao que acabaram de aprender
            </p>
          </div>

          <p
            style={{
              fontFamily: NU,
              fontSize: 14,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.4)",
              margin: 0,
            }}
          >
            Um fragmento real da história humana. Para que percebam que fazem
            parte de algo muito maior.
          </p>
        </div>
      </section>

      {/* SECTION — A história */}
      <section
        style={{
          padding: "96px 24px",
          background: "rgba(237,234,226,0.78)",
        }}
      >
        <div
          ref={s5.ref}
          style={{
            maxWidth: 520,
            margin: "0 auto",
            ...reveal(s5.visible),
          }}
        >
          <p
            style={{
              fontFamily: NU,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: TEXT_TERTIARY,
              margin: "0 0 12px",
            }}
          >
            A história do SOMOS
          </p>
          <p
            style={{
              fontFamily: NU,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#6b4fcf",
              margin: "0 0 22px",
            }}
          >
            INES, FUNDADORA
          </p>
          <div
            style={{
              fontFamily: NU,
              fontSize: 14,
              lineHeight: 1.8,
              color: TEXT_PRIMARY,
              maxWidth: 480,
            }}
          >
            <p style={{ margin: 0 }}>
              A minha filha Valentina tem 9 anos. Está em Cambridge Year 4, em
              Portugal. Esta semana estudou biografias e números primos. Sei o
              que aprendeu — e o que ainda não percebeu bem. Construí o SOMOS
              para que qualquer pai possa saber o mesmo sobre o seu filho.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION — Currículos */}
      <section
        style={{
          padding: "96px 24px",
          background: "rgba(245,242,236,0.72)",
        }}
      >
        <div
          ref={s6.ref}
          style={{
            maxWidth: 720,
            margin: "0 auto",
            textAlign: "center",
            ...reveal(s6.visible),
          }}
        >
          <p
            style={{
              fontFamily: NU,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: TEXT_TERTIARY,
              margin: "0 0 14px",
            }}
          >
            Funciona com o currículo do teu filho
          </p>
          <h2
            style={{
              fontFamily: CG,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 26,
              lineHeight: 1.35,
              color: TEXT_PRIMARY,
              margin: "0 0 32px",
            }}
          >
            Funciona com o currículo do teu filho, seja qual for.
          </h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 10,
              marginBottom: 28,
            }}
          >
            {[
              "🇵🇹 Currículo PT",
              "🌍 Cambridge",
              "🌐 IB",
              "🇧🇷 BNCC",
              "🇫🇷 Éducation Nationale",
            ].map((pill) => (
              <span
                key={pill}
                style={{
                  background: "rgba(245,242,236,0.9)",
                  border: "1px solid rgba(26,23,20,0.1)",
                  borderRadius: 999,
                  padding: "8px 16px",
                  fontFamily: NU,
                  fontSize: 13,
                  color: TEXT_PRIMARY,
                }}
              >
                {pill}
              </span>
            ))}
          </div>

          <p
            style={{
              fontFamily: NU,
              fontSize: 13,
              color: TEXT_SECONDARY,
              margin: 0,
            }}
          >
            Se o teu filho muda de país ou de escola, o SOMOS continua com ele.
          </p>
        </div>
      </section>

      {/* SECTION — CTA final */}
      <section
        style={{
          padding: "120px 24px",
          background: "rgba(237,234,226,0.76)",
        }}
      >
        <div
          ref={s7.ref}
          style={{
            maxWidth: 640,
            margin: "0 auto",
            textAlign: "center",
            ...reveal(s7.visible),
          }}
        >
          <h2
            style={{
              fontFamily: CG,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(32px, 5vw, 42px)",
              color: TEXT_PRIMARY,
              margin: "0 0 14px",
              lineHeight: 1.2,
            }}
          >
            O melhor momento para começar era ontem. O segundo melhor é agora.
          </h2>
          <p
            style={{
              fontFamily: NU,
              fontSize: 15,
              color: TEXT_SECONDARY,
              margin: "0 0 36px",
            }}
          >
            7 dias gratuitos. Sem cartão de crédito.
          </p>
          <Link href="/register">
            <button
              className="cta-btn"
              style={{
                background: TEXT_PRIMARY,
                color: "#fff",
                border: "none",
                borderRadius: 3,
                padding: "18px 44px",
                fontFamily: NU,
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.14em",
                cursor: "none",
              }}
            >
              COMEÇAR
            </button>
          </Link>
          <p
            style={{
              fontFamily: NU,
              fontSize: 12.5,
              color: TEXT_TERTIARY,
              margin: "28px 0 0",
            }}
          >
            Em beta privado com as primeiras famílias de Portugal e Reino Unido.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        ref={s8.ref}
        style={{
          background: "rgba(245,242,236,0.95)",
          padding: "28px 28px",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(26,23,20,0.08)",
        }}
      >
        <p
          style={{
            fontFamily: NU,
            fontSize: 12,
            color: TEXT_TERTIARY,
            margin: 0,
          }}
        >
          SOMOS · 2026 · theworldofsomos.com
        </p>
        <p
          style={{
            fontFamily: CG,
            fontStyle: "italic",
            fontSize: 13,
            color: TEXT_SECONDARY,
            margin: 0,
            textAlign: "right",
          }}
        >
          Sei de onde venho. Sei onde estou. Descubro quem sou. Tenho quem me
          apoie.
        </p>
      </footer>
    </CosmosBackground>
  );
}
