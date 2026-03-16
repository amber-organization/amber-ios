"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

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
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-xl font-semibold tracking-tight text-white">
          Life Plan <span className="text-[#f59e0b]">Assistant</span>
        </span>
        <a
          href="#waitlist"
          className="text-sm text-white/60 hover:text-white transition-colors border border-white/20 hover:border-white/40 px-4 py-1.5 rounded-full"
        >
          Get Early Access
        </a>
      </nav>

      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-3 py-1 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full animate-pulse" />
          Powered by Amber · Part of FiduciaryOS
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
          You are 22.{" "}
          <span className="text-[#f59e0b]">No one has given you a real plan.</span>
        </h1>
        <p className="text-lg sm:text-xl text-white/50 max-w-2xl mb-12 leading-relaxed">
          Life Plan Assistant maps your personality, values, and goals into a structured career path, learning roadmap, and daily habits. Amber already knows who you are. This turns that knowledge into a plan you can actually execute.
        </p>

        <div className="grid sm:grid-cols-3 gap-6 text-left w-full mb-12">
          {[
            {
              title: "It figures out who you are first",
              body: "Generic career tools ask what you want. Life Plan Assistant starts with who you are — personality, values, relationship patterns, health data — and builds the plan from there.",
            },
            {
              title: "Specific, not generic",
              body: "Not 'consider a career in tech.' A concrete roadmap: what to learn, in what order, for which role, at which companies, with which people in your network as the path in.",
            },
            {
              title: "Gets more accurate over time",
              body: "Every memory Amber stores about you makes the plan sharper. The longer you use it, the more precisely it reflects who you actually are — not who you thought you were at 22.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-white/3 border border-white/8 rounded-2xl p-5 space-y-3">
              <div className="w-6 h-px bg-[#f59e0b]" />
              <h3 className="font-semibold text-white text-sm">{item.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>

        <div id="waitlist" className="w-full max-w-md">
          {submitted ? (
            <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-2xl px-6 py-4 text-[#f59e0b] text-sm">
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
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#f59e0b]/60 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#f59e0b] hover:bg-[#d97706] text-black text-sm font-medium px-5 py-3 rounded-xl transition-colors whitespace-nowrap disabled:opacity-60"
              >
                {loading ? "..." : "Join waitlist"}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 py-8 max-w-6xl mx-auto flex items-center justify-between">
        <span className="text-sm text-[#f59e0b] font-medium">Life Plan Assistant</span>
        <span className="text-sm text-white/30">An Amber sub-venture · Built by Caleb Newton</span>
      </footer>
    </main>
  );
}
