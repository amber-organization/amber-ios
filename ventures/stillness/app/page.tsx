"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs text-[#a78bfa] bg-[#a78bfa]/10 border border-[#a78bfa]/20 px-3 py-1 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-[#a78bfa] rounded-full animate-pulse" />
          Now in private beta
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
          Track what actually{" "}
          <span className="text-[#a78bfa]">affects</span>{" "}
          your mental health.
        </h1>
        <p className="text-lg sm:text-xl text-white/50 max-w-2xl mb-12 leading-relaxed">
          Stillness connects your daily patterns — sleep, movement, social time, screen use — and shows you what actually moves the needle on how you feel.
        </p>

        <div id="waitlist" className="w-full max-w-md">
          {submitted ? (
            <div className="bg-[#a78bfa]/10 border border-[#a78bfa]/30 rounded-2xl px-6 py-4 text-[#a78bfa] text-sm">
              Thanks — we&apos;ll be in touch.
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
                className="bg-[#a78bfa] hover:bg-[#9061f9] text-white text-sm font-medium px-5 py-3 rounded-xl transition-colors whitespace-nowrap"
              >
                Join waitlist
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Why it matters */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-white/5">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-12">Why it matters</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              title: "Mental health is invisible",
              body: "Therapy helps, but it's one hour a week. The other 167 hours? You're flying blind.",
            },
            {
              title: "Patterns hide in plain sight",
              body: "Your 3pm slumps, your best sleep, your social energy — the data is there. Nobody's connecting the dots.",
            },
            {
              title: "You deserve clarity",
              body: "Not a mood journal. Not a meditation timer. Real insight into what makes you feel like yourself.",
            },
          ].map((item) => (
            <div key={item.title} className="space-y-3">
              <div className="w-8 h-px bg-[#a78bfa]" />
              <h3 className="font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 max-w-6xl mx-auto flex items-center justify-between">
        <span className="text-sm text-[#a78bfa] font-medium">stillness</span>
        <span className="text-sm text-white/30">Coming soon · Built by Caleb Newton</span>
      </footer>
    </main>
  );
}
