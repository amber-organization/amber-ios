"use client";

import { useEffect, useRef } from "react";

export default function GranimBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<import("granim") | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    async function init() {
      const Granim = (await import("granim")).default;
      instanceRef.current = new Granim({
        element: canvasRef.current!,
        direction: "diagonal",
        isPausedWhenNotInView: true,
        stateTransitionSpeed: 4000,
        defaultStateName: "default-state",
        states: {
          "default-state": {
            colors: [
              ["#1a0533", "#3b0764"],
              ["#3b0764", "#86198f"],
              ["#86198f", "#1a0533"],
            ],
            transitionSpeed: 6000,
          },
        },
      });
    }

    init();

    return () => {
      instanceRef.current?.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.85,
      }}
    />
  );
}
