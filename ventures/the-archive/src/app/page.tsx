"use client";

import { useState } from "react";

const EXTINCTION_EVENTS = [
  {
    year: "48 BC",
    name: "Library of Alexandria",
    loss: "An estimated 400,000 scrolls — the largest collection of human knowledge in the ancient world.",
    type: "Fire",
  },
  {
    year: "2009",
    name: "Geocities",
    loss: "38 million user-created web pages. An entire era of personal publishing, gone overnight.",
    type: "Shutdown",
  },
  {
    year: "2019",
    name: "MySpace Music",
    loss: "50 million songs from 14 million artists. A decade of indie music culture, irretrievably corrupted.",
    type: "Data loss",
  },
  {
    year: "2016",
    name: "Vine",
    loss: "200 million users, 6 years of a generation&apos;s creative expression. Deleted in a business decision.",
    type: "Shutdown",
  },
  {
    year: "2023",
    name: "Google Podcasts",
    loss: "Millions of podcast episodes across thousands of independent shows, wiped from Google&apos;s servers.",
    type: "Shutdown",
  },
];

const WHO_ITS_FOR = [
  { icon: "🏛", label: "Universities", desc: "Research archives, institutional records, rare collections" },
  { icon: "📚", label: "Libraries", desc: "Digital collections, historical documents, oral histories" },
  { icon: "🏛", label: "Governments", desc: "Legislative records, cultural heritage, public domain works" },
  { icon: "🎨", label: "Artists", desc: "Creative portfolios, master recordings, original works" },
  { icon: "🔬", label: "Researchers", desc: "Datasets, experimental results, methodological records" },
  { icon: "📰", label: "Media orgs", desc: "Journalism archives, photography, broadcast history" },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orgType, setOrgType] = useState("institution");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, orgType }),
      });
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  }

  return (
    <main className="min-h-screen" style={{ background: "#1c1917", color: "#fafaf9" }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto border-b sans" style={{ borderColor: "rgba(250,250,249,0.08)" }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: "#d97706" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: "Georgia, serif" }}>The Archive</span>
        </div>
        <a
          href="#preserve"
          className="text-sm sans font-medium transition-colors px-4 py-2 rounded-full border"
          style={{ borderColor: "#d97706", color: "#d97706" }}
        >
          Preserve your work
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <p className="text-xs sans font-semibold uppercase tracking-widest mb-10" style={{ color: "#d97706" }}>
          The permanent record
        </p>

        <h1 className="text-5xl sm:text-7xl font-bold leading-[1.05] mb-8" style={{ fontFamily: "Georgia, serif" }}>
          The internet forgets.{" "}
          <span style={{ color: "#d97706" }}>The Archive doesn&apos;t.</span>
        </h1>

        <blockquote className="text-base italic max-w-xl mx-auto mb-12" style={{ color: "rgba(250,250,249,0.5)" }}>
          &ldquo;How much of what we have made will the future have access to? At the rate we are going, the answer may be: almost none.&rdquo;
          <cite className="not-italic text-xs block mt-2" style={{ color: "rgba(250,250,249,0.3)" }}>
            — Brewster Kahle, founder of the Internet Archive
          </cite>
        </blockquote>

        <p className="text-lg sans max-w-2xl mx-auto leading-relaxed mb-14" style={{ color: "rgba(250,250,249,0.6)" }}>
          Every institution, artist, and researcher who trusts the cloud is trusting a business model.
          The Archive is the first preservation infrastructure built for permanence — not profits.
        </p>

        {/* Waitlist */}
        <div id="preserve" className="max-w-md mx-auto">
          {submitted ? (
            <div className="rounded-2xl px-6 py-5 sans" style={{ background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.3)", color: "#f59e0b" }}>
              Received. We will reach out to discuss your preservation needs.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOrgType("institution")}
                  className="flex-1 text-sm sans py-2.5 rounded-lg transition-all"
                  style={{
                    background: orgType === "institution" ? "#d97706" : "rgba(250,250,249,0.05)",
                    color: orgType === "institution" ? "#fff" : "rgba(250,250,249,0.5)",
                    border: `1px solid ${orgType === "institution" ? "#d97706" : "rgba(250,250,249,0.1)"}`,
                  }}
                >
                  Institution
                </button>
                <button
                  type="button"
                  onClick={() => setOrgType("creator")}
                  className="flex-1 text-sm sans py-2.5 rounded-lg transition-all"
                  style={{
                    background: orgType === "creator" ? "#d97706" : "rgba(250,250,249,0.05)",
                    color: orgType === "creator" ? "#fff" : "rgba(250,250,249,0.5)",
                    border: `1px solid ${orgType === "creator" ? "#d97706" : "rgba(250,250,249,0.1)"}`,
                  }}
                >
                  Creator
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 sans text-sm rounded-xl px-4 py-3.5 focus:outline-none transition-all"
                  style={{
                    background: "rgba(250,250,249,0.06)",
                    border: "1px solid rgba(250,250,249,0.12)",
                    color: "#fafaf9",
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="sans text-sm font-medium px-5 py-3.5 rounded-xl transition-colors whitespace-nowrap"
                  style={{ background: "#d97706", color: "#fff" }}
                >
                  {loading ? "..." : "Request access"}
                </button>
              </div>
            </form>
          )}
          <p className="text-xs sans mt-3" style={{ color: "rgba(250,250,249,0.25)" }}>
            Institutions and independent creators both qualify. TAM $12B. We are selective.
          </p>
        </div>
      </section>

      {/* Digital extinction timeline */}
      <section className="border-t py-20" style={{ borderColor: "rgba(250,250,249,0.06)" }}>
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs sans font-semibold uppercase tracking-widest mb-12" style={{ color: "rgba(250,250,249,0.3)" }}>
            A brief history of what we have lost
          </p>
          <div className="space-y-0">
            {EXTINCTION_EVENTS.map((event, i) => (
              <div
                key={event.name}
                className="flex gap-6 py-6 border-b"
                style={{ borderColor: "rgba(250,250,249,0.06)", animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-16 shrink-0">
                  <span className="text-sm sans font-mono" style={{ color: "#d97706" }}>{event.year}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-base" style={{ fontFamily: "Georgia, serif" }}>{event.name}</h3>
                    <span
                      className="text-xs sans px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(250,250,249,0.06)", color: "rgba(250,250,249,0.4)" }}
                    >
                      {event.type}
                    </span>
                  </div>
                  <p
                    className="text-sm sans leading-relaxed"
                    style={{ color: "rgba(250,250,249,0.5)" }}
                    dangerouslySetInnerHTML={{ __html: event.loss }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs sans mt-6 text-center" style={{ color: "rgba(250,250,249,0.2)" }}>
            This is not a list of accidents. It is the predictable outcome of building culture on infrastructure that was never designed to last.
          </p>
        </div>
      </section>

      {/* The solution */}
      <section className="py-20" style={{ background: "#292524" }}>
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs sans font-semibold uppercase tracking-widest mb-12" style={{ color: "rgba(250,250,249,0.3)" }}>
            How The Archive is different
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                ),
                title: "Triple-redundant physical storage",
                body: "Every deposit is stored across three independent physical locations on separate power grids. No single point of failure. No shared infrastructure with any cloud provider.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                ),
                title: "Cryptographic proof of preservation",
                body: "Every file is hashed at deposit. Periodic verification runs confirm integrity. Institutions receive cryptographic certificates proving their materials exist and are intact.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4l3 3"/>
                  </svg>
                ),
                title: "100-year preservation contracts",
                body: "Not a subscription. A contract with endowment-backed guarantees. The Archive is structured to survive the companies that fund it — including us.",
              },
            ].map((item) => (
              <div key={item.title} className="space-y-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(217,119,6,0.12)" }}>
                  {item.icon}
                </div>
                <h3 className="font-semibold" style={{ fontFamily: "Georgia, serif" }}>{item.title}</h3>
                <p className="text-sm sans leading-relaxed" style={{ color: "rgba(250,250,249,0.5)" }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it&apos;s for */}
      <section className="py-20 border-t" style={{ borderColor: "rgba(250,250,249,0.06)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs sans font-semibold uppercase tracking-widest mb-12" style={{ color: "rgba(250,250,249,0.3)" }}>
            Who The Archive is for
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {WHO_ITS_FOR.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl p-5"
                style={{ background: "rgba(250,250,249,0.03)", border: "1px solid rgba(250,250,249,0.07)" }}
              >
                <div className="text-2xl mb-3">{item.icon}</div>
                <div className="font-semibold text-sm mb-1" style={{ fontFamily: "Georgia, serif" }}>{item.label}</div>
                <div className="text-xs sans leading-relaxed" style={{ color: "rgba(250,250,249,0.4)" }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amber connection */}
      <section className="py-16" style={{ background: "#292524" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm sans leading-relaxed" style={{ color: "rgba(250,250,249,0.5)" }}>
            Built on the same infrastructure as Amber — the OS that never forgets who you are.
            The Archive applies the same principle to culture: the things humans make deserve
            the same permanence as the humans who made them.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sans" style={{ borderColor: "rgba(250,250,249,0.06)" }}>
        <span className="text-sm font-medium" style={{ color: "#d97706", fontFamily: "Georgia, serif" }}>The Archive</span>
        <span className="text-sm" style={{ color: "rgba(250,250,249,0.3)" }}>An Amber sub-venture &middot; Built by Caleb Newton</span>
      </footer>
    </main>
  );
}
