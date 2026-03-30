"use client";

import { useEffect, useRef } from "react";

interface No {
  id: number;
  x: number;
  y: number;
  raio: number;
  cor: string;
  opacidade: number;
  velocidadeX: number;
  velocidadeY: number;
  pulsando: boolean;
  fasePulso: number;
}

interface Estrela {
  x: number;
  y: number;
  raio: number;
  pontas: number;
  cor: string;
  opacidade: number;
  piscando: boolean;
  fasePisca: number;
  velPisca: number;
}

interface EstrelaCadente {
  x: number;
  y: number;
  ang: number;
  vel: number;
  comprimento: number;
  progresso: number;
  cor: string;
  ativa: boolean;
  faisca: { x: number; y: number; opacidade: number } | null;
}

const CORES_DIMENSOES = [
  "#a78bfa", // Identitária — roxo
  "#4ade80", // Naturalista — verde
  "#60a5fa", // Lógica — azul
  "#f472b6", // Artística — rosa
  "#facc15", // Social — amarelo
];

const COR_NEUTRA = "#b5a99a";

const CONFIG = {
  nosTotal: 60,
  nosColoridos: 10,
  distanciaMaxFio: 100,
  opacidadeFioMax: 0.19,
  velocidadeMovimento: 0.1,
};

function criarNos(largura: number, altura: number): No[] {
  const nos: No[] = [];

  for (let i = 0; i < CONFIG.nosTotal; i++) {
    const eColorido = i < CONFIG.nosColoridos;
    const cor = eColorido
      ? CORES_DIMENSOES[i % CORES_DIMENSOES.length]
      : COR_NEUTRA;

    const velocMax = CONFIG.velocidadeMovimento;
    const velX = (Math.random() - 0.5) * velocMax * 2;
    const velY = (Math.random() - 0.5) * velocMax * 2;

    nos.push({
      id: i,
      x: Math.random() * largura,
      y: Math.random() * altura,
      raio: eColorido ? Math.random() * 8 + 10 : Math.random() * 3 + 3,
      cor,
      opacidade: eColorido
        ? Math.random() * 0.35 + 0.45
        : Math.random() * 0.25 + 0.15,
      velocidadeX: velX === 0 ? 0.05 : velX,
      velocidadeY: velY === 0 ? 0.05 : velY,
      pulsando: eColorido,
      fasePulso: Math.random() * Math.PI * 2,
    });
  }

  return nos;
}

function criarEstrelas(largura: number, altura: number): Estrela[] {
  const estrelas: Estrela[] = [];
  const todasCores = [...CORES_DIMENSOES, COR_NEUTRA];
  const numEstrelas = 20 + Math.floor(Math.random() * 6); // 20-25

  for (let i = 0; i < numEstrelas; i++) {
    estrelas.push({
      x: Math.random() * largura,
      y: Math.random() * altura,
      raio: Math.random() * 5 + 3, // 3-8px
      pontas: Math.random() > 0.5 ? 4 : 6,
      cor: todasCores[Math.floor(Math.random() * todasCores.length)],
      opacidade: Math.random() * 0.4 + 0.3,
      piscando: Math.random() > 0.5,
      fasePisca: Math.random() * Math.PI * 2,
      velPisca: 0.01 + Math.random() * 0.02,
    });
  }

  return estrelas;
}

function desenharEstrela(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  raio: number,
  pontas: number,
  cor: string,
  opacidade: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < pontas * 2; i++) {
    const r = i % 2 === 0 ? raio : raio * 0.4;
    const ang = (i * Math.PI) / pontas;
    if (i === 0) {
      ctx.moveTo(r * Math.sin(ang), -r * Math.cos(ang));
    } else {
      ctx.lineTo(r * Math.sin(ang), -r * Math.cos(ang));
    }
  }
  ctx.closePath();
  const opHex = Math.round(opacidade * 255)
    .toString(16)
    .padStart(2, "0");
  ctx.fillStyle = cor + opHex;
  ctx.fill();
  ctx.restore();
}

export default function RedeViva() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // prefers-reduced-motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let nos: No[] = [];
    let estrelas: Estrela[] = [];
    let estrelaCadente: EstrelaCadente | null = null;
    let animFrame: number;
    let dpr = window.devicePixelRatio || 1;
    let shootingStarTimeout: ReturnType<typeof setTimeout>;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.scale(dpr, dpr);
      nos = criarNos(w, h);
      estrelas = criarEstrelas(w, h);
    };

    const dist = (a: No, b: No) => {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    function lancarEstrelaCadente() {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      estrelaCadente = {
        x: Math.random() * w * 0.6,
        y: Math.random() * h * 0.3,
        ang: (25 + Math.random() * 20) * Math.PI / 180,
        vel: 8,
        comprimento: 120 + Math.random() * 80,
        progresso: 0,
        cor: Math.random() > 0.5 ? "#ffffff" : "#a78bfa",
        ativa: true,
        faisca: null,
      };
      shootingStarTimeout = setTimeout(lancarEstrelaCadente, 8000 + Math.random() * 4000);
    }

    // Primeira estrela cadente após 3s
    shootingStarTimeout = setTimeout(lancarEstrelaCadente, 3000);

    const animar = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);

      // 0. Desenhar estrelas fixas
      estrelas.forEach((e) => {
        let op = e.opacidade;
        if (e.piscando) {
          e.fasePisca += e.velPisca;
          op = e.opacidade + Math.sin(e.fasePisca) * 0.15;
          op = Math.max(0.1, Math.min(1, op));
        }
        desenharEstrela(ctx, e.x, e.y, e.raio, e.pontas, e.cor, op);
      });

      // 1. Mover nós
      nos.forEach((no) => {
        no.x += no.velocidadeX;
        no.y += no.velocidadeY;
        if (no.x < 0) {
          no.x = 0;
          no.velocidadeX *= -1;
        }
        if (no.x > w) {
          no.x = w;
          no.velocidadeX *= -1;
        }
        if (no.y < 0) {
          no.y = 0;
          no.velocidadeY *= -1;
        }
        if (no.y > h) {
          no.y = h;
          no.velocidadeY *= -1;
        }
      });

      // 2. Desenhar fios
      for (let i = 0; i < nos.length; i++) {
        for (let j = i + 1; j < nos.length; j++) {
          const d = dist(nos[i], nos[j]);
          if (d < CONFIG.distanciaMaxFio) {
            const opacidade =
              (1 - d / CONFIG.distanciaMaxFio) * CONFIG.opacidadeFioMax;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(167, 139, 250, ${opacidade})`;
            ctx.lineWidth = 1.8 * (1 - d / CONFIG.distanciaMaxFio);
            ctx.moveTo(nos[i].x, nos[i].y);
            ctx.lineTo(nos[j].x, nos[j].y);
            ctx.stroke();
          }
        }
      }

      // 3. Desenhar nós
      nos.forEach((no) => {
        // Pulso — halo externo
        if (no.pulsando) {
          no.fasePulso += 0.02;
          const escala = 1 + Math.sin(no.fasePulso) * 0.3;
          const rgb = hexToRgb(no.cor);
          ctx.beginPath();
          ctx.arc(no.x, no.y, no.raio * escala * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`;
          ctx.fill();
        }

        // Nó principal
        const opHex = Math.round(no.opacidade * 255)
          .toString(16)
          .padStart(2, "0");
        ctx.beginPath();
        ctx.arc(no.x, no.y, no.raio, 0, Math.PI * 2);
        ctx.fillStyle = no.cor + opHex;
        ctx.fill();
      });

      // 4. Desenhar estrela cadente
      if (estrelaCadente && estrelaCadente.ativa) {
        const ec = estrelaCadente;
        ec.progresso += ec.vel;

        const cabecaX = ec.x + Math.cos(ec.ang) * ec.progresso;
        const cabecaY = ec.y + Math.sin(ec.ang) * ec.progresso;

        const caudaProgresso = Math.max(0, ec.progresso - ec.comprimento);
        const caudaX = ec.x + Math.cos(ec.ang) * caudaProgresso;
        const caudaY = ec.y + Math.sin(ec.ang) * caudaProgresso;

        // Duração ~0.8s a 60fps = ~48 frames; com vel=8, percorre ~384px
        // Considerar ativa enquanto a cauda estiver no ecrã
        if (caudaX > w * 1.2 || caudaY > h * 1.2) {
          // Deixar faísca no ponto final
          ec.faisca = { x: cabecaX, y: cabecaY, opacidade: 1 };
          ec.ativa = false;
        } else {
          // Desenhar rastro com gradiente
          const rgb = hexToRgb(ec.cor);
          const grad = ctx.createLinearGradient(caudaX, caudaY, cabecaX, cabecaY);
          grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
          grad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);

          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.moveTo(caudaX, caudaY);
          ctx.lineTo(cabecaX, cabecaY);
          ctx.stroke();

          // Brilho na cabeça
          ctx.beginPath();
          ctx.arc(cabecaX, cabecaY, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`;
          ctx.fill();
        }
      }

      // 5. Faísca residual
      if (estrelaCadente && !estrelaCadente.ativa && estrelaCadente.faisca) {
        const f = estrelaCadente.faisca;
        f.opacidade -= 0.03;
        if (f.opacidade > 0) {
          const rgb = hexToRgb(estrelaCadente.cor);
          ctx.beginPath();
          ctx.arc(f.x, f.y, 4 * f.opacidade, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${f.opacidade})`;
          ctx.fill();
        } else {
          estrelaCadente = null;
        }
      }

      animFrame = requestAnimationFrame(animar);
    };

    const animarEstatico = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      // Estrelas fixas (estáticas)
      estrelas.forEach((e) => {
        desenharEstrela(ctx, e.x, e.y, e.raio, e.pontas, e.cor, e.opacidade);
      });

      for (let i = 0; i < nos.length; i++) {
        for (let j = i + 1; j < nos.length; j++) {
          const d = dist(nos[i], nos[j]);
          if (d < CONFIG.distanciaMaxFio) {
            const opacidade =
              (1 - d / CONFIG.distanciaMaxFio) * CONFIG.opacidadeFioMax;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(167, 139, 250, ${opacidade})`;
            ctx.lineWidth = 1.8 * (1 - d / CONFIG.distanciaMaxFio);
            ctx.moveTo(nos[i].x, nos[i].y);
            ctx.lineTo(nos[j].x, nos[j].y);
            ctx.stroke();
          }
        }
      }

      nos.forEach((no) => {
        const opHex = Math.round(no.opacidade * 255)
          .toString(16)
          .padStart(2, "0");
        ctx.beginPath();
        ctx.arc(no.x, no.y, no.raio, 0, Math.PI * 2);
        ctx.fillStyle = no.cor + opHex;
        ctx.fill();
      });
    };

    const handleScroll = () => {
      const offset = window.scrollY * 0.05;
      canvas.style.transform = `translateY(${offset}px)`;
    };

    resize();

    if (prefersReduced) {
      animarEstatico();
    } else {
      animar();
    }

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(shootingStarTimeout);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
