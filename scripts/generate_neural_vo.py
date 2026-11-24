"""Generate the FINAL Arabic male voice-over with Microsoft neural TTS (edge-tts).

Default voice: ar-IQ-BasselNeural (Iraqi Arabic, male). Needs network access to
speech.platform.bing.com (no API key).   pip install edge-tts

Output: public/audio/vo/final/<id>.wav  (one processed, loudness-matched file per line)
Then:   npm run retime && npm run render:final

Env overrides: VO_VOICE, VO_RATE (e.g. +6%), VO_PITCH (e.g. -6Hz)
"""
import asyncio
import json
import os
import subprocess
import tempfile

import ssl

import edge_tts
import edge_tts.communicate as _comm

# Respect an outbound HTTPS proxy (and its CA bundle) when the machine uses one.
PROXY = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
_CA = os.environ.get("SSL_CERT_FILE") or ("/root/.ccr/ca-bundle.crt" if os.path.exists("/root/.ccr/ca-bundle.crt") else None)
if _CA:
    _comm._SSL_CTX = ssl.create_default_context(cafile=_CA)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, "src", "data", "timeline.json"), encoding="utf-8"))
OUT = os.path.join(ROOT, "public", "audio", "vo", "final")
os.makedirs(OUT, exist_ok=True)

VOICE = os.environ.get("VO_VOICE", "ar-IQ-BasselNeural")
RATE = os.environ.get("VO_RATE", "+12%")
PITCH = os.environ.get("VO_PITCH", "-5Hz")
# Accent guard: only Iraqi-locale voices are allowed for this ad (never Egyptian / Gulf).
if not VOICE.startswith("ar-IQ-"):
    raise SystemExit(f"Refusing non-Iraqi voice {VOICE}: this ad requires an ar-IQ voice")

# Spoken text comes from timeline.json "voiced" (Iraqi dialect narration, digits written as words).
LINE_RATE = {"v12": "+0%"}  # phone number slower and clearer

# Voice chain: rumble cut, warmth/body, presence, gentle compression, tight silence trim, loudness.
CHAIN = (
    "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,"
    "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,"
    "highpass=f=75,equalizer=f=140:t=q:w=1:g=3,equalizer=f=3200:t=q:w=1.2:g=2,"
    "equalizer=f=7000:t=q:w=2:g=-1.5,"
    "acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,"
    "loudnorm=I=-16:TP=-1.5:LRA=7"
)


async def synth(text, path, rate):
    await edge_tts.Communicate(text, VOICE, rate=rate, pitch=PITCH, proxy=PROXY).save(path)


async def main():
    for v in TL["voiceOver"]:
        dst = os.path.join(OUT, f"{v['id']}.wav")
        if v.get("silent"):
            if os.path.exists(dst):
                os.remove(dst)
            print(f"{v['id']}: (silent visual beat)")
            continue
        text = v["voiced"]
        with tempfile.TemporaryDirectory() as td:
            mp3 = os.path.join(td, "l.mp3")
            for attempt in range(4):
                try:
                    await synth(text, mp3, LINE_RATE.get(v["id"], RATE))
                    break
                except Exception as e:  # network hiccup – retry with backoff
                    if attempt == 3:
                        raise
                    print("retry", v["id"], e)
                    await asyncio.sleep(2 * (attempt + 1))
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", mp3, "-af", CHAIN, "-ar", "48000", "-ac", "2", dst], check=True)
        d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", dst],
                                 capture_output=True, text=True).stdout)
        slot = (v["to"] - v["from"]) / TL["fps"]
        print(f"{v['id']}: {d:5.2f}s (current slot {slot:5.2f}s)  {text[:50]}")


asyncio.run(main())
