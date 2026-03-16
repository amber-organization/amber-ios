from .screen import screenshot, get_screen_state
from .mouse import click, right_click, double_click, scroll, move_to
from .keyboard import type_text, press_key, hotkey
from .apps import open_app, activate_app, run_applescript
from .shell import run_shell
from .clipboard import copy_to_clipboard, get_clipboard

__all__ = [
    "screenshot", "get_screen_state",
    "click", "right_click", "double_click", "scroll", "move_to",
    "type_text", "press_key", "hotkey",
    "open_app", "activate_app", "run_applescript",
    "run_shell",
    "copy_to_clipboard", "get_clipboard",
]
