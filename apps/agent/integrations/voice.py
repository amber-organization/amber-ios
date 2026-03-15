"""
Fish Audio TTS integration — speak text through your Mac's speakers.
Used for morning briefs and spoken Amber responses.

API: https://api.fish.audio/v1/tts
SDK: pip install fish-audio-sdk
"""
from __future__ import annotations

import os
import subprocess
import tempfile

import httpx
import ormsgpack

FISH_API_KEY = os.getenv("FISH_AUDIO_API_KEY", "")

# Default voice: Energetic Male — change to any voice ID from fish.audio/discovery
DEFAULT_VOICE_ID = os.getenv("FISH_VOICE_ID", "802e3bc2b27e49c2995d23ef70e6ac89")

FISH_TTS_URL = "https://api.fish.audio/v1/tts"


def speak(text: str, voice_id: str = DEFAULT_VOICE_ID, play: bool = True) -> bytes:
    """
    Convert text to speech using Fish Audio and optionally play it on the Mac.
    Returns raw MP3 bytes.
    """
    if not FISH_API_KEY:
        raise RuntimeError("FISH_AUDIO_API_KEY not set — add it to your .env")

    payload = {
        "text": text,
        "reference_id": voice_id,
        "format": "mp3",
        "mp3_bitrate": 128,
        "latency": "normal",
        "chunk_length": 200,
        "normalize": True,
    }

    response = httpx.post(
        FISH_TTS_URL,
        content=ormsgpack.packb(payload),
        headers={
            "authorization": f"Bearer {FISH_API_KEY}",
            "content-type": "application/msgpack",
            "model": "s2-pro",
        },
        timeout=30,
    )
    response.raise_for_status()
    audio = response.content

    if play:
        _play_audio(audio)

    return audio


def _play_audio(mp3_bytes: bytes) -> None:
    """Write to a temp file and play via macOS `afplay`."""
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        f.write(mp3_bytes)
        tmp_path = f.name

    try:
        subprocess.run(["afplay", tmp_path], check=True, timeout=120)
    finally:
        os.unlink(tmp_path)


def speak_brief(brief_text: str) -> None:
    """Speak the morning operator brief aloud."""
    speak(brief_text, play=True)
