"use client";

import { useState } from "react";

type Tab = "mental" | "cognitive";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [tab, setTab] = useState<Tab>("mental");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-xl font-semibold tracking-tight text-[#a78bfa]">stillness</span>
        <a
          href="#waitlist"
          className="text-sm text-white/60 hover:text-white transition-colors border border-white/20 hover:border-white/40 px-4 py-1.5 rounded-full"
        >
          Get Early Access
        </a>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs text-[#a78bfa] bg-[#a78bfa]/10 border border-[#a78bfa]/20 px-3 py-1 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-[#a78bfa] rounded-full animate-pulse" />
          Powered by Amber
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
          The brain health platform{" "}
          <span className="text-[#a78bfa]">that actually sees you.</span>
        </h1>
        <p className="text-lg sm:text-xl text-white/50 max-w-2xl mb-10 leading-relaxed">
          Stillness tracks your psychological state and watches for early signs of cognitive decline — using the same relationship and health graph that Amber already knows about you. Two problems. One platform.
        </p>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 mb-12">
          {(["mental", "cognitive"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t
                  ? "bg-[#a78bfa] text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {t === "mental" ? "Mental Health" : "Cognitive Health"}
            </button>
          ))}
        </div>

        {tab === "mental" ? (
          <div className="grid sm:grid-cols-3 gap-6 text-left w-full mb-12">
            {[
              { title: "Which relationships lift you up", body: "Stillness correlates your mood data with your relationship graph and shows you the patterns your therapist never sees." },
              { title: "What actually moves the needle", body: "Sleep, movement, social time, screen use — Stillness shows which ones actually predict how you feel, not which ones you think do." },
              { title: "Before it becomes a crisis", body: "Most mental health tools are reactive. Stillness is proactive — it surfaces patterns weeks before you would notice them yourself." },
            ].map((item) => (
              <div key={item.title} className="bg-white/3 border border-white/8 rounded-2xl p-5 space-y-3">
                <div className="w-6 h-px bg-[#a78bfa]" />
                <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-6 text-left w-full mb-12">
            {[
              { title: "20 years before diagnosis", body: "Alzheimer's begins two decades before symptoms appear. The behavioral signals — typing rhythm, sleep fragmentation, word retrieval — are there long before any test catches them." },
              { title: "Passive, continuous detection", body: "Stillness watches how you communicate, sleep, move, and engage with the people in your life. The patterns that precede cognitive decline show up across all of these at once." },
              { title: "Give your family time", body: "Early detection means preparation, options, and more years of connection. Stillness gives you that time back." },
            ].map((item) => (
              <div key={item.title} className="bg-white/3 border border-white/8 rounded-2xl p-5 space-y-3">
                <div className="w-6 h-px bg-[#a78bfa]" />
                <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        )}

        <div id="waitlist" className="w-full max-w-md">
          {submitted ? (
            <div className="bg-[#a78bfa]/10 border border-[#a78bfa]/30 rounded-2xl px-6 py-4 text-[#a78bfa] text-sm">
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
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#a78bfa]/60 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
              className="bg-[#a78bfa] hover:bg-[#9061f9] text-white text-sm font-medium px-5 py-3 rounded-xl transition-colors whitespace-nowrap disabled:opacity-60"
              >
                {loading ? "..." : "Join waitlist"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-white/5 max-w-4xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-3 gap-8 text-center">
          {[
            { n: "1 in 5", label: "adults has a diagnosable mental health condition" },
            { n: "55M", label: "people living with dementia today" },
            { n: "20 years", label: "before dementia is detectable by current methods" },
          ].map((s) => (
            <div key={s.n} className="space-y-2">
              <div className="text-3xl font-bold text-[#a78bfa]">{s.n}</div>
              <div className="text-sm text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 max-w-6xl mx-auto flex items-center justify-between">
        <span className="text-sm text-[#a78bfa] font-medium">stillness</span>
        <span className="text-sm text-white/30">An Amber sub-venture · Built by Caleb Newton</span>
      </footer>
    </main>
  );
}
