"use client";

import { useState } from "react";

function StatCard({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="text-3xl font-bold text-emerald-600 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-800">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function SignalRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
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
    <main className="min-h-screen" style={{ background: "#f9fafb" }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-900 tracking-tight">Wellbeing</span>
        </div>
        <a
          href="#waitlist"
          className="text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors px-4 py-2 rounded-full"
        >
          Get early access
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full mb-8 font-medium">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" style={{ animation: "pulse 2s ease-in-out infinite" }} />
          Built on the Amber health graph
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6">
          Your mind has patterns.{" "}
          <span className="text-emerald-500">Amber reads them.</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-12">
          A brain health platform that tracks psychological wellbeing the way Amber tracks physical health —
          and catches the earliest signs of cognitive decline up to 20 years before clinical diagnosis.
        </p>

        <div id="waitlist" className="max-w-md mx-auto">
          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-5 text-emerald-700 font-medium">
              You&apos;re on the list. We&apos;ll be in touch early.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-5 py-3.5 rounded-xl transition-colors whitespace-nowrap disabled:opacity-60"
              >
                {loading ? "..." : "Get early access"}
              </button>
            </form>
          )}
          <p className="text-xs text-gray-400 mt-3">No spam. Early access only. Amber ecosystem users get priority.</p>
        </div>
      </section>

      {/* Two products */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-10 text-center">Two layers. One platform.</p>
        <div className="grid md:grid-cols-2 gap-6">

          {/* Mental health layer */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Mental Health Layer</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Tracks which relationships, environments, and daily habits lift you up versus drain you.
              Built from Amber&apos;s existing relationship and behavioral graph — no new inputs required.
            </p>
            <div className="bg-gray-50 rounded-2xl p-4">
              <SignalRow label="Mood score (7-day avg)" value="72 / 100" color="text-emerald-600" />
              <SignalRow label="Social fulfillment" value="High" color="text-emerald-600" />
              <SignalRow label="Stress indicators" value="Moderate" color="text-amber-500" />
              <SignalRow label="Draining relationships" value="2 flagged" color="text-red-400" />
            </div>
          </div>

          {/* Early detection */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Early Detection</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Alzheimer&apos;s and dementia begin silently — 20 years before any clinical symptom. Wellbeing monitors the
              subtle behavioral signals that precede diagnosis: typing rhythm, sleep fragmentation, language complexity, social withdrawal.
            </p>
            <div className="bg-gray-50 rounded-2xl p-4">
              <SignalRow label="Cognitive baseline" value="Established" color="text-emerald-600" />
              <SignalRow label="Typing rhythm variance" value="Normal range" color="text-emerald-600" />
              <SignalRow label="Sleep fragmentation" value="Slight increase" color="text-amber-500" />
              <SignalRow label="Language complexity" value="Stable" color="text-emerald-600" />
            </div>
          </div>
        </div>
      </section>

      {/* Why now — stats */}
      <section className="border-t border-gray-100 bg-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-10 text-center">The scale of the problem</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value="55M" label="People with dementia" sub="Worldwide, today" />
            <StatCard value="20 yrs" label="Before diagnosis" sub="Alzheimer's begins silently" />
            <StatCard value="1 in 5" label="Adults" sub="Has a diagnosable mental health condition" />
            <StatCard value="$235B" label="TAM" sub="Mental health + cognitive care market" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-10">How it works</p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Amber already has the data",
              body: "Sleep patterns, activity levels, communication frequency, social connections, stress markers — Amber collects it passively across your entire health graph.",
            },
            {
              step: "02",
              title: "Wellbeing is the interpretation layer",
              body: "Rather than collecting new data, Wellbeing analyzes what Amber already knows. It surfaces patterns that aren't visible in any single dimension — only in the aggregate.",
            },
            {
              step: "03",
              title: "Continuous monitoring",
              body: "Baselines are established over 90 days, then Wellbeing monitors for deviations. Significant changes trigger a private report — not an alarm, a conversation.",
            },
          ].map((item) => (
            <div key={item.step} className="space-y-3">
              <div className="text-xs font-mono text-emerald-500 font-semibold">{item.step}</div>
              <div className="w-8 h-0.5 bg-emerald-200" />
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Moat statement */}
      <section className="bg-emerald-600 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-4">
            No app has both layers at once.
          </h2>
          <p className="text-emerald-100 text-base leading-relaxed">
            That&apos;s exactly why Wellbeing can see what no one else can. Every standalone mental health app is missing
            the relationship graph. Every cognitive screening tool is missing the behavioral baseline. Wellbeing is the
            first platform that has both — because Amber is the only OS that tracks both.
          </p>
        </div>
      </section>

      {/* Second waitlist CTA */}
      <section className="max-w-md mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Join the waitlist</h2>
        <p className="text-sm text-gray-400 mb-8">
          Early access opens to Amber ecosystem users first. Be among the first to see your wellbeing graph.
        </p>
        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-5 text-emerald-700 font-medium">
            You&apos;re already on the list.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-5 py-3.5 rounded-xl transition-colors whitespace-nowrap disabled:opacity-60"
            >
              {loading ? "..." : "Join waitlist"}
            </button>
          </form>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <span className="text-sm font-medium text-emerald-600">Wellbeing</span>
        </div>
        <span className="text-sm text-gray-400">An Amber sub-venture &middot; Built by Caleb Newton</span>
      </footer>
    </main>
  );
}
