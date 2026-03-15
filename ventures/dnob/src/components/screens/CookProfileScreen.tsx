"use client";

import { useState } from "react";
import StatusBar from "@/components/ui/StatusBar";
import BackButton from "@/components/ui/BackButton";

interface CookProfileScreenProps {
  cookId: string;
  onBack: () => void;
  onOrderFromCook: (activityId: string) => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

interface PeerProfile {
  initials: string;
  name: string;
  age: number;
  hospital: string;
  room: string;
  color: string;
  bio: string;
  interests: string[];
  mutualFriends: number;
  recentActivity: { id: string; text: string; time: string }[];
}

function getProfile(cookId: string): PeerProfile {
  const PROFILES: Record<string, PeerProfile> = {
    peer1: {
      initials: "MK", name: "Maya", age: 11,
      hospital: "Children's Hospital Los Angeles", room: "Room 3C",
      color: "#a855f7",
      bio: "loves minecraft and has 2 cats. currently binge-watching Avatar the Last Airbender for the 4th time.",
      interests: ["Gaming", "Drawing", "Cats", "Avatar", "Minecraft"],
      mutualFriends: 2,
      recentActivity: [
        { id: "act1", text: "Joined Movie Night", time: "Yesterday" },
        { id: "act2", text: "Won 3 rounds of Uno", time: "2 days ago" },
        { id: "act3", text: "Joined Art Circle", time: "Last week" },
      ],
    },
    peer2: {
      initials: "JR", name: "Jordan", age: 12,
      hospital: "UCLA Mattel Children's Hospital", room: "Room 7A",
      color: "#3b82f6",
      bio: "super into Minecraft redstone, loves dogs, and is learning guitar in the hospital music room.",
      interests: ["Minecraft", "Guitar", "Dogs", "Lego", "Music"],
      mutualFriends: 1,
      recentActivity: [
        { id: "act2", text: "Joined Game Hour", time: "Today" },
        { id: "act1", text: "Shared a playlist", time: "3 days ago" },
        { id: "act3", text: "Won at chess", time: "Last week" },
      ],
    },
  };
  return PROFILES[cookId] ?? PROFILES["peer1"];
}

export default function CookProfileScreen({ cookId, onBack, onOrderFromCook }: CookProfileScreenProps) {
  const [friendAdded, setFriendAdded] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const profile = getProfile(cookId);

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
          paddingTop: "59px", paddingBottom: "80px",
          scrollbarWidth: "none",
        }}
      >
        {/* Back */}
        <div style={{ padding: "10px 20px 4px" }}>
          <BackButton onBack={onBack} label="Back" />
        </div>

        {/* Hero */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 20px 0", textAlign: "center" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: profile.color + "40", border: `3px solid ${profile.color}60`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 32px ${profile.color}44`,
          }}>
            <span style={{ fontSize: "22px", fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "0.04em", lineHeight: 1 }}>{profile.initials}</span>
          </div>

          <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.025em", marginTop: "12px", lineHeight: 1.15 }}>
            {profile.name}, {profile.age}
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", marginTop: "4px" }}>
            {profile.hospital}
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
            {profile.room}
          </div>

          {/* Mutual friends */}
          <div style={{
            marginTop: "10px",
            display: "inline-flex", alignItems: "center", gap: "5px",
            background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.18)",
            borderRadius: "100px", padding: "4px 12px",
          }}>
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
              <circle cx="4" cy="4" r="2.5" stroke="rgba(244,114,182,0.75)" strokeWidth="1.2" />
              <circle cx="9" cy="4" r="2" stroke="rgba(244,114,182,0.55)" strokeWidth="1.2" />
            </svg>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(244,114,182,0.85)" }}>
              {profile.mutualFriends} mutual {profile.mutualFriends === 1 ? "friend" : "friends"}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "8px", padding: "16px 20px 0", justifyContent: "center" }}>
          <button
            onClick={() => setMessageSent(true)}
            style={{
              flex: 1, maxWidth: "160px", height: "44px",
              background: messageSent ? "rgba(244,114,182,0.1)" : "linear-gradient(135deg, #f472b6, #e879f9)",
              border: messageSent ? "1px solid rgba(244,114,182,0.25)" : "none",
              borderRadius: "12px", cursor: "pointer",
              fontSize: "13px", fontWeight: 700,
              color: messageSent ? "rgba(244,114,182,0.85)" : "#1a0a2e",
              fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}
          >
            {messageSent ? (
              <>
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Sent!
              </>
            ) : "Send Message"}
          </button>
          <button
            onClick={() => setFriendAdded(true)}
            style={{
              flex: 1, maxWidth: "160px", height: "44px",
              background: friendAdded ? "rgba(167,139,250,0.1)" : "rgba(255,255,255,0.06)",
              border: friendAdded ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px", cursor: friendAdded ? "default" : "pointer",
              fontSize: "13px", fontWeight: 600,
              color: friendAdded ? "rgba(167,139,250,0.85)" : "rgba(255,255,255,0.65)",
              fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
            }}
          >
            {friendAdded ? (
              <>
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Friends
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                Add Friend
              </>
            )}
          </button>
        </div>

        {/* Bio */}
        <div style={{ margin: "20px 16px 0" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
            About {profile.name}
          </div>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.65, margin: 0 }}>
            {profile.bio}
          </p>
        </div>

        {/* Interests */}
        <div style={{ margin: "18px 16px 0" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
            Interests
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {profile.interests.map((i) => (
              <span key={i} style={{
                background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.2)",
                borderRadius: "100px", padding: "5px 12px",
                fontSize: "12px", color: "rgba(244,114,182,0.9)", fontWeight: 600,
              }}>{i}</span>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ margin: "20px 16px 0" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
            Recent Activity
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {profile.recentActivity.map((act) => (
              <button
                key={act.id}
                onClick={() => onOrderFromCook(act.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "12px", padding: "12px 13px",
                  cursor: "pointer", textAlign: "left", width: "100%",
                  fontFamily: "var(--font-dm-sans), var(--font-inter), sans-serif",
                  transition: "background 0.12s ease",
                }}
                onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,114,182,0.06)"; }}
                onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                onTouchStart={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,114,182,0.06)"; }}
                onTouchEnd={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
              >
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(244,114,182,0.5)", flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: "13px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{act.text}</span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{act.time}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: "40px" }} />
      </div>
    </div>
  );
}
