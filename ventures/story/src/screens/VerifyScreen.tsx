"use client";

import { useReducer, useEffect, useRef } from "react";
import type { NavProps } from "@/types";

// ── Trust Tier Architecture (v2.0) ─────────────────────────────────────────────
// Mandatory biometric on day 1 is the wrong approach. The moat is a tiered trust
// stack that starts LOW friction (school email + device binding) and progressively
// unlocks more capability as users invest more in their verified identity.
//
// Tier 1: School email + device binding  →  circles, posting, daily prompts
// Tier 2: Selfie / liveness check        →  Discovery feed (optional)
// Tier 3: In-person campus event          →  Campus Verified badge (optional)
// Tier 4: Institution-grade              →  Reserved for public figures

const TIERS = [
  { tier: 1, label: "Identity confirmed",  description: "School email + device binding", color: "#34d399", optional: false },
  { tier: 2, label: "Liveness verified",   description: "Optional — unlocks Discovery",  color: "#f59e0b", optional: true  },
  { tier: 3, label: "Campus Verified",     description: "In-person event — highest trust", color: "#a78bfa", optional: true  },
  { tier: 4, label: "Institution-grade",   description: "Reserved for public figures",   color: "#60a5fa", optional: true  },
] as const;

type VerifyState = { phase: number };
type VerifyAction = { type: "ADVANCE_PHASE"; value: number };

function verifyReducer(state: VerifyState, action: VerifyAction): VerifyState {
  switch (action.type) {
    case "ADVANCE_PHASE": return { ...state, phase: action.value };
    default: return state;
  }
}

function scheduleVerifyPhases(
  dispatch: React.Dispatch<VerifyAction>,
  navigate: NavProps["navigate"],
  isMounted: React.MutableRefObject<boolean>,
): (() => void) {
  const t1 = setTimeout(() => { if (isMounted.current) dispatch({ type: "ADVANCE_PHASE", value: 1 }); }, 600);
  const t2 = setTimeout(() => { if (isMounted.current) dispatch({ type: "ADVANCE_PHASE", value: 2 }); }, 1300);
  const t3 = setTimeout(() => { if (isMounted.current) dispatch({ type: "ADVANCE_PHASE", value: 3 }); }, 1900);
  const tNav = setTimeout(() => navigate("home", "forward"), 2700);
  return () => {
    isMounted.current = false;
    clearTimeout(t1);
    clearTimeout(t2);
    clearTimeout(t3);
    clearTimeout(tNav);
  };
}

interface TierRowProps {
  tier: typeof TIERS[number];
  phase: number;
}

function TierRow({ tier, phase }: TierRowProps) {
  const isDone    = phase >= tier.tier;
  const isActive  = phase === tier.tier - 1 && !tier.optional;
  const isPending = !isDone && !isActive;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 0",
      opacity: isPending ? 0.32 : 1,
      transition: "opacity 0.4s ease",
    }}>
      {/* Status indicator */}
      <div style={{
        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: isDone ? tier.color : "transparent",
        border: isDone ? "none" : `1.5px solid ${isActive ? tier.color : "rgba(255,255,255,0.12)"}`,
        transition: "all 0.4s ease",
        position: "relative" as const,
      }}>
        {isDone ? (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4L4.5 7.5L10 1" stroke="#0f0c0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : isActive ? (
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            backgroundColor: tier.color,
            animation: "pulse 1.2s ease-in-out infinite",
          }} />
        ) : (
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-inter)", fontWeight: 600 }}>
            {tier.tier}
          </span>
        )}
      </div>

      {/* Tier info */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 12.5, fontWeight: 600,
          color: isDone ? "#fff" : isActive ? tier.color : "rgba(255,255,255,0.4)",
          fontFamily: "var(--font-inter)",
          transition: "color 0.4s ease",
        }}>
          {tier.label}
          {tier.optional && (
            <span style={{ fontSize: 9, fontWeight: 400, color: "rgba(255,255,255,0.22)", marginLeft: 6 }}>optional</span>
          )}
        </div>
        <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.26)", fontFamily: "var(--font-inter)", marginTop: 1 }}>
          {tier.description}
        </div>
      </div>
    </div>
  );
}

export default function VerifyScreen({ navigate }: NavProps) {
  const [state, dispatch] = useReducer(verifyReducer, { phase: 0 });
  const { phase } = state;
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return scheduleVerifyPhases(dispatch, navigate, mountedRef);
  }, [navigate]);

  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg, #14100a 0%, #0d0b08 50%, #0f0c0a 100%)",
      position: "relative", overflow: "hidden",
      padding: "0 28px",
      boxSizing: "border-box" as const,
    }}>
      {/* Cancel button */}
      <button
        onClick={() => navigate("splash", "back")}
        style={{
          position: "absolute", top: 16, left: 16,
          background: "none", border: "none",
          color: "rgba(255,255,255,0.3)", fontSize: 12,
          fontFamily: "var(--font-inter)", cursor: "pointer", padding: "4px 8px",
        }}
      >
        Cancel
      </button>

      {/* Background glow */}
      <div style={{
        position: "absolute", top: "40%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 300, height: 300,
        background: "radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
        opacity: phase >= 1 ? 1 : 0,
        transition: "opacity 0.8s ease",
      }} />

      {/* Header label */}
      <div style={{
        fontSize: 11, color: "rgba(52,211,153,0.65)", fontWeight: 600,
        fontFamily: "var(--font-inter)", letterSpacing: "0.08em", marginBottom: 20,
      }}>
        TRUST SETUP
      </div>

      {/* Title */}
      <div style={{
        fontSize: 22, fontWeight: 700, color: "#fff",
        fontFamily: "var(--font-dm-sans)", letterSpacing: "-0.02em",
        textAlign: "center" as const, marginBottom: 6,
      }}>
        Building your trust layer
      </div>

      {/* Subtitle */}
      <div style={{
        fontSize: 13, color: "rgba(255,255,255,0.38)",
        fontFamily: "var(--font-inter)", textAlign: "center" as const,
        lineHeight: 1.55, marginBottom: 32, maxWidth: 240,
      }}>
        Your identity on Story is a reputation you build over time, not a form you fill out once.
      </div>

      {/* Tier list card */}
      <div style={{
        width: "100%", maxWidth: 300,
        backgroundColor: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14, padding: "4px 16px",
        marginBottom: 20,
      }}>
        {TIERS.map((tier, i) => (
          <div key={tier.tier}>
            <TierRow tier={tier} phase={phase} />
            {i < TIERS.length - 1 && (
              <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.04)" }} />
            )}
          </div>
        ))}
      </div>

      {/* Tier 1 unlocks — fades in once Tier 1 is done */}
      <div style={{
        width: "100%", maxWidth: 300,
        backgroundColor: "rgba(52,211,153,0.04)",
        border: "1px solid rgba(52,211,153,0.12)",
        borderRadius: 12, padding: "12px 14px",
        opacity: phase >= 1 ? 1 : 0,
        transition: "opacity 0.5s ease",
        pointerEvents: phase >= 1 ? "auto" : "none",
      }}>
        <div style={{
          fontSize: 10, color: "rgba(52,211,153,0.6)", fontWeight: 600,
          fontFamily: "var(--font-inter)", letterSpacing: "0.06em", marginBottom: 8,
        }}>
          TIER 1 UNLOCKS
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 5 }}>
          {["Post to your Circles", "Reply to stories", "Daily prompts", "Voice stories"].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#34d399", flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-inter)" }}>
                {item}
              </span>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 10, paddingTop: 10,
          borderTop: "1px solid rgba(52,211,153,0.08)",
          fontSize: 10, color: "rgba(255,255,255,0.25)",
          fontFamily: "var(--font-inter)", lineHeight: 1.5,
        }}>
          Add liveness or attend a campus event to unlock Discovery
        </div>
      </div>

      {/* Demo mode */}
      <div style={{
        position: "absolute", bottom: 18, left: 0, right: 0,
        fontSize: 9, color: "rgba(255,255,255,0.2)",
        fontFamily: "var(--font-inter)", textAlign: "center" as const, letterSpacing: "0.04em",
      }}>
        Demo mode · No data collected
      </div>
    </div>
  );
}
