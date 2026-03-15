"use client";
import { useState, useEffect } from "react";

function liveTime(): string {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m} ${period}`;
}

export default function StatusBar({ time }: { time?: string }) {
  const [display, setDisplay] = useState(time ?? liveTime());
  useEffect(() => {
    if (time) return; // static override
    const tick = () => setDisplay(liveTime());
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [time]);

  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: "59px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 22px", zIndex: 50, pointerEvents: "none",
      background: "#040407",
    }}>
      <span style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.01em", fontFamily: "var(--font-inter), sans-serif" }}>
        {display}
      </span>
      <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
          <path d="M8 10.5 a0.75 0.75 0 1 1 0-0.01Z" fill="rgba(255,255,255,0.8)" />
          <path d="M5.5 8.2C6.2 7.5 7.05 7.1 8 7.1s1.8.4 2.5 1.1" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M3 5.8C4.4 4.4 6.1 3.6 8 3.6s3.6.8 5 2.2" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M0.8 3.4C2.7 1.4 5.2 0.2 8 0.2s5.3 1.2 7.2 3.2" stroke="rgba(255,255,255,0.65)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        {/* Battery */}
        <div aria-hidden="true" style={{ width: "25px", height: "13px", border: "1.5px solid rgba(255,255,255,0.6)", borderRadius: "3px", position: "relative", display: "flex", alignItems: "center", padding: "1.5px" }}>
          <div style={{ position: "absolute", right: "-4px", top: "50%", transform: "translateY(-50%)", width: "2px", height: "6px", background: "rgba(255,255,255,0.5)", borderRadius: "0 1px 1px 0" }} />
          <div style={{ height: "100%", width: "72%", background: "rgba(255,255,255,0.85)", borderRadius: "1.5px" }} />
        </div>
      </div>
    </div>
  );
}
