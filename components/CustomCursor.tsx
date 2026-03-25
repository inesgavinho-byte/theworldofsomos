"use client";

import { useEffect, useRef, useState } from "react";

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

const TRAIL_LENGTH = 14;

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [isHover, setIsHover] = useState(false);
  const posRef = useRef({ x: -100, y: -100 });
  const trailRef = useRef<TrailPoint[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };

      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }

      idRef.current += 1;
      const newPoint: TrailPoint = {
        x: e.clientX,
        y: e.clientY,
        id: idRef.current,
      };

      trailRef.current = [newPoint, ...trailRef.current].slice(0, TRAIL_LENGTH);
      setTrail([...trailRef.current]);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest(
        "button, a, input, textarea, select, [role='button'], label"
      );
      setIsHover(!!interactive);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onMouseOver);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onMouseOver);
    };
  }, []);

  return (
    <>
      <div
        id="cursor"
        ref={cursorRef}
        className={isHover ? "cursor-hover" : ""}
        style={{ left: "-100px", top: "-100px" }}
      />
      {trail.map((point, index) => {
        const progress = index / TRAIL_LENGTH;
        const size = 8 * (1 - progress * 0.7);
        const opacity = (1 - progress) * 0.35;
        const hue = index < TRAIL_LENGTH / 2 ? "167, 139, 250" : "74, 222, 128";

        return (
          <div
            key={point.id}
            className="cursor-trail"
            style={{
              left: `${point.x}px`,
              top: `${point.y}px`,
              width: `${size}px`,
              height: `${size}px`,
              background: `rgba(${hue}, ${opacity})`,
            }}
          />
        );
      })}
    </>
  );
}
