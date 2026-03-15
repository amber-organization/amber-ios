"use client";

import { useState } from "react";
import StatusBar from "@/components/ui/StatusBar";
import BackButton from "@/components/ui/BackButton";

interface CheckoutScreenProps {
  dropId: string;
  onBack: () => void;
  onConfirm: () => void;
}

interface ActivityInfo {
  emoji: string;
  name: string;
  time: string;
  host: string;
  hostRole: string;
  color: string;
}

function getActivity(dropId: string): ActivityInfo {
  const MAP: Record<string, ActivityInfo> = {
    act1: { emoji: "🎬", name: "Movie Night", time: "Tonight 7:00 PM", host: "Nurse Jamie", hostRole: "Child Life Specialist", color: "rgba(244,114,182,0.2)" },
    act2: { emoji: "🎮", name: "Game Hour", time: "Tomorrow 4:00 PM", host: "Carlos V.", hostRole: "Activity Coordinator", color: "rgba(167,139,250,0.2)" },
    act3: { emoji: "🎨", name: "Art Circle", time: "Wednesday 2:00 PM", host: "Ms. Rosa", hostRole: "Art Therapist", color: "rgba(96,165,250,0.2)" },
  };
  return MAP[dropId] ?? MAP["act1"];
}

export default function CheckoutScreen({ dropId, onBack, onConfirm }: CheckoutScreenProps) {
  const [bringFriend, setBringFriend] = useState(false);
  const [joining, setJoining] = useState(false);

  const activity = getActivity(dropId);

  function handleJoin() {
    if (joining) return;
    setJoining(true);
    setTimeout(onConfirm, 1200);
  }

  return (
    <div style={{
      width: "100%", height: "100%", background: "#030107",
      overflow: "hidden", position: "relative",
      fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      <StatusBar />

      {/* Nav bar */}
      <div style={{
        paddingTop: "59px", paddingBottom: "0",
        paddingLeft: "20px", paddingRight: "20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0, marginBottom: "16px",
      }}>
        <div style={{ width: "72px" }}>
          <BackButton onBack={onBack} label="Cancel" />
        </div>
        <span style={{ color: "#ffffff", fontSize: "16px", fontWeight: 700, letterSpacing: "-0.02em", flex: 1, textAlign: "center" }}>
          Join Activity
        </span>
        <div style={{ width: "72px" }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>

        {/* Activity card */}
        <div style={{ background: activity.color, border: "1px solid rgba(244,114,182,0.2)", borderRadius: "18px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "14px",
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", flexShrink: 0,
            }}>
              {activity.emoji}
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.025em", lineHeight: 1.15 }}>{activity.name}</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", marginTop: "3px" }}>{activity.time}</div>
            </div>
          </div>
        </div>

        {/* Hosted by */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "14px" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Hosted by</div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
              background: "rgba(244,114,182,0.15)", border: "1.5px solid rgba(244,114,182,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="6" r="3" stroke="rgba(244,114,182,0.8)" strokeWidth="1.3" />
                <path d="M2 15c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="rgba(244,114,182,0.8)" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>{activity.host}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "1px" }}>{activity.hostRole}</div>
            </div>
          </div>
        </div>

        {/* Bring a friend toggle */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff" }}>Bring a Friend</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>Invite someone from your friend list</div>
            </div>
            <button
              onClick={() => setBringFriend(v => !v)}
              aria-pressed={bringFriend}
              style={{
                width: "44px", height: "26px", borderRadius: "13px",
                background: bringFriend ? "rgba(244,114,182,0.9)" : "rgba(255,255,255,0.12)",
                border: "none", cursor: "pointer", position: "relative",
                transition: "background 0.2s ease", flexShrink: 0,
              }}
            >
              <div style={{
                position: "absolute", top: "3px",
                left: bringFriend ? "21px" : "3px",
                width: "20px", height: "20px", borderRadius: "50%",
                background: "#ffffff",
                transition: "left 0.2s ease",
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              }} />
            </button>
          </div>
          {bringFriend && (
            <div style={{ marginTop: "12px", padding: "10px 12px", background: "rgba(244,114,182,0.07)", border: "1px solid rgba(244,114,182,0.15)", borderRadius: "10px" }}>
              <div style={{ fontSize: "12px", color: "rgba(244,114,182,0.85)", fontWeight: 500 }}>
                Your friends will get a notification to join.
              </div>
            </div>
          )}
        </div>

        {/* You're all set message */}
        <div style={{
          background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.18)",
          borderRadius: "16px", padding: "16px",
          display: "flex", alignItems: "flex-start", gap: "12px",
        }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
            background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <path d="M1.5 7L7 12.5 16.5 1.5" stroke="rgba(74,222,128,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>You are all set!</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
              Just show up at the time above. Your spot is saved and staff will be there to welcome you.
            </div>
          </div>
        </div>

        {/* Safety reminder */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "14px", padding: "12px 14px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
              <path d="M7 1L13 3.5v5c0 3.5-2.8 5.5-6 6-3.2-.5-6-2.5-6-6v-5L7 1Z" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" fill="none" />
            </svg>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
              All D-NOB activities are supervised by trained hospital staff and child life specialists.
            </span>
          </div>
        </div>
      </div>

      {/* Join CTA */}
      <div style={{ padding: "0 16px 28px", flexShrink: 0 }}>
        <button
          onClick={handleJoin}
          disabled={joining}
          style={{
            width: "100%", height: "52px", borderRadius: "16px",
            background: joining ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #f472b6 0%, #e879f9 60%, #c084fc 100%)",
            border: "none", cursor: joining ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            fontSize: "16px", fontWeight: 700,
            color: joining ? "rgba(255,255,255,0.3)" : "#1a0a2e",
            fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
            letterSpacing: "-0.01em",
            boxShadow: joining ? "none" : "0 8px 32px rgba(244,114,182,0.3)",
            transition: "transform 0.13s ease, opacity 0.13s ease",
          }}
          onMouseDown={(e) => { if (!joining) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.975)"; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          onTouchStart={(e) => { if (!joining) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.975)"; }}
          onTouchEnd={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        >
          {joining ? "Joining..." : "Join Now"}
          {!joining && (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5" stroke="#1a0a2e" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
