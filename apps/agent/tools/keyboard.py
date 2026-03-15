"""Keyboard control — type text, press keys, hotkeys."""
from __future__ import annotations

import pyautogui


def type_text(text: str, interval: float = 0.03) -> str:
    """Type a string character-by-character."""
    pyautogui.typewrite(text, interval=interval)
    preview = text[:60] + "..." if len(text) > 60 else text
    return f"typed: {preview!r}"


def press_key(key: str) -> str:
    """Press a single key (e.g. 'enter', 'tab', 'escape', 'delete')."""
    pyautogui.press(key)
    return f"pressed {key}"


def hotkey(*keys: str) -> str:
    """
    Press a key combination (e.g. hotkey('command', 'c') for Cmd+C).
    Keys are held in order, then released in reverse.
    """
    pyautogui.hotkey(*keys)
    combo = "+".join(keys)
    return f"pressed hotkey {combo}"
