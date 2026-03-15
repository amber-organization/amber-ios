"use client";

import { useState } from "react";
import StatusBar from "@/components/ui/StatusBar";

interface OrderActiveScreenProps {
  dropId: string;
  onViewRating: () => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

interface RoomInfo {
  emoji: string;
  name: string;
  time: string;
  host: string;
}

function getRoomInfo(dropId: string): RoomInfo {
  const MAP: Record<string, RoomInfo> = {
    act1: { emoji: "🎬", name: "Movie Night", time: "Tonight 7:00 PM", host: "Nurse Jamie" },
    act2: { emoji: "🎮", name: "Game Hour", time: "Tomorrow 4:00 PM", host: "Carlos V." },
    act3: { emoji: "🎨", name: "Art Circle", time: "Wednesday 2:00 PM", host: "Ms. Rosa" },
  };
  return MAP[dropId] ?? MAP["act1"];
}

const PARTICIPANTS = [
  { initials: "AJ", color: "#f472b6", label: "You" },
  { initials: "MK", color: "#a855f7", label: "" },
  { initials: "JR", color: "#3b82f6", label: "" },
  { initials: "SL", color: "#10b981", label: "" },
  { initials: "AT", color: "#f59e0b", label: "" },
  { initials: "RL", color: "#ec4899", label: "" },
];

const CHAT_MESSAGES = [
  { id: "m1", author: "MK", color: "#a855f7", text: "omg this part is so good", time: "7:12 PM" },
  { id: "m2", author: "JR", color: "#3b82f6", text: "lol same i literally screamed when this happened", time: "7:13 PM" },
  { id: "m3", author: "SL", color: "#10b981", text: "anyone want to play uno after?", time: "7:14 PM" },
  { id: "m4", author: "MK", color: "#a855f7", text: "YES uno lets go", time: "7:14 PM" },
];

export default function OrderActiveScreen({ dropId, onViewRating }: OrderActiveScreenProps) {
  const [inputText, setInputText] = useState("");
  const room = getRoomInfo(dropId);

  return (
    <div style={{
      width: "100%", height: "100%", background: "#030107",
      position: "relative", display: "flex", flexDirection: "column",
      overflow: "hidden",
      fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
    }}>
      <StatusBar />

      {/* Header */}
      <div style={{
        paddingTop: "59px", paddingLeft: "16px", paddingRight: "16px", paddingBottom: "12px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ fontSize: "24px" }}>{room.emoji}</div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em" }}>
              {room.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "rgba(74,222,128,0.9)", boxShadow: "0 0 5px rgba(74,222,128,0.7)" }} />
              <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(74,222,128,0.9)" }}>Live now</span>
            </div>
          </div>
        </div>

        {/* Staff badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: "5px",
          background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.2)",
          borderRadius: "100px", padding: "4px 10px",
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
            <path d="M5 1L9 2.5v3C9 8 7 9.5 5 10 3 9.5 1 8 1 5.5V2.5L5 1Z" stroke="rgba(244,114,182,0.75)" strokeWidth="1.1" fill="none" />
          </svg>
          <span style={{ fontSize: "10px", fontWeight: 600, color: "rgba(244,114,182,0.85)" }}>{room.host}</span>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="inner-scroll" style={{
        flex: 1, overflowY: "auto", scrollbarWidth: "none",
        display: "flex", flexDirection: "column",
      }}>
        {/* Participants grid */}
        <div style={{ padding: "14px 16px", flexShrink: 0 }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
            In the room
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            {PARTICIPANTS.map((p) => (
              <div key={p.initials} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                background: "rgba(255,255,255,0.04)", border: `1px solid ${p.color}44`,
                borderRadius: "14px", padding: "14px 8px",
              }}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "50%",
                    background: p.color + "40", border: `2px solid ${p.color}70`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 0 10px ${p.color}44`,
                  }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{p.initials}</span>
                  </div>
                  <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "8px", height: "8px", borderRadius: "50%", background: "rgba(74,222,128,0.9)", border: "1.5px solid #030107" }} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{p.initials}</div>
                  {p.label && <div style={{ fontSize: "9px", color: "rgba(244,114,182,0.7)", fontWeight: 600, marginTop: "1px" }}>{p.label}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div style={{ padding: "0 16px", flexShrink: 0 }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
            Chat
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {CHAT_MESSAGES.map((msg) => (
              <div key={msg.id} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <div style={{
                  width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
                  background: msg.color + "40", border: `1.5px solid ${msg.color}60`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{msg.author}</span>
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px", padding: "9px 12px", flex: 1,
                }}>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.45 }}>{msg.text}</div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>{msg.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: "16px", flexShrink: 0 }} />
      </div>

      {/* Message input bar */}
      <div style={{
        padding: "10px 16px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: "8px",
        flexShrink: 0, background: "rgba(3,1,7,0.95)",
      }}>
        <div style={{
          flex: 1, height: "40px", borderRadius: "20px",
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", padding: "0 14px",
        }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Say something..."
            style={{
              background: "none", border: "none", outline: "none",
              width: "100%", fontSize: "13px", color: "rgba(255,255,255,0.7)",
              fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
              caretColor: "rgba(244,114,182,0.8)",
            }}
          />
        </div>
        <button style={{
          width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
          background: inputText.trim() ? "rgba(244,114,182,0.9)" : "rgba(255,255,255,0.08)",
          border: "none", cursor: inputText.trim() ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.15s ease",
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8h10M8.5 4L13 8l-4.5 4" stroke={inputText.trim() ? "#1a0a2e" : "rgba(255,255,255,0.25)"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Leave Room button */}
      <div style={{ padding: "10px 16px 28px", flexShrink: 0 }}>
        <button
          onClick={onViewRating}
          style={{
            width: "100%", height: "48px", borderRadius: "14px",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
            cursor: "pointer", fontSize: "14px", fontWeight: 600,
            color: "rgba(255,255,255,0.55)",
            fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
            transition: "background 0.12s ease",
          }}
          onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)"; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
          onTouchStart={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)"; }}
          onTouchEnd={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3M9 10l4-3-4-3M13 7H5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Leave Room
        </button>
      </div>
    </div>
  );
}
