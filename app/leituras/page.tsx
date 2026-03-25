import Link from "next/link";

const ARTIGOS = [
  {
    slug: "como-falar-filho-dificuldades",
    titulo: "Como falar com o teu filho sobre dificuldades na escola",
    subtitulo: "Ferramentas práticas para criar espaços de diálogo sem julgamento",
    categoria: "Família",
    tempo: "5 min",
    cor: "#a78bfa",
    corTexto: "#534ab7",
    data: "20 março 2026",
  },
  {
    slug: "neurociencia-aprendizagem",
    titulo: "O que a neurociência nos diz sobre como as crianças aprendem",
    subtitulo: "Da plasticidade cerebral aos estilos de aprendizagem — o que a ciência sabe de facto",
    categoria: "Ciência",
    tempo: "8 min",
    cor: "#60a5fa",
    corTexto: "#185fa5",
    data: "15 março 2026",
  },
  {
    slug: "neurodivergencia-guia-pais",
    titulo: "Neurodivergência — um guia honesto para pais",
    subtitulo: "Compreender TDAH, dislexia e outras formas de pensar que não são 'erradas'",
    categoria: "Diagnóstico",
    tempo: "10 min",
    cor: "#4ade80",
    corTexto: "#2d5c3a",
    data: "8 março 2026",
  },
  {
    slug: "avos-participar-aprendizagem",
    titulo: "Como os avós podem participar na aprendizagem dos netos",
    subtitulo: "A sabedoria intergeracional como ferramenta pedagógica",
    categoria: "Família",
    tempo: "6 min",
    cor: "#facc15",
    corTexto: "#854f0b",
    data: "1 março 2026",
  },
  {
    slug: "rotinas-criancas-ansiosas",
    titulo: "Rotinas que ajudam crianças ansiosas a aprender melhor",
    subtitulo: "Previsibilidade como base de segurança para a exploração cognitiva",
    categoria: "Bem-estar",
    tempo: "7 min",
    cor: "#f472b6",
    corTexto: "#993556",
    data: "22 fevereiro 2026",
  },
];

export default function LeiturasPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--fundo-pai)",
        position: "relative",
        zIndex: 1,
        padding: "0 0 60px",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <Link href="/">
          <h1
            className="font-editorial"
            style={{ fontSize: "22px", fontWeight: 500 }}
          >
            SOMOS
          </h1>
        </Link>
        <Link href="/login">
          <button
            style={{
              background: "var(--texto-principal)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "7px 16px",
              fontSize: "13px",
              fontWeight: 800,
              fontFamily: "Nunito, sans-serif",
              cursor: "none",
            }}
          >
            Entrar
          </button>
        </Link>
      </nav>

      {/* Header */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "32px 40px 40px",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--texto-secundario)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          Fonte do Conhecimento
        </p>
        <h2
          className="font-editorial"
          style={{ fontSize: "48px", fontWeight: 500, lineHeight: 1.1 }}
        >
          Leituras para pais que pensam.
        </h2>
        <p
          style={{
            fontSize: "16px",
            color: "var(--texto-secundario)",
            fontWeight: 600,
            marginTop: "12px",
            maxWidth: "480px",
            lineHeight: 1.6,
          }}
        >
          Artigos sobre aprendizagem, família e desenvolvimento infantil.
          Sem receitas — com perguntas.
        </p>
      </div>

      {/* Featured article */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0 40px",
          marginBottom: "32px",
        }}
      >
        <Link href={`/leituras/${ARTIGOS[0].slug}`}>
          <div
            className="card-hover"
            style={{
              background: "rgba(245,242,236,0.9)",
              borderRadius: "24px",
              padding: "32px",
              border: "1px solid rgba(160,144,128,0.15)",
            }}
          >
            <div
              className="badge-dimensao"
              style={{
                background: `${ARTIGOS[0].cor}15`,
                color: ARTIGOS[0].corTexto,
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: ARTIGOS[0].cor,
                }}
              />
              {ARTIGOS[0].categoria} · {ARTIGOS[0].tempo}
            </div>
            <h3
              className="font-editorial"
              style={{ fontSize: "32px", fontWeight: 500, marginBottom: "10px", lineHeight: 1.2 }}
            >
              {ARTIGOS[0].titulo}
            </h3>
            <p
              style={{
                fontSize: "15px",
                color: "var(--texto-secundario)",
                fontWeight: 600,
                lineHeight: 1.6,
                marginBottom: "16px",
              }}
            >
              {ARTIGOS[0].subtitulo}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--texto-secundario)",
                  fontWeight: 600,
                }}
              >
                {ARTIGOS[0].data}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: ARTIGOS[0].corTexto,
                  fontWeight: 700,
                }}
              >
                Ler artigo →
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Other articles */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0 40px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {ARTIGOS.slice(1).map((artigo) => (
          <Link key={artigo.slug} href={`/leituras/${artigo.slug}`}>
            <div
              className="card-hover"
              style={{
                background: "rgba(245,242,236,0.8)",
                borderRadius: "16px",
                padding: "20px 24px",
                border: "1px solid rgba(160,144,128,0.12)",
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: `${artigo.cor}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: artigo.cor,
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: artigo.corTexto,
                    }}
                  >
                    {artigo.categoria}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--texto-secundario)",
                      fontWeight: 600,
                    }}
                  >
                    · {artigo.tempo} · {artigo.data}
                  </span>
                </div>
                <h4
                  className="font-editorial"
                  style={{ fontSize: "18px", fontWeight: 500, lineHeight: 1.3 }}
                >
                  {artigo.titulo}
                </h4>
              </div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                style={{ flexShrink: 0, opacity: 0.3 }}
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="var(--texto-principal)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
