"use client";

import { useState } from "react";
import StatusBar from "@/components/ui/StatusBar";
import BackButton from "@/components/ui/BackButton";

interface CookDashboardScreenProps {
  cookId: string;
  onBack: () => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PATIENTS = [
  { id: "p1", name: "Maya K.", room: "Room 3C", status: "Active", lastCheckin: "10 min ago", initials: "MK", color: "#a855f7", mood: "😄" },
  { id: "p2", name: "Jordan R.", room: "Room 7A", status: "Active", lastCheckin: "25 min ago", initials: "JR", color: "#3b82f6", mood: "🙂" },
  { id: "p3", name: "Sam L.", room: "Room 2B", status: "Resting", lastCheckin: "1 hr ago", initials: "SL", color: "#10b981", mood: "😐" },
  { id: "p4", name: "Alex T.", room: "Room 5D", status: "Active", lastCheckin: "5 min ago", initials: "AT", color: "#f97316", mood: "🙂" },
];

const ACTIVITY_LOG = [
  { id: "e1", time: "2:30 PM", text: "Movie Night started with 4 kids", icon: "film" },
  { id: "e2", time: "1:15 PM", text: "Maya joined Game Hour", icon: "game" },
  { id: "e3", time: "11:00 AM", text: "Art Circle completed (3 participants)", icon: "art" },
  { id: "e4", time: "9:45 AM", text: "Morning mood check-ins received", icon: "heart" },
];

const QUICK_ACTIONS = [
  { id: "checkin", label: "Check In", color: "#10b981" },
  { id: "message", label: "Send Message", color: "#3b82f6" },
  { id: "flag", label: "Flag for Support", color: "#f97316" },
];

function ActivityIcon({ icon }: { icon: string }) {
  if (icon === "film") return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="2" width="10" height="8" rx="1.5" stroke="rgba(244,114,182,0.7)" strokeWidth="1.2" />
      <path d="M4.5 4.5L8 6l-3.5 1.5V4.5Z" fill="rgba(244,114,182,0.7)" />
    </svg>
  );
  if (icon === "game") return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="3.5" width="10" height="6" rx="2" stroke="rgba(244,114,182,0.7)" strokeWidth="1.2" />
      <path d="M4 6.5h2M5 5.5v2" stroke="rgba(244,114,182,0.7)" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="6.5" r="0.6" fill="rgba(244,114,182,0.7)" />
    </svg>
  );
  if (icon === "art") return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 9c0-3 6-7 6-4 0 2-3 1-3 4" stroke="rgba(244,114,182,0.7)" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="4" cy="4" r="1" fill="rgba(244,114,182,0.5)" />
    </svg>
  );
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 11S1 7.5 1 4a3 3 0 0 1 6 0 3 3 0 0 1 6 0c0 3.5-5 7-5 7Z" stroke="rgba(244,114,182,0.7)" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export default function CookDashboardScreen({ cookId: _cookId, onBack }: CookDashboardScreenProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const activeCount = PATIENTS.filter((p) => p.status === "Active").length;

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
          paddingTop: "59px", paddingBottom: "40px",
          scrollbarWidth: "none",
        }}
      >
        {/* Header */}
        <div style={{ padding: "10px 20px 0" }}>
          <BackButton onBack={onBack} label="Sign Out" />
        </div>

        <div style={{ padding: "12px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(244,114,182,0.65)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "3px" }}>
                Staff Dashboard
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                My Room
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
                Room 4B - Pediatric Ward
              </div>
            </div>
            <div style={{
              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
              borderRadius: "100px", padding: "5px 12px",
              display: "flex", alignItems: "center", gap: "5px",
              marginTop: "4px",
            }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
              <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(16,185,129,0.9)" }}>{activeCount} Active</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "8px", padding: "16px 16px 0" }}>
          {[
            { label: "Patients", value: PATIENTS.length },
            { label: "Activities Today", value: 3 },
            { label: "Check-ins", value: 8 },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "14px", padding: "12px 10px", textAlign: "center",
            }}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginTop: "3px", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Patient list */}
        <div style={{ margin: "20px 16px 0" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
            Patients
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {PATIENTS.map((p) => {
              const isSel = selectedPatient === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatient(isSel ? null : p.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    background: isSel ? "rgba(244,114,182,0.06)" : "rgba(255,255,255,0.04)",
                    border: isSel ? "1px solid rgba(244,114,182,0.2)" : "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "14px", padding: "12px 14px",
                    cursor: "pointer", textAlign: "left", width: "100%",
                    fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{
                    width: "42px", height: "42px", borderRadius: "50%", flexShrink: 0,
                    background: `${p.color}22`, border: `2px solid ${p.color}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{p.initials}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>{p.name}</span>
                      <span style={{ fontSize: "16px", lineHeight: 1 }}>{p.mood}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{p.room} - Last seen {p.lastCheckin}</div>
                  </div>
                  <div style={{
                    background: p.status === "Active" ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${p.status === "Active" ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: "100px", padding: "3px 10px",
                    fontSize: "10px", fontWeight: 600,
                    color: p.status === "Active" ? "rgba(16,185,129,0.9)" : "rgba(255,255,255,0.4)",
                    flexShrink: 0,
                  }}>
                    {p.status}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        {selectedPatient && (
          <div style={{ margin: "16px 16px 0" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
              Quick Actions - {PATIENTS.find((p) => p.id === selectedPatient)?.name}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setActiveAction(a.id)}
                  style={{
                    flex: 1, height: "44px",
                    background: activeAction === a.id ? `${a.color}22` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${activeAction === a.id ? `${a.color}40` : "rgba(255,255,255,0.09)"}`,
                    borderRadius: "12px", cursor: "pointer",
                    fontSize: "11px", fontWeight: 600,
                    color: activeAction === a.id ? a.color : "rgba(255,255,255,0.55)",
                    fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
                    transition: "all 0.15s ease",
                    padding: "0 6px",
                  }}
                  onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
                  onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
                  onTouchStart={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
                  onTouchEnd={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
                >
                  {a.label}
                </button>
              ))}
            </div>
            {activeAction && (
              <div style={{
                marginTop: "8px",
                background: "rgba(244,114,182,0.06)", border: "1px solid rgba(244,114,182,0.15)",
                borderRadius: "12px", padding: "10px 14px",
                fontSize: "12px", color: "rgba(255,255,255,0.55)", textAlign: "center",
              }}>
                {activeAction === "checkin" && "Check-in sent to " + PATIENTS.find((p) => p.id === selectedPatient)?.name}
                {activeAction === "message" && "Message drafted for " + PATIENTS.find((p) => p.id === selectedPatient)?.name}
                {activeAction === "flag" && PATIENTS.find((p) => p.id === selectedPatient)?.name + " flagged for support review"}
              </div>
            )}
          </div>
        )}

        {/* Activity log */}
        <div style={{ margin: "20px 16px 0" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
            Today's Activity Log
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {ACTIVITY_LOG.map((e, i) => (
              <div key={e.id} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                {/* Timeline */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "28px", flexShrink: 0 }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                    background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <ActivityIcon icon={e.icon} />
                  </div>
                  {i < ACTIVITY_LOG.length - 1 && (
                    <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.07)", margin: "3px 0" }} />
                  )}
                </div>
                <div style={{ flex: 1, paddingBottom: i < ACTIVITY_LOG.length - 1 ? "0" : "0", minHeight: "28px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", fontWeight: 500, lineHeight: 1.4 }}>{e.text}</span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "1px" }}>{e.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Activity CTA */}
        <div style={{ margin: "20px 16px 0" }}>
          <button
            style={{
              width: "100%", height: "50px",
              background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.2)",
              borderRadius: "14px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
              fontSize: "14px", fontWeight: 700, color: "rgba(244,114,182,0.85)",
              transition: "all 0.15s ease",
            }}
            onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,114,182,0.14)"; }}
            onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,114,182,0.08)"; }}
            onTouchStart={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,114,182,0.14)"; }}
            onTouchEnd={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,114,182,0.08)"; }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            Schedule Activity
          </button>
        </div>

        <div style={{ height: "20px" }} />
      </div>
    </div>
  );
}
