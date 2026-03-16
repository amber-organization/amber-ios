"""Shell execution — run terminal commands safely."""
from __future__ import annotations

import subprocess


def run_shell(command: str, timeout: int = 30) -> str:
    """
    Run a shell command and return combined stdout+stderr.
    Raises RuntimeError on non-zero exit code.
    """
    result = subprocess.run(
        command,
        shell=True,
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    output = (result.stdout + result.stderr).strip()
    if result.returncode != 0:
        raise RuntimeError(f"Command failed (exit {result.returncode}): {output}")
    return output or "(no output)"
