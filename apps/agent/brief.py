"""
Morning Operator Brief builder.

Gathers data from Gmail, Google Calendar, and Amber backend,
then uses Claude to synthesize a spoken/text brief.
Delivered via fish.audio TTS (spoken aloud) + iMessage (text).
"""
from __future__ import annotations

import os
from datetime import date

import httpx

from integrations.gcal import get_todays_events
from integrations.gmail import get_urgent_threads
from integrations.voice import speak_brief

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
AMBER_API_URL = os.getenv("AMBER_API_URL", "http://localhost:3000")
AMBER_AGENT_SECRET = os.getenv("AMBER_AGENT_SECRET", "")
AMBER_USER_ID = int(os.getenv("AMBER_USER_ID", "1"))


def _headers() -> dict:
    return {"X-Agent-Secret": AMBER_AGENT_SECRET, "Content-Type": "application/json"}


def _format_events(events: list[dict]) -> str:
    if not events:
        return "No events today."

    lines = []
    for e in events:
        if e.get("is_all_day"):
            lines.append(f"  • {e['title']} (all day)")
        else:
            start = e.get("start", "")
            # Parse just the time portion
            if "T" in start:
                time_part = start.split("T")[1][:5]  # HH:MM
                lines.append(f"  • {time_part} — {e['title']}")
            else:
                lines.append(f"  • {e['title']}")

        if e.get("location"):
            lines.append(f"    📍 {e['location']}")
        if e.get("attendees"):
            lines.append(f"    👤 {', '.join(e['attendees'][:3])}")

    return "\n".join(lines)


def _format_emails(threads: list[dict]) -> str:
    if not threads:
        return "No urgent emails."

    lines = []
    for t in threads[:8]:
        star = "⭐ " if t.get("is_starred") else ""
        lines.append(f"  • {star}{t['subject'][:60]}")
        lines.append(f"    From: {t['from'][:40]}")
        if t.get("snippet"):
            lines.append(f"    {t['snippet'][:80]}")

    return "\n".join(lines)


def _build_brief_prompt(today: str, events_text: str, emails_text: str) -> str:
    return f"""You are Amber, a personal health network assistant. Write a warm, energetic morning operator brief for today ({today}).

TODAY'S CALENDAR:
{events_text}

URGENT EMAILS (last 24h):
{emails_text}

Write the brief as if you're speaking to the user in a friendly, direct way — like a trusted assistant. Keep it under 200 words.

Structure:
1. Brief greeting + today's date
2. Calendar highlights (only what matters)
3. Email priorities (top 2-3 only)
4. One short motivational or grounding note to close

Write naturally — this will be read aloud via text-to-speech. No bullet points or markdown."""


async def build_morning_brief() -> str:
    """Gather data and synthesize the morning brief text."""
    today = date.today().isoformat()

    # Fetch calendar and email in parallel
    events: list[dict] = []
    threads: list[dict] = []

    try:
        events = get_todays_events()
    except Exception as e:
        print(f"[Brief] Calendar error: {e}")

    try:
        threads = get_urgent_threads(max_results=15)
    except Exception as e:
        print(f"[Brief] Gmail error: {e}")

    events_text = _format_events(events)
    emails_text = _format_emails(threads)
    prompt = _build_brief_prompt(today, events_text, emails_text)

    # Call Claude to write the brief
    res = httpx.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-sonnet-4-6",
            "max_tokens": 512,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=30,
    )
    res.raise_for_status()
    brief_text = res.json()["content"][0]["text"]

    return brief_text


async def deliver_morning_brief() -> None:
    """Build, speak, and send the morning brief."""
    print("[Brief] Building morning brief...")
    brief_text = await build_morning_brief()

    today = date.today().isoformat()

    # Speak aloud via fish.audio
    try:
        speak_brief(brief_text)
        print("[Brief] Spoken aloud.")
    except Exception as e:
        print(f"[Brief] TTS error: {e}")

    # Send to Amber backend (which texts it via iMessage)
    try:
        res = httpx.post(
            f"{AMBER_API_URL}/agent/brief/send",
            headers=_headers(),
            json={
                "userId": AMBER_USER_ID,
                "briefText": brief_text,
                "briefDate": today,
            },
            timeout=15,
        )
        res.raise_for_status()
        print("[Brief] Sent to Amber backend.")
    except Exception as e:
        print(f"[Brief] Backend delivery error: {e}")
