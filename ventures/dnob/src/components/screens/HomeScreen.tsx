"use client";

import { useState } from "react";
import StatusBar from "@/components/ui/StatusBar";

interface HomeScreenProps {
  onSelectDrop: (peerId: string) => void;
  onSelectCook: (staffId: string) => void;
}

type AppTab = "home" | "friends" | "activities" | "profile";

// ─── Data ─────────────────────────────────────────────────────────────────────

const ONLINE_FRIENDS = [
  { id: "peer1", initials: "MK", name: "Maya", color: "#a855f7", online: true },
  { id: "peer2", initials: "JR", name: "Jordan", color: "#3b82f6", online: true },
  { id: "peer3", initials: "SL", name: "Sofia", color: "#10b981", online: true },
  { id: "peer4", initials: "AT", name: "Aiden", color: "#f59e0b", online: false },
  { id: "peer5", initials: "LM", name: "Leo", color: "#ec4899", online: true },
];

const ACTIVITIES = [
  { id: "act1", emoji: "🎬", name: "Movie Night", time: "Tonight 7:00 PM", count: 12, color: "rgba(244,114,182,0.2)", border: "rgba(244,114,182,0.3)" },
  { id: "act2", emoji: "🎮", name: "Game Hour", time: "Tomorrow 4:00 PM", count: 8, color: "rgba(167,139,250,0.2)", border: "rgba(167,139,250,0.3)" },
  { id: "act3", emoji: "🎨", name: "Art Circle", time: "Wed 2:00 PM", count: 6, color: "rgba(96,165,250,0.2)", border: "rgba(96,165,250,0.3)" },
];

const MATCHES = [
  { id: "peer6", initials: "RL", name: "Riley, 12", tag: "loves gaming", color: "#8b5cf6" },
  { id: "peer7", initials: "CJ", name: "Casey, 10", tag: "into music", color: "#06b6d4" },
];

const NOTIFS = [
  { id: "n1", text: "Maya sent you a message", detail: "omg did you watch that last night", time: "2m ago", unread: true },
  { id: "n2", text: "Jordan is online now", detail: "Minecraft fan", time: "8m ago", unread: true },
  { id: "n3", text: "Movie Night is tonight", detail: "12 kids joining at 7pm", time: "1h ago", unread: false },
  { id: "n4", text: "New friend suggestion", detail: "Riley, 12 shares your interests", time: "3h ago", unread: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "7px", marginBottom: "12px" }}>
      <span style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em" }}>{title}</span>
      {count !== undefined && (
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>{count}</span>
      )}
    </div>
  );
}

function OnlineDot() {
  return (
    <div style={{
      width: "9px", height: "9px", borderRadius: "50%",
      background: "rgba(74,222,128,0.9)",
      boxShadow: "0 0 5px rgba(74,222,128,0.7)",
      flexShrink: 0,
    }} />
  );
}

// ─── Notification Panel ───────────────────────────────────────────────────────

function NotifPanel({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
      style={{ position: "absolute", inset: 0, zIndex: 100, background: "rgba(3,1,7,0.7)", backdropFilter: "blur(6px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute", top: "59px", right: "16px",
          width: "calc(100% - 32px)", maxWidth: "340px",
          background: "#0e0a1a", border: "1px solid rgba(244,114,182,0.15)",
          borderRadius: "18px", padding: "0 0 8px", overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em" }}>Notifications</span>
        </div>
        {NOTIFS.map((n) => (
          <div key={n.id} style={{
            display: "flex", alignItems: "flex-start", gap: "10px",
            padding: "11px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: n.unread ? "#f472b6" : "transparent", flexShrink: 0, marginTop: "4px" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: n.unread ? 600 : 500, color: "#ffffff", marginBottom: "2px", lineHeight: 1.3 }}>{n.text}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", lineHeight: 1.3 }}>{n.detail}</div>
            </div>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HOME TAB ─────────────────────────────────────────────────────────────────

function HomeTab({ onSelectPeer, onSelectActivity }: { onSelectPeer: (id: string) => void; onSelectActivity: (id: string) => void }) {
  return (
    <div style={{ padding: "0 16px 100px" }}>
      {/* Greeting */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "42px", height: "42px", borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, rgba(244,114,182,0.3), rgba(167,139,250,0.3))",
            border: "2px solid rgba(244,114,182,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "0.02em" }}>AJ</span>
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Good morning, Alex
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>
              Children's Hospital LA
            </div>
          </div>
        </div>
      </div>

      {/* Friends Online */}
      <div style={{ marginBottom: "24px" }}>
        <SectionHeader title="Friends Online" count={ONLINE_FRIENDS.filter(f => f.online).length} />
        <div style={{ display: "flex", gap: "14px", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "4px" }}>
          {ONLINE_FRIENDS.map((friend) => (
            <button
              key={friend.id}
              onClick={() => onSelectPeer(friend.id)}
              style={{
                flexShrink: 0,
                display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                background: "none", border: "none", cursor: "pointer", padding: "0",
                fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
              }}
            >
              <div style={{ position: "relative" }}>
                <div style={{
                  width: "54px", height: "54px", borderRadius: "50%",
                  background: friend.color + "44",
                  border: friend.online ? `2.5px solid ${friend.color}88` : "2px solid rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: friend.online ? `0 0 16px ${friend.color}44` : "none",
                }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.02em" }}>{friend.initials}</span>
                </div>
                {friend.online && (
                  <div style={{ position: "absolute", bottom: "2px", right: "2px" }}>
                    <OnlineDot />
                  </div>
                )}
              </div>
              <span style={{ fontSize: "11px", fontWeight: 600, color: friend.online ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)" }}>
                {friend.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Activities */}
      <div style={{ marginBottom: "24px" }}>
        <SectionHeader title="Today's Activities" />
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {ACTIVITIES.map((act) => (
            <button
              key={act.id}
              onClick={() => onSelectActivity(act.id)}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(244,114,182,0.12)",
                borderRadius: "16px", padding: "13px 14px",
                cursor: "pointer", textAlign: "left",
                fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
                width: "100%",
                transition: "background 0.12s ease",
              }}
              onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,114,182,0.07)"; }}
              onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
              onTouchStart={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,114,182,0.07)"; }}
              onTouchEnd={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
            >
              <div style={{
                width: "46px", height: "46px", borderRadius: "13px",
                background: act.color, border: `1px solid ${act.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "24px", flexShrink: 0,
              }}>
                {act.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>{act.name}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>{act.time}</div>
              </div>
              <div style={{ display: "flex", flex: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                <span style={{
                  fontSize: "11px", fontWeight: 600, color: "rgba(244,114,182,0.85)",
                  background: "rgba(244,114,182,0.1)", border: "1px solid rgba(244,114,182,0.2)",
                  borderRadius: "20px", padding: "2px 8px", whiteSpace: "nowrap",
                }}>
                  {act.count} kids joining
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Your Matches */}
      <div style={{ marginBottom: "24px" }}>
        <SectionHeader title="Your Matches" />
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {MATCHES.map((m) => (
            <div
              key={m.id}
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "16px", padding: "14px",
                display: "flex", alignItems: "center", gap: "12px",
              }}
            >
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%", flexShrink: 0,
                background: m.color + "30", border: `2px solid ${m.color}50`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{m.initials}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>{m.name}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>{m.tag}</div>
              </div>
              <button
                onClick={() => onSelectPeer(m.id)}
                style={{
                  height: "34px", padding: "0 14px",
                  background: "rgba(244,114,182,0.12)", border: "1px solid rgba(244,114,182,0.25)",
                  borderRadius: "10px", cursor: "pointer",
                  fontSize: "12px", fontWeight: 600, color: "rgba(244,114,182,0.9)",
                  fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
                  flexShrink: 0,
                }}
              >
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FRIENDS TAB ──────────────────────────────────────────────────────────────

function FriendsTab({ onSelectPeer }: { onSelectPeer: (id: string) => void }) {
  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em" }}>Friends</div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", marginTop: "3px" }}>Your people</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {ONLINE_FRIENDS.map((f) => (
          <button
            key={f.id}
            onClick={() => onSelectPeer(f.id)}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px", padding: "12px 14px",
              cursor: "pointer", textAlign: "left", width: "100%",
              fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
              transition: "background 0.12s ease",
            }}
            onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,114,182,0.06)"; }}
            onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
            onTouchStart={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,114,182,0.06)"; }}
            onTouchEnd={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: "46px", height: "46px", borderRadius: "50%",
                background: f.color + "40", border: `2px solid ${f.color}60`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{f.initials}</span>
              </div>
              {f.online && <div style={{ position: "absolute", bottom: "1px", right: "1px" }}><OnlineDot /></div>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>{f.name}</div>
              <div style={{ fontSize: "12px", color: f.online ? "rgba(74,222,128,0.7)" : "rgba(255,255,255,0.35)", marginTop: "2px" }}>
                {f.online ? "Online now" : "Last seen recently"}
              </div>
            </div>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path d="M1 1L6 6L1 11" stroke="rgba(255,255,255,0.2)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── ACTIVITIES TAB ───────────────────────────────────────────────────────────

function ActivitiesTab({ onSelectActivity }: { onSelectActivity: (id: string) => void }) {
  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em" }}>Activities</div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", marginTop: "3px" }}>Groups, games, and hangouts</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {ACTIVITIES.map((act) => (
          <button
            key={act.id}
            onClick={() => onSelectActivity(act.id)}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              background: "rgba(255,255,255,0.04)", border: `1px solid ${act.border}`,
              borderRadius: "18px", padding: "14px",
              cursor: "pointer", textAlign: "left", width: "100%",
              fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
              transition: "background 0.12s ease",
            }}
            onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,114,182,0.06)"; }}
            onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
            onTouchStart={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,114,182,0.06)"; }}
            onTouchEnd={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
          >
            <div style={{
              width: "52px", height: "52px", borderRadius: "15px",
              background: act.color, border: `1px solid ${act.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "26px", flexShrink: 0,
            }}>
              {act.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>{act.name}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "3px" }}>{act.time}</div>
              <div style={{ fontSize: "11px", color: "rgba(244,114,182,0.8)", marginTop: "3px", fontWeight: 600 }}>
                {act.count} kids joining
              </div>
            </div>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path d="M1 1L6 6L1 11" stroke="rgba(255,255,255,0.2)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── PROFILE TAB ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const interests = ["Gaming", "Drawing", "Movies", "Minecraft", "Music"];
  return (
    <div style={{ padding: "0 16px 100px" }}>
      {/* Profile header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "22px" }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(244,114,182,0.3), rgba(167,139,250,0.3))",
          border: "2.5px solid rgba(244,114,182,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          boxShadow: "0 0 24px rgba(244,114,182,0.25)",
        }}>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "0.02em" }}>AJ</span>
        </div>
        <div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.025em" }}>Alex J.</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>Age 13 · Children's Hospital LA</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "22px" }}>
        {[
          { label: "Friends", value: "7" },
          { label: "Activities", value: "4" },
          { label: "Day streak", value: "5" },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "13px 8px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginTop: "4px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Interests */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "10px", letterSpacing: "-0.01em" }}>Interests</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {interests.map((i) => (
            <span key={i} style={{
              background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.2)",
              borderRadius: "100px", padding: "5px 12px",
              fontSize: "12px", color: "rgba(244,114,182,0.9)", fontWeight: 600,
            }}>{i}</span>
          ))}
        </div>
      </div>

      {/* Hospital */}
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "14px", padding: "14px 16px",
      }}>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>My Hospital</div>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff" }}>Children's Hospital Los Angeles</div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "3px" }}>Room 4B</div>
      </div>
    </div>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

function BottomTabBar({ active, onSelect }: { active: AppTab; onSelect: (t: AppTab) => void }) {
  const tabs: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "home", label: "Home",
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 9.5L10 3l7 6.5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
    },
    {
      id: "friends", label: "Friends",
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M2 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="15" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" /><path d="M15 13c1.7.3 3 1.9 3 3.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    },
    {
      id: "activities", label: "Activities",
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="11" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" /></svg>,
    },
    {
      id: "profile", label: "Profile",
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" /><path d="M3 17c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    },
  ];

  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      height: "80px",
      background: "rgba(3,1,7,0.97)",
      borderTop: "1px solid rgba(255,255,255,0.07)",
      display: "flex", alignItems: "center",
      paddingBottom: "12px",
      zIndex: 50,
    }}>
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
              background: "none", border: "none", cursor: "pointer",
              color: isActive ? "rgba(244,114,182,0.9)" : "rgba(255,255,255,0.3)",
              fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
              padding: "6px 0",
              transition: "color 0.15s ease",
            }}
          >
            {tab.icon}
            <span style={{ fontSize: "10px", fontWeight: isActive ? 600 : 500, letterSpacing: "0.02em" }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main HomeScreen ──────────────────────────────────────────────────────────

export default function HomeScreen({ onSelectDrop, onSelectCook: _onSelectCook }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = NOTIFS.filter(n => n.unread).length;

  return (
    <div style={{
      width: "100%", height: "100%", background: "#030107",
      position: "relative", overflow: "hidden",
      fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
    }}>
      <StatusBar />

      {/* Top nav bar */}
      <div style={{
        position: "absolute", top: "59px", left: 0, right: 0, height: "52px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px",
        background: "rgba(3,1,7,0.92)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        zIndex: 40,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="D-NOB" style={{ height: "22px", objectFit: "contain" }} />
        <button
          onClick={() => setShowNotifs(v => !v)}
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
          style={{
            position: "relative", background: "none", border: "none", cursor: "pointer",
            padding: "6px", display: "flex", alignItems: "center", justifyContent: "center",
            minWidth: "44px", minHeight: "44px",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2a6 6 0 0 1 6 6c0 4 2 5 2 5H2s2-1 2-5a6 6 0 0 1 6-6ZM8.5 17a1.5 1.5 0 0 0 3 0" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {unreadCount > 0 && (
            <div style={{
              position: "absolute", top: "6px", right: "6px",
              width: "14px", height: "14px", borderRadius: "50%",
              background: "#f472b6",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #030107",
            }}>
              <span style={{ fontSize: "8px", fontWeight: 700, color: "#1a0a2e" }}>{unreadCount}</span>
            </div>
          )}
        </button>
      </div>

      {/* Scrollable content */}
      <div
        className="inner-scroll"
        style={{
          position: "absolute", inset: 0,
          overflowY: "auto", overflowX: "hidden",
          paddingTop: "111px",
          scrollbarWidth: "none",
        }}
      >
        {activeTab === "home" && <HomeTab onSelectPeer={onSelectDrop} onSelectActivity={onSelectDrop} />}
        {activeTab === "friends" && <FriendsTab onSelectPeer={onSelectDrop} />}
        {activeTab === "activities" && <ActivitiesTab onSelectActivity={onSelectDrop} />}
        {activeTab === "profile" && <ProfileTab />}
      </div>

      {showNotifs && <NotifPanel onClose={() => setShowNotifs(false)} />}

      <BottomTabBar active={activeTab} onSelect={(t) => setActiveTab(t)} />
    </div>
  );
}
