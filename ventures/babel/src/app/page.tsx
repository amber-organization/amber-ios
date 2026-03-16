"use client";

import { useState } from "react";

const CONVERSATION = [
  {
    id: 1,
    speaker: "Sofia",
    lang: "es",
    original: "¿Cómo te sientes hoy?",
    translated: "How are you feeling today?",
    avatar: "S",
    avatarColor: "#6366f1",
    side: "left" as const,
  },
  {
    id: 2,
    speaker: "You",
    lang: "en",
    original: "Really good, actually. I just got some exciting news.",
    translated: "La verdad es que muy bien. Acabo de recibir una buena noticia.",
    avatar: "Y",
    avatarColor: "#8b5cf6",
    side: "right" as const,
  },
  {
    id: 3,
    speaker: "Sofia",
    lang: "es",
    original: "¡Qué bueno! Cuéntame todo.",
    translated: "That's great! Tell me everything.",
    avatar: "S",
    avatarColor: "#6366f1",
    side: "left" as const,
  },
  {
    id: 4,
    speaker: "You",
    lang: "en",
    original: "We should celebrate. Are you free this weekend?",
    translated: "Deberíamos celebrarlo. ¿Estás libre este fin de semana?",
    avatar: "Y",
    avatarColor: "#8b5cf6",
    side: "right" as const,
  },
];

function ChatBubble({ msg, delay }: { msg: typeof CONVERSATION[0]; delay: string }) {
  const isRight = msg.side === "right";
  return (
    <div
      className={`bubble-in-${delay}`}
      style={{
        display: "flex",
        flexDirection: isRight ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 10,
        marginBottom: 16,
      }}
    >
      <div style={{
        width: 32, height: 32,
        borderRadius: "50%",
        backgroundColor: msg.avatarColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, flexShrink: 0,
      }}>{msg.avatar}</div>
      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 4, alignItems: isRight ? "flex-end" : "flex-start" }}>
        <div style={{
          padding: "12px 16px",
          borderRadius: isRight ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          backgroundColor: isRight ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.07)",
          border: `1px solid ${isRight ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.1)"}`,
          fontSize: 14,
          lineHeight: 1.5,
        }}>
          <div style={{ marginBottom: 6 }}>{msg.original}</div>
          <div style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.45)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 6,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <span style={{
              padding: "1px 6px",
              borderRadius: 4,
              backgroundColor: "rgba(99,102,241,0.2)",
              fontSize: 10,
              fontWeight: 700,
              color: "#818cf8",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>{msg.lang}</span>
            {msg.translated}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BabelLanding() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Try again.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: "#05050f", minHeight: "100vh", color: "#fff" }}>

      {/* Nav */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 40px",
        borderBottom: "1px solid rgba(99,102,241,0.1)",
        position: "sticky",
        top: 0,
        backgroundColor: "rgba(5,5,15,0.9)",
        backdropFilter: "blur(12px)",
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700,
          }}>B</div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>Babel</span>
        </div>
        <a
          href="#waitlist"
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          Get early access
        </a>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "80px 24px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "clamp(40px, 6vw, 80px)",
        alignItems: "center",
      }}>
        <div>
          <div className="fade-up" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 100,
            border: "1px solid rgba(99,102,241,0.25)",
            backgroundColor: "rgba(99,102,241,0.06)",
            fontSize: 13,
            color: "#818cf8",
            marginBottom: 28,
            fontWeight: 500,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              backgroundColor: "#6366f1",
              boxShadow: "0 0 8px rgba(99,102,241,0.8)",
            }} />
            7,000 languages. Zero of them incompatible.
          </div>

          <h1 className="fade-up-delay-1" style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: 24,
          }}>
            Speak your language.<br />
            <span style={{
              background: "linear-gradient(135deg, #6366f1, #a5b4fc, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Be understood in theirs.
            </span>
          </h1>

          <p className="fade-up-delay-2" style={{
            fontSize: "clamp(16px, 2.5vw, 20px)",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.7,
            marginBottom: 40,
          }}>
            Real-time universal translation so any two human beings can speak to each other
            in their own language, instantly and for free. The product disappears.
            Only the conversation remains.
          </p>

          {/* Waitlist form */}
          <div id="waitlist" className="fade-up-delay-3">
            {submitted ? (
              <div style={{
                padding: "24px 28px",
                borderRadius: 14,
                border: "1px solid rgba(99,102,241,0.3)",
                backgroundColor: "rgba(99,102,241,0.06)",
                display: "inline-block",
              }}>
                <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                  You&apos;re in. Early access coming soon.
                </p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>
                  We&apos;ll reach out when Babel is ready.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 200,
                    padding: "14px 18px",
                    borderRadius: 10,
                    border: "1px solid rgba(99,102,241,0.2)",
                    backgroundColor: "rgba(99,102,241,0.04)",
                    color: "#fff",
                    fontSize: 15,
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(99,102,241,0.2)")}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="glow-btn"
                  style={{
                    padding: "14px 28px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 15,
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    transition: "opacity 0.2s, transform 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "scale(1.02)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  {loading ? "Joining..." : "Get early access"}
                </button>
                {error && (
                  <p style={{ width: "100%", color: "#f87171", fontSize: 14 }}>{error}</p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Conversation mockup */}
        <div className="fade-up-delay-2" style={{
          padding: 28,
          borderRadius: 20,
          border: "1px solid rgba(99,102,241,0.15)",
          backgroundColor: "rgba(99,102,241,0.03)",
          backdropFilter: "blur(8px)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  backgroundColor: "#6366f1",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700,
                }}>S</div>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  backgroundColor: "#8b5cf6",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700,
                  marginLeft: -8,
                  border: "2px solid #05050f",
                }}>Y</div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Sofia &amp; You</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                  Spanish &harr; English &middot; live
                </div>
              </div>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 100,
              backgroundColor: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                backgroundColor: "#6366f1",
                boxShadow: "0 0 6px rgba(99,102,241,0.8)",
              }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#818cf8" }}>LIVE</span>
            </div>
          </div>

          <div>
            {CONVERSATION.map((msg, i) => (
              <ChatBubble key={msg.id} msg={msg} delay={String(i + 1)} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "24px 40px",
        display: "flex",
        justifyContent: "center",
        gap: "clamp(32px, 6vw, 80px)",
        flexWrap: "wrap",
      }}>
        {[
          { stat: "7,000", label: "Languages spoken worldwide" },
          { stat: "1.5B", label: "Second-language speakers" },
          { stat: "$60B", label: "Global language services market" },
          { stat: "Free", label: "Always, for end users" },
        ].map(({ stat, label }) => (
          <div key={stat} style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "clamp(22px, 4vw, 34px)",
              fontWeight: 800,
              background: "linear-gradient(135deg, #6366f1, #a5b4fc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>{stat}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Why different from Google Translate */}
      <section style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "100px 24px",
      }}>
        <p style={{
          textAlign: "center",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.15em",
          color: "#6366f1",
          textTransform: "uppercase",
          marginBottom: 16,
        }}>Why it&apos;s different</p>
        <h2 style={{
          textAlign: "center",
          fontSize: "clamp(28px, 5vw, 44px)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          marginBottom: 60,
        }}>
          Not a dictionary. A relationship.
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
          {[
            {
              title: "Personalization",
              body: "Babel learns the vocabulary, nicknames, and conversational rhythm of the specific people in your life. It gets better the more you use it with your actual people.",
              icon: "◈",
            },
            {
              title: "Relationship context",
              body: "Powered by Amber&apos;s relationship graph, Babel understands who you&apos;re talking to — translating not just words, but tone, formality, and intent.",
              icon: "⟡",
            },
            {
              title: "Invisible UX",
              body: "Google Translate is a tool you pick up. Babel is woven into the conversation. You don&apos;t use Babel. You just talk.",
              icon: "◯",
            },
          ].map((item) => (
            <div key={item.title} style={{
              padding: 32,
              borderRadius: 16,
              border: "1px solid rgba(99,102,241,0.12)",
              backgroundColor: "rgba(99,102,241,0.03)",
            }}>
              <div style={{ fontSize: 28, marginBottom: 16, color: "#6366f1" }}>{item.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{item.title}</h3>
              <p
                style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}
                dangerouslySetInnerHTML={{ __html: item.body }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Amber relationship graph section */}
      <section style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "0 24px 100px",
      }}>
        <div style={{
          borderRadius: 24,
          border: "1px solid rgba(99,102,241,0.15)",
          background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)",
          padding: "64px clamp(24px, 5vw, 64px)",
          textAlign: "center",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 100,
            border: "1px solid rgba(99,102,241,0.2)",
            backgroundColor: "rgba(99,102,241,0.06)",
            fontSize: 12,
            color: "#818cf8",
            marginBottom: 28,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            Amber integration
          </div>
          <h2 style={{
            fontSize: "clamp(26px, 4vw, 40px)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            marginBottom: 20,
            maxWidth: 580,
            margin: "0 auto 20px",
          }}>
            Built on Amber&apos;s relationship graph
          </h2>
          <p style={{
            fontSize: "clamp(16px, 2.5vw, 19px)",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.7,
            maxWidth: 560,
            margin: "0 auto 40px",
          }}>
            Babel learns the vocabulary and rhythm of the people in your life.
            The more you use it with your actual relationships, the more natural
            the translation becomes. It&apos;s not translating language — it&apos;s
            translating you.
          </p>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            flexWrap: "wrap",
          }}>
            {["Social health", "Emotional health", "Relationship depth"].map((tag) => (
              <div key={tag} style={{
                padding: "8px 16px",
                borderRadius: 100,
                border: "1px solid rgba(99,102,241,0.2)",
                backgroundColor: "rgba(99,102,241,0.06)",
                fontSize: 13,
                color: "#818cf8",
                fontWeight: 500,
              }}>{tag}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Market */}
      <section style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "0 24px 100px",
        textAlign: "center",
      }}>
        <p style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.15em",
          color: "#6366f1",
          textTransform: "uppercase",
          marginBottom: 16,
        }}>The market</p>
        <h2 style={{
          fontSize: "clamp(28px, 5vw, 44px)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          marginBottom: 16,
        }}>
          1.5 billion people speak English<br />as a second language.
        </h2>
        <p style={{
          fontSize: 18,
          color: "rgba(255,255,255,0.5)",
          lineHeight: 1.7,
          maxWidth: 560,
          margin: "0 auto 60px",
        }}>
          They don&apos;t want to translate. They want to be understood.
          That&apos;s a different problem. And it&apos;s the one Babel solves.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 }}>
          {[
            { label: "TAM", value: "$55B", sub: "Total addressable market" },
            { label: "SAM", value: "$8B", sub: "Serviceable addressable market" },
            { label: "SOM", value: "$400M", sub: "Serviceable obtainable market" },
          ].map(({ label, value, sub }) => (
            <div key={label} style={{
              padding: "28px 24px",
              borderRadius: 16,
              border: "1px solid rgba(99,102,241,0.12)",
              backgroundColor: "rgba(99,102,241,0.03)",
            }}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                marginBottom: 8,
              }}>{label}</div>
              <div style={{
                fontSize: "clamp(28px, 5vw, 40px)",
                fontWeight: 800,
                background: "linear-gradient(135deg, #6366f1, #a5b4fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>{value}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        maxWidth: 680,
        margin: "0 auto",
        padding: "0 24px 120px",
        textAlign: "center",
      }}>
        <div style={{
          padding: "64px 40px",
          borderRadius: 24,
          border: "1px solid rgba(99,102,241,0.15)",
          background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }}>
          <h2 style={{
            fontSize: "clamp(28px, 5vw, 40px)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}>
            Every conversation matters.<br />
            None of them should be lost.
          </h2>
          <p style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.5)",
            marginBottom: 40,
            lineHeight: 1.6,
          }}>
            Get early access to Babel. We&apos;re building carefully — language is human,
            and we take that seriously.
          </p>
          {submitted ? (
            <div style={{
              padding: "20px 32px",
              borderRadius: 12,
              border: "1px solid rgba(99,102,241,0.3)",
              backgroundColor: "rgba(99,102,241,0.06)",
              display: "inline-block",
            }}>
              <p style={{ fontWeight: 600 }}>You&apos;re on the list. Talk soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 220,
                  padding: "14px 18px",
                  borderRadius: 10,
                  border: "1px solid rgba(99,102,241,0.2)",
                  backgroundColor: "rgba(99,102,241,0.04)",
                  color: "#fff",
                  fontSize: 15,
                  outline: "none",
                }}
                onFocus={e => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
                onBlur={e => (e.target.style.borderColor = "rgba(99,102,241,0.2)")}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "14px 28px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Joining..." : "Get early access"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "32px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 24, height: 24,
            borderRadius: 6,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700,
          }}>B</div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Babel</span>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
          An Amber sub-venture &middot; Built by Caleb Newton
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>Part of</span>
          <span style={{
            fontSize: 12, fontWeight: 700,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>Amber Health</span>
        </div>
      </footer>
    </div>
  );
}
