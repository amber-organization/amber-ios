"""Screen observation tools — screenshot + Claude vision analysis."""
from __future__ import annotations

import base64
import io
import os
from typing import Any

import pyautogui
from PIL import Image


def screenshot(region: tuple[int, int, int, int] | None = None) -> tuple[bytes, str]:
    """
    Take a screenshot (or region) and return:
      - raw PNG bytes
      - base64-encoded string for Claude vision API
    """
    img: Image.Image = pyautogui.screenshot(region=region)  # type: ignore[arg-type]
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    raw = buf.getvalue()
    b64 = base64.standard_b64encode(raw).decode()
    return raw, b64


def get_screen_state() -> dict[str, Any]:
    """
    Return current screen dimensions and a base64 screenshot for Claude.
    Used at the start of each agent step.
    """
    width, height = pyautogui.size()
    _, b64 = screenshot()
    return {
        "width": width,
        "height": height,
        "screenshot_b64": b64,
    }
