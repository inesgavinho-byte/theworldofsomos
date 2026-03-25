import Link from "next/link";

const PILARES = [
  {
    numero: "01",
    titulo: "Diagnóstico",
    descricao:
      "Onde está o meu filho realmente? Mapeamento de competências universal, independente da escola.",
    cor: "#a78bfa",
    corCard: "#2a2250",
  },
  {
    numero: "02",
    titulo: "Adaptação",
    descricao:
      "Como é que o meu filho aprende melhor? Detectar padrões, preferências e sinais de neurodivergência.",
    cor: "#4ade80",
    corCard: "#1e3d28",
  },
  {
    numero: "03",
    titulo: "Família",
    descricao:
      "Como posso eu ajudar? Ferramentas para pais, avós e irmãos participarem na jornada.",
    cor: "#facc15",
    corCard: "#2a1f0a",
  },
];

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        zIndex: 1,
        background: "var(--fundo-pai)",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h1
          className="font-editorial"
          style={{ fontSize: "26px", fontWeight: 500 }}
        >
          SOMOS
        </h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link href="/leituras">
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--texto-secundario)",
              }}
            >
              Leituras
            </span>
          </Link>
          <Link href="/login">
            <button
              style={{
                background: "transparent",
                border: "1.5px solid rgba(160,144,128,0.4)",
                borderRadius: "10px",
                padding: "7px 16px",
                fontSize: "13px",
                fontWeight: 700,
                fontFamily: "Nunito, sans-serif",
                color: "var(--texto-principal)",
                cursor: "none",
              }}
            >
              Entrar
            </button>
          </Link>
          <Link href="/register">
            <button
              style={{
                background: "var(--texto-principal)",
                border: "none",
                borderRadius: "10px",
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: 800,
                fontFamily: "Nunito, sans-serif",
                color: "white",
                cursor: "none",
              }}
            >
              Começar
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "80px 40px 60px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(167,139,250,0.1)",
            border: "1px solid rgba(167,139,250,0.25)",
            padding: "6px 16px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--roxo-texto)",
            marginBottom: "28px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--roxo-tint)",
            }}
          />
          Plataforma de continuidade educativa familiar
        </div>

        <h2
          className="font-editorial"
          style={{
            fontSize: "clamp(44px, 6vw, 80px)",
            fontWeight: 500,
            lineHeight: 1.05,
            maxWidth: "800px",
            margin: "0 auto 28px",
            letterSpacing: "-1px",
          }}
        >
          A aprendizagem não começa{" "}
          <span style={{ fontStyle: "italic" }}>nem termina</span> na escola.
        </h2>

        <p
          style={{
            fontSize: "18px",
            color: "var(--texto-secundario)",
            fontWeight: 600,
            maxWidth: "540px",
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          O SOMOS devolve aos pais as ferramentas para entenderem e apoiarem o
          filho, independentemente da escola que frequenta.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link href="/register">
            <button
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
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Começar gratuitamente
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12H19M13 6L19 12L13 18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Link>
          <Link href="/leituras">
            <button
              style={{
                background: "transparent",
                color: "var(--texto-principal)",
                border: "1.5px solid rgba(160,144,128,0.3)",
                borderRadius: "14px",
                padding: "16px 24px",
                fontSize: "15px",
                fontWeight: 700,
                fontFamily: "Nunito, sans-serif",
                cursor: "none",
              }}
            >
              Ler o blog
            </button>
          </Link>
        </div>
      </section>

      {/* Três pilares */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "20px 40px 80px",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--texto-secundario)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          Como funciona
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {PILARES.map((pilar) => (
            <div
              key={pilar.numero}
              style={{
                background: pilar.corCard,
                borderRadius: "20px",
                padding: "28px",
                color: "white",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "16px",
                  fontSize: "64px",
                  fontWeight: 900,
                  fontFamily: "Nunito, sans-serif",
                  color: "rgba(255,255,255,0.04)",
                  lineHeight: 1,
                }}
              >
                {pilar.numero}
              </span>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: `${pilar.cor}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: pilar.cor,
                  }}
                />
              </div>
              <h3
                className="font-editorial"
                style={{
                  fontSize: "24px",
                  fontWeight: 500,
                  marginBottom: "10px",
                }}
              >
                {pilar.titulo}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  opacity: 0.55,
                  lineHeight: 1.6,
                }}
              >
                {pilar.descricao}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(160,144,128,0.15)",
          padding: "24px 40px",
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          className="font-editorial"
          style={{ fontSize: "18px", fontWeight: 500 }}
        >
          SOMOS
        </span>
        <p
          style={{
            fontSize: "12px",
            color: "var(--texto-secundario)",
            fontWeight: 600,
          }}
        >
          © 2026 SOMOS — Plataforma de continuidade educativa familiar
        </p>
      </footer>
    </div>
  );
}
