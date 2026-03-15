'use client'

import { useState } from 'react'
import {
  FileText,
  Link2,
  LayoutList,
  Share2,
  ShieldCheck,
  Zap,
  Upload,
  Cpu,
  GitMerge,
  Eye,
  ArrowRight,
  CheckCircle2,
  Database,
  Activity,
  Clock,
  Lock,
} from 'lucide-react'

function MedBridgeMark({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Bridge shape — two pillars with horizontal bar */}
      <rect x="3" y="10" width="3" height="9" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="16" y="10" width="3" height="9" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="3" y="9" width="16" height="2.5" rx="1.25" fill="currentColor" />
      {/* Cross — medical symbol above bridge */}
      <rect x="9.5" y="2" width="3" height="8" rx="1.5" fill="#4f8ef7" />
      <rect x="6.5" y="4.75" width="9" height="2.5" rx="1.25" fill="#4f8ef7" />
    </svg>
  )
}

const INGESTION_METHODS = [
  {
    icon: FileText,
    title: 'PDF and Image Upload',
    desc: 'Visit summaries, discharge paperwork, lab PDFs, scanned charts, portal screenshots.',
  },
  {
    icon: Cpu,
    title: 'OCR + AI Extraction',
    desc: 'Extracts medications, diagnoses, labs, visit dates, providers, and facilities from any document.',
  },
  {
    icon: Link2,
    title: 'SMART on FHIR',
    desc: 'Connect compatible patient portals directly. Structured records flow automatically via authorization.',
  },
  {
    icon: Database,
    title: 'C-CDA / CCD Import',
    desc: 'Import standardized clinical summary exports from Epic, Oracle/Cerner, athenahealth, and more.',
  },
]

const PIPELINE_LAYERS = [
  {
    icon: Upload,
    label: 'Ingest',
    desc: 'FHIR connectors, C-CDA importer, PDF/image uploader, OCR + AI pipeline, provider upload workflows.',
  },
  {
    icon: GitMerge,
    label: 'Normalize',
    desc: 'Maps everything into Patient, Encounter, Observation, Medication, Condition, Allergy, DocumentReference.',
  },
  {
    icon: Zap,
    label: 'Reconcile',
    desc: 'Deduplication, source conflict handling, versioning, provenance preservation, confidence scoring.',
  },
  {
    icon: Eye,
    label: 'Review',
    desc: 'Uncertain AI extractions and conflicting records surface for human validation before entering your timeline.',
  },
  {
    icon: LayoutList,
    label: 'Timeline',
    desc: 'All records from all sources in one chronological, filterable view with source attribution on every item.',
  },
  {
    icon: Share2,
    label: 'Share',
    desc: 'Export a clean, provider-ready packet or generate a secure share link in seconds.',
  },
]

const PROBLEMS = [
  '59% of Americans have records across multiple fragmented portals',
  'Providers make decisions with incomplete outside history',
  'Specialists receive referral packets that are late, partial, or unusable',
  'Critical data is trapped in PDFs, portals, and incompatible charting systems',
]

const FEATURES = [
  { icon: FileText, label: 'PDF + image upload' },
  { icon: Cpu, label: 'OCR + AI extraction' },
  { icon: Database, label: 'C-CDA / CCD import' },
  { icon: Link2, label: 'FHIR portal connection' },
  { icon: Activity, label: 'Unified timeline' },
  { icon: ShieldCheck, label: 'Source provenance' },
  { icon: Share2, label: 'Provider share flow' },
  { icon: Clock, label: 'Audit log' },
  { icon: Eye, label: 'Review queue' },
  { icon: Lock, label: 'Patient-controlled' },
]

export default function Home() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const AMBER_API = process.env.NEXT_PUBLIC_AMBER_API_URL ?? 'https://api.amber.health'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await fetch(`${AMBER_API}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, venture: 'medbridge' }),
      })
    } catch {
      // Non-fatal — still show success to user
    }
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text-high)' }}>
      {/* Nav */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 32px',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'sticky',
          top: 0,
          background: 'rgba(10,10,11,0.92)',
          backdropFilter: 'blur(12px)',
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MedBridgeMark style={{ color: 'var(--text-high)' }} />
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}>MedBridge</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
              padding: '4px 10px',
              border: '1px solid var(--border)',
              borderRadius: 6,
            }}
          >
            Beta
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '96px 32px 80px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            background: 'var(--accent-dim)',
            border: '1px solid rgba(79,142,247,0.25)',
            borderRadius: 100,
            marginBottom: 32,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f8ef7', display: 'inline-block' }} />
          <span style={{ fontSize: 12, color: '#4f8ef7', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
            Part of the Amber health network
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            marginBottom: 24,
          }}
        >
          Your health records,{' '}
          <span style={{ color: '#4f8ef7' }}>unified</span>
        </h1>

        <p
          style={{
            fontSize: 18,
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            maxWidth: 560,
            margin: '0 auto 48px',
          }}
        >
          Healthcare has digitized but not unified. MedBridge ingests records from every portal, PDF,
          and FHIR endpoint you have and normalizes them into one patient-controlled health timeline.
        </p>

        {/* Waitlist */}
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              gap: 8,
              maxWidth: 440,
              margin: '0 auto',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: '1 1 220px',
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-high)',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                background: '#4f8ef7',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? 'Joining...' : (
                <>Join the waitlist <ArrowRight size={14} /></>
              )}
            </button>
          </form>
        ) : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              background: 'var(--accent-green-dim)',
              border: '1px solid rgba(62,207,142,0.25)',
              borderRadius: 10,
              color: 'var(--accent-green)',
              fontSize: 14,
            }}
          >
            <CheckCircle2 size={16} />
            You are on the list. We will reach out when beta opens.
          </div>
        )}

        <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-faint)' }}>
          Read-only access. No EHR write-back. HIPAA-aligned storage.
        </p>
      </section>

      {/* Problem */}
      <section
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '64px 32px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <p
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
            fontFamily: 'var(--font-mono)',
            marginBottom: 32,
          }}
        >
          The problem
        </p>
        <h2
          style={{
            fontSize: 'clamp(22px, 4vw, 36px)',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            marginBottom: 24,
            maxWidth: 560,
          }}
        >
          Healthcare's problem is no longer digitization. It is{' '}
          <span style={{ color: 'var(--text-secondary)' }}>fragmentation</span>.
        </h2>
        <div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
          {PROBLEMS.map((p) => (
            <div
              key={p}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '14px 16px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#e05252',
                  marginTop: 6,
                  flexShrink: 0,
                }}
              />
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ingestion methods */}
      <section
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '64px 32px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <p
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
            fontFamily: 'var(--font-mono)',
            marginBottom: 12,
          }}
        >
          Ingestion
        </p>
        <h2
          style={{
            fontSize: 'clamp(20px, 3.5vw, 32px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 40,
          }}
        >
          Ingest anything
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 16,
          }}
        >
          {INGESTION_METHODS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              style={{
                padding: '24px 20px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: 'var(--accent-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={16} color="#4f8ef7" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-high)' }}>{title}</p>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture pipeline */}
      <section
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '64px 32px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <p
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
            fontFamily: 'var(--font-mono)',
            marginBottom: 12,
          }}
        >
          How it works
        </p>
        <h2
          style={{
            fontSize: 'clamp(20px, 3.5vw, 32px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 40,
          }}
        >
          Normalize everything
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {PIPELINE_LAYERS.map(({ icon: Icon, label, desc }, i) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 20,
                padding: '20px 24px',
                background: i % 2 === 0 ? 'var(--surface)' : 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  minWidth: 130,
                }}
              >
                <Icon size={16} color="#4f8ef7" style={{ flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--text-high)',
                  }}
                >
                  {label}
                </span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text-secondary)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '64px 32px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <p
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
            fontFamily: 'var(--font-mono)',
            marginBottom: 12,
          }}
        >
          Beta features
        </p>
        <h2
          style={{
            fontSize: 'clamp(20px, 3.5vw, 32px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 32,
          }}
        >
          Share cleanly
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 10,
          }}
        >
          {FEATURES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 9,
              }}
            >
              <Icon size={14} color="var(--text-faint)" />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '64px 32px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <p
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
            fontFamily: 'var(--font-mono)',
            marginBottom: 32,
          }}
        >
          Principles
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          {[
            { label: 'Patient-controlled', desc: 'You own your records. MedBridge is a tool, not a custodian.' },
            { label: 'Source-aware', desc: 'Every record carries provenance — origin, date, import method.' },
            { label: 'Read-first', desc: 'No EHR write-back in beta. We read the world; we do not modify it.' },
            { label: 'Workflow-oriented', desc: 'Built for referrals and handoffs, not storage.' },
            { label: 'Structured and messy', desc: 'FHIR when available. C-CDA when export exists. AI when records are messy.' },
          ].map(({ label, desc }) => (
            <div
              key={label}
              style={{
                padding: '20px 16px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-high)' }}>{label}</p>
              <p style={{ fontSize: 12, lineHeight: 1.65, color: 'var(--text-secondary)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Amber connection */}
      <section
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '64px 32px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            padding: '40px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <p
            style={{
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Part of the Amber network
          </p>
          <h3
            style={{
              fontSize: 'clamp(18px, 3vw, 26px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              maxWidth: 520,
            }}
          >
            MedBridge feeds your physical health dimension inside Amber
          </h3>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: 560 }}>
            Amber tracks six dimensions of your wellbeing. MedBridge is the physical health layer,
            surfacing your medical history, recent labs, and care timeline as intelligence that
            Amber uses to give you a complete picture of where you stand.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {['Physical', 'Spiritual', 'Emotional', 'Intellectual', 'Social', 'Financial'].map((dim) => (
              <span
                key={dim}
                style={{
                  padding: '4px 12px',
                  borderRadius: 100,
                  fontSize: 12,
                  border: '1px solid var(--border)',
                  color: dim === 'Physical' ? '#4f8ef7' : 'var(--text-faint)',
                  background: dim === 'Physical' ? 'var(--accent-dim)' : 'transparent',
                }}
              >
                {dim}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '64px 32px 96px',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(24px, 4vw, 40px)',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            marginBottom: 16,
          }}
        >
          Join the beta waitlist
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32 }}>
          We are onboarding patients with complex care histories first.
        </p>
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              gap: 8,
              maxWidth: 440,
              margin: '0 auto',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: '1 1 220px',
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-high)',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                background: '#4f8ef7',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? 'Joining...' : (
                <>Request access <ArrowRight size={14} /></>
              )}
            </button>
          </form>
        ) : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              background: 'var(--accent-green-dim)',
              border: '1px solid rgba(62,207,142,0.25)',
              borderRadius: 10,
              color: 'var(--accent-green)',
              fontSize: 14,
            }}
          >
            <CheckCircle2 size={16} />
            You are on the list.
          </div>
        )}
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MedBridgeMark style={{ color: 'var(--text-faint)' }} />
          <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>MedBridge</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>
          A venture by{' '}
          <a
            href="https://amber.health"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
          >
            Amber
          </a>
          . Built for patient-controlled health data portability.
        </p>
      </footer>
    </div>
  )
}
