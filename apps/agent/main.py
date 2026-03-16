"""
Amber macOS Agent — entry point.

Starts the scheduler (morning brief at 8am) and polls the Amber backend
for queued tasks to execute.

Usage:
    python main.py

Environment:
    Copy .env.example → .env and fill in your keys.
"""
from __future__ import annotations

import asyncio
import logging
import os
import signal
import sys
import time

import httpx
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
log = logging.getLogger("amber.agent")

AMBER_API_URL = os.getenv("AMBER_API_URL", "http://localhost:3000")
AMBER_AGENT_SECRET = os.getenv("AMBER_AGENT_SECRET", "")
AMBER_USER_ID = int(os.getenv("AMBER_USER_ID", "1"))
POLL_INTERVAL = int(os.getenv("AMBER_POLL_INTERVAL", "15"))  # seconds


def _agent_headers() -> dict:
    return {"X-Agent-Secret": AMBER_AGENT_SECRET}


async def poll_for_tasks() -> None:
    """Check the Amber backend for queued tasks and run them."""
    from agent import run_task

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            res = await client.get(
                f"{AMBER_API_URL}/agent/tasks",
                params={"status": "queued", "userId": AMBER_USER_ID},
                headers=_agent_headers(),
            )
            if not res.is_success:
                log.warning(f"Task poll failed: {res.status_code}")
                return

            tasks = res.json().get("tasks", [])
            queued = [t for t in tasks if t["status"] == "queued"]

            for task in queued[:1]:  # one at a time
                log.info(f"Running task {task['id']}: {task['prompt'][:60]}")
                try:
                    summary = await run_task(task["id"], task["prompt"])
                    log.info(f"Task {task['id']} complete: {summary[:60]}")
                except Exception as e:
                    log.error(f"Task {task['id']} failed: {e}")
                    await client.patch(
                        f"{AMBER_API_URL}/agent/tasks/{task['id']}",
                        json={"status": "failed", "errorMessage": str(e)},
                        headers=_agent_headers(),
                    )

        except httpx.RequestError as e:
            log.warning(f"Backend unreachable: {e}")


async def main_loop() -> None:
    """Main async loop — polls for tasks, runs them."""
    log.info(f"Amber agent started. Polling every {POLL_INTERVAL}s.")
    log.info(f"User ID: {AMBER_USER_ID} | API: {AMBER_API_URL}")

    while True:
        await poll_for_tasks()
        await asyncio.sleep(POLL_INTERVAL)


def main():
    from scheduler import start_scheduler_thread

    # Start the scheduler in a background thread (morning brief, etc.)
    scheduler_thread = start_scheduler_thread()
    log.info("Scheduler thread started.")

    # Handle clean shutdown
    def shutdown(sig, frame):
        log.info("Shutting down Amber agent...")
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    # Run the task poll loop
    asyncio.run(main_loop())


if __name__ == "__main__":
    main()
