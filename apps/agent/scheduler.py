"""
Amber Agent Scheduler

Runs background jobs on a schedule:
  - 8:00 AM daily: morning operator brief
  - Future: evening wrap-up, proactive check-ins, etc.
"""
from __future__ import annotations

import asyncio
import logging
import os

import schedule
import time
import threading

from brief import deliver_morning_brief

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("amber.scheduler")

BRIEF_TIME = os.getenv("AMBER_BRIEF_TIME", "08:00")  # 24h local time


def run_async(coro):
    """Run an async coroutine from a sync scheduler context."""
    try:
        asyncio.run(coro)
    except Exception as e:
        log.error(f"Scheduled job failed: {e}")


def schedule_jobs():
    """Register all scheduled jobs."""
    log.info(f"Scheduling morning brief at {BRIEF_TIME} daily")
    schedule.every().day.at(BRIEF_TIME).do(run_async, deliver_morning_brief())


def run_scheduler():
    """Block forever running pending scheduled jobs."""
    schedule_jobs()
    log.info("Scheduler running. Press Ctrl+C to stop.")
    while True:
        schedule.run_pending()
        time.sleep(30)


def start_scheduler_thread() -> threading.Thread:
    """Start the scheduler in a background thread (used by main.py)."""
    t = threading.Thread(target=run_scheduler, daemon=True, name="amber-scheduler")
    t.start()
    return t
