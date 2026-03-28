"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const HOJE_IDX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

const MISSAO = {
  slug: "as-emocoes-sao-dados",
  titulo: "As Emoções são Dados",
  dimensao: "Identitária",
  cor: "#a78bfa",
  corCard: "#2a2250",
  progresso: 0,
  total: 5,
};

// Lições universais — pertencem à condição humana, não ao currículo
const LICOES_UNIVERSAIS = [
  { slug: "as-emocoes-sao-dados",  titulo: "As Emoções são Dados",   dimensao: "Identitária", cor: "#a78bfa", feito: false },
  { slug: "errar-e-parte-do-mapa", titulo: "Errar é Parte do Mapa",  dimensao: "Identitária", cor: "#a78bfa", feito: false },
  { slug: "o-proposito",           titulo: "O Propósito",            dimensao: "Social",      cor: "#facc15", feito: false },
];

// Lições curriculares — filtradas pelo currículo da criança
const LICOES_CURRICULARES = [
  { slug: "palavras-que-voam",          titulo: "As Palavras que Voam",       dimensao: "Artística",   cor: "#f472b6", feito: false },
  { slug: "o-mapa-dos-numeros",         titulo: "O Mapa dos Números",         dimensao: "Lógica",      cor: "#60a5fa", feito: false },
  { slug: "a-vida-secreta-das-plantas", titulo: "A Vida Secreta das Plantas", dimensao: "Naturalista", cor: "#4ade80", feito: false },
  { slug: "a-aventura-em-ingles",       titulo: "The Big Adventure",          dimensao: "Artística",   cor: "#f472b6", feito: false },
  { slug: "os-descobrimentos",          titulo: "Os Descobrimentos",          dimensao: "Social",      cor: "#facc15", feito: false },
];

const TAREFAS = [
  { id: 1, texto: "Ler 15 minutos sobre florestas", feita: false, cor: "#4ade80" },
  { id: 2, texto: "Fazer o exercício de matemática", feita: true, cor: "#60a5fa" },
  { id: 3, texto: "Pedir à avó para contar uma história", feita: false, cor: "#f472b6" },
];

interface Props {
  profile: { nome: string; tipo: string } | null;
  crianca: any;
}

export default function CriancaDashboardClient({ profile, crianca }: Props) {
  const router = useRouter();
  const nome = crianca?.nome ?? profile?.nome ?? "Explorador";
  const streak = 7;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/crianca/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--fundo-crianca)",
        position: "relative",
        zIndex: 1,
        padding: "24px 16px 64px",
        overflowY: "auto",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          maxWidth: "560px",
          margin: "0 auto 24px",
        }}
      >
        <h1 className="font-editorial" style={{ fontSize: "22px", fontWeight: 500 }}>
          SOMOS
        </h1>
        <button
          onClick={handleLogout}
          style={{
            background: "transparent",
            border: "1.5px solid rgba(160,144,128,0.3)",
            borderRadius: "10px",
            padding: "5px 12px",
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

      {/* Central column */}
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        {/* Avatar + nome */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "20px",
            animation: "fadeIn 0.5s ease",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #a78bfa 0%, #4ade80 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
              fontSize: "28px",
              fontWeight: 900,
              color: "white",
            }}
          >
            {nome.charAt(0).toUpperCase()}
          </div>
          <h2
            className="font-editorial"
            style={{ fontSize: "28px", fontWeight: 500, marginBottom: "4px" }}
          >
            Olá, {nome}
          </h2>
          <p style={{ fontSize: "13px", color: "var(--texto-secundario)", fontWeight: 600 }}>
            O que vamos descobrir hoje?
          </p>
        </div>

        {/* Streak pill */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div className="streak-pill">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C12 2 8 8 8 13C8 15.76 9.79 18 12 18C14.21 18 16 15.76 16 13C16 8 12 2 12 2Z"
                stroke="#a78bfa"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M8 13C8 15.76 9.79 18 12 18" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ color: "var(--roxo-texto)" }}>{streak} dias seguidos</span>
          </div>
        </div>

        {/* Stats 3 colunas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          {[
            { label: "Estrelas", valor: "47", cor: "#facc15" },
            { label: "Lições", valor: "12", cor: "#4ade80" },
            { label: "Semanas", valor: "3", cor: "#a78bfa" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(255,255,255,0.6)",
                borderRadius: "14px",
                padding: "14px",
                textAlign: "center",
                border: "1px solid rgba(160,144,128,0.12)",
              }}
            >
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: stat.cor,
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                {stat.valor}
              </p>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--texto-secundario)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Missão do dia */}
        <Link href={`/licao/${MISSAO.slug}/exercicios`}>
          <div
            className="card-hover"
            style={{
              background: MISSAO.corCard,
              borderRadius: "20px",
              padding: "20px",
              marginBottom: "20px",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "120px",
                height: "120px",
                background: `radial-gradient(circle at 80% 20%, ${MISSAO.cor}20 0%, transparent 70%)`,
              }}
            />
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                opacity: 0.5,
                marginBottom: "8px",
              }}
            >
              Missão do dia
            </p>
            <div
              className="badge-dimensao"
              style={{
                background: `${MISSAO.cor}25`,
                color: MISSAO.cor,
                marginBottom: "10px",
              }}
            >
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: MISSAO.cor }} />
              {MISSAO.dimensao}
            </div>
            <h3
              className="font-editorial"
              style={{ fontSize: "22px", fontWeight: 500, marginBottom: "12px" }}
            >
              {MISSAO.titulo}
            </h3>

            {/* Progress bar */}
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  height: "4px",
                  borderRadius: "2px",
                  background: "rgba(255,255,255,0.15)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(MISSAO.progresso / MISSAO.total) * 100}%`,
                    borderRadius: "2px",
                    background: MISSAO.cor,
                  }}
                />
              </div>
              <p style={{ fontSize: "11px", opacity: 0.5, marginTop: "4px" }}>
                {MISSAO.progresso}/{MISSAO.total} questões
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: MISSAO.cor,
                color: MISSAO.corCard,
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 800,
              }}
            >
              Começar
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </Link>

        {/* Lições Universais — O teu mundo interior */}
        <div
          style={{
            background: "rgba(255,255,255,0.6)",
            borderRadius: "20px",
            padding: "18px",
            marginBottom: "20px",
            border: "1px solid rgba(167,139,250,0.18)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--texto-secundario)",
                flex: 1,
              }}
            >
              O teu mundo interior
            </p>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "999px",
                background: "rgba(167,139,250,0.12)",
                color: "#534ab7",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.04em",
              }}
            >
              Universal
            </span>
          </div>
          {LICOES_UNIVERSAIS.map((ex, i) => (
            <Link key={ex.slug} href={`/licao/${ex.slug}/exercicios`}>
              <div
                className="card-hover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px",
                  borderRadius: "12px",
                  background: ex.feito ? "rgba(74,222,128,0.06)" : "transparent",
                  marginBottom: i < LICOES_UNIVERSAIS.length - 1 ? "6px" : 0,
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: `${ex.cor}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {ex.feito ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12L10 17L19 7" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: ex.cor }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", fontWeight: 700 }}>{ex.titulo}</p>
                  <p style={{ fontSize: "11px", color: "var(--texto-secundario)", fontWeight: 600 }}>
                    {ex.dimensao}
                  </p>
                </div>
                {!ex.feito && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="var(--texto-secundario)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Lições Curriculares — As tuas matérias */}
        <div
          style={{
            background: "rgba(255,255,255,0.6)",
            borderRadius: "20px",
            padding: "18px",
            marginBottom: "20px",
            border: "1px solid rgba(96,165,250,0.18)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--texto-secundario)",
                flex: 1,
              }}
            >
              As tuas matérias
            </p>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "999px",
                background: "rgba(96,165,250,0.12)",
                color: "#185fa5",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.04em",
              }}
            >
              Curricular
            </span>
          </div>
          {LICOES_CURRICULARES.map((ex, i) => (
            <Link key={ex.slug} href={`/licao/${ex.slug}/exercicios`}>
              <div
                className="card-hover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px",
                  borderRadius: "12px",
                  background: ex.feito ? "rgba(74,222,128,0.06)" : "transparent",
                  marginBottom: i < LICOES_CURRICULARES.length - 1 ? "6px" : 0,
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: `${ex.cor}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {ex.feito ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12L10 17L19 7" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: ex.cor }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", fontWeight: 700 }}>{ex.titulo}</p>
                  <p style={{ fontSize: "11px", color: "var(--texto-secundario)", fontWeight: 600 }}>
                    {ex.dimensao}
                  </p>
                </div>
                {!ex.feito && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="var(--texto-secundario)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Semana */}
        <div
          style={{
            background: "rgba(255,255,255,0.6)",
            borderRadius: "20px",
            padding: "18px",
            marginBottom: "20px",
            border: "1px solid rgba(160,144,128,0.12)",
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
            Esta semana
          </p>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {DIAS_SEMANA.map((dia, i) => {
              const isToday = i === HOJE_IDX;
              const isDone = i < HOJE_IDX;
              return (
                <div key={dia} className="semana-dia">
                  <div
                    className="semana-dia-circle"
                    style={{
                      background: isDone
                        ? "#4ade80"
                        : isToday
                        ? "var(--roxo-card)"
                        : "rgba(160,144,128,0.12)",
                      color: isDone || isToday ? "white" : "var(--texto-secundario)",
                    }}
                  >
                    {isDone ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12L10 17L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <span style={{ fontSize: "11px", fontWeight: 800 }}>
                        {isToday ? "•" : ""}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: isToday ? "var(--roxo-texto)" : "var(--texto-secundario)",
                    }}
                  >
                    {dia}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cofre semanal */}
        <div
          style={{
            background: "linear-gradient(135deg, #2a1f0a 0%, #3a2d10 100%)",
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "20px",
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
              marginBottom: "10px",
            }}
          >
            Cofre semanal
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "rgba(250,204,21,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L14.09 8.26L20.82 8.27L15.45 12.14L17.54 18.4L12 14.53L6.46 18.4L8.55 12.14L3.18 8.27L9.91 8.26L12 2Z"
                  stroke="#facc15"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: "22px", fontWeight: 900, color: "#facc15" }}>
                47 estrelas
              </p>
              <p style={{ fontSize: "12px", opacity: 0.5 }}>
                Continua a explorar
              </p>
            </div>
          </div>
          <div
            style={{
              marginTop: "14px",
              height: "6px",
              borderRadius: "3px",
              background: "rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "94%",
                borderRadius: "3px",
                background: "#facc15",
              }}
            />
          </div>
        </div>

        {/* Tarefas do dia */}
        <div
          style={{
            background: "rgba(255,255,255,0.6)",
            borderRadius: "20px",
            padding: "18px",
            border: "1px solid rgba(160,144,128,0.12)",
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
            Tarefas do dia
          </p>
          {TAREFAS.map((tarefa) => (
            <div
              key={tarefa.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 0",
                borderBottom: "1px solid rgba(160,144,128,0.08)",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "6px",
                  border: tarefa.feita
                    ? `2px solid #4ade80`
                    : `2px solid rgba(160,144,128,0.3)`,
                  background: tarefa.feita ? "#4ade80" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {tarefa.feita && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12L10 17L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: tarefa.feita ? "line-through" : "none",
                  opacity: tarefa.feita ? 0.5 : 1,
                }}
              >
                {tarefa.texto}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
