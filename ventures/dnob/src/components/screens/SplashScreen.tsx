"use client";

import { useState, useEffect } from "react";
import StatusBar from "@/components/ui/StatusBar";

interface SplashScreenProps {
  onContinue: () => void;
  onCookLogin: (staffId: string) => void;
}

// ─── Floating Dots Animation ───────────────────────────────────────────────────

function FloatingDots() {
  const dots = [
    { x: "20%", y: "30%", size: 6, delay: 0, dur: 3.2 },
    { x: "75%", y: "25%", size: 4, delay: 0.8, dur: 2.8 },
    { x: "60%", y: "65%", size: 7, delay: 1.6, dur: 3.6 },
    { x: "30%", y: "70%", size: 5, delay: 0.4, dur: 3.0 },
    { x: "80%", y: "55%", size: 4, delay: 1.2, dur: 2.6 },
    { x: "45%", y: "20%", size: 5, delay: 2.0, dur: 3.4 },
  ];

  const connections = [
    { x1: "20%", y1: "30%", x2: "45%", y2: "20%", delay: 0.5 },
    { x1: "75%", y1: "25%", x2: "60%", y2: "65%", delay: 1.0 },
    { x1: "30%", y1: "70%", x2: "60%", y2: "65%", delay: 1.5 },
    { x1: "45%", y1: "20%", x2: "75%", y2: "25%", delay: 0.8 },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {connections.map((c, i) => (
          <line
            key={i}
            x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
            stroke="rgba(244,114,182,0.15)"
            strokeWidth="0.3"
            style={{
              animation: `fadeInLine 1.2s ease ${c.delay}s both`,
            }}
          />
        ))}
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x} cy={d.y} r={d.size * 0.5}
            fill="rgba(244,114,182,0.4)"
            style={{
              animation: `floatDot ${d.dur}s ease-in-out ${d.delay}s infinite alternate`,
            }}
          />
        ))}
      </svg>
      <style>{`
        @keyframes floatDot {
          0% { opacity: 0.3; transform: translateY(0px); }
          100% { opacity: 0.8; transform: translateY(-4px); }
        }
        @keyframes fadeInLine {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Main SplashScreen ────────────────────────────────────────────────────────

export default function SplashScreen({ onContinue, onCookLogin }: SplashScreenProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 80);
    const t2 = setTimeout(() => onContinue(), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onContinue]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(160deg, #120719 0%, #04010a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        overflow: "hidden",
        position: "relative",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
        fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
      }}
    >
      <StatusBar />
      <FloatingDots />

      {/* Glow */}
      <div style={{
        position: "absolute",
        top: "35%", left: "50%", transform: "translate(-50%, -50%)",
        width: "320px", height: "320px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(244,114,182,0.1) 0%, rgba(232,121,249,0.05) 50%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          padding: "0 28px",
          position: "relative",
          zIndex: 1,
          gap: "0",
        }}
      >
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="D-NOB"
          style={{ width: "160px", objectFit: "contain", marginBottom: "8px" }}
        />

        {/* Tagline */}
        <div style={{
          fontSize: "11px", fontWeight: 600, color: "rgba(244,114,182,0.65)",
          letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "20px",
        }}>
          Dedicated Network of Belonging
        </div>

        <p style={{
          fontSize: "14px", color: "rgba(255,255,255,0.55)",
          margin: "0", lineHeight: 1.6, textAlign: "center", maxWidth: "220px",
        }}>
          Find your people. Make real friends. You are not alone.
        </p>

        {/* Safety pill */}
        <div style={{
          marginTop: "22px",
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "6px 14px",
          background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.18)",
          borderRadius: "100px",
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
            <path d="M5 1L9 2.5v3.5C9 8 7 9.5 5 10 3 9.5 1 8 1 6V2.5L5 1Z" stroke="rgba(244,114,182,0.75)" strokeWidth="1.2" fill="none" />
          </svg>
          <span style={{
            fontSize: "11px", fontWeight: 500, color: "rgba(244,114,182,0.85)",
            letterSpacing: "0.01em", whiteSpace: "nowrap",
          }}>
            Safe and monitored by hospital staff
          </span>
        </div>
      </div>

      {/* Staff Login at bottom */}
      <div style={{
        width: "100%", padding: "0 20px 36px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "0",
        flexShrink: 0, position: "relative", zIndex: 1,
      }}>
        <button
          onClick={() => onCookLogin("staff1")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "5px",
            padding: "8px 12px",
            fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
            minHeight: "44px",
          }}
        >
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.22)", letterSpacing: "0.01em" }}>
            Hospital staff?
          </span>
          <span style={{
            fontSize: "11px", fontWeight: 600, color: "rgba(244,114,182,0.5)",
            letterSpacing: "0.01em", display: "inline-flex", alignItems: "center", gap: "3px",
          }}>
            Staff Login
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
