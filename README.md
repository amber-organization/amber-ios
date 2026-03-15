# Amber — The Health Network

> **Your health is shaped by the people around you. Amber makes that visible.**

---

## What is Amber?

Amber is a **health network** — a personal platform that connects your wellbeing data, personality insights, and social connections into one unified view. It tracks six dimensions of health and shows how your relationships, habits, and daily choices influence each one.

Amber is not a fitness tracker. It's not a social media app. It's the connective layer between your health, your people, and your self-awareness.

---

## Six Dimensions of Health

Amber scores your wellbeing across six interconnected dimensions:

| Dimension | Color | What It Tracks |
|-----------|-------|----------------|
| 🔮 Spiritual | Purple | Inner peace, purpose, mindfulness |
| ❤️ Emotional | Red | Mood, feelings, emotional regulation |
| 🏃 Physical | Green | Activity, sleep, exercise, movement |
| 🧠 Intellectual | Orange | Learning, curiosity, mental engagement |
| 👥 Social | Blue | Connection quality, community, belonging |
| 💰 Financial | Teal | Career health, professional networking |

Each dimension is scored 0–100 and tracked over time through daily digests powered by AI.

---

## Core Features

### Contacts
Unified contact management with rich profiles, personality data, and relationship context. Import from Apple Contacts or add manually.

### Network Visualizations
Three ways to see your people:
- **Amber Network** — Interactive bubble chart showing connection strength by health dimension
- **Family Network** — Hierarchical tree view of family relationships
- **Find My Friends** — Geographic visualization of your network

### Profile (Amber ID)
Your identity card with:
- Live activity tracking (Move, Exercise, Stand, Sleep, Screen Time)
- Personality insights (MBTI, Enneagram, Zodiac sun/moon/rising)
- Daily check-in (emotions, energy, cycle, sleep)
- Six daily digests with AI-powered chat for each health dimension
- Connected apps and data source management

### AI Insights
Perplexity-style chat interface for each health dimension. Ask questions about your patterns, get personalized recommendations, and understand how your relationships affect your wellbeing.

### Connected Data Sources
Integrate with Apple Health, Apple Contacts, Location Services, Google Calendar, Gmail, Instagram, Facebook, TikTok, LinkedIn, X, Substack, Claude, and ChatGPT.

---

## Tech Stack

### iOS
- **SwiftUI** — Declarative UI
- **Combine** — Reactive data flow
- **MVVM** — Clean architecture
- **iOS 17.0+** — Minimum deployment target

### Backend (this monorepo)
- **Fastify** — Node.js API server
- **Drizzle ORM** — Type-safe Postgres queries
- **Postgres + pgvector** — Relational + vector search
- **Claude (Anthropic)** — Memory extraction, AI digests
- **Stripe** — Subscription billing
- **Loop Message** — iMessage delivery
- **GCP Cloud Storage** — Photos, transcripts, exports
- **Railway** — Deployment

---

## Monorepo Structure

```
amber/
  AmberApp/               — iOS Swift app (SwiftUI)
  apps/
    apple/                — iOS Swift app entry
    web/                  — Next.js web app (auth, onboarding, chat)
    agent/                — macOS computer-use agent (Python + Claude vision)
    imessage-agent/       — Multi-user iMessage agent (Caleb + Sagar as User #1/#2)
  services/
    app/                  — Fastify REST API (main backend — auth, DB, webhooks, billing)
    worker/               — Background job runner (memory extraction, drift detection)
  packages/
    shared-types/         — TypeScript domain types
    memory-engine/        — Memory ingestion + Claude extraction
    people-graph/         — Hybrid semantic + structured search
    storage/              — GCP Cloud Storage adapter
    prompts/              — Shared prompt templates
```

---

## API Endpoints

Base URL: deployed via Railway

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET/POST` | `/persons` | Contact graph |
| `GET/POST` | `/memories` | Relationship memories |
| `GET/PATCH` | `/action-items` | Follow-up tasks |
| `GET/PATCH` | `/approvals` | Approval queue |
| `GET` | `/billing/status` | Subscription status |
| `POST` | `/billing/checkout` | Stripe checkout |
| `POST` | `/billing/portal` | Billing portal |
| `POST` | `/billing/webhook` | Stripe webhook |
| `POST` | `/webhooks/loop-message` | Inbound iMessages |

---

## Getting Started

```bash
# iOS
git clone https://github.com/amber-organization/amber.git
cd amber/AmberApp
open AmberApp.xcodeproj
# Select iPhone 15 Pro → Cmd+R

# Backend
pnpm install
pnpm dev
```

See **SETUP.md** for env vars and full configuration.

---

## Sub-Ventures

Amber is a platform. These 7 products are built on top of the Amber relationship and health graph:

| Venture | What it is | Status |
|---------|-----------|--------|
| **Story** | Verified-real social network — no bots, no resharing, only things you actually lived | Live |
| **D-NOB** | Private community for children fighting serious illness | Live |
| **Marrow** | Club and organization recruiting OS — replaces Google Forms and spreadsheets | Live |
| **FiduciaryOS** | AI financial + life advisor — fiduciary financial guidance and career planning, combined | Live |
| **ClearOut** | AI inbox that writes replies in your voice and learns who matters to you | Live |
| **Stillness** | Brain health platform — mental health tracking + cognitive decline detection, built on Amber's graph | Building |
| **Healthy Tech Index** | Every app and device rated by what it actually does to the people who use it | Building |

**WEB** (relationship CRM) is Amber's core feature, not a separate product. It lives in the contacts + memories layer of the platform.

The moat: each sub-venture deepens Amber's compounding personal dataset. The relationship graph, health metrics, behavioral data, and social patterns cannot be rebuilt from scratch by any competitor starting today.

---

## Roadmap

**Now:** iOS app (onboarding, contacts, personality, daily digests), backend API (auth, onboarding, signals, circles, memories, billing), iMessage agent (multi-user — Caleb and Sagar as User #1 and #2), web app (auth, onboarding, chat).

**Next:** Stripe subscriptions live, real-time memory sync between agent + app, pgvector semantic search, WEB relationship CRM features, Stillness mental health dimension.

**Future:** Remember cognitive monitoring, Life Plan Assistant, Healthy Tech Index ratings powered by aggregate Amber data, Android, public API.

---

## Privacy

- All data stored locally on device
- No ads, no data selling
- You control which data sources connect
- Export your data anytime

---

## License

Proprietary — Amber Technologies Inc.

---

**Built with SwiftUI ❤️**
