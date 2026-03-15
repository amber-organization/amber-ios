"use client";

import { useState, useEffect } from "react";
import StatusBar from "@/components/ui/StatusBar";

interface OnboardingScreenProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    id: "alone",
    eyebrow: "You are not alone",
    title: "There are kids\njust like you.",
    body: "Hospital life can feel lonely. D-NOB connects you with other kids going through similar experiences, so you always have someone in your corner.",
    visual: "hearts",
    cta: "Next",
  },
  {
    id: "safe",
    eyebrow: "A safe space, always",
    title: "Your safety is\nour priority.",
    body: "Every message is monitored by trained staff. Your real name, location, and personal info stay private. You control who you talk to.",
    visual: "shield",
    cta: "Next",
  },
  {
    id: "squad",
    eyebrow: "Your squad is waiting",
    title: "Join activities.\nMake real friends.",
    body: "Movie nights, game hours, art circles and more. Join group hangouts, meet kids who get it, and build friendships that last past the hospital.",
    visual: "squad",
    cta: "Let's go",
  },
];

function HeartsVisual() {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px", marginTop: "8px" }}>
      <div style={{ position: "relative", width: "180px", height: "80px" }}>
        <div style={{ position: "absolute", left: "16px", top: "10px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "50%",
            background: "rgba(244,114,182,0.12)", border: "1.5px solid rgba(244,114,182,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "20px" }}>AJ</span>
          </div>
          <div style={{ width: "2px", height: "16px", background: "rgba(244,114,182,0.3)", margin: "0 auto" }} />
        </div>
        <div style={{ position: "absolute", left: "50%", top: "0", transform: "translateX(-50%)" }}>
          <svg width="28" height="26" viewBox="0 0 28 26" fill="none">
            <path d="M14 24S2 15.5 2 8a6 6 0 0 1 12-1 6 6 0 0 1 12 1c0 7.5-12 16-12 16Z" fill="rgba(244,114,182,0.25)" stroke="rgba(244,114,182,0.8)" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ position: "absolute", right: "16px", top: "10px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "50%",
            background: "rgba(167,139,250,0.12)", border: "1.5px solid rgba(167,139,250,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "20px" }}>M</span>
          </div>
        </div>
        <div style={{
          position: "absolute", bottom: "0", left: "50%", transform: "translateX(-50%)",
          background: "rgba(244,114,182,0.1)", border: "1px solid rgba(244,114,182,0.2)",
          borderRadius: "20px", padding: "2px 10px",
          fontSize: "10px", fontWeight: 600, color: "rgba(244,114,182,0.85)",
          whiteSpace: "nowrap",
        }}>
          Connected
        </div>
      </div>
    </div>
  );
}

function ShieldVisual() {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px", marginTop: "8px" }}>
      <div style={{
        width: "96px", height: "96px", borderRadius: "50%",
        background: "rgba(244,114,182,0.07)", border: "1.5px solid rgba(244,114,182,0.2)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0",
      }}>
        <svg width="40" height="44" viewBox="0 0 40 44" fill="none">
          <path d="M20 2L38 9v14c0 12-9 20-18 22C11 43 2 31 2 23V9L20 2Z" fill="rgba(244,114,182,0.12)" stroke="rgba(244,114,182,0.75)" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M12 22l6 6 10-12" stroke="rgba(244,114,182,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function SquadVisual() {
  const members = [
    { initials: "AJ", color: "rgba(244,114,182,0.2)", border: "rgba(244,114,182,0.35)" },
    { initials: "MK", color: "rgba(167,139,250,0.2)", border: "rgba(167,139,250,0.35)" },
    { initials: "JR", color: "rgba(96,165,250,0.2)", border: "rgba(96,165,250,0.35)" },
    { initials: "SL", color: "rgba(52,211,153,0.2)", border: "rgba(52,211,153,0.35)" },
  ];
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "24px", marginTop: "8px" }}>
      {members.map((m) => (
        <div key={m.initials} style={{
          width: "48px", height: "48px", borderRadius: "50%",
          background: m.color, border: `2px solid ${m.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 12px ${m.border}`,
        }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.02em" }}>{m.initials}</span>
        </div>
      ))}
    </div>
  );
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const slide = SLIDES[slideIdx];
  const isLast = slideIdx === SLIDES.length - 1;

  function advance() {
    if (isLast) {
      try { localStorage.setItem("dnob_onboarded", "1"); } catch {}
      onComplete();
    } else {
      setSlideIdx((i) => i + 1);
    }
  }

  function skip() {
    try { localStorage.setItem("dnob_onboarded", "1"); } catch {}
    onComplete();
  }

  return (
    <div
      style={{
        width: "100%", height: "100%",
        background: "linear-gradient(160deg, #120719 0%, #04010a 100%)",
        display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
      }}
    >
      <StatusBar />

      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        padding: "0 24px", paddingTop: "59px",
        overflowY: "auto", scrollbarWidth: "none",
      }}>
        {/* Visual */}
        <div style={{ marginTop: "16px" }}>
          {slide.id === "alone" && <HeartsVisual />}
          {slide.id === "safe" && <ShieldVisual />}
          {slide.id === "squad" && <SquadVisual />}
        </div>

        {/* Eyebrow */}
        <div style={{
          fontSize: "11px", fontWeight: 600, color: "rgba(244,114,182,0.7)",
          letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px",
        }}>
          {slide.eyebrow}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "32px", fontWeight: 800, color: "#ffffff",
          letterSpacing: "-0.04em", lineHeight: 1.1,
          margin: "0 0 14px",
          whiteSpace: "pre-line",
          fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
        }}>
          {slide.title}
        </h1>

        {/* Body */}
        <p style={{
          fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.65,
          margin: "0 0 20px",
        }}>
          {slide.body}
        </p>

        {/* Safe badge on slide 2 */}
        {slide.id === "safe" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { icon: "shield", label: "Every message is reviewed by trained staff" },
              { icon: "lock", label: "Your real name and location stay private" },
              { icon: "check", label: "You can block or report anyone, anytime" },
            ].map(({ label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                  background: "rgba(244,114,182,0.1)", border: "1px solid rgba(244,114,182,0.22)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l2.5 2.5 5.5-6" stroke="rgba(244,114,182,0.9)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ flex: 1, minHeight: "16px" }} />
      </div>

      {/* Bottom: dots + CTA */}
      <div style={{ padding: "16px 24px 36px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ width: "44px" }} />
          <div style={{ display: "flex", gap: "6px" }}>
            {SLIDES.map((s, i) => (
              <div
                key={s.id}
                style={{
                  width: i === slideIdx ? "20px" : "6px", height: "6px",
                  borderRadius: "3px",
                  transition: "width 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
                  background: i === slideIdx ? "rgba(244,114,182,0.8)" : "rgba(255,255,255,0.18)",
                }}
              />
            ))}
          </div>
          {!isLast ? (
            <button
              onClick={skip}
              style={{
                width: "44px", background: "none", border: "none", cursor: "pointer",
                fontSize: "13px", color: "rgba(255,255,255,0.35)",
                fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
                padding: "8px 0", minHeight: "44px", textAlign: "right",
              }}
            >
              Skip
            </button>
          ) : (
            <div style={{ width: "44px" }} />
          )}
        </div>

        <button
          onClick={advance}
          style={{
            width: "100%", height: "52px",
            background: "linear-gradient(135deg, #f472b6 0%, #e879f9 60%, #c084fc 100%)",
            border: "none", borderRadius: "16px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            fontSize: "16px", fontWeight: 700, color: "#1a0a2e",
            fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
            letterSpacing: "-0.01em",
            boxShadow: "0 0 0 1px rgba(244,114,182,0.25), 0 8px 32px rgba(244,114,182,0.28)",
            transition: "transform 0.15s ease, opacity 0.15s ease",
          }}
          onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          onTouchStart={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
          onTouchEnd={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        >
          {slide.cta}
          {isLast && (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5" stroke="#1a0a2e" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
