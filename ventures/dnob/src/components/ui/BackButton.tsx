"use client";

interface BackButtonProps {
  onBack: () => void;
  label?: string;
  light?: boolean;
}

export default function BackButton({ onBack, label = "Back", light = false }: BackButtonProps) {
  return (
    <button
      onClick={onBack}
      style={{
        display: "flex", alignItems: "center", gap: "4px",
        background: "none", border: "none", cursor: "pointer", padding: "4px 0",
        color: light ? "rgba(255,255,255,0.9)" : "rgba(196,181,253,0.9)",
        fontSize: "14px", fontWeight: 500, fontFamily: "var(--font-inter), sans-serif",
        letterSpacing: "-0.01em", minHeight: "44px",
      }}
    >
      <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
        <path d="M7 1L1.5 6.5L7 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );
}
