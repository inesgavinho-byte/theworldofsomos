"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDimensaoBySlug } from "@/lib/dimensoes";

const EXERCICIOS_POR_SLUG: Record<string, { pergunta: string; opcoes: string[]; correta: number; explicacao: string }[]> = {
  "floresta-tropical": [
    {
      pergunta: "Qual é a camada mais alta da floresta tropical?",
      opcoes: ["Sub-bosque", "Dossel", "Emergente", "Chão da floresta"],
      correta: 2,
      explicacao: "A camada emergente é a mais alta, onde as árvores mais altas se destacam acima do dossel.",
    },
    {
      pergunta: "Porque é que as florestas tropicais têm tanta biodiversidade?",
      opcoes: [
        "Por causa do frio",
        "Pela abundância de luz e chuva durante o ano",
        "Por terem poucos predadores",
        "Por estarem longe do mar",
      ],
      correta: 1,
      explicacao: "O calor constante e a chuva abundante criam condições perfeitas para muitas espécies diferentes.",
    },
    {
      pergunta: "O que é a fotossíntese?",
      opcoes: [
        "Como as plantas bebem água",
        "Como as plantas dormem",
        "Como as plantas produzem energia a partir da luz",
        "Como as plantas se reproduzem",
      ],
      correta: 2,
      explicacao: "A fotossíntese é o processo pelo qual as plantas convertem luz solar em energia química (açúcares).",
    },
    {
      pergunta: "Qual é o papel das árvores no ciclo da água?",
      opcoes: [
        "Absorvem e libertam água para a atmosfera",
        "Bloqueiam a chuva",
        "Secam o solo",
        "Não têm nenhum papel",
      ],
      correta: 0,
      explicacao: "As árvores absorvem água pelas raízes e libertam-na pelas folhas — um processo chamado transpiração.",
    },
    {
      pergunta: "O que significa 'endémico' quando falamos de uma espécie?",
      opcoes: [
        "Que é perigosa",
        "Que existe em todo o mundo",
        "Que só existe numa região específica",
        "Que está extinta",
      ],
      correta: 2,
      explicacao: "Uma espécie endémica só existe naturalmente numa região geográfica específica.",
    },
  ],
  "sistema-solar": [
    {
      pergunta: "Qual é o planeta mais próximo do Sol?",
      opcoes: ["Vénus", "Terra", "Mercúrio", "Marte"],
      correta: 2,
      explicacao: "Mercúrio é o planeta mais próximo do Sol, completando uma órbita em apenas 88 dias.",
    },
    {
      pergunta: "O que é um ano-luz?",
      opcoes: [
        "Um ano com muito sol",
        "A distância que a luz percorre num ano",
        "Um tipo de estrela",
        "Uma unidade de tempo",
      ],
      correta: 1,
      explicacao: "Um ano-luz é a distância que a luz percorre num ano — cerca de 9,46 trilhões de quilómetros.",
    },
    {
      pergunta: "Quantas luas tem Marte?",
      opcoes: ["0", "1", "2", "4"],
      correta: 2,
      explicacao: "Marte tem duas luas: Fobos e Deimos, que são muito pequenas comparadas com a Lua da Terra.",
    },
    {
      pergunta: "O que mantém os planetas em órbita?",
      opcoes: ["O vento solar", "A gravidade do Sol", "A velocidade deles", "O campo magnético"],
      correta: 1,
      explicacao: "A gravidade do Sol puxa os planetas em direção a ele, enquanto a sua velocidade os mantém em órbita.",
    },
    {
      pergunta: "Como se chama a galáxia onde vivemos?",
      opcoes: ["Andrómeda", "Via Láctea", "Triangulum", "Whirlpool"],
      correta: 1,
      explicacao: "Vivemos na Via Láctea, uma galáxia espiral com mais de 200 mil milhões de estrelas.",
    },
  ],
};

// Default exercises for slugs not in the map
const EXERCICIOS_PADRAO = [
  {
    pergunta: "O que é mais importante no processo de aprendizagem?",
    opcoes: ["Memorizar tudo", "Tentar mesmo quando é difícil", "Nunca errar", "Copiar dos outros"],
    correta: 1,
    explicacao: "Tentar mesmo quando é difícil é o segredo da aprendizagem — o erro é parte do caminho.",
  },
  {
    pergunta: "Qual é a melhor altura para estudar?",
    opcoes: [
      "Quando não há mais nada para fazer",
      "Só antes dos testes",
      "Um pouco todos os dias",
      "O mais tarde possível",
    ],
    correta: 2,
    explicacao: "Estudar um pouco todos os dias é muito mais eficaz do que estudar muito de uma vez.",
  },
  {
    pergunta: "O que acontece ao teu cérebro quando aprendes algo novo?",
    opcoes: [
      "Fica mais cansado",
      "Fica igual",
      "Formam-se novas ligações entre neurónios",
      "Fica mais pequeno",
    ],
    correta: 2,
    explicacao: "Cada vez que aprendes algo, o teu cérebro cria novas conexões — é como um músculo que cresce!",
  },
  {
    pergunta: "Porque é que dormir bem é importante para aprender?",
    opcoes: [
      "Não é importante",
      "Durante o sono o cérebro consolida as memórias",
      "Para ter energia para brincar",
      "Para não ter fome",
    ],
    correta: 1,
    explicacao: "Durante o sono, o cérebro processa e consolida tudo o que aprendeste durante o dia.",
  },
  {
    pergunta: "O que significa ter uma 'mentalidade de crescimento'?",
    opcoes: [
      "Crescer fisicamente",
      "Acreditar que as capacidades podem ser desenvolvidas com esforço",
      "Ser muito alto",
      "Ter muitos livros",
    ],
    correta: 1,
    explicacao: "Uma mentalidade de crescimento é acreditar que podes melhorar com esforço e prática.",
  },
];

function getExercicios(slug: string) {
  return EXERCICIOS_POR_SLUG[slug] ?? EXERCICIOS_PADRAO;
}

// Character configurations per dimension
const PERSONAGENS_POR_DIMENSAO: Record<string, Array<{ arquivo: string; video?: string }>> = {
  naturalista: [
    { arquivo: "Maya.png", video: "MAYA.mp4" },
    { arquivo: "Mayasalta.png" },
    { arquivo: "Sofia.png" },
  ],
  logica: [
    { arquivo: "Kenji.png" },
    { arquivo: "Finn.png" },
    { arquivo: "Ibrahim.png" },
    { arquivo: "Leo.png" },
  ],
  artistica: [
    { arquivo: "Yuki.png" },
    { arquivo: "Sara.png" },
  ],
  social: [
    { arquivo: "Nora.png" },
    { arquivo: "Kwame.png" },
  ],
  identitaria: [
    { arquivo: "Tomas.png" },
    { arquivo: "Layla.png" },
  ],
};

// Lesson-specific character overrides
const PERSONAGEM_POR_SLUG: Record<string, { arquivo: string; video?: string }> = {
  "vida-secreta-das-plantas": { arquivo: "Sofia_experiencias.png" },
};

const FRASES_ACERTO = ["Muito bem!", "Acertaste!", "Excelente!"];
const FRASES_ERRO = ["Quase!", "Tenta de novo!", "Não desistas!"];

function getPersonagem(slug: string, dimensaoSlug: string, questionIndex: number) {
  if (PERSONAGEM_POR_SLUG[slug]) return PERSONAGEM_POR_SLUG[slug];
  const pool = PERSONAGENS_POR_DIMENSAO[dimensaoSlug] ?? PERSONAGENS_POR_DIMENSAO.identitaria;
  return pool[questionIndex % pool.length];
}

interface PageProps {
  params: { slug: string };
}

export default function ExerciciosPage({ params }: PageProps) {
  const { slug } = params;
  const router = useRouter();
  const dim = getDimensaoBySlug(slug);
  const exercicios = getExercicios(slug);

  const [atual, setAtual] = useState(0);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [confirmada, setConfirmada] = useState(false);
  const [respostas, setRespostas] = useState<boolean[]>([]);
  const [estrelas, setEstrelas] = useState(0);

  const exercicio = exercicios[atual];
  const total = exercicios.length;
  const correta = selecionada === exercicio.correta;

  const personagem = getPersonagem(slug, dim.slug, atual);
  const fraseFeedback = correta
    ? FRASES_ACERTO[atual % FRASES_ACERTO.length]
    : FRASES_ERRO[atual % FRASES_ERRO.length];

  const confirmar = () => {
    if (selecionada === null) return;
    setConfirmada(true);
    if (correta) {
      setEstrelas((e) => e + 1);
    }
  };

  const avancar = () => {
    const novasRespostas = [...respostas, correta];
    setRespostas(novasRespostas);

    if (atual + 1 < total) {
      setAtual((a) => a + 1);
      setSelecionada(null);
      setConfirmada(false);
    } else {
      // Done — go to reflexao
      const params = new URLSearchParams({
        respostas: novasRespostas.map((r) => (r ? "1" : "0")).join(""),
        estrelas: String(estrelas + (correta ? 1 : 0)),
      });
      router.push(`/licao/${slug}/reflexao?${params}`);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--fundo-crianca)",
        position: "relative",
        zIndex: 1,
        padding: "0 0 40px",
      }}
    >
      {/* Nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(160,144,128,0.1)",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: "transparent",
            border: "none",
            cursor: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 700,
            fontFamily: "Nunito, sans-serif",
            color: "var(--texto-secundario)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Voltar
        </button>

        <h1
          className="font-editorial"
          style={{ fontSize: "18px", fontWeight: 500 }}
        >
          {slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
        </h1>

        {/* Estrelas counter */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L14.09 8.26L20.82 8.27L15.45 12.14L17.54 18.4L12 14.53L6.46 18.4L8.55 12.14L3.18 8.27L9.91 8.26L12 2Z"
              stroke="#facc15"
              strokeWidth="1.5"
              strokeLinejoin="round"
              fill={estrelas > 0 ? "#facc15" : "none"}
            />
          </svg>
          <span style={{ fontSize: "14px", fontWeight: 800, color: "#854f0b" }}>
            {estrelas}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: "540px", margin: "0 auto", padding: "24px 20px" }}>
        {/* Progress dots */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "8px",
          }}
        >
          {exercicios.map((_, i) => (
            <div
              key={i}
              className={`progress-dot ${i < atual ? "done" : ""} ${i === atual ? "active" : ""}`}
              style={
                i === atual
                  ? { background: dim.cor }
                  : i < atual
                  ? {}
                  : {}
              }
            />
          ))}
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: "3px",
            borderRadius: "2px",
            background: "rgba(160,144,128,0.15)",
            overflow: "hidden",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${((atual + (confirmada ? 1 : 0)) / total) * 100}%`,
              borderRadius: "2px",
              background: dim.cor,
              transition: "width 0.4s ease",
            }}
          />
        </div>

        {/* Dimension badge */}
        <div
          className="badge-dimensao"
          style={{
            background: `${dim.cor}18`,
            color: dim.corTexto,
            marginBottom: "16px",
          }}
        >
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: dim.cor }} />
          {dim.nome}
        </div>

        {/* Question card */}
        <div
          className="card-dashed"
          style={{
            padding: "24px",
            marginBottom: "20px",
            background: "rgba(255,255,255,0.5)",
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
            Questão {atual + 1} de {total}
          </p>
          <p
            className="font-editorial"
            style={{
              fontSize: "22px",
              fontWeight: 500,
              lineHeight: 1.4,
              color: "var(--texto-principal)",
            }}
          >
            {exercicio.pergunta}
          </p>
        </div>

        {/* Options 2×2 grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          {exercicio.opcoes.map((opcao, i) => {
            let bg = "rgba(255,255,255,0.6)";
            let border = "1.5px solid rgba(160,144,128,0.2)";
            let color = "var(--texto-principal)";

            if (confirmada) {
              if (i === exercicio.correta) {
                bg = "rgba(74,222,128,0.12)";
                border = "1.5px solid rgba(74,222,128,0.5)";
              } else if (i === selecionada && i !== exercicio.correta) {
                bg = "rgba(250,204,21,0.12)";
                border = "1.5px solid rgba(250,204,21,0.5)";
                color = "var(--amarelo-texto)";
              }
            } else if (i === selecionada) {
              bg = `${dim.cor}15`;
              border = `1.5px solid ${dim.cor}60`;
            }

            return (
              <button
                key={i}
                onClick={() => !confirmada && setSelecionada(i)}
                disabled={confirmada}
                style={{
                  background: bg,
                  border,
                  borderRadius: "14px",
                  padding: "16px",
                  textAlign: "left",
                  cursor: confirmada ? "default" : "none",
                  fontFamily: "Nunito, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color,
                  lineHeight: 1.4,
                  transition: "all 0.2s",
                  position: "relative",
                }}
              >
                {confirmada && i === selecionada && i !== exercicio.correta && (
                  <span
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "10px",
                      fontSize: "16px",
                      fontWeight: 900,
                      color: "#854f0b",
                    }}
                  >
                    ~
                  </span>
                )}
                {confirmada && i === exercicio.correta && (
                  <span style={{ position: "absolute", top: "8px", right: "10px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12L10 17L19 7" stroke="#2d5c3a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
                {opcao}
              </button>
            );
          })}
        </div>

        {/* Feedback after answer — character + encouragement */}
        {confirmada && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "12px",
              marginBottom: "20px",
              animation: "fadeIn 0.3s ease",
            }}
          >
            {/* Character */}
            <div
              style={{
                position: "relative",
                width: "90px",
                height: "130px",
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              {personagem.video ? (
                <video
                  src={`/assets/personagens/${personagem.video}`}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "bottom center",
                  }}
                />
              ) : (
                <img
                  src={`/assets/personagens/${personagem.arquivo}`}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "bottom center",
                  }}
                />
              )}
              {/* Gradient mask to blend dark image background with page */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse 90% 80% at 50% 55%, transparent 30%, #f5f2ec 80%), " +
                    "linear-gradient(to top, #f5f2ec 0%, transparent 45%)",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Feedback card */}
            <div
              style={{
                flex: 1,
                padding: "16px",
                borderRadius: "16px",
                background: correta ? "rgba(74,222,128,0.08)" : "rgba(250,204,21,0.08)",
                border: `1px solid ${correta ? "rgba(74,222,128,0.3)" : "rgba(250,204,21,0.3)"}`,
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: correta ? "#2d5c3a" : "#854f0b",
                  marginBottom: "4px",
                }}
              >
                {fraseFeedback}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--texto-principal)",
                  opacity: 0.8,
                }}
              >
                {exercicio.explicacao}
              </p>
            </div>
          </div>
        )}

        {/* Action button */}
        {!confirmada ? (
          <button
            onClick={confirmar}
            disabled={selecionada === null}
            style={{
              width: "100%",
              background: selecionada !== null ? dim.corCard : "rgba(160,144,128,0.15)",
              color: selecionada !== null ? "white" : "var(--texto-secundario)",
              border: "none",
              borderRadius: "14px",
              padding: "16px",
              fontSize: "15px",
              fontWeight: 800,
              fontFamily: "Nunito, sans-serif",
              cursor: selecionada !== null ? "none" : "default",
              transition: "all 0.2s",
            }}
          >
            Confirmar resposta
          </button>
        ) : (
          <button
            onClick={avancar}
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
            }}
          >
            {atual + 1 < total ? "Próxima questão" : "Ver resultado"}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M13 6L19 12L13 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
