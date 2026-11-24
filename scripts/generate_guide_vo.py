"""Generate a GUIDE (scratch) Arabic voice-over aligned to the timeline.

This uses the free offline espeak-ng + MBROLA Arabic male voice. It is a *timing guide*
for editing and for the voice artist – it is NOT broadcast quality. Replace it with a
studio recording or a premium neural voice (see docs/VOICE_OVER.md).

Requires:  sudo apt-get install espeak-ng mbrola mbrola-ar2 ffmpeg
Run:       python3 scripts/generate_guide_vo.py
Output:    public/audio/vo/guide/<id>.wav   (one file per line, already fitted to its slot)
"""
import json
import os
import subprocess
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, "src", "data", "timeline.json"), encoding="utf-8"))
FPS = TL["fps"]
OUT = os.path.join(ROOT, "public", "audio", "vo", "guide")
os.makedirs(OUT, exist_ok=True)
VOICE = os.environ.get("GUIDE_VOICE", "mb-ar2")


def duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


for seg in TL["voiceOver"]:
    if seg.get("silent"):
        continue
    slot = (seg["to"] - seg["from"]) / FPS
    with tempfile.TemporaryDirectory() as td:
        raw = os.path.join(td, "raw.wav")
        subprocess.run(["espeak-ng", "-v", VOICE, "-s", "150", "-p", "30", "-a", "180", "-w", raw, seg["voiced"]],
                       check=True, capture_output=True)
        # re-synthesise at the speaking rate that fits the slot, then fine-tune with atempo
        speed = int(max(110, min(320, 150 * duration(raw) / slot)))
        subprocess.run(["espeak-ng", "-v", VOICE, "-s", str(speed), "-p", "30", "-a", "180", "-w", raw, seg["voiced"]],
                       check=True, capture_output=True)
        d = duration(raw)
        tempo = max(0.8, min(1.25, d / slot))
        dst = os.path.join(OUT, f"{seg['id']}.wav")
        af = (f"atempo={tempo:.3f},highpass=f=70,lowpass=f=7500,"
              "acompressor=threshold=-18dB:ratio=3:attack=5:release=80,"
              "aecho=0.8:0.5:40|70:0.12|0.07,loudnorm=I=-16:TP=-1.5")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", af, "-ar", "44100", "-ac", "2", dst], check=True)
        print(f"{seg['id']}: raw {d:.2f}s -> slot {slot:.2f}s (tempo {tempo:.2f}) -> {duration(dst):.2f}s")
