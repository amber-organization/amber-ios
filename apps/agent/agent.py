"""
Amber macOS Agent — core plan/execute/verify loop.

Architecture:
  1. Receive task prompt (from Amber backend or morning brief scheduler)
  2. Plan: ask Claude with screenshot context for a step-by-step plan
  3. Execute: run each step using the tools (mouse, keyboard, apps, shell)
  4. Verify: take screenshot after each step, confirm success with Claude vision
  5. Log: update task status + steps in Amber backend after each action
  6. If approval_required: pause, notify user via iMessage, wait for approval
"""
from __future__ import annotations

import asyncio
import base64
import json
import os
import time
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

import httpx

from tools.screen import screenshot
from tools.mouse import click, scroll
from tools.keyboard import type_text, hotkey, press_key
from tools.apps import open_app, activate_app, run_applescript, open_url
from tools.shell import run_shell
from tools.clipboard import copy_to_clipboard, get_clipboard
from integrations.amber_api import update_task, send_message
from integrations.voice import speak

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
AMBER_USER_ID = int(os.getenv("AMBER_USER_ID", "1"))

MODEL = "claude-sonnet-4-6"
MAX_STEPS = 20
STEP_DELAY = 1.0  # seconds between actions


# ── Tool definitions for Claude ──────────────────────────────────────────────

TOOLS = [
    {
        "name": "click",
        "description": "Click the mouse at (x, y) coordinates on screen.",
        "input_schema": {
            "type": "object",
            "properties": {
                "x": {"type": "integer"},
                "y": {"type": "integer"},
                "button": {"type": "string", "enum": ["left", "right", "middle"], "default": "left"},
            },
            "required": ["x", "y"],
        },
    },
    {
        "name": "type_text",
        "description": "Type text as keyboard input.",
        "input_schema": {
            "type": "object",
            "properties": {"text": {"type": "string"}},
            "required": ["text"],
        },
    },
    {
        "name": "press_key",
        "description": "Press a single key (e.g. 'return', 'escape', 'tab', 'space').",
        "input_schema": {
            "type": "object",
            "properties": {"key": {"type": "string"}},
            "required": ["key"],
        },
    },
    {
        "name": "hotkey",
        "description": "Press a keyboard shortcut (e.g. 'command+c', 'command+space').",
        "input_schema": {
            "type": "object",
            "properties": {"keys": {"type": "string", "description": "e.g. 'command+c'"}},
            "required": ["keys"],
        },
    },
    {
        "name": "open_app",
        "description": "Open a macOS application by name.",
        "input_schema": {
            "type": "object",
            "properties": {"app_name": {"type": "string"}},
            "required": ["app_name"],
        },
    },
    {
        "name": "open_url",
        "description": "Open a URL in the default browser.",
        "input_schema": {
            "type": "object",
            "properties": {"url": {"type": "string"}},
            "required": ["url"],
        },
    },
    {
        "name": "run_applescript",
        "description": "Execute an AppleScript and return output.",
        "input_schema": {
            "type": "object",
            "properties": {"script": {"type": "string"}},
            "required": ["script"],
        },
    },
    {
        "name": "run_shell",
        "description": "Run a shell command and return stdout.",
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {"type": "string"},
                "timeout": {"type": "integer", "default": 30},
            },
            "required": ["command"],
        },
    },
    {
        "name": "scroll",
        "description": "Scroll the mouse wheel at a position.",
        "input_schema": {
            "type": "object",
            "properties": {
                "x": {"type": "integer"},
                "y": {"type": "integer"},
                "clicks": {"type": "integer", "description": "Positive = up, negative = down"},
            },
            "required": ["x", "y", "clicks"],
        },
    },
    {
        "name": "get_clipboard",
        "description": "Return the current clipboard contents.",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "request_approval",
        "description": "Pause execution and ask the user for approval before continuing. Use this before any irreversible action (send email, delete file, make payment, etc.).",
        "input_schema": {
            "type": "object",
            "properties": {
                "reason": {"type": "string", "description": "What you're about to do and why you need approval"},
            },
            "required": ["reason"],
        },
    },
    {
        "name": "task_complete",
        "description": "Mark the task as complete and provide a summary.",
        "input_schema": {
            "type": "object",
            "properties": {
                "summary": {"type": "string", "description": "What was accomplished"},
            },
            "required": ["summary"],
        },
    },
]


# ── Tool execution ────────────────────────────────────────────────────────────

def execute_tool(name: str, inputs: dict[str, Any]) -> str:
    """Execute a tool call and return the result as a string."""
    try:
        if name == "click":
            click(inputs["x"], inputs["y"], inputs.get("button", "left"))
            return f"Clicked ({inputs['x']}, {inputs['y']})"

        elif name == "type_text":
            type_text(inputs["text"])
            return f"Typed: {inputs['text'][:50]}..."

        elif name == "press_key":
            press_key(inputs["key"])
            return f"Pressed: {inputs['key']}"

        elif name == "hotkey":
            keys = inputs["keys"].split("+")
            hotkey(*keys)
            return f"Hotkey: {inputs['keys']}"

        elif name == "open_app":
            open_app(inputs["app_name"])
            return f"Opened: {inputs['app_name']}"

        elif name == "open_url":
            open_url(inputs["url"])
            return f"Opened URL: {inputs['url']}"

        elif name == "run_applescript":
            result = run_applescript(inputs["script"])
            return result or "(no output)"

        elif name == "run_shell":
            result = run_shell(inputs["command"], timeout=inputs.get("timeout", 30))
            return result[:500] if result else "(no output)"

        elif name == "scroll":
            scroll(inputs["x"], inputs["y"], inputs["clicks"])
            return f"Scrolled {inputs['clicks']} at ({inputs['x']}, {inputs['y']})"

        elif name == "get_clipboard":
            return get_clipboard()

        else:
            return f"Unknown tool: {name}"

    except Exception as e:
        return f"Error: {e}"


# ── Main agent loop ───────────────────────────────────────────────────────────

@dataclass
class AgentStep:
    step: int
    action: str
    tool: str
    result: str
    screenshot_b64: str = ""
    completed_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())


async def run_task(task_id: int, prompt: str) -> str:
    """
    Run a task from start to finish. Returns the final summary.
    Updates Amber backend after each step.
    """
    steps: list[AgentStep] = []
    messages: list[dict] = []

    # Mark task as running
    await update_task(task_id, {"status": "running"})

    # Take initial screenshot for context
    _, screen_b64 = screenshot()

    system_prompt = """You are Amber's macOS agent. You control a Mac computer to complete tasks for the user.

RULES:
- Always take a screenshot before clicking to verify the current state
- Use request_approval before any irreversible action (sending emails, deleting files, making payments, form submissions)
- Be efficient — take the minimum number of steps
- When the task is done, call task_complete with a clear summary
- If you're stuck after 3 attempts at a step, report the problem and stop

You have vision — screenshots are attached to help you see the current screen state."""

    # Initial message with screenshot
    messages.append({
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": screen_b64,
                },
            },
            {
                "type": "text",
                "text": f"Task: {prompt}\n\nCurrent screen is attached. Create a plan and execute it step by step.",
            },
        ],
    })

    step_num = 0
    final_summary = ""

    while step_num < MAX_STEPS:
        # Call Claude
        response = httpx.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": MODEL,
                "max_tokens": 2048,
                "system": system_prompt,
                "tools": TOOLS,
                "messages": messages,
            },
            timeout=60,
        )
        response.raise_for_status()
        data = response.json()

        messages.append({"role": "assistant", "content": data["content"]})

        # Process tool calls
        tool_results = []
        done = False

        for block in data["content"]:
            if block["type"] != "tool_use":
                continue

            tool_name = block["name"]
            tool_input = block["input"]
            tool_use_id = block["id"]

            step_num += 1

            # Handle special control tools
            if tool_name == "request_approval":
                reason = tool_input.get("reason", "")
                await update_task(task_id, {
                    "status": "waiting_approval",
                    "approvalRequired": True,
                    "approvalPrompt": reason,
                    "steps": [vars(s) for s in steps],
                })

                # Notify user via iMessage
                await send_message(
                    AMBER_USER_ID,
                    f"⚠️ Amber needs your approval:\n\n{reason}\n\nCheck the Amber app to approve or deny.",
                )

                # Wait for approval (poll DB) — up to 10 minutes
                approved = await wait_for_approval(task_id, timeout=600)

                if approved:
                    result = "Approved by user — continuing."
                    await update_task(task_id, {"status": "running"})
                else:
                    result = "Not approved — task cancelled."
                    await update_task(task_id, {"status": "cancelled"})
                    done = True

            elif tool_name == "task_complete":
                final_summary = tool_input.get("summary", "Task completed.")
                result = final_summary
                done = True

            else:
                # Execute the tool
                time.sleep(STEP_DELAY)
                result = execute_tool(tool_name, tool_input)

                # Screenshot after each action for verification
                _, post_b64 = screenshot()

                step = AgentStep(
                    step=step_num,
                    action=tool_input.get("description", tool_name),
                    tool=tool_name,
                    result=result,
                    screenshot_b64=post_b64,
                )
                steps.append(step)

                # Update task in backend
                await update_task(task_id, {
                    "steps": [vars(s) for s in steps],
                })

                # Add screenshot to messages for next turn
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": tool_use_id,
                    "content": [
                        {"type": "text", "text": result},
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/png",
                                "data": post_b64,
                            },
                        },
                    ],
                })
                continue

            # For control tools (approval, complete)
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tool_use_id,
                "content": result,
            })

        if tool_results:
            messages.append({"role": "user", "content": tool_results})

        if done or data.get("stop_reason") == "end_turn":
            break

    # Mark complete
    await update_task(task_id, {
        "status": "completed",
        "result": final_summary or "Task finished.",
        "steps": [vars(s) for s in steps],
        "completedAt": datetime.utcnow().isoformat(),
    })

    return final_summary or "Task completed."


async def wait_for_approval(task_id: int, timeout: int = 600) -> bool:
    """Poll the Amber backend until the task is approved or timeout."""
    import os
    amber_url = os.getenv("AMBER_API_URL", "http://localhost:3000")
    secret = os.getenv("AMBER_AGENT_SECRET", "")

    start = time.time()
    while time.time() - start < timeout:
        await asyncio.sleep(10)
        try:
            res = httpx.get(
                f"{amber_url}/agent/tasks/{task_id}",
                headers={"X-Agent-Secret": secret},
                timeout=10,
            )
            if res.status_code == 200:
                task = res.json().get("task", {})
                if task.get("status") == "running" and task.get("approvedAt"):
                    return True
                if task.get("status") == "cancelled":
                    return False
        except Exception:
            pass

    return False
