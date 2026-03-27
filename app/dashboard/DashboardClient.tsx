"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { getCurriculoConfig, formatAnoEscolar } from "@/lib/curriculo";

const LICOES = [
  {
    slug: "floresta-tropical",
    titulo: "A Floresta Tropical",
    subtitulo: "Ecossistemas e biodiversidade",
    dimensao: "Naturalista",
    cor: "#4ade80",
    corTexto: "#2d5c3a",
    corCard: "#1e3d28",
    numero: "01",
  },
  {
    slug: "cerebro-incrivel",
    titulo: "O Cérebro Incrível",
    subtitulo: "Como funciona a tua mente",
    dimensao: "Identitária",
    cor: "#a78bfa",
    corTexto: "#534ab7",
    corCard: "#2a2250",
    numero: "02",
  },
  {
    slug: "sistema-solar",
    titulo: "O Sistema Solar",
    subtitulo: "Planetas e galáxias",
    dimensao: "Lógica",
    cor: "#60a5fa",
    corTexto: "#185fa5",
    corCard: "#0f1a2e",
    numero: "03",
  },
  {
    slug: "a-zona-certa",
    titulo: "A Zona Certa",
    subtitulo: "Encontrar o teu espaço",
    dimensao: "Identitária",
    cor: "#a78bfa",
    corTexto: "#534ab7",
    corCard: "#2a2250",
    numero: "04",
  },
  {
    slug: "o-proposito",
    titulo: "O Propósito",
    subtitulo: "Para que estou aqui?",
    dimensao: "Social",
    cor: "#facc15",
    corTexto: "#854f0b",
    corCard: "#2a1f0a",
    numero: "05",
  },
];

const COMPETENCIAS = [
  { nome: "Raciocínio Lógico", nivel: 72, cor: "#60a5fa" },
  { nome: "Consciência Emocional", nivel: 58, cor: "#a78bfa" },
  { nome: "Literacia Científica", nivel: 85, cor: "#4ade80" },
  { nome: "Competências Sociais", nivel: 44, cor: "#f472b6" },
  { nome: "Propósito & Valores", nivel: 61, cor: "#facc15" },
];

const ARTIGO_RECENTE = {
  titulo: "Como falar com o teu filho sobre dificuldades na escola",
  categoria: "Família",
  tempo: "5 min",
  slug: "como-falar-filho-dificuldades",
};

function hoje(): string {
  const d = new Date();
  const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]}`;
}

interface Props {
  profile: { nome: string; tipo: string } | null;
  familiaId: string | null;
  criancas: any[];
}

export default function DashboardClient({ profile, familiaId, criancas }: Props) {
  const router = useRouter();
  const licaoHoje = LICOES[0];
  const outrasLicoes = LICOES.slice(1, 5);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--fundo-pai)",
        position: "relative",
        zIndex: 1,
        padding: "32px 24px",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
          maxWidth: "1200px",
          margin: "0 auto 32px",
        }}
      >
        <h1
          className="font-editorial"
          style={{ fontSize: "28px", fontWeight: 500 }}
        >
          SOMOS
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span
            style={{
              fontSize: "13px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
            }}
          >
            {profile?.nome ?? ""}
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

      {/* Main layout */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN */}
        <div>
          {/* Date */}
          <p
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--texto-secundario)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            {hoje()}
          </p>

          {/* Hero — Lição de Hoje */}
          <Link href={`/licao/${licaoHoje.slug}`}>
            <div
              className="card-hover"
              style={{
                background: "rgba(245,242,236,0.9)",
                borderRadius: "20px",
                overflow: "hidden",
                marginBottom: "20px",
                display: "flex",
                border: "1px solid rgba(160,144,128,0.15)",
                height: "140px",
              }}
            >
              {/* Colored left panel */}
              <div
                style={{
                  width: "172px",
                  flexShrink: 0,
                  background: licaoHoje.corCard,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    fontSize: "80px",
                    fontWeight: 900,
                    fontFamily: "Nunito, sans-serif",
                    color: "rgba(255,255,255,0.05)",
                    lineHeight: 1,
                    bottom: "-8px",
                    right: "8px",
                  }}
                >
                  {licaoHoje.numero}
                </span>
                {/* Dimension SVG */}
                <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M16 28C16 28 4 20 4 12C4 7.58 7.58 4 12 4C13.8 4 15.46 4.6 16.8 5.6"
                    stroke={licaoHoje.cor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M16 28C16 28 28 20 28 12C28 7.58 24.42 4 20 4C18.2 4 16.54 4.6 15.2 5.6"
                    stroke={licaoHoje.cor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="16" y1="8" x2="16" y2="28"
                    stroke={licaoHoje.cor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Right content */}
              <div
                style={{
                  flex: 1,
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div
                  className="badge-dimensao"
                  style={{
                    background: `${licaoHoje.cor}18`,
                    color: licaoHoje.corTexto,
                    marginBottom: "8px",
                    alignSelf: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: licaoHoje.cor,
                    }}
                  />
                  {licaoHoje.dimensao}
                </div>
                <h2
                  className="font-editorial"
                  style={{
                    fontSize: "24px",
                    fontWeight: 500,
                    marginBottom: "4px",
                    lineHeight: 1.2,
                  }}
                >
                  {licaoHoje.titulo}
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--texto-secundario)",
                    fontWeight: 600,
                  }}
                >
                  {licaoHoje.subtitulo}
                </p>
              </div>
            </div>
          </Link>

          {/* Grid 2×2 outras lições */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}
          >
            {outrasLicoes.map((licao) => (
              <Link key={licao.slug} href={`/licao/${licao.slug}`}>
                <div
                  className="card-hover"
                  style={{
                    background: `color-mix(in srgb, ${licao.cor} 6%, #f5f2ec 94%)`,
                    borderRadius: "16px",
                    padding: "18px",
                    border: "1px solid rgba(160,144,128,0.12)",
                    position: "relative",
                    overflow: "hidden",
                    minHeight: "120px",
                  }}
                >
                  {/* bg SVG */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-8px",
                      right: "-8px",
                      opacity: 0.14,
                      color: licao.cor,
                    }}
                  >
                    <svg width="56" height="56" viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M6 26C6 21.58 10.48 18 16 18C21.52 18 26 21.58 26 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>

                  <div
                    className="badge-dimensao"
                    style={{
                      background: `${licao.cor}20`,
                      color: licao.corTexto,
                      marginBottom: "10px",
                      fontSize: "11px",
                    }}
                  >
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: licao.cor }} />
                    {licao.dimensao}
                  </div>
                  <h3
                    className="font-editorial"
                    style={{ fontSize: "18px", fontWeight: 500, lineHeight: 1.3 }}
                  >
                    {licao.titulo}
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--texto-secundario)",
                      fontWeight: 600,
                      marginTop: "4px",
                    }}
                  >
                    {licao.subtitulo}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Gerar exercícios do livro */}
          <Link href="/gerar">
            <div
              className="card-hover"
              style={{
                background: "rgba(96,165,250,0.1)",
                border: "1.5px solid rgba(96,165,250,0.25)",
                borderRadius: "16px",
                padding: "16px 18px",
                cursor: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "rgba(96,165,250,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    flexShrink: 0,
                  }}
                >
                  📷
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 800,
                      color: "#185fa5",
                      marginBottom: "2px",
                    }}
                  >
                    Gerar exercícios do livro
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--texto-secundario)",
                      fontWeight: 600,
                    }}
                  >
                    Tira uma foto a qualquer página
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* A vossa família */}
          <div
            style={{
              background: "var(--roxo-card)",
              borderRadius: "20px",
              padding: "20px",
              color: "white",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                opacity: 0.5,
                marginBottom: "12px",
              }}
            >
              A vossa família
            </p>
            {criancas.length > 0 ? (
              criancas.map((c: any) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.07)",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(167,139,250,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {c.nome?.charAt(0) ?? "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 700 }}>{c.nome}</p>
                    {c.curriculo && c.curriculo !== "outro" ? (
                      <p style={{ fontSize: "11px", opacity: 0.6, fontWeight: 600 }}>
                        {(() => {
                          const cfg = getCurriculoConfig(c.curriculo);
                          const anoDisplay = c.ano_escolar
                            ? formatAnoEscolar(c.curriculo, c.ano_escolar)
                            : null;
                          return cfg
                            ? `${cfg.bandeira} ${c.curriculo}${anoDisplay ? ` · ${anoDisplay}` : ""}`
                            : c.curriculo;
                        })()}
                      </p>
                    ) : (
                      <p style={{ fontSize: "11px", opacity: 0.5 }}>{c.escola ?? "—"}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <Link href="/onboarding">
                <div
                  style={{
                    border: "1.5px dashed rgba(255,255,255,0.2)",
                    borderRadius: "12px",
                    padding: "16px",
                    textAlign: "center",
                    cursor: "none",
                  }}
                >
                  <p style={{ fontSize: "13px", fontWeight: 700, opacity: 0.7 }}>
                    + Adicionar criança
                  </p>
                </div>
              </Link>
            )}
          </div>

          {/* Mapa de competências */}
          <div
            style={{
              background: "rgba(245,242,236,0.9)",
              borderRadius: "20px",
              padding: "20px",
              border: "1px solid rgba(160,144,128,0.15)",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--texto-secundario)",
                marginBottom: "14px",
              }}
            >
              Mapa de competências
            </p>
            {COMPETENCIAS.map((c) => (
              <div key={c.nome} style={{ marginBottom: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                  }}
                >
                  <span style={{ fontSize: "12px", fontWeight: 700 }}>{c.nome}</span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: c.cor,
                    }}
                  >
                    {c.nivel}%
                  </span>
                </div>
                <div
                  style={{
                    height: "4px",
                    borderRadius: "2px",
                    background: "rgba(160,144,128,0.15)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${c.nivel}%`,
                      borderRadius: "2px",
                      background: c.cor,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Fonte do Conhecimento */}
          <div
            style={{
              background: "rgba(245,242,236,0.9)",
              borderRadius: "20px",
              padding: "20px",
              border: "1px solid rgba(160,144,128,0.15)",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--texto-secundario)",
                marginBottom: "12px",
              }}
            >
              Fonte do conhecimento
            </p>
            <Link href={`/leituras/${ARTIGO_RECENTE.slug}`}>
              <div className="card-hover">
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(167,139,250,0.12)",
                    color: "var(--roxo-texto)",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  {ARTIGO_RECENTE.categoria} · {ARTIGO_RECENTE.tempo}
                </div>
                <p
                  className="font-editorial"
                  style={{
                    fontSize: "16px",
                    fontWeight: 500,
                    lineHeight: 1.4,
                    color: "var(--texto-principal)",
                  }}
                >
                  {ARTIGO_RECENTE.titulo}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--roxo-texto)",
                    fontWeight: 700,
                    marginTop: "8px",
                  }}
                >
                  Ler artigo →
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
