"""(Re)build src/data/timeline.json – scene lengths, VO slots and SFX cues.

Every scene in the Remotion project animates relative to its own duration, so the whole
video re-syncs automatically when the timeline changes.

Duration source for each voice-over line (in priority order):
  1. public/audio/vo/final/<id>.wav|mp3  – the real studio / AI recording (exact length used)
  2. an estimate from espeak-ng (if installed) divided by PACE
  3. an estimate from the word count (WPS words per second)

Run after you drop in the final voice-over files:
    python3 scripts/build_timeline.py && python3 scripts/generate_audio.py
"""
import json
import os
import shutil
import subprocess
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "src", "data", "timeline.json")
TL = json.load(open(PATH, encoding="utf-8"))
FPS = TL["fps"]
PACE = float(os.environ.get("PACE", "2.0"))  # espeak raw duration / energetic ad read
SLOW = {"v12": 1.45}  # phone number is read slower and clearer
WPS = 2.9

VO = {v["id"]: v for v in TL["voiceOver"]}

# scene id -> (label, [vo ids], lead-in frames, gap frames, tail frames)
STRUCTURE = [
    ("opening", "المشهد الأول – الافتتاحية", ["v01", "v02"], 6, 6, 8),
    ("teacher", "المشهد الأول – انطلاق التسجيل / تقديم الأستاذ", ["v03"], 10, 0, 12),
    ("location", "المشهد الثاني – مكان التدريس", ["v04"], 12, 0, 10),
    ("promise", "المشهد الثالث – مقدمة المميزات", ["v05"], 10, 0, 8),
    ("f1", "الميزة 1 – شرح مفصل للمادة", ["v06"], 11, 0, 7),
    ("f2", "الميزة 2 – امتحانات مستمرة", ["v07"], 11, 0, 7),
    ("f3", "الميزة 3 – نظام إلكتروني دقيق", ["v08"], 11, 0, 7),
    ("f4", "الميزة 4 – تواصل مباشر مع ولي الأمر", ["v09"], 11, 0, 7),
    ("f5", "الميزة 5 – متابعة حتى الامتحان الوزاري", ["v10"], 11, 0, 7),
    ("contact", "المشهد الرابع – معلومات التسجيل", ["v11", "v12", "v13"], 10, 8, 12),
    ("closing", "المشهد الخامس – الخاتمة", ["v14", "v15", "v16", "v17", "v18"], 8, 8, 45),
]


def probe(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                       capture_output=True, text=True)
    return float(r.stdout.strip())


def vo_seconds(vid):
    seg = VO[vid]
    if seg.get("silent"):
        return seg.get("minSec", 1.0), "silent"
    sec, src = _vo_seconds(vid)
    return max(sec, seg.get("minSec", 0)), src


def _vo_seconds(vid):
    for ext in ("wav", "mp3", "m4a"):
        p = os.path.join(ROOT, "public", "audio", "vo", "final", f"{vid}.{ext}")
        if os.path.exists(p):
            return probe(p) + 0.05, "final"
    seg = VO[vid]
    if shutil.which("espeak-ng"):
        with tempfile.TemporaryDirectory() as td:
            raw = os.path.join(td, "r.wav")
            r = subprocess.run(["espeak-ng", "-v", "mb-ar2", "-s", "150", "-w", raw, seg["voiced"]], capture_output=True)
            if r.returncode == 0 and os.path.exists(raw):
                return probe(raw) / SLOW.get(vid, PACE), "espeak"
    return len(seg["text"].split()) / WPS + 0.3, "words"


scenes, frame = [], 0
for sid, label, vids, lead, gap, tail in STRUCTURE:
    start = frame
    cur = start + lead
    for i, vid in enumerate(vids):
        sec, src = vo_seconds(vid)
        n = int(round(sec * FPS))
        VO[vid]["from"], VO[vid]["to"] = cur, cur + n
        VO[vid]["durationSource"] = src
        cur += n + (gap if i < len(vids) - 1 else 0)
    end = cur + tail
    scenes.append({"id": sid, "from": start, "duration": end - start, "label": label})
    frame = end

S = {s["id"]: s for s in scenes}
total = frame
sfx = [
    ("impact.wav", 0, 0.9), ("shimmer.wav", 10, 0.5),
]
for s in scenes[1:]:
    sfx.append(("whoosh.wav", s["from"] - 10, 0.65))
sfx += [
    ("hit.wav", S["teacher"]["from"] + 14, 0.7),
    ("shimmer.wav", S["teacher"]["from"] + 70, 0.45),
    ("pop.wav", S["location"]["from"] + 18, 0.6),
    ("hit.wav", S["promise"]["from"] + 6, 0.55),
]
for f in ("f1", "f2", "f3", "f4", "f5"):
    sfx.append(("ding.wav", S[f]["from"] + 12, 0.55))
ph = VO["v12"]
step = (ph["to"] - ph["from"]) / 3
sfx += [("hit.wav", S["contact"]["from"] + 8, 0.5)]
sfx += [("tick.wav", int(ph["from"] + i * step), 0.55) for i in range(3)]
sfx += [
    ("hit.wav", ph["to"] - 4, 0.6),
    ("riser.wav", S["closing"]["from"] - 78, 0.7),
    ("impact.wav", S["closing"]["from"], 1.0),
    ("hit.wav", VO["v16"]["from"] - 2, 0.75),
    ("riser.wav", VO["v18"]["from"] - 78, 0.4),
    ("impact.wav", VO["v18"]["from"] - 4, 1.0),
    ("shimmer.wav", VO["v18"]["from"], 0.6),
]
TL["scenes"] = scenes
TL["durationInFrames"] = total
TL["sfx"] = [{"file": f, "at": max(0, int(a)), "volume": v} for f, a, v in sorted(sfx, key=lambda x: x[1])]
TL["voiceOver"] = list(VO.values())
json.dump(TL, open(PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(f"timeline: {total} frames = {total / FPS:.1f}s")
for s in scenes:
    print(f"  {s['id']:9s} {s['from']:5d} +{s['duration']:4d}")
