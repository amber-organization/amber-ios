"""App control via AppleScript — open, activate, query frontmost app."""
from __future__ import annotations

import subprocess
import shlex


def run_applescript(script: str) -> str:
    """Run an AppleScript and return stdout."""
    result = subprocess.run(
        ["osascript", "-e", script],
        capture_output=True,
        text=True,
        timeout=15,
    )
    if result.returncode != 0:
        raise RuntimeError(f"AppleScript error: {result.stderr.strip()}")
    return result.stdout.strip()


def open_app(app_name: str) -> str:
    """Open an application by name (e.g. 'Safari', 'Mail', 'Calendar')."""
    result = subprocess.run(
        ["open", "-a", app_name],
        capture_output=True,
        text=True,
        timeout=10,
    )
    if result.returncode != 0:
        raise RuntimeError(f"Could not open {app_name}: {result.stderr.strip()}")
    return f"opened {app_name}"


def activate_app(app_name: str) -> str:
    """Bring an application to the foreground."""
    script = f'tell application "{app_name}" to activate'
    run_applescript(script)
    return f"activated {app_name}"


def get_frontmost_app() -> str:
    """Return the name of the currently focused application."""
    script = 'tell application "System Events" to get name of first application process whose frontmost is true'
    return run_applescript(script)


def open_url(url: str, browser: str = "Safari") -> str:
    """Open a URL in the specified browser."""
    subprocess.run(["open", "-a", browser, url], check=True, timeout=10)
    return f"opened {url} in {browser}"
