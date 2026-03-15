"use client";

import { useState } from "react";

const RATINGS = [
  {
    name: "Instagram",
    score: 28,
    delta: -4,
    category: "Social",
    impact: "High addiction mechanics. Sleep disruption, FOMO loops, passive consumption spiral.",
    certified: false,
  },
  {
    name: "TikTok",
    score: 19,
    delta: -7,
    category: "Social",
    impact: "Highest dopamine manipulation of any app rated. Attention collapse risk. Average session 95 min.",
    certified: false,
  },
  {
    name: "X / Twitter",
    score: 22,
    delta: -5,
    category: "Social",
    impact: "Outrage optimization. Chronic negative affect correlation is well-documented across three studies.",
    certified: false,
  },
  {
    name: "Duolingo",
    score: 67,
    delta: +1,
    category: "Learning",
    impact: "Gamification is mild and goal-aligned. Streak anxiety is a real but manageable concern.",
    certified: true,
  },
  {
    name: "Apple Health",
    score: 81,
    delta: +3,
    category: "Health",
    impact: "Passive tracking with no engagement traps. Genuinely useful. Low distraction footprint.",
    certified: true,
  },
  {
    name: "Amber",
    score: 94,
    delta: +6,
    category: "Health",
    impact: "Passive, no engagement tricks. No notifications designed to pull you back. Health improves with use.",
    certified: true,
  },
];

const SENTINEL_TIERS = [
  {
    level: "Bronze",
    color: "#cd7f32",
    desc: "Basic safety audit. No critical findings. Suitable for internal disclosure.",
    requirements: ["No deceptive design patterns", "Data handling transparency", "User deletion compliance"],
  },
  {
    level: "Silver",
    color: "#9ca3af",
    desc: "Intermediate audit. Bias testing, adversarial probing, third-party review.",
    requirements: ["All Bronze requirements", "Bias evaluation across demographics", "Adversarial prompt resistance", "Incident response plan"],
  },
  {
    level: "Gold",
    color: "#d97706",
    desc: "Full certification. Suitable for regulatory filings and enterprise procurement.",
    requirements: ["All Silver requirements", "Annual re-certification", "Public transparency report", "Third-party pentest", "Board-level AI governance"],
  },
];

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-3 mt-3">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-mono font-semibold w-8 text-right" style={{ color }}>{score}</span>
    </div>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"hti" | "sentinel">("hti");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, product: activeTab }),
      });
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  }

  return (
    <main className="min-h-screen" style={{ background: "#0a0a0a", color: "#fff" }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto border-b sticky top-0 z-10" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0a0a0a" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: "#22c55e" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">Verify</span>
        </div>

        {/* Tab switcher */}
        <div className="hidden sm:flex items-center gap-1 rounded-full p-1" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => setActiveTab("hti")}
            className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
            style={{
              background: activeTab === "hti" ? "#22c55e" : "transparent",
              color: activeTab === "hti" ? "#000" : "rgba(255,255,255,0.5)",
            }}
          >
            Healthy Tech Index
          </button>
          <button
            onClick={() => setActiveTab("sentinel")}
            className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
            style={{
              background: activeTab === "sentinel" ? "#22c55e" : "transparent",
              color: activeTab === "sentinel" ? "#000" : "rgba(255,255,255,0.5)",
            }}
          >
            Sentinel
          </button>
        </div>

        <a
          href="#waitlist"
          className="text-sm font-medium text-black px-4 py-2 rounded-full transition-colors"
          style={{ background: "#22c55e" }}
        >
          Get early access
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-8" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e", animation: "pulse 2s ease-in-out infinite" }} />
          Two products. One standard.
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
          Technology without accountability{" "}
          <span style={{ color: "#22c55e" }}>is the tobacco industry of our time.</span>
        </h1>

        <p className="text-lg max-w-2xl mx-auto leading-relaxed mb-12" style={{ color: "rgba(255,255,255,0.5)" }}>
          Verify runs two programs: the <strong className="text-white">Healthy Tech Index</strong> — every app rated by what it actually does to people —
          and <strong className="text-white">Sentinel</strong> — the first credible, data-backed AI safety certification for enterprises and regulators.
        </p>

        {/* Mobile tab switcher */}
        <div className="flex sm:hidden items-center gap-1 rounded-full p-1 mb-8 mx-auto w-fit" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => setActiveTab("hti")}
            className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
            style={{
              background: activeTab === "hti" ? "#22c55e" : "transparent",
              color: activeTab === "hti" ? "#000" : "rgba(255,255,255,0.5)",
            }}
          >
            Healthy Tech Index
          </button>
          <button
            onClick={() => setActiveTab("sentinel")}
            className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
            style={{
              background: activeTab === "sentinel" ? "#22c55e" : "transparent",
              color: activeTab === "sentinel" ? "#000" : "rgba(255,255,255,0.5)",
            }}
          >
            Sentinel
          </button>
        </div>
      </section>

      {/* Healthy Tech Index section */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
            Healthy Tech Index
          </p>
        </div>
        <h2 className="text-2xl font-bold mb-3">Every app rated by real outcomes.</h2>
        <p className="text-sm mb-8 max-w-2xl leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
          Not surveys. Real measured outcomes from Amber users: sleep disruption, stress levels, relationship quality,
          attention span, life satisfaction. Updated monthly.
        </p>

        <div className="space-y-3">
          {RATINGS.map((app) => (
            <div
              key={app.name}
              className="rounded-2xl p-5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{app.name}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
                    >
                      {app.category}
                    </span>
                    <span className={`text-xs font-mono ${app.delta > 0 ? "text-green-400" : "text-red-400"}`}>
                      {app.delta > 0 ? "+" : ""}{app.delta} this month
                    </span>
                    {app.certified && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1 max-w-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>{app.impact}</p>
                </div>
              </div>
              <ScoreBar score={app.score} />
            </div>
          ))}
        </div>

        <p className="text-xs mt-4 text-center" style={{ color: "rgba(255,255,255,0.2)" }}>
          Scores 0–100. Based on aggregated Amber user outcomes across sleep, stress, attention, and relationships.
          Sample shown. Not surveys — real measured outcomes.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>

      {/* Sentinel section */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
            Sentinel
          </p>
        </div>
        <h2 className="text-2xl font-bold mb-3">Independent AI safety auditing.</h2>
        <p className="text-sm mb-12 max-w-2xl leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
          The first credible, data-backed AI safety standard for enterprises and regulators.
          Not self-reported. Not checkbox compliance. Real audits, real findings, real certificates.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {SENTINEL_TIERS.map((tier) => (
            <div
              key={tier.level}
              className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.07)` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${tier.color}22`, border: `1px solid ${tier.color}55` }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tier.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <span className="font-semibold text-sm" style={{ color: tier.color }}>{tier.level}</span>
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>{tier.desc}</p>
              <ul className="space-y-1.5">
                {tier.requirements.map((req) => (
                  <li key={req} className="flex items-start gap-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-6" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { label: "Target", value: "Fortune 500 + Regulators" },
              { label: "TAM", value: "$36B" },
              { label: "SOM", value: "$340M" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-xl font-bold" style={{ color: "#22c55e" }}>{stat.value}</div>
                <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it works */}
      <section className="border-t py-16" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-10" style={{ color: "rgba(255,255,255,0.3)" }}>Why it works</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                title: "Food has nutrition labels",
                body: "Every food product discloses what it does to your body. Every app should disclose what it does to your mind. Verify builds that standard.",
              },
              {
                title: "Not surveys — real outcomes",
                body: "Every other rating system asks people how they feel. Verify measures what technology actually does to sleep, stress, relationships, and attention — from Amber&apos;s behavioral data.",
              },
              {
                title: "Market pressure works",
                body: "Once the standard becomes culturally legible, companies face real pressure to improve their scores. That is how you change an industry from the demand side.",
              },
            ].map((item) => (
              <div key={item.title} className="space-y-3">
                <div className="w-8 h-px" style={{ background: "#22c55e" }} />
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}
                  dangerouslySetInnerHTML={{ __html: item.body }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Healthy Tech Index reference */}
      <section className="border-t py-12" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs leading-relaxed text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
            The Healthy Tech Index also has a standalone product page at{" "}
            <a href="#" className="underline" style={{ color: "rgba(255,255,255,0.5)" }}>healthy-tech-index.amber.health</a>.
            Verify is the combined brand — HTI + Sentinel — operating under one mission: accountability for technology.
          </p>
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="max-w-md mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold mb-3">Get early access</h2>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
          We are onboarding the first batch of apps for HTI ratings and the first five Sentinel audits.
        </p>
        {submitted ? (
          <div className="rounded-2xl px-6 py-5 text-sm font-medium" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" }}>
            You&apos;re on the list. We&apos;ll be in touch.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 text-sm rounded-xl px-4 py-3.5 focus:outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "#fff",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="text-sm font-medium text-black px-5 py-3.5 rounded-xl transition-colors whitespace-nowrap disabled:opacity-60"
              style={{ background: "#22c55e" }}
            >
              {loading ? "..." : "Join waitlist"}
            </button>
          </form>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "#22c55e" }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>
          <span className="text-sm font-medium" style={{ color: "#22c55e" }}>Verify</span>
        </div>
        <span className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>An Amber sub-venture &middot; Built by Caleb Newton</span>
      </footer>
    </main>
  );
}
