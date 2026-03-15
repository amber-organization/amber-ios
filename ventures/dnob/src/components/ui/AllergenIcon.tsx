"use client";
import { AllergenKey } from "@/data/mock";

const LABELS: Record<AllergenKey, string> = {
  gluten: "Gluten",
  dairy: "Dairy",
  egg: "Egg",
  soy: "Soy",
  nuts: "Nuts",
  peanuts: "Peanuts",
  shellfish: "Shellfish",
  sesame: "Sesame",
};

interface AllergenIconProps {
  allergen: AllergenKey;
  size?: "sm" | "md";
}

export default function AllergenIcon({ allergen, size = "sm" }: AllergenIconProps) {
  const isSmall = size === "sm";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "rgba(239,68,68,0.12)",
        border: "1px solid rgba(239,68,68,0.25)",
        borderRadius: "6px",
        padding: isSmall ? "2px 6px" : "3px 8px",
        fontSize: isSmall ? "10px" : "11px",
        fontWeight: 600,
        color: "rgba(252,165,165,0.9)",
        fontFamily: "var(--font-inter), sans-serif",
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {LABELS[allergen]}
    </div>
  );
}
