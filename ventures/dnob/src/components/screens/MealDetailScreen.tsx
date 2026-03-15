"use client";

import StatusBar from "@/components/ui/StatusBar";
import BackButton from "@/components/ui/BackButton";

interface MealDetailScreenProps {
  dropId: string;
  onBack: () => void;
  onOrder: (activityId: string) => void;
  onViewCook: (staffId: string) => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

interface ActivityDetail {
  emoji: string;
  name: string;
  time: string;
  count: number;
  description: string;
  hostName: string;
  hostRole: string;
  color: string;
  border: string;
  participants: { initials: string; color: string }[];
  tags: string[];
}

function getActivity(dropId: string): ActivityDetail {
  const ACTIVITIES: Record<string, ActivityDetail> = {
    act1: {
      emoji: "🎬", name: "Movie Night", time: "Tonight 7:00 PM",
      count: 12, color: "rgba(244,114,182,0.2)", border: "rgba(244,114,182,0.35)",
      description: "We watch a movie together using a shared screen while chatting in the room. Everyone votes on what to watch and we pause for snack breaks. Popcorn emoji required in your bio.",
      hostName: "Nurse Jamie", hostRole: "Child Life Specialist",
      participants: [
        { initials: "MK", color: "#a855f7" },
        { initials: "JR", color: "#3b82f6" },
        { initials: "SL", color: "#10b981" },
        { initials: "AT", color: "#f59e0b" },
        { initials: "RL", color: "#ec4899" },
      ],
      tags: ["Hosted", "Safe", "Weekly"],
    },
    act2: {
      emoji: "🎮", name: "Game Hour", time: "Tomorrow 4:00 PM",
      count: 8, color: "rgba(167,139,250,0.2)", border: "rgba(167,139,250,0.35)",
      description: "Play games together online. We rotate between Uno, trivia, and Jackbox games. No experience needed, just show up ready to have fun. Trash talk is friendly-only.",
      hostName: "Carlos V.", hostRole: "Activity Coordinator",
      participants: [
        { initials: "JR", color: "#3b82f6" },
        { initials: "MK", color: "#a855f7" },
        { initials: "CJ", color: "#06b6d4" },
        { initials: "LS", color: "#f59e0b" },
      ],
      tags: ["Hosted", "Safe", "Bi-weekly"],
    },
    act3: {
      emoji: "🎨", name: "Art Circle", time: "Wed 2:00 PM",
      count: 6, color: "rgba(96,165,250,0.2)", border: "rgba(96,165,250,0.35)",
      description: "Share what you're working on and get inspired by others. Sketching, digital art, painting, doodling, all welcome. We take turns sharing our screens and just hang out while we create.",
      hostName: "Ms. Rosa", hostRole: "Art Therapist",
      participants: [
        { initials: "SL", color: "#10b981" },
        { initials: "AT", color: "#f59e0b" },
        { initials: "RL", color: "#ec4899" },
      ],
      tags: ["Hosted", "Safe", "Weekly"],
    },
  };
  return ACTIVITIES[dropId] ?? ACTIVITIES["act1"];
}

export default function MealDetailScreen({ dropId, onBack, onOrder, onViewCook }: MealDetailScreenProps) {
  const activity = getActivity(dropId);

  return (
    <div style={{
      width: "100%", height: "100%", background: "#030107",
      position: "relative", display: "flex", flexDirection: "column",
      overflow: "hidden",
      fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
    }}>
      <StatusBar />

      <div className="inner-scroll" style={{
        position: "absolute", inset: 0,
        overflowY: "auto", overflowX: "hidden",
        paddingTop: "59px", paddingBottom: "100px",
        scrollbarWidth: "none",
      }}>
        {/* Nav row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px 6px" }}>
          <BackButton onBack={onBack} label="Activities" />
        </div>

        {/* Hero */}
        <div style={{ margin: "4px 16px 0" }}>
          <div style={{
            borderRadius: "20px",
            background: activity.color, border: `1px solid ${activity.border}`,
            padding: "28px 20px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
          }}>
            <div style={{ fontSize: "48px", lineHeight: 1 }}>{activity.emoji}</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.025em", textAlign: "center" }}>
              {activity.name}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", textAlign: "center" }}>
              {activity.time}
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              background: "rgba(244,114,182,0.15)", border: "1px solid rgba(244,114,182,0.3)",
              borderRadius: "20px", padding: "4px 12px",
              marginTop: "4px",
            }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "rgba(74,222,128,0.9)", boxShadow: "0 0 5px rgba(74,222,128,0.7)" }} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{activity.count} kids joining</span>
            </div>
          </div>
        </div>

        {/* Safe & moderated badge */}
        <div style={{ margin: "12px 16px 0" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "rgba(244,114,182,0.07)", border: "1px solid rgba(244,114,182,0.18)",
            borderRadius: "14px", padding: "12px 14px",
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
              background: "rgba(244,114,182,0.12)", border: "1px solid rgba(244,114,182,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                <path d="M9 1L17 4.5v8c0 5.5-4 9-8 10-4-1-8-4.5-8-10v-8L9 1Z" fill="rgba(244,114,182,0.15)" stroke="rgba(244,114,182,0.7)" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M5.5 10l2.5 2.5 4-5" stroke="rgba(244,114,182,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", marginBottom: "2px" }}>Safe and Moderated</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>Every session is supervised by trained hospital staff.</div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ margin: "16px 16px 0" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>About this activity</div>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.72)", lineHeight: 1.65, margin: 0 }}>
            {activity.description}
          </p>
        </div>

        {/* Tags */}
        <div style={{ margin: "12px 16px 0", display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {activity.tags.map((tag) => (
            <span key={tag} style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "100px", padding: "4px 10px",
              fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: 500,
            }}>{tag}</span>
          ))}
        </div>

        {/* Who's joining */}
        <div style={{ margin: "18px 16px 0" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
            Who is joining
          </div>
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "4px" }}>
            {activity.participants.map((p) => (
              <div key={p.initials} style={{
                flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "50%",
                  background: p.color + "40", border: `2px solid ${p.color}60`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{p.initials}</span>
                </div>
              </div>
            ))}
            {activity.count > activity.participants.length && (
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.07)", border: "2px solid rgba(255,255,255,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>
                    +{activity.count - activity.participants.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Host */}
        <div style={{ margin: "18px 16px 0" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
            Hosted by
          </div>
          <button
            onClick={() => onViewCook("staff1")}
            style={{
              width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "14px", padding: "12px 14px",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", textAlign: "left",
              fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
              transition: "background 0.12s ease",
            }}
            onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,114,182,0.06)"; }}
            onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
            onTouchStart={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,114,182,0.06)"; }}
            onTouchEnd={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
          >
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
              background: "rgba(244,114,182,0.15)", border: "2px solid rgba(244,114,182,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="7" r="3.5" stroke="rgba(244,114,182,0.8)" strokeWidth="1.4" />
                <path d="M2 16c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="rgba(244,114,182,0.8)" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>{activity.hostName}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>{activity.hostRole}</div>
            </div>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path d="M1 1L6 6L1 11" stroke="rgba(255,255,255,0.2)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div style={{ height: "20px" }} />
      </div>

      {/* Join CTA */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "0 20px 24px",
        background: "linear-gradient(0deg, #030107 0%, #030107 55%, rgba(3,1,7,0) 100%)",
        zIndex: 20,
      }}>
        <div style={{ height: "28px" }} />
        <button
          onClick={() => onOrder(dropId)}
          style={{
            width: "100%", height: "52px",
            background: "linear-gradient(135deg, #f472b6 0%, #e879f9 60%, #c084fc 100%)",
            border: "none", borderRadius: "16px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            fontSize: "16px", fontWeight: 700, color: "#1a0a2e",
            fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
            letterSpacing: "-0.01em",
            boxShadow: "0 8px 32px rgba(244,114,182,0.3)",
            transition: "transform 0.13s ease, opacity 0.13s ease",
          }}
          onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.975)"; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          onTouchStart={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.975)"; }}
          onTouchEnd={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        >
          Join Activity
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5" stroke="#1a0a2e" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={{ textAlign: "center", marginTop: "7px", fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
          Supervised by hospital staff
        </div>
      </div>
    </div>
  );
}
