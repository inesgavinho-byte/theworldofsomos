"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDimensaoBySlug, SLUG_DIMENSAO } from "@/lib/dimensoes";

// ─── Types ────────────────────────────────────────────────────────────────────

type DimKey = "identitaria" | "naturalista" | "logica" | "social" | "emocional";

// ─── Static data ──────────────────────────────────────────────────────────────

const LICOES_INFO: Record<string, { titulo: string; descricao: string; duracao: string; questoes: number }> = {
  "floresta-tropical": {
    titulo: "A Floresta Tropical",
    descricao: "Mergulha no ecossistema mais rico do planeta. Descobre como as espécies cooperam, competem e sobrevivem neste labirinto de vida.",
    duracao: "15",
    questoes: 5,
  },
  "cerebro-incrivel": {
    titulo: "O Cérebro Incrível",
    descricao: "O teu cérebro é a estrutura mais complexa do universo conhecido. Vamos descobrir como ele aprende, sente e cria.",
    duracao: "12",
    questoes: 5,
  },
  "sistema-solar": {
    titulo: "O Sistema Solar",
    descricao: "Da rocha ígnea ao gás gigante — o nosso sistema solar é um lugar de extremos. Vamos explorar os seus oito planetas e os segredos que guardam.",
    duracao: "14",
    questoes: 5,
  },
  "a-zona-certa": {
    titulo: "A Zona Certa",
    descricao: "Existe um espaço entre o demasiado fácil e o demasiado difícil onde a aprendizagem realmente acontece. Onde está a tua zona certa?",
    duracao: "10",
    questoes: 5,
  },
  "cerebro-desafios": {
    titulo: "O Cérebro e os Desafios",
    descricao: "Por que é que o teu cérebro cresce quando enfrenta obstáculos? A neurociência por detrás da resiliência e do crescimento.",
    duracao: "11",
    questoes: 5,
  },
  "o-proposito": {
    titulo: "O Propósito",
    descricao: "Para que estou aqui? Uma das questões mais profundas da humanidade, explorada com olhos curiosos e coração aberto.",
    duracao: "13",
    questoes: 5,
  },
  "como-aprender": {
    titulo: "Como Aprender",
    descricao: "Há estratégias de aprendizagem que funcionam e outras que não. Descobre as técnicas que os melhores estudantes do mundo usam.",
    duracao: "12",
    questoes: 5,
  },
  // Lições universais
  "as-emocoes-sao-dados": {
    titulo: "As Emoções são Dados",
    descricao: "As emoções não são fraqueza — são informação. Quando sentes medo, o teu corpo está a dizer-te algo. Descobre o sistema de navegação interno que todos temos.",
    duracao: "10",
    questoes: 5,
  },
  "errar-e-parte-do-mapa": {
    titulo: "Errar é Parte do Mapa",
    descricao: "Nenhum explorador chegou a um lugar novo sem se perder pelo caminho. O erro não é o oposto do sucesso — é o caminho para ele.",
    duracao: "10",
    questoes: 5,
  },
  "o-planeta-e-a-nossa-casa": {
    titulo: "O Planeta é a Nossa Casa",
    descricao: "Não existe endereço mais preciso do que este: Terra, Sistema Solar, Via Láctea. Esta é a nossa casa. O que acontece quando não cuidamos dela?",
    duracao: "10",
    questoes: 5,
  },
  // Novas lições — 3.º/4.º ano PT
  "palavras-que-voam": {
    titulo: "As Palavras que Voam",
    descricao: "Uma criança descobre que as palavras têm superpotências diferentes — algumas descrevem, outras mostram acção, outras ainda ligam ideias. Adjectivos, verbos e conjunções ganham vida numa aventura de linguagem.",
    duracao: "12 min",
    questoes: 5,
  },
  "o-mapa-dos-numeros": {
    titulo: "O Mapa dos Números",
    descricao: "Uma exploradora encontra um mapa antigo cheio de números misteriosos. Para desvendar os segredos do mapa, tem de perceber padrões, multiplicações e divisões simples.",
    duracao: "14 min",
    questoes: 5,
  },
  "a-vida-secreta-das-plantas": {
    titulo: "A Vida Secreta das Plantas",
    descricao: "Uma criança descobre que as plantas respiram de forma diferente dos animais. De dia fazem fotossíntese, de noite respiram. Explora as partes da planta e o ciclo da água.",
    duracao: "13 min",
    questoes: 5,
  },
  "a-aventura-em-ingles": {
    titulo: "The Big Adventure",
    descricao: "Um robot chamado Beep chega a Portugal e não fala português. Ajuda-o a aprender palavras essenciais do dia-a-dia — cores, animais, acções e estados emocionais.",
    duracao: "11 min",
    questoes: 5,
  },
  "os-descobrimentos": {
    titulo: "Os Descobrimentos",
    descricao: "Portugal, pequeno país na ponta da Europa, teve uma ideia enorme: e se atravessássemos o oceano? A história das caravelas, de Vasco da Gama e do que os portugueses encontraram.",
    duracao: "15 min",
    questoes: 5,
  },
};

const DIM_BG: Record<DimKey, string> = {
  identitaria: "#0d0b1a",
  naturalista: "#0f1a14",
  logica: "#0a0f1a",
  social: "#1a0a12",
  emocional: "#1a1200",
};

const MANTRAS: Record<DimKey, string[]> = {
  identitaria: [
    "Conhecer-te é a maior aventura.",
    "Tens um universo dentro de ti.",
    "O que sentes é real e importa.",
    "A tua história só tu podes escrever.",
  ],
  naturalista: [
    "A natureza tem segredos à tua espera.",
    "Cada folha conta uma história.",
    "O mundo natural está cheio de maravilhas.",
  ],
  logica: [
    "O teu cérebro fica mais forte cada vez que pensa.",
    "Cada problema tem uma solução à tua espera.",
    "Pensar é um superpoder.",
  ],
  social: [
    "As tuas palavras têm poder.",
    "Expressar é uma forma de voar.",
    "A língua é a casa do pensamento.",
  ],
  emocional: [
    "Cada pessoa é um mundo por descobrir.",
    "Juntos somos mais do que a soma das partes.",
    "A história é feita de pessoas como tu.",
  ],
};

const BTN_TEXT_COLOR: Record<DimKey, string> = {
  identitaria: "#1a1530",
  naturalista: "#1e3d28",
  logica: "#0f1a2e",
  social: "#3d1a2e",
  emocional: "#2a1f0a",
};

// ─── Dimension icon (JSX) ─────────────────────────────────────────────────────

function DimIcon({ dimKey, color, size = 80 }: { dimKey: DimKey; color: string; size?: number }) {
  const s = size;
  if (dimKey === "naturalista") return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <path d="M16 28C16 28 4 20 4 12C4 7.58 7.58 4 12 4C13.8 4 15.46 4.6 16.8 5.6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 28C16 28 28 20 28 12C28 7.58 24.42 4 20 4C18.2 4 16.54 4.6 15.2 5.6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="8" x2="16" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  if (dimKey === "identitaria") return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="12" r="5" stroke={color} strokeWidth="1.5"/>
      <path d="M6 26C6 21.58 10.48 18 16 18C21.52 18 26 21.58 26 26" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  if (dimKey === "logica") return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="4" width="10" height="10" rx="2" stroke={color} strokeWidth="1.5"/>
      <rect x="18" y="4" width="10" height="10" rx="2" stroke={color} strokeWidth="1.5"/>
      <rect x="4" y="18" width="10" height="10" rx="2" stroke={color} strokeWidth="1.5"/>
      <path d="M23 18V14M19 23H14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  if (dimKey === "social") return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <circle cx="10" cy="12" r="4" stroke={color} strokeWidth="1.5"/>
      <circle cx="22" cy="12" r="4" stroke={color} strokeWidth="1.5"/>
      <path d="M4 26C4 22.13 6.69 19 10 19" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M28 26C28 22.13 25.31 19 22 19" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14 26C14 22.13 16 19 16 19" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  // emocional
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <path d="M16 27L5.5 16.5C3.5 14.5 3.5 11.5 5.5 9.5C7.5 7.5 10.5 7.5 12.5 9.5L16 13L19.5 9.5C21.5 7.5 24.5 7.5 26.5 9.5C28.5 11.5 28.5 14.5 26.5 16.5L16 27Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Canvas particles ─────────────────────────────────────────────────────────

function ParticleCanvas({ dimKey, color }: { dimKey: DimKey; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Build particles
    const W = () => canvas.width;
    const H = () => canvas.height;
    const N = 35;

    interface Particle {
      x: number; y: number; r: number; opacity: number;
      vx: number; vy: number; phase: number; speed: number;
      pulsePhase: number; pulseSpeed: number;
    }

    const particles: Particle[] = Array.from({ length: N }, () => ({
      x: Math.random() * (W() || 400),
      y: Math.random() * (H() || 700),
      r: 0.5 + Math.random() * 1.5,
      opacity: 0.2 + Math.random() * 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: dimKey === "naturalista" ? -(0.3 + Math.random() * 0.7) : (Math.random() - 0.5) * 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.5,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.02,
    }));

    // For emocional: fixed positions, fade in/out
    const emoParticles = dimKey === "emocional" ? Array.from({ length: 30 }, () => ({
      x: Math.random() * (W() || 400),
      y: Math.random() * (H() || 700),
      r: 1 + Math.random() * 2,
      opacity: Math.random(),
      fadeSpeed: 0.003 + Math.random() * 0.008,
      fadeDir: Math.random() > 0.5 ? 1 : -1,
    })) : null;

    let frame = 0;
    let rafId: number;

    const tick = () => {
      const w = W(); const h = H();
      ctx.clearRect(0, 0, w, h);
      frame++;

      if (dimKey === "identitaria") {
        // Stars with connections + pulse
        particles.forEach((p) => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
          p.pulsePhase += p.pulseSpeed;
          const pulse = 1 + 0.3 * Math.sin(p.pulsePhase);
          const alpha = p.opacity * (0.85 + 0.15 * Math.sin(p.pulsePhase));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(167,139,250,${alpha})`;
          ctx.fill();
        });
        // Connections
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(167,139,250,${0.12 * (1 - dist / 80)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }

      } else if (dimKey === "naturalista") {
        // Upward floating spores
        particles.forEach((p, i) => {
          p.y += p.vy;
          p.x += Math.sin(frame * 0.02 + i) * 0.3;
          if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
          const alpha = p.opacity * (0.5 + 0.5 * Math.abs(Math.sin(frame * 0.01 + p.phase)));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(74,222,128,${alpha})`;
          ctx.fill();
        });

      } else if (dimKey === "logica") {
        // Grid + randomly lit lines
        const step = 32;
        ctx.lineWidth = 0.5;
        // Base grid
        for (let x = 0; x <= w; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0); ctx.lineTo(x, h);
          ctx.strokeStyle = "rgba(96,165,250,0.05)";
          ctx.stroke();
        }
        for (let y = 0; y <= h; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y); ctx.lineTo(w, y);
          ctx.strokeStyle = "rgba(96,165,250,0.05)";
          ctx.stroke();
        }
        // Randomly lit segments
        particles.forEach((p, i) => {
          p.pulsePhase += 0.015;
          const glow = Math.max(0, Math.sin(p.pulsePhase + i));
          if (glow > 0.3) {
            const gx = Math.floor(p.x / step) * step;
            const gy = Math.floor(p.y / step) * step;
            const alpha = glow * 0.25;
            ctx.beginPath();
            if (i % 2 === 0) {
              ctx.moveTo(gx, gy); ctx.lineTo(gx + step, gy);
            } else {
              ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + step);
            }
            ctx.strokeStyle = `rgba(96,165,250,${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

      } else if (dimKey === "social") {
        // Sinusoidal floating notes (pink/artística)
        particles.forEach((p, i) => {
          p.x += p.speed * 0.4;
          p.y = (p.y + (h / N) * i % h) + Math.sin(frame * 0.03 + p.phase) * 0.6;
          if (p.x > w + 10) { p.x = -10; }
          const alpha = 0.15 + 0.35 * Math.abs(Math.sin(frame * 0.02 + p.phase));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(244,114,182,${alpha})`;
          ctx.fill();
        });

      } else if (dimKey === "emocional" && emoParticles) {
        // Appear/disappear city lights with connections
        emoParticles.forEach((p) => {
          p.opacity += p.fadeSpeed * p.fadeDir;
          if (p.opacity >= 0.85) { p.opacity = 0.85; p.fadeDir = -1; }
          if (p.opacity <= 0.0) { p.opacity = 0; p.fadeDir = 1; }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(250,204,21,${p.opacity * 0.7})`;
          ctx.fill();
        });
        // Connections between nearby lit points
        for (let i = 0; i < emoParticles.length; i++) {
          for (let j = i + 1; j < emoParticles.length; j++) {
            if (emoParticles[i].opacity < 0.3 || emoParticles[j].opacity < 0.3) continue;
            const dx = emoParticles[i].x - emoParticles[j].x;
            const dy = emoParticles[i].y - emoParticles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(emoParticles[i].x, emoParticles[i].y);
              ctx.lineTo(emoParticles[j].x, emoParticles[j].y);
              const alpha = 0.08 * Math.min(emoParticles[i].opacity, emoParticles[j].opacity) * (1 - dist / 100);
              ctx.strokeStyle = `rgba(250,204,21,${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [dimKey, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

// ─── Typewriter title (social/artística) ──────────────────────────────────────

function TypewriterTitle({ text, color }: { text: string; color: string }) {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let i = 0;
    const startDelay = setTimeout(() => {
      setShowCursor(true);
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          // hide cursor after 2s
          setTimeout(() => setCursorVisible(false), 2000);
        }
      }, 60);
      return () => clearInterval(interval);
    }, 1100);
    return () => clearTimeout(startDelay);
  }, [text]);

  return (
    <h1
      className="font-editorial"
      style={{ fontSize: "40px", fontWeight: 500, color: "white", lineHeight: 1.1, marginBottom: "16px", minHeight: "88px" }}
    >
      {displayed}
      {showCursor && cursorVisible && (
        <span style={{ display: "inline-block", width: "2px", height: "0.85em", background: color, marginLeft: "2px", verticalAlign: "text-bottom", animation: "cursorBlink 0.8s step-end infinite" }} />
      )}
    </h1>
  );
}

// ─── Counting stat (logica) ───────────────────────────────────────────────────

function CountStat({ target, suffix, delay }: { target: number; suffix: string; delay: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let current = 0;
      const steps = target;
      const interval = setInterval(() => {
        current++;
        setVal(current);
        if (current >= steps) clearInterval(interval);
      }, 60);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return <span>{val}{suffix}</span>;
}

// ─── Main page ────────────────────────────────────────────────────────────────

interface PageProps {
  params: { slug: string };
}

export default function LicaoCapaPage({ params }: PageProps) {
  const { slug } = params;
  const router = useRouter();
  const dim = getDimensaoBySlug(slug);
  const dimKey = (SLUG_DIMENSAO[slug] ?? "identitaria") as DimKey;

  const info = LICOES_INFO[slug] ?? {
    titulo: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    descricao: "Uma lição especial para descobrires algo novo sobre o mundo.",
    duracao: "10",
    questoes: 5,
  };

  const bg = DIM_BG[dimKey];
  const cor = dim.cor;
  const btnTextColor = BTN_TEXT_COLOR[dimKey];

  // Pick random mantra once on mount
  const [mantra] = useState(() => {
    const list = MANTRAS[dimKey];
    return list[Math.floor(Math.random() * list.length)];
  });

  // Check reduced motion
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Icon animation class by dimension
  const iconAnimClass =
    dimKey === "identitaria" ? "cover-icon-glow"
    : dimKey === "naturalista" ? "cover-icon-bounce"
    : dimKey === "logica" ? "cover-icon-scan"
    : dimKey === "emocional" ? "cover-icon-spin"
    : ""; // social/pink: plain fade-in

  const iconStyle: React.CSSProperties =
    dimKey === "identitaria"
      ? { color: cor, opacity: 1, animationDelay: "800ms" }
      : dimKey === "naturalista"
      ? { color: cor, opacity: 0, animationFillMode: "both", animationDelay: "800ms" }
      : dimKey === "logica"
      ? { color: cor, opacity: 0, animationFillMode: "both", animationDelay: "800ms" }
      : dimKey === "emocional"
      ? { color: cor, opacity: 0, animationFillMode: "both", animationDelay: "800ms" }
      : { color: cor, opacity: 0, animation: "coverFadeIn 0.6s ease both", animationDelay: "800ms" };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Particle canvas (behind everything) */}
      {!reducedMotion && <ParticleCanvas dimKey={dimKey} color={cor} />}

      {/* Ambient glow top-left */}
      <div
        style={{
          position: "fixed",
          top: "-120px",
          left: "-120px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${cor}18 0%, transparent 65%)`,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Nav */}
      <div style={{ position: "relative", zIndex: 2, padding: "20px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={() => router.back()}
          style={{
            background: "rgba(255,255,255,0.08)",
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
            color: "rgba(255,255,255,0.5)",
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
          position: "relative",
          zIndex: 2,
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
            background: `${cor}22`,
            color: cor,
            marginBottom: "20px",
            alignSelf: "flex-start",
            opacity: 0,
            animation: "coverFadeIn 0.5s ease both",
            animationDelay: "200ms",
          }}
        >
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: cor }} />
          {dim.nome}
        </div>

        {/* Mantra */}
        <p
          className="cover-mantra font-editorial"
          style={{
            fontStyle: "italic",
            fontSize: "16px",
            color: cor,
            opacity: 0,
            marginBottom: "20px",
            animationDelay: "300ms",
            animationFillMode: "both",
            lineHeight: 1.5,
          }}
        >
          {mantra}
        </p>

        {/* Icon */}
        <div
          className={iconAnimClass}
          style={{
            marginBottom: "24px",
            width: "80px",
            height: "80px",
            ...iconStyle,
          }}
        >
          <DimIcon dimKey={dimKey} color={cor} size={80} />
        </div>

        {/* Title */}
        {dimKey === "social" ? (
          <TypewriterTitle text={info.titulo} color={cor} />
        ) : dimKey === "identitaria" ? (
          // Letter-by-letter
          <h1
            className="font-editorial"
            style={{ fontSize: "40px", fontWeight: 500, color: "white", lineHeight: 1.1, marginBottom: "16px" }}
          >
            {info.titulo.split("").map((char, i) => (
              <span
                key={i}
                className="cover-letter"
                style={{
                  animationDelay: `${1100 + i * 80}ms`,
                  opacity: 0,
                }}
              >
                {char === " " ? "\u00a0" : char}
              </span>
            ))}
          </h1>
        ) : dimKey === "emocional" ? (
          // Shimmer pass
          <h1
            className="font-editorial cover-shimmer-title"
            style={{
              fontSize: "40px",
              fontWeight: 500,
              lineHeight: 1.1,
              marginBottom: "16px",
              opacity: 0,
              animation: "coverFadeIn 0.5s ease both, shimmerPass 1.4s ease both",
              animationDelay: "1100ms, 1100ms",
            }}
          >
            {info.titulo}
          </h1>
        ) : (
          // Default: slide from left (naturalista, logica)
          <h1
            className="font-editorial"
            style={{
              fontSize: "40px",
              fontWeight: 500,
              color: "white",
              lineHeight: 1.1,
              marginBottom: "16px",
              opacity: 0,
              animation: "coverFadeIn 0.6s ease both",
              animationDelay: "1100ms",
            }}
          >
            {info.titulo}
          </h1>
        )}

        {/* Description */}
        <p
          style={{
            fontSize: "15px",
            color: "rgba(255,255,255,0.6)",
            fontWeight: 600,
            lineHeight: 1.6,
            marginBottom: "32px",
            opacity: 0,
            animation: "coverFadeIn 0.5s ease both",
            animationDelay: "1400ms",
          }}
        >
          {info.descricao}
        </p>

        {/* Meta stats */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "32px",
            opacity: 0,
            animation: "coverFadeIn 0.5s ease both",
            animationDelay: "1400ms",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {dimKey === "logica"
              ? <><CountStat target={parseInt(info.duracao)} suffix=" min" delay={1400} /></>
              : `${info.duracao} min`}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L14.09 8.26L20.82 8.27L15.45 12.14L17.54 18.4L12 14.53L6.46 18.4L8.55 12.14L3.18 8.27L9.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            {dimKey === "logica"
              ? <><CountStat target={info.questoes} suffix=" questões" delay={1500} /></>
              : `${info.questoes} questões`}
          </div>
        </div>

        {/* CTA button */}
        <div
          style={{
            opacity: 0,
            animation: "coverFadeIn 0.5s ease both",
            animationDelay: "1700ms",
          }}
        >
          <Link href={`/licao/${slug}/exercicios`}>
            <button
              style={{
                width: "100%",
                background: cor,
                color: btnTextColor,
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
                boxShadow: `0 4px 24px ${cor}40`,
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
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
    </div>
  );
}
