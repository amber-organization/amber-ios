"""Mouse control — click, scroll, move."""
from __future__ import annotations

import time
import pyautogui

pyautogui.FAILSAFE = True      # move mouse to corner to abort
pyautogui.PAUSE = 0.05         # small pause after each action


def click(x: int, y: int) -> str:
    pyautogui.click(x, y)
    return f"clicked ({x}, {y})"


def right_click(x: int, y: int) -> str:
    pyautogui.rightClick(x, y)
    return f"right-clicked ({x}, {y})"


def double_click(x: int, y: int) -> str:
    pyautogui.doubleClick(x, y)
    return f"double-clicked ({x}, {y})"


def scroll(x: int, y: int, clicks: int) -> str:
    """Scroll at (x, y). Positive clicks = up, negative = down."""
    pyautogui.scroll(clicks, x=x, y=y)
    direction = "up" if clicks > 0 else "down"
    return f"scrolled {abs(clicks)} clicks {direction} at ({x}, {y})"


def move_to(x: int, y: int, duration: float = 0.2) -> str:
    pyautogui.moveTo(x, y, duration=duration)
    return f"moved mouse to ({x}, {y})"
