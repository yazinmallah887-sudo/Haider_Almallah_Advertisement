"""Export synchronized Arabic subtitles (SRT) from src/data/timeline.json.

Writes out/subtitles-ar.srt – upload it as a caption file on Facebook / YouTube, or keep the
burned-in captions that the Remotion composition already renders.
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, "src", "data", "timeline.json"), encoding="utf-8"))
FPS = TL["fps"]


def ts(frame):
    ms = round(frame / FPS * 1000)
    return f"{ms // 3600000:02d}:{ms % 3600000 // 60000:02d}:{ms % 60000 // 1000:02d},{ms % 1000:03d}"


os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
lines = []
for i, v in enumerate([x for x in TL["voiceOver"] if not x.get("silent")], 1):
    text = v["text"].replace("2027-2028", "⁦2027-2028⁩").replace("0773 822 3960", "⁦0773 822 3960⁩")
    lines.append(f"{i}\n{ts(v.get('audioFrom', v['from']))} --> {ts(v.get('audioTo', v['to']))}\n‫{text}‬\n")
path = os.path.join(ROOT, "out", "subtitles-ar.srt")
open(path, "w", encoding="utf-8").write("\n".join(lines))
print("written", path)
