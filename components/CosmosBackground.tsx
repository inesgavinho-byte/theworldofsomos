"use client";

import { useEffect, useRef } from "react";

const PALETTE = [
  "#a78bfa",
  "#facc15",
  "#f472b6",
  "#60a5fa",
  "#4ade80",
  "#c4b5fd",
  "#fde68a",
];

interface Orb {
  x: number;
  y: number;
  rx: number;
  ry: number;
  color: string;
  alpha: number;
  phase: number;
  drift: number;
  baseX: number;
  baseY: number;
}

interface ConstellationNode {
  x: number;
  y: number;
  baseY: number;
  color: string;
  radius: number;
  phase: number;
  pulseSpeed: number;
  floatSpeed: number;
  floatAmp: number;
}

interface EdgeSpark {
  from: number;
  to: number;
  t: number;
  speed: number;
}

interface BgStar {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  phase: number;
  pulseSpeed: number;
  sparkle: boolean;
  rotation: number;
  rotSpeed: number;
}

interface FloatCircle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  color: string;
  phase: number;
  pulsePhase: number;
  floatSpeedX: number;
  floatSpeedY: number;
  floatAmpX: number;
  floatAmpY: number;
  pulseSpeed: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
  trailMax: number;
  alive: boolean;
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function CosmosBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    let orbs: Orb[] = [];
    let nodes: ConstellationNode[] = [];
    let edgeSparks: EdgeSpark[] = [];
    let bgStars: BgStar[] = [];
    let floatCircles: FloatCircle[] = [];
    let meteors: Meteor[] = [];
    let particles: Particle[] = [];

    let animFrame = 0;
    let showerTimeout: ReturnType<typeof setTimeout> | null = null;
    let frameCount = 0;

    const buildWorld = (w: number, h: number) => {
      // Orbs nebulosas (14)
      orbs = Array.from({ length: 14 }, () => {
        const x = Math.random() * w;
        const y = Math.random() * h;
        return {
          x,
          y,
          baseX: x,
          baseY: y,
          rx: 80 + Math.random() * 140,
          ry: 80 + Math.random() * 140,
          color: pick(PALETTE),
          alpha: 0.03 + Math.random() * 0.03,
          phase: Math.random() * Math.PI * 2,
          drift: 0.0008 + Math.random() * 0.0012,
        };
      });

      // Constellations (85 nodes)
      nodes = Array.from({ length: 85 }, () => {
        const y = Math.random() * h;
        return {
          x: Math.random() * w,
          y,
          baseY: y,
          color: pick(PALETTE),
          radius: 1.4 + Math.random() * 2.2,
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.012 + Math.random() * 0.02,
          floatSpeed: 0.004 + Math.random() * 0.008,
          floatAmp: 6 + Math.random() * 14,
        };
      });
      edgeSparks = [];

      // Background stars (260)
      bgStars = Array.from({ length: 260 }, () => {
        const sparkle = Math.random() < 0.15;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          radius: sparkle ? 1.4 + Math.random() * 2 : 0.6 + Math.random() * 1.3,
          color: pick(PALETTE),
          opacity: 0.3 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.01 + Math.random() * 0.03,
          sparkle,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.01,
        };
      });

      // Floating circles (18)
      floatCircles = Array.from({ length: 18 }, () => {
        const x = Math.random() * w;
        const y = Math.random() * h;
        return {
          x,
          y,
          baseX: x,
          baseY: y,
          radius: 14 + Math.random() * 38,
          color: pick(PALETTE),
          phase: Math.random() * Math.PI * 2,
          pulsePhase: Math.random() * Math.PI * 2,
          floatSpeedX: 0.002 + Math.random() * 0.004,
          floatSpeedY: 0.002 + Math.random() * 0.004,
          floatAmpX: 20 + Math.random() * 40,
          floatAmpY: 20 + Math.random() * 40,
          pulseSpeed: 0.01 + Math.random() * 0.02,
        };
      });

      meteors = [];
      particles = [];
    };

    const spawnMeteor = (originX?: number, originY?: number) => {
      if (meteors.filter((m) => m.alive).length >= 9) return;
      const w = width;
      const h = height;
      const angleDeg = 28 + Math.random() * 34;
      const angle = (angleDeg * Math.PI) / 180;
      const speed = 9 + Math.random() * 13;
      const startX =
        originX !== undefined
          ? originX + (Math.random() - 0.5) * 60
          : Math.random() * w * 0.7 - w * 0.05;
      const startY =
        originY !== undefined
          ? originY + (Math.random() - 0.5) * 40
          : -20 + Math.random() * h * 0.3;
      meteors.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.008 + Math.random() * 0.012,
        color: pick(PALETTE),
        trail: [],
        trailMax: 35 + Math.floor(Math.random() * 25),
        alive: true,
      });
    };

    const scheduleShower = () => {
      const delay = 8000 + Math.random() * 10000;
      showerTimeout = setTimeout(() => {
        const count = 4 + Math.floor(Math.random() * 2);
        const originX = Math.random() * width * 0.7;
        const originY = -10 + Math.random() * height * 0.2;
        for (let i = 0; i < count; i++) {
          setTimeout(
            () => spawnMeteor(originX, originY),
            i * (100 + Math.random() * 150)
          );
        }
        scheduleShower();
      }, delay);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrapper.offsetWidth;
      const h = wrapper.scrollHeight;
      width = w;
      height = h;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      buildWorld(w, h);
    };

    const drawSparkle = (
      x: number,
      y: number,
      r: number,
      color: string,
      alpha: number,
      rotation: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      const points = 8;
      for (let i = 0; i < points * 2; i++) {
        const rr = i % 2 === 0 ? r : r * 0.35;
        const ang = (i * Math.PI) / points;
        const px = rr * Math.sin(ang);
        const py = -rr * Math.cos(ang);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      const rgb = hexToRgb(color);
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // Orbs (lowest layer)
      orbs.forEach((o) => {
        o.phase += o.drift;
        o.x = o.baseX + Math.cos(o.phase) * 30;
        o.y = o.baseY + Math.sin(o.phase * 1.3) * 24;
        const rgb = hexToRgb(o.color);
        const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.rx);
        grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${o.alpha})`);
        grad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(o.x, o.y, o.rx, o.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Background stars
      bgStars.forEach((s) => {
        s.phase += s.pulseSpeed;
        const pulse = 0.6 + 0.4 * Math.sin(s.phase);
        const alpha = Math.max(0.1, Math.min(1, s.opacity * pulse));
        if (s.sparkle) {
          s.rotation += s.rotSpeed;
          drawSparkle(s.x, s.y, s.radius, s.color, alpha, s.rotation);
        } else {
          const rgb = hexToRgb(s.color);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
          ctx.fill();
        }
      });

      // Floating circles with halo
      floatCircles.forEach((c) => {
        c.phase += c.floatSpeedX;
        c.pulsePhase += c.pulseSpeed;
        c.x = c.baseX + Math.cos(c.phase) * c.floatAmpX;
        c.y = c.baseY + Math.sin(c.phase * 1.1 + 0.4) * c.floatAmpY;
        const pulse = 0.8 + 0.2 * Math.sin(c.pulsePhase);
        const rgb = hexToRgb(c.color);

        // Halo
        const halo = ctx.createRadialGradient(
          c.x,
          c.y,
          0,
          c.x,
          c.y,
          c.radius * 2.6
        );
        halo.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${0.12 * pulse})`);
        halo.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius * 2.6, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${0.28 * pulse})`;
        ctx.fill();
      });

      // Update constellation nodes
      nodes.forEach((n) => {
        n.phase += n.pulseSpeed;
        n.y = n.baseY + Math.sin(n.phase * 0.6) * n.floatAmp;
      });

      // Draw edges
      const maxDist = height / 8;
      const maxDistSq = maxDist * maxDist;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dsq = dx * dx + dy * dy;
          if (dsq < maxDistSq) {
            const dist = Math.sqrt(dsq);
            const pulse = 0.5 + 0.5 * Math.sin((frameCount + i * 7 + j * 3) * 0.02);
            const baseAlpha = (1 - dist / maxDist) * 0.14 * pulse;
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, `rgba(167,139,250,${baseAlpha})`);
            grad.addColorStop(0.5, `rgba(196,181,253,${baseAlpha * 1.1})`);
            grad.addColorStop(1, `rgba(167,139,250,${baseAlpha})`);
            ctx.beginPath();
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.8;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            // Maybe spawn a spark along this edge
            if (
              Math.random() < 0.0006 &&
              edgeSparks.filter((e) => e.from === i && e.to === j).length === 0
            ) {
              edgeSparks.push({
                from: i,
                to: j,
                t: 0,
                speed: 0.006 + Math.random() * 0.01,
              });
            }
          }
        }
      }

      // Draw edge sparks (light travelling)
      edgeSparks = edgeSparks.filter((s) => s.t < 1);
      edgeSparks.forEach((s) => {
        s.t += s.speed;
        const a = nodes[s.from];
        const b = nodes[s.to];
        if (!a || !b) return;
        const px = a.x + (b.x - a.x) * s.t;
        const py = a.y + (b.y - a.y) * s.t;
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#c4b5fd";
        ctx.beginPath();
        ctx.arc(px, py, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fill();
        ctx.restore();
      });

      // Draw constellation nodes with glow
      nodes.forEach((n) => {
        const pulse = 0.6 + 0.4 * Math.sin(n.phase);
        const rgb = hexToRgb(n.color);
        ctx.save();
        ctx.shadowBlur = 10 + 8 * pulse;
        ctx.shadowColor = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${0.6 + 0.3 * pulse})`;
        ctx.fill();
        ctx.restore();
      });

      // Update and draw particles
      particles = particles.filter((p) => p.life > 0);
      particles.forEach((p) => {
        p.life -= 0.03;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        const rgb = hexToRgb(p.color);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${p.life * 0.8})`;
        ctx.fill();
      });

      // Meteors
      meteors = meteors.filter(
        (m) => m.alive || m.trail.some((t) => t.alpha > 0.02)
      );
      meteors.forEach((m) => {
        if (m.alive) {
          m.x += m.vx;
          m.y += m.vy;
          m.vx *= 0.997;
          m.vy *= 0.997;
          m.life -= m.decay;

          m.trail.unshift({ x: m.x, y: m.y, alpha: 1 });
          if (m.trail.length > m.trailMax) m.trail.length = m.trailMax;

          // Emit particles
          const emit = 1 + Math.floor(Math.random() * 3);
          for (let i = 0; i < emit; i++) {
            particles.push({
              x: m.x,
              y: m.y,
              vx: -m.vx * 0.1 + (Math.random() - 0.5) * 0.8,
              vy: -m.vy * 0.1 + (Math.random() - 0.5) * 0.8,
              life: 0.6 + Math.random() * 0.4,
              color: m.color,
              size: 0.8 + Math.random() * 1.4,
            });
          }

          if (
            m.life <= 0 ||
            m.x > width + 50 ||
            m.y > height + 50 ||
            m.x < -50
          ) {
            m.alive = false;
          }
        } else {
          // fade tail
        }

        // Draw trail
        m.trail.forEach((t) => {
          t.alpha *= 0.96;
        });
        if (m.trail.length > 1) {
          const rgb = hexToRgb(m.color);
          for (let i = 0; i < m.trail.length - 1; i++) {
            const t1 = m.trail[i];
            const t2 = m.trail[i + 1];
            const lifeFactor = 1 - i / m.trail.length;
            const alpha = lifeFactor * t1.alpha * (m.alive ? m.life : 0.5);
            if (alpha < 0.01) continue;
            const grad = ctx.createLinearGradient(t1.x, t1.y, t2.x, t2.y);
            grad.addColorStop(
              0,
              `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`
            );
            grad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
            ctx.beginPath();
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2.5 * lifeFactor;
            ctx.lineCap = "round";
            ctx.moveTo(t1.x, t1.y);
            ctx.lineTo(t2.x, t2.y);
            ctx.stroke();
          }
        }

        // Draw head
        if (m.alive) {
          const rgb = hexToRgb(m.color);
          ctx.save();
          ctx.shadowBlur = 35;
          ctx.shadowColor = m.color;
          ctx.beginPath();
          ctx.arc(m.x, m.y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${m.life})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${m.life})`;
          ctx.fill();
          ctx.restore();
        }
      });

      animFrame = requestAnimationFrame(render);
    };

    const renderStatic = () => {
      ctx.clearRect(0, 0, width, height);
      orbs.forEach((o) => {
        const rgb = hexToRgb(o.color);
        const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.rx);
        grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${o.alpha})`);
        grad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(o.x, o.y, o.rx, o.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      bgStars.forEach((s) => {
        const rgb = hexToRgb(s.color);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${s.opacity})`;
        ctx.fill();
      });
      nodes.forEach((n) => {
        const rgb = hexToRgb(n.color);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.8)`;
        ctx.fill();
      });
    };

    resize();

    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(wrapper);

    window.addEventListener("resize", resize);

    if (prefersReduced) {
      renderStatic();
    } else {
      render();
      scheduleShower();
      // initial lone meteor
      setTimeout(() => spawnMeteor(), 2500);
    }

    return () => {
      cancelAnimationFrame(animFrame);
      if (showerTimeout) clearTimeout(showerTimeout);
      ro.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        background: "#f5f2ec",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
