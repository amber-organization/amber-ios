"use client";
import { useEffect, useState, useRef } from "react";
import IPhoneMockup from "@/components/IPhoneMockup";
import AppShell from "@/components/AppShell";
import GranimBg from "@/components/GranimBg";

export default function HomeClient() {
  const [scale, setScale] = useState(1);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const calc = () => {
      const scaleH = (window.innerHeight - 80) / 740;
      const scaleW = (window.innerWidth - 48) / 345;
      setScale(Math.min(0.92, scaleH, scaleW));
    };
    calc();
    window.addEventListener("resize", calc, { passive: true });
    return () => window.removeEventListener("resize", calc);
  }, []);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = containerRef.current?.querySelector(".inner-scroll") as HTMLElement | null;
    if (el) {
      e.preventDefault();
      el.scrollTop += e.deltaY;
    }
  };

  return (
    <div
      style={{
        background: "#050201",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
      }}
    >
      <GranimBg />
      <div
        ref={containerRef}
        onWheel={handleWheel}
        style={{ position: "relative", zIndex: 10 }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease",
            filter: "drop-shadow(0 40px 100px rgba(0,0,0,0.9)) drop-shadow(0 8px 32px rgba(139,92,246,0.15))",
          }}
        >
          <IPhoneMockup>
            <AppShell />
          </IPhoneMockup>
        </div>
      </div>
    </div>
  );
}
