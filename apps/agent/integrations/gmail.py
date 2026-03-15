"""Gmail integration — fetch urgent threads for morning brief."""
from __future__ import annotations

import os
import json
from typing import Any

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

GMAIL_TOKEN_PATH = os.getenv("GMAIL_TOKEN_PATH", "gmail_token.json")
GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
]


def _get_service():
    creds = None
    if os.path.exists(GMAIL_TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(GMAIL_TOKEN_PATH, GMAIL_SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            with open(GMAIL_TOKEN_PATH, "w") as f:
                f.write(creds.to_json())
        else:
            raise RuntimeError(
                "Gmail not authorized. Run `python -m integrations.gmail_auth` to set up."
            )
    return build("gmail", "v1", credentials=creds)


def get_urgent_threads(max_results: int = 20) -> list[dict[str, Any]]:
    """
    Return unread threads from the last 24 hours, ordered by newest first.
    Each item: { subject, from, snippet, date, thread_id, is_starred }
    """
    service = _get_service()

    results = service.users().threads().list(
        userId="me",
        q="is:unread newer_than:1d",
        maxResults=max_results,
    ).execute()

    threads = results.get("threads", [])
    output = []

    for t in threads:
        thread = service.users().threads().get(
            userId="me",
            id=t["id"],
            format="metadata",
            metadataHeaders=["Subject", "From", "Date"],
        ).execute()

        headers = {h["name"]: h["value"] for h in thread["messages"][0].get("payload", {}).get("headers", [])}
        labels = thread["messages"][0].get("labelIds", [])

        output.append({
            "thread_id": t["id"],
            "subject": headers.get("Subject", "(no subject)"),
            "from": headers.get("From", ""),
            "date": headers.get("Date", ""),
            "snippet": thread["messages"][0].get("snippet", ""),
            "is_starred": "STARRED" in labels,
            "message_count": len(thread["messages"]),
        })

    return output
