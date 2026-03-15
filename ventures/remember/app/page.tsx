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
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-xl font-semibold tracking-tight text-[#f59e0b]">remember</span>
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
          Research-backed early detection
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
          Catch cognitive decline{" "}
          <span className="text-[#f59e0b]">years before</span>{" "}
          symptoms appear.
        </h1>
        <p className="text-lg sm:text-xl text-white/50 max-w-2xl mb-12 leading-relaxed">
          Remember analyzes subtle behavioral patterns — typing rhythm, sleep, language — to detect early signs of Alzheimer&apos;s and dementia before a diagnosis is possible any other way.
        </p>

        <div id="waitlist" className="w-full max-w-md">
          {submitted ? (
            <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-2xl px-6 py-4 text-[#f59e0b] text-sm">
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
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#f59e0b]/60 transition-all"
              />
              <button
                type="submit"
                className="bg-[#f59e0b] hover:bg-[#d97706] text-black text-sm font-medium px-5 py-3 rounded-xl transition-colors whitespace-nowrap"
              >
                Join waitlist
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-white/5">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-12">Why it matters</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              title: "By the time symptoms show, it's late",
              body: "Alzheimer's begins 20 years before diagnosis. The window for meaningful intervention is now, not later.",
            },
            {
              title: "Passive data is already there",
              body: "How you type, sleep, move, and communicate — these patterns shift years before cognitive tests catch anything.",
            },
            {
              title: "Give families time",
              body: "Early detection means preparation, options, and more years of connection. Remember gives you that time back.",
            },
          ].map((item) => (
            <div key={item.title} className="space-y-3">
              <div className="w-8 h-px bg-[#f59e0b]" />
              <h3 className="font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 py-8 max-w-6xl mx-auto flex items-center justify-between">
        <span className="text-sm text-[#f59e0b] font-medium">remember</span>
        <span className="text-sm text-white/30">Coming soon · Built by Caleb Newton</span>
      </footer>
    </main>
  );
}
