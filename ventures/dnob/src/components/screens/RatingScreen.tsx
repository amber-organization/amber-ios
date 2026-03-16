"use client";

import { useState } from "react";
import StatusBar from "@/components/ui/StatusBar";

interface RatingScreenProps {
  dropId: string;
  onSubmit: () => void;
}

const MOODS = [
  { emoji: "😢", label: "Rough", value: 1, color: "rgba(96,165,250,0.7)" },
  { emoji: "😕", label: "Meh", value: 2, color: "rgba(167,139,250,0.7)" },
  { emoji: "😐", label: "Okay", value: 3, color: "rgba(251,191,36,0.7)" },
  { emoji: "🙂", label: "Good", value: 4, color: "rgba(52,211,153,0.7)" },
  { emoji: "😄", label: "Great", value: 5, color: "rgba(244,114,182,0.9)" },
];

const FRIENDS = [
  { id: "peer1", initials: "MK", name: "Maya", color: "#a855f7" },
  { id: "peer2", initials: "JR", name: "Jordan", color: "#3b82f6" },
  { id: "peer3", initials: "SL", name: "Sam", color: "#10b981" },
];

export default function RatingScreen({ dropId: _dropId, onSubmit }: RatingScreenProps) {
  const [mood, setMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function toggleFriend(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  function handleSubmit() {
    if (mood === null) return;
    setSubmitting(true);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => onSubmit(), 900);
    }, 600);
  }

  const selectedMood = MOODS.find((m) => m.value === mood);

  if (done) {
    return (
      <div style={{
        width: "100%", height: "100%", background: "#030107",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
        gap: "16px", padding: "24px",
      }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: "rgba(244,114,182,0.1)", border: "2px solid rgba(244,114,182,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 40px rgba(244,114,182,0.2)",
        }}>
          <svg width="32" height="28" viewBox="0 0 32 28" fill="none">
            <path d="M16 26S3 17.5 3 9a7 7 0 0 1 14-1 7 7 0 0 1 14 1c0 8.5-13 17-13 17Z" fill="rgba(244,114,182,0.25)" stroke="rgba(244,114,182,0.9)" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em", textAlign: "center" }}>
          Thanks for sharing!
        </div>
        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.6, maxWidth: "240px" }}>
          Your feelings matter. See you at the next hangout.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: "100%", height: "100%", background: "#030107",
      position: "relative", overflow: "hidden",
      fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
    }}>
      <StatusBar />
      <div
        className="inner-scroll"
        style={{
          position: "absolute", inset: 0,
          overflowY: "auto", overflowX: "hidden",
          paddingTop: "59px", paddingBottom: "100px",
          scrollbarWidth: "none",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 20px 0", textAlign: "center" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(244,114,182,0.7)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            After-hangout check-in
          </div>
          <h1 style={{
            fontSize: "28px", fontWeight: 800, color: "#ffffff",
            letterSpacing: "-0.035em", lineHeight: 1.1, margin: "0 0 8px",
          }}>
            How are you feeling?
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.55 }}>
            No wrong answers here. We just want to know.
          </p>
        </div>

        {/* Mood selector */}
        <div style={{ padding: "24px 16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "6px" }}>
            {MOODS.map((m) => {
              const active = mood === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                    gap: "6px", padding: "12px 4px",
                    background: active ? `${m.color.replace("0.7", "0.12").replace("0.9", "0.12")}` : "rgba(255,255,255,0.04)",
                    border: active ? `1.5px solid ${m.color}` : "1.5px solid rgba(255,255,255,0.08)",
                    borderRadius: "14px", cursor: "pointer",
                    transition: "all 0.15s ease",
                    transform: active ? "scale(1.06)" : "scale(1)",
                    boxShadow: active ? `0 0 16px ${m.color.replace("0.7", "0.25").replace("0.9", "0.25")}` : "none",
                    fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
                  }}
                >
                  <span style={{ fontSize: "26px", lineHeight: 1 }}>{m.emoji}</span>
                  <span style={{
                    fontSize: "10px", fontWeight: 600,
                    color: active ? m.color : "rgba(255,255,255,0.4)",
                    letterSpacing: "0.02em",
                  }}>{m.label}</span>
                </button>
              );
            })}
          </div>

          {selectedMood && (
            <div style={{
              marginTop: "12px",
              background: "rgba(244,114,182,0.06)", border: "1px solid rgba(244,114,182,0.14)",
              borderRadius: "12px", padding: "10px 14px",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <span style={{ fontSize: "18px" }}>{selectedMood.emoji}</span>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>
                {selectedMood.value === 1 && "It's okay to have tough days. You're not alone in this."}
                {selectedMood.value === 2 && "We hear you. Some days are just like that."}
                {selectedMood.value === 3 && "Thanks for checking in. Every day counts."}
                {selectedMood.value === 4 && "Glad it was a good one! Keep it up."}
                {selectedMood.value === 5 && "That's awesome! You light up the room."}
              </span>
            </div>
          )}
        </div>

        {/* Optional note */}
        <div style={{ margin: "22px 16px 0" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
            What made today good? (optional)
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Share a moment, a laugh, anything..."
            rows={3}
            style={{
              width: "100%", boxSizing: "border-box",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px", padding: "12px 14px",
              fontSize: "14px", color: "rgba(255,255,255,0.8)",
              fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
              resize: "none", outline: "none", lineHeight: 1.6,
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(244,114,182,0.35)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
          />
        </div>

        {/* Friend chips */}
        <div style={{ margin: "20px 16px 0" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
            Who did you connect with?
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {FRIENDS.map((f) => {
              const on = selected.includes(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => toggleFriend(f.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "7px 14px 7px 8px",
                    background: on ? `${f.color}18` : "rgba(255,255,255,0.04)",
                    border: on ? `1.5px solid ${f.color}55` : "1.5px solid rgba(255,255,255,0.09)",
                    borderRadius: "100px", cursor: "pointer",
                    fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{
                    width: "26px", height: "26px", borderRadius: "50%",
                    background: `${f.color}28`, border: `1.5px solid ${f.color}55`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{f.initials}</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: on ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)" }}>
                    {f.name}
                  </span>
                  {on && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5l3.5 3.5L11 1" stroke="rgba(244,114,182,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ height: "20px" }} />
      </div>

      {/* Submit button */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "12px 20px 36px",
        background: "linear-gradient(to top, #030107 60%, transparent)",
      }}>
        <button
          onClick={handleSubmit}
          disabled={mood === null || submitting}
          style={{
            width: "100%", height: "52px",
            background: mood === null
              ? "rgba(255,255,255,0.06)"
              : submitting
              ? "rgba(244,114,182,0.3)"
              : "linear-gradient(135deg, #f472b6 0%, #e879f9 60%, #c084fc 100%)",
            border: mood === null ? "1px solid rgba(255,255,255,0.1)" : "none",
            borderRadius: "16px", cursor: mood === null ? "default" : "pointer",
            fontSize: "16px", fontWeight: 700,
            color: mood === null ? "rgba(255,255,255,0.3)" : "#1a0a2e",
            fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
            letterSpacing: "-0.01em",
            boxShadow: mood !== null && !submitting ? "0 0 0 1px rgba(244,114,182,0.25), 0 8px 32px rgba(244,114,182,0.28)" : "none",
            transition: "all 0.2s ease",
          }}
          onMouseDown={(e) => { if (mood !== null) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          onTouchStart={(e) => { if (mood !== null) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
          onTouchEnd={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        >
          {submitting ? "Saving..." : mood === null ? "Pick a mood to continue" : "Submit Check-in"}
        </button>
      </div>
    </div>
  );
}
