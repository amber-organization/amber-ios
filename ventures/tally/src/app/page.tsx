"use client";

import { useState } from "react";

export default function TallyLanding() {
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
    <div style={{ backgroundColor: "#0c0800", minHeight: "100vh", color: "#fff" }}>

      {/* Nav */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 40px",
        borderBottom: "1px solid rgba(245,158,11,0.1)",
        position: "sticky",
        top: 0,
        backgroundColor: "rgba(12,8,0,0.9)",
        backdropFilter: "blur(12px)",
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700,
          }}>T</div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>Tally</span>
        </div>
        <a
          href="#waitlist"
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#0c0800",
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          Join waitlist
        </a>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "100px 24px 80px",
        textAlign: "center",
      }}>
        <div className="fade-up" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 14px",
          borderRadius: 100,
          border: "1px solid rgba(245,158,11,0.25)",
          backgroundColor: "rgba(245,158,11,0.06)",
          fontSize: 13,
          color: "#fbbf24",
          marginBottom: 32,
          fontWeight: 500,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            backgroundColor: "#f59e0b",
            boxShadow: "0 0 8px rgba(245,158,11,0.8)",
          }} />
          $6 trillion word-of-mouth market. Zero of it goes to friends.
        </div>

        <h1 className="fade-up-delay-1" style={{
          fontSize: "clamp(40px, 7vw, 72px)",
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          marginBottom: 24,
        }}>
          Your recommendation<br />
          <span style={{
            background: "linear-gradient(135deg, #f59e0b, #fde68a, #d97706)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            is worth something.
          </span>
        </h1>

        <p className="fade-up-delay-2" style={{
          fontSize: "clamp(18px, 3vw, 22px)",
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.6,
          marginBottom: 48,
          maxWidth: 560,
          margin: "0 auto 48px",
        }}>
          Start getting paid for it. Tally turns your social circle into a high-trust
          referral network. Authentic recommendations, real rewards.
        </p>

        {/* Waitlist form */}
        <div id="waitlist" className="fade-up-delay-3">
          {submitted ? (
            <div style={{
              padding: "28px 40px",
              borderRadius: 16,
              border: "1px solid rgba(245,158,11,0.3)",
              backgroundColor: "rgba(245,158,11,0.06)",
              maxWidth: 480,
              margin: "0 auto",
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎉</div>
              <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                You&apos;re on the list.
              </p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>
                We&apos;ll reach out when Tally is ready for you.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                gap: 12,
                maxWidth: 480,
                margin: "0 auto",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
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
                  border: "1px solid rgba(245,158,11,0.2)",
                  backgroundColor: "rgba(245,158,11,0.04)",
                  color: "#fff",
                  fontSize: 15,
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                onBlur={e => (e.target.style.borderColor = "rgba(245,158,11,0.2)")}
              />
              <button
                type="submit"
                disabled={loading}
                className="glow-btn"
                style={{
                  padding: "14px 28px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#0c0800",
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
                <p style={{ width: "100%", color: "#f87171", fontSize: 14, textAlign: "center" }}>
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </section>

      {/* Social proof bar */}
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
          { stat: "$6T", label: "Word-of-mouth purchases/yr" },
          { stat: "13%", label: "All consumer purchases driven by WOM" },
          { stat: "$18B", label: "Addressable market" },
          { stat: "0%", label: "Of WOM value captured by friends" },
        ].map(({ stat, label }) => (
          <div key={stat} style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 800,
              background: "linear-gradient(135deg, #f59e0b, #fde68a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>{stat}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "100px 24px" }}>
        <p style={{
          textAlign: "center",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.15em",
          color: "#f59e0b",
          textTransform: "uppercase",
          marginBottom: 16,
        }}>How it works</p>
        <h2 style={{
          textAlign: "center",
          fontSize: "clamp(28px, 5vw, 44px)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          marginBottom: 64,
        }}>
          Three steps. Zero awkwardness.
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
          {[
            {
              number: "01",
              title: "Share what you love",
              body: "Recommend a product, service, or place to someone in your circle. Just like you always have. The difference is — this time, it&apos;s tracked.",
              icon: "✦",
            },
            {
              number: "02",
              title: "Friend buys",
              body: "When your friend makes a purchase through your recommendation, Tally sees it. No awkward codes, no spammy links. It just works.",
              icon: "→",
            },
            {
              number: "03",
              title: "You both earn",
              body: "You get rewarded for the recommendation. They get a discount or bonus. Both of you win. The brand pays — not you.",
              icon: "◎",
            },
          ].map((step) => (
            <div
              key={step.number}
              style={{
                padding: 32,
                borderRadius: 16,
                border: "1px solid rgba(245,158,11,0.12)",
                backgroundColor: "rgba(245,158,11,0.03)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute",
                top: 24,
                right: 24,
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(245,158,11,0.3)",
                letterSpacing: "0.1em",
              }}>{step.number}</div>
              <div style={{
                fontSize: 28,
                marginBottom: 20,
                color: "#f59e0b",
              }}>{step.icon}</div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 12,
                letterSpacing: "-0.01em",
              }}>{step.title}</h3>
              <p
                style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}
                dangerouslySetInnerHTML={{ __html: step.body }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Authentic vs Performative */}
      <section style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "0 24px 100px",
      }}>
        <div style={{
          borderRadius: 24,
          border: "1px solid rgba(245,158,11,0.12)",
          backgroundColor: "rgba(245,158,11,0.03)",
          padding: "64px clamp(24px, 5vw, 64px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 48,
          alignItems: "center",
        }}>
          <div>
            <p style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "#f59e0b",
              textTransform: "uppercase",
              marginBottom: 16,
            }}>Why it&apos;s different</p>
            <h2 style={{
              fontSize: "clamp(26px, 4vw, 38px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: 20,
            }}>
              Not influencer marketing.<br />
              <span style={{
                background: "linear-gradient(135deg, #f59e0b, #fde68a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Friend marketing.</span>
            </h2>
            <p style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.7,
            }}>
              Influencer marketing is performative. You don&apos;t know those people.
              You don&apos;t trust their opinions. Tally is built on something
              fundamentally different: the people you already trust, recommending
              things they&apos;ve actually used.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "Influencer", bad: true, points: ["Paid to say it", "Doesn&apos;t use the product", "Optimized for clicks", "Strangers to you"] },
              { label: "Tally", bad: false, points: ["Genuinely recommends", "Uses it themselves", "Optimized for trust", "People you know"] },
            ].map((col) => (
              <div key={col.label} style={{
                padding: "20px 24px",
                borderRadius: 12,
                border: `1px solid ${col.bad ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.2)"}`,
                backgroundColor: col.bad ? "rgba(239,68,68,0.04)" : "rgba(245,158,11,0.06)",
              }}>
                <div style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: col.bad ? "#f87171" : "#f59e0b",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}>{col.label}</div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {col.points.map((p) => (
                    <li key={p} style={{
                      fontSize: 14,
                      color: col.bad ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.7)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}>
                      <span style={{ color: col.bad ? "#ef4444" : "#f59e0b", fontSize: 12 }}>
                        {col.bad ? "✕" : "✓"}
                      </span>
                      <span dangerouslySetInnerHTML={{ __html: p }} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market section */}
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
          color: "#f59e0b",
          textTransform: "uppercase",
          marginBottom: 16,
        }}>The opportunity</p>
        <h2 style={{
          fontSize: "clamp(28px, 5vw, 44px)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          marginBottom: 20,
        }}>Word-of-mouth drives<br />13% of all consumer purchases.</h2>
        <p style={{
          fontSize: 18,
          color: "rgba(255,255,255,0.5)",
          lineHeight: 1.7,
          maxWidth: 580,
          margin: "0 auto 60px",
        }}>
          That&apos;s a $6 trillion influence market. And right now, none of it goes
          to the people actually doing the influencing. Your friends.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 }}>
          {[
            { label: "TAM", value: "$18B", sub: "Total addressable market" },
            { label: "SAM", value: "$3B", sub: "Serviceable addressable market" },
            { label: "SOM", value: "$150M", sub: "Serviceable obtainable market" },
          ].map(({ label, value, sub }) => (
            <div key={label} style={{
              padding: "28px 24px",
              borderRadius: 16,
              border: "1px solid rgba(245,158,11,0.12)",
              backgroundColor: "rgba(245,158,11,0.03)",
            }}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                marginBottom: 8,
              }}>{label}</div>
              <div style={{
                fontSize: "clamp(28px, 5vw, 40px)",
                fontWeight: 800,
                background: "linear-gradient(135deg, #f59e0b, #fde68a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>{value}</div>
              <div style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                marginTop: 6,
              }}>{sub}</div>
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
          border: "1px solid rgba(245,158,11,0.15)",
          background: "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 70%)",
        }}>
          <h2 style={{
            fontSize: "clamp(28px, 5vw, 40px)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}>
            Start getting paid<br />for what you already do.
          </h2>
          <p style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.5)",
            marginBottom: 40,
            lineHeight: 1.6,
          }}>
            Join the waitlist. We&apos;re building this carefully — high trust requires getting it right.
          </p>
          {submitted ? (
            <div style={{
              padding: "20px 32px",
              borderRadius: 12,
              border: "1px solid rgba(245,158,11,0.3)",
              backgroundColor: "rgba(245,158,11,0.06)",
              display: "inline-block",
            }}>
              <p style={{ fontWeight: 600 }}>You&apos;re on the list. We&apos;ll be in touch.</p>
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
                  border: "1px solid rgba(245,158,11,0.2)",
                  backgroundColor: "rgba(245,158,11,0.04)",
                  color: "#fff",
                  fontSize: 15,
                  outline: "none",
                }}
                onFocus={e => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                onBlur={e => (e.target.style.borderColor = "rgba(245,158,11,0.2)")}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "14px 28px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#0c0800",
                  fontWeight: 700,
                  fontSize: 15,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Joining..." : "Join the waitlist"}
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
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#0c0800",
          }}>T</div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Tally</span>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
          A Tally sub-venture &middot; Built by Caleb Newton &amp; Cayden Ginting
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
