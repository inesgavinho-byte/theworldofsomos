"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDimensaoBySlug } from "@/lib/dimensoes";

const LICOES_INFO: Record<string, { titulo: string; descricao: string; duracao: string }> = {
  "floresta-tropical": {
    titulo: "A Floresta Tropical",
    descricao: "Mergulha no ecossistema mais rico do planeta. Descobre como as espécies cooperam, competem e sobrevivem neste labirinto de vida.",
    duracao: "15 min",
  },
  "cerebro-incrivel": {
    titulo: "O Cérebro Incrível",
    descricao: "O teu cérebro é a estrutura mais complexa do universo conhecido. Vamos descobrir como ele aprende, sente e cria.",
    duracao: "12 min",
  },
  "sistema-solar": {
    titulo: "O Sistema Solar",
    descricao: "Da rocha ígnea ao gás gigante — o nosso sistema solar é um lugar de extremos. Vamos explorar os seus oito planetas e os segredos que guardam.",
    duracao: "14 min",
  },
  "a-zona-certa": {
    titulo: "A Zona Certa",
    descricao: "Existe um espaço entre o demasiado fácil e o demasiado difícil onde a aprendizagem realmente acontece. Onde está a tua zona certa?",
    duracao: "10 min",
  },
  "cerebro-desafios": {
    titulo: "O Cérebro e os Desafios",
    descricao: "Por que é que o teu cérebro cresce quando enfrenta obstáculos? A neurociência por detrás da resiliência e do crescimento.",
    duracao: "11 min",
  },
  "o-proposito": {
    titulo: "O Propósito",
    descricao: "Para que estou aqui? Uma das questões mais profundas da humanidade, explorada com olhos curiosos e coração aberto.",
    duracao: "13 min",
  },
  "como-aprender": {
    titulo: "Como Aprender",
    descricao: "Há estratégias de aprendizagem que funcionam e outras que não. Descobre as técnicas que os melhores estudantes do mundo usam.",
    duracao: "12 min",
  },
  // Novas lições — 3.º/4.º ano PT
  "palavras-que-voam": {
    titulo: "As Palavras que Voam",
    descricao: "Uma criança descobre que as palavras têm superpotências diferentes — algumas descrevem, outras mostram acção, outras ainda ligam ideias. Adjectivos, verbos e conjunções ganham vida numa aventura de linguagem.",
    duracao: "12 min",
  },
  "o-mapa-dos-numeros": {
    titulo: "O Mapa dos Números",
    descricao: "Uma exploradora encontra um mapa antigo cheio de números misteriosos. Para desvendar os segredos do mapa, tem de perceber padrões, multiplicações e divisões simples.",
    duracao: "14 min",
  },
  "a-vida-secreta-das-plantas": {
    titulo: "A Vida Secreta das Plantas",
    descricao: "Uma criança descobre que as plantas respiram de forma diferente dos animais. De dia fazem fotossíntese, de noite respiram. Explora as partes da planta e o ciclo da água.",
    duracao: "13 min",
  },
  "a-aventura-em-ingles": {
    titulo: "The Big Adventure",
    descricao: "Um robot chamado Beep chega a Portugal e não fala português. Ajuda-o a aprender palavras essenciais do dia-a-dia — cores, animais, acções e estados emocionais.",
    duracao: "11 min",
  },
  "os-descobrimentos": {
    titulo: "Os Descobrimentos",
    descricao: "Portugal, pequeno país na ponta da Europa, teve uma ideia enorme: e se atravessássemos o oceano? A história das caravelas, de Vasco da Gama e do que os portugueses encontraram.",
    duracao: "15 min",
  },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function LicaoCapaPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const dim = getDimensaoBySlug(slug);
  const info = LICOES_INFO[slug] ?? {
    titulo: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    descricao: "Uma lição especial para descobrires algo novo sobre o mundo.",
    duracao: "10 min",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: dim.corCard,
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "fixed",
          top: "-100px",
          left: "-100px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${dim.cor}15 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Nav */}
      <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={() => router.back()}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: "10px",
            padding: "8px 14px",
            cursor: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 700,
            fontFamily: "Nunito, sans-serif",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Voltar
        </button>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "24px",
          maxWidth: "520px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Dimension badge */}
        <div
          className="badge-dimensao"
          style={{
            background: `${dim.cor}25`,
            color: dim.cor,
            marginBottom: "20px",
            alignSelf: "flex-start",
          }}
        >
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: dim.cor }} />
          {dim.nome}
        </div>

        {/* Big SVG illustration */}
        <div
          style={{
            marginBottom: "24px",
            opacity: 0.4,
            color: dim.cor,
          }}
        >
          <svg width="80" height="80" viewBox="0 0 32 32" fill="none">
            <path d="M16 28C16 28 4 20 4 12C4 7.58 7.58 4 12 4C13.8 4 15.46 4.6 16.8 5.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M16 28C16 28 28 20 28 12C28 7.58 24.42 4 20 4C18.2 4 16.54 4.6 15.2 5.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="16" y1="8" x2="16" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <h1
          className="font-editorial"
          style={{
            fontSize: "40px",
            fontWeight: 500,
            color: "white",
            lineHeight: 1.1,
            marginBottom: "16px",
          }}
        >
          {info.titulo}
        </h1>

        <p
          style={{
            fontSize: "15px",
            color: "rgba(255,255,255,0.6)",
            fontWeight: 600,
            lineHeight: 1.6,
            marginBottom: "32px",
          }}
        >
          {info.descricao}
        </p>

        {/* Meta */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {info.duracao}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L14.09 8.26L20.82 8.27L15.45 12.14L17.54 18.4L12 14.53L6.46 18.4L8.55 12.14L3.18 8.27L9.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            5 questões
          </div>
        </div>

        {/* CTA */}
        <Link href={`/licao/${slug}/exercicios`}>
          <button
            style={{
              width: "100%",
              background: dim.cor,
              color: dim.corCard,
              border: "none",
              borderRadius: "16px",
              padding: "18px",
              fontSize: "16px",
              fontWeight: 900,
              fontFamily: "Nunito, sans-serif",
              cursor: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            Começar lição
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </Link>
      </div>
    </div>
  );
}
