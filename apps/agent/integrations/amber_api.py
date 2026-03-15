"""Amber backend API client — used by the agent to update task state and send messages."""
from __future__ import annotations

import os
import httpx

AMBER_API_URL = os.getenv("AMBER_API_URL", "http://localhost:3000")
AMBER_AGENT_SECRET = os.getenv("AMBER_AGENT_SECRET", "")


def _headers() -> dict:
    return {"X-Agent-Secret": AMBER_AGENT_SECRET, "Content-Type": "application/json"}


async def update_task(task_id: int, payload: dict) -> None:
    async with httpx.AsyncClient(timeout=10) as client:
        await client.patch(
            f"{AMBER_API_URL}/agent/tasks/{task_id}",
            json=payload,
            headers=_headers(),
        )


async def send_message(user_id: int, text: str, channel: str = "imessage") -> None:
    """Send a message to the user via Amber's unified chat endpoint."""
    async with httpx.AsyncClient(timeout=10) as client:
        await client.post(
            f"{AMBER_API_URL}/agent/notify",
            json={"userId": user_id, "text": text, "channel": channel},
            headers=_headers(),
        )
