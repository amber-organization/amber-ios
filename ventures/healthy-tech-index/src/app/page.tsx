"use client";

import { useState } from "react";

const SAMPLE_RATINGS = [
  { name: "Instagram", score: 28, delta: -4, category: "Social", impact: "High addiction mechanics. Degrades sleep, FOMO, passive consumption." },
  { name: "Apple Health", score: 81, delta: +3, category: "Health", impact: "Passive health tracking with no engagement traps. Genuinely useful." },
  { name: "TikTok", score: 19, delta: -7, category: "Social", impact: "Highest dopamine manipulation of any app rated. Attention collapse risk." },
  { name: "Duolingo", score: 67, delta: +1, category: "Learning", impact: "Gamification is mild and goal-aligned. Streak anxiety is a real concern." },
  { name: "Amber", score: 94, delta: +6, category: "Health", impact: "Passive, no engagement tricks. The more you use it, the healthier you get." },
  { name: "X / Twitter", score: 22, delta: -5, category: "Social", impact: "Outrage optimization. Negative affect correlation is well-documented." },
];

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm font-mono font-semibold" style={{ color }}>{score}</span>
    </div>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans">
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-xl font-semibold tracking-tight text-white">
          Healthy <span className="text-[#22c55e]">Tech</span> Index
        </span>
        <a
          href="#waitlist"
          className="text-sm text-white/60 hover:text-white transition-colors border border-white/20 hover:border-white/40 px-4 py-1.5 rounded-full"
        >
          Get Early Access
        </a>
      </nav>

      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 px-3 py-1 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse" />
          Powered by Amber behavioral data
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
          Choose tech{" "}
          <span className="text-[#22c55e]">like you choose food.</span>
        </h1>
        <p className="text-lg sm:text-xl text-white/50 max-w-2xl mb-12 leading-relaxed">
          Every app and device rated by what it actually does to the people who use it. Not surveys. Real measured outcomes from Amber users: sleep, stress, relationships, attention, life satisfaction.
        </p>
      </section>

      {/* Sample ratings */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-6">Sample ratings</p>
        <div className="space-y-3">
          {SAMPLE_RATINGS.map((app) => (
            <div key={app.name} className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{app.name}</span>
                    <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{app.category}</span>
                    <span className={`text-xs font-mono ${app.delta > 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                      {app.delta > 0 ? "+" : ""}{app.delta}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mt-1 max-w-sm">{app.impact}</p>
                </div>
              </div>
              <ScoreBar score={app.score} />
            </div>
          ))}
        </div>
        <p className="text-xs text-white/20 mt-4 text-center">Scores 0–100. Based on aggregated Amber user outcomes. Updated monthly.</p>
      </section>

      {/* Why */}
      <section className="border-t border-white/5 max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-10">Why this exists</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { title: "Food has nutrition labels", body: "Technology has nothing. Every food product discloses what it does to your body. Every app should disclose what it does to your mind." },
            { title: "Not surveys — real outcomes", body: "Every other rating system asks people how they feel about an app. Healthy Tech Index measures what the app actually does to their sleep, stress, and relationships." },
            { title: "Market pressure works", body: "Once the standard becomes culturally legible, companies face real pressure to improve their scores. That is how you change an industry from the demand side." },
          ].map((item) => (
            <div key={item.title} className="space-y-3">
              <div className="w-8 h-px bg-[#22c55e]" />
              <h3 className="font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="border-t border-white/5 max-w-md mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Get notified when ratings go live</h2>
        <p className="text-sm text-white/40 mb-6">We&apos;ll send you the first batch of ratings before public launch.</p>
        {submitted ? (
          <div className="bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-2xl px-6 py-4 text-[#22c55e] text-sm">
            Thanks — you&apos;re on the list.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#22c55e]/60 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#22c55e] hover:bg-[#16a34a] text-black text-sm font-medium px-5 py-3 rounded-xl transition-colors whitespace-nowrap disabled:opacity-60"
            >
              {loading ? "..." : "Join waitlist"}
            </button>
          </form>
        )}
      </section>

      <footer className="border-t border-white/5 px-6 py-8 max-w-6xl mx-auto flex items-center justify-between">
        <span className="text-sm text-[#22c55e] font-medium">Healthy Tech Index</span>
        <span className="text-sm text-white/30">An Amber sub-venture · Built by Caleb Newton</span>
      </footer>
    </main>
  );
}
