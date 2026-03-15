"""Google Calendar integration — fetch today's events for morning brief."""
from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

GCAL_TOKEN_PATH = os.getenv("GCAL_TOKEN_PATH", "gcal_token.json")
GCAL_SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]


def _get_service():
    creds = None
    if os.path.exists(GCAL_TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(GCAL_TOKEN_PATH, GCAL_SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            with open(GCAL_TOKEN_PATH, "w") as f:
                f.write(creds.to_json())
        else:
            raise RuntimeError(
                "Google Calendar not authorized. Run `python -m integrations.gcal_auth`."
            )
    return build("calendar", "v3", credentials=creds)


def get_todays_events() -> list[dict[str, Any]]:
    """
    Return all events for today (midnight to midnight local time).
    Each item: { title, start, end, location, description, calendar, is_all_day, attendees }
    """
    service = _get_service()

    now = datetime.now(timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = start_of_day + timedelta(days=1)

    events_result = service.events().list(
        calendarId="primary",
        timeMin=start_of_day.isoformat(),
        timeMax=end_of_day.isoformat(),
        singleEvents=True,
        orderBy="startTime",
    ).execute()

    events = events_result.get("items", [])
    output = []

    for event in events:
        start = event.get("start", {})
        end = event.get("end", {})
        is_all_day = "date" in start and "dateTime" not in start

        attendees = [
            a.get("email", "") for a in event.get("attendees", [])
            if not a.get("self", False)
        ]

        output.append({
            "title": event.get("summary", "(no title)"),
            "start": start.get("dateTime") or start.get("date"),
            "end": end.get("dateTime") or end.get("date"),
            "location": event.get("location"),
            "description": event.get("description"),
            "calendar": "primary",
            "is_all_day": is_all_day,
            "attendees": attendees,
            "event_id": event.get("id"),
        })

    return output
