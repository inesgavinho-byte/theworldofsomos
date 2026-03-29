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

const CORES_DIMENSOES = [
  "#a78bfa", // Identitária — roxo
  "#4ade80", // Naturalista — verde
  "#60a5fa", // Lógica — azul
  "#f472b6", // Artística — rosa
  "#facc15", // Social — amarelo
];

const COR_NEUTRA = "#b5a99a";

const CONFIG = {
  nosTotal: 120,
  nosColoridos: 12,
  distanciaMaxFio: 150,
  opacidadeFioMax: 0.15,
  velocidadeMovimento: 0.3,
};

function criarNos(largura: number, altura: number, isMobile: boolean): No[] {
  const total = isMobile ? 60 : CONFIG.nosTotal;
  const nosColoridos = isMobile ? 6 : CONFIG.nosColoridos;
  const nos: No[] = [];

  for (let i = 0; i < total; i++) {
    const eColorido = i < nosColoridos;
    const cor = eColorido
      ? CORES_DIMENSOES[i % CORES_DIMENSOES.length]
      : COR_NEUTRA;

    const velocMax = CONFIG.velocidadeMovimento * (isMobile ? 0.5 : 1);
    const velX = (Math.random() - 0.5) * velocMax * 2;
    const velY = (Math.random() - 0.5) * velocMax * 2;

    nos.push({
      id: i,
      x: Math.random() * largura,
      y: Math.random() * largura,
      raio: eColorido ? Math.random() * 3 + 3 : Math.random() * 2 + 1.5,
      cor,
      opacidade: eColorido
        ? Math.random() * 0.35 + 0.45
        : Math.random() * 0.25 + 0.15,
      velocidadeX: velX === 0 ? 0.1 : velX,
      velocidadeY: velY === 0 ? 0.1 : velY,
      pulsando: eColorido && i < nosColoridos / 2,
      fasePulso: Math.random() * Math.PI * 2,
    });
    nos[i].y = Math.random() * altura;
  }

  return nos;
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
    let animFrame: number;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.scale(dpr, dpr);
      const isMobile = w < 768;
      nos = criarNos(w, h, isMobile);
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

    const animar = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);

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
            ctx.lineWidth = 0.5;
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

      animFrame = requestAnimationFrame(animar);
    };

    const animarEstatico = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < nos.length; i++) {
        for (let j = i + 1; j < nos.length; j++) {
          const d = dist(nos[i], nos[j]);
          if (d < CONFIG.distanciaMaxFio) {
            const opacidade =
              (1 - d / CONFIG.distanciaMaxFio) * CONFIG.opacidadeFioMax;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(167, 139, 250, ${opacidade})`;
            ctx.lineWidth = 0.5;
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
