"""Clipboard utilities."""
from __future__ import annotations

import subprocess


def copy_to_clipboard(text: str) -> str:
    """Copy text to the system clipboard via pbcopy."""
    subprocess.run("pbcopy", input=text.encode(), check=True)
    return f"copied {len(text)} chars to clipboard"


def get_clipboard() -> str:
    """Read the current clipboard contents via pbpaste."""
    result = subprocess.run("pbpaste", capture_output=True, check=True)
    return result.stdout.decode()
