"""Sync a human voice-over recording to the ad, sentence by sentence.

The recording (assets/voice-over/iraqi-voiceover-original.wav) is cut at the measured
sentence boundaries below (cuts sit inside pauses; segments are contiguous, so no word is
dropped). Each sentence is placed at the frame where its on-screen text appears
(the scene's visual anchor `from` in src/data/timeline.json). Only if a sentence is longer
than its scene window is it gently time-stretched (rubberband, pitch & formants preserved,
max +15 %). Writes public/audio/vo/final/<id>.wav and audioFrom/audioTo in the timeline.
"""
import json, os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "voice-over", "iraqi-voiceover-original.wav")
TLP = os.path.join(ROOT, "src", "data", "timeline.json")
OUT = os.path.join(ROOT, "public", "audio", "vo", "final")
FPS = 30

# id -> (start, end) seconds in the recording (measured: pauses, syllable counts, digit rhythm)
CUTS = {
    "v01": (0.00, 2.34), "v03": (2.34, 11.00), "v04": (11.00, 17.17), "v05": (17.17, 18.97),
    "v06": (18.97, 20.08), "v07": (20.08, 25.81), "v08": (25.81, 30.19), "v09": (30.19, 33.95),
    "v10": (33.95, 40.23), "v11": (40.23, 43.79), "v12": (43.79, 49.90), "v13": (49.90, 52.76),
    "v16": (52.76, 54.59), "v17": (54.59, None),
}
EARLY = 12     # a sentence that needs room may start up to 0.4 s early (never before its scene appears)
EXACT = {"v12", "v16"}  # tied to precise visual hits (phone digits slam-in, CTA button): never start early
GAP = 5        # min frames of breathing room before the next sentence
MAX_TEMPO = 1.15

# Clean-up chain for the whole recording (one pass → consistent level across sentences)
CHAIN = ("afftdn=nr=8:nf=-50,highpass=f=80,equalizer=f=160:t=q:w=1:g=2.5,"
         "equalizer=f=3000:t=q:w=1.2:g=2,acompressor=threshold=-22dB:ratio=2.5:attack=10:release=150:makeup=1.5,"
         "loudnorm=I=-16:TP=-2:LRA=8,aresample=48000:resampler=soxr")


def run(*a):
    subprocess.run(list(a), check=True)


def probe(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                                capture_output=True, text=True).stdout)


def speech_bounds(p):
    """First/last instant above -40 dBFS (trim the silence that the pause-cuts leave)."""
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", p, "-af", "silencedetect=noise=-40dB:d=0.05", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    d = probe(p); s, e = 0.0, d
    starts = [float(l.split("silence_start: ")[1]) for l in out.splitlines() if "silence_start" in l]
    ends = [float(l.split("silence_end: ")[1].split()[0]) for l in out.splitlines() if "silence_end" in l]
    if starts and starts[0] <= 0.01 and ends: s = ends[0]
    if starts and (len(starts) > len(ends) or (ends and ends[-1] >= d - 0.01)): e = starts[-1]
    return max(0, s - 0.03), min(d, e + 0.06)


def main():
    tl = json.load(open(TLP, encoding="utf-8"))
    os.makedirs(OUT, exist_ok=True)
    clean = os.path.join(OUT, "_clean.wav")
    run("ffmpeg", "-y", "-v", "error", "-i", SRC, "-af", CHAIN, "-ac", "2", clean)
    vo = {v["id"]: v for v in tl["voiceOver"]}
    scene_of = {}
    for v in tl["voiceOver"]:
        scene_of[v["id"]] = max((sc["from"] for sc in tl["scenes"] if sc["from"] <= v["from"]), default=0)
    order = [k for k in CUTS]
    prev_end = 0
    report = []
    for i, vid in enumerate(order):
        a, b = CUTS[vid]
        seg = os.path.join(OUT, f"_{vid}.wav")
        args = ["ffmpeg", "-y", "-v", "error", "-ss", f"{a}", "-i", clean]
        if b: args += ["-t", f"{b - a}"]
        run(*args, "-c:a", "pcm_s16le", seg)
        s, e = speech_bounds(seg)
        dst = os.path.join(OUT, f"{vid}.wav")
        anchor = vo[vid]["from"]
        nxt_id = order[i + 1] if i + 1 < len(order) else None
        nxt = (max(vo[nxt_id]["from"] - EARLY, scene_of[nxt_id] + 3) if nxt_id else tl["durationInFrames"] - 15)
        start = max(prev_end + GAP, anchor)
        dur_f = (e - s) * FPS
        if vid in EXACT:
            nxt = max(nxt, start + dur_f / MAX_TEMPO + GAP + 1)   # let the next sentence shift slightly instead
        elif start + dur_f > nxt - GAP:            # needs room: start a little earlier first
            start = max(prev_end + GAP, anchor - EARLY, scene_of[vid] + 3)
        room = nxt - GAP - start
        tempo = max(1.0, min(MAX_TEMPO, dur_f / room)) if room > 0 else MAX_TEMPO
        f = f"atrim={s:.3f}:{e:.3f},asetpts=N/SR/TB,afade=t=in:d=0.012,areverse,afade=t=in:d=0.03,areverse"
        if tempo > 1.001:
            f += f",rubberband=tempo={tempo:.4f}:formant=preserved:pitch=1:transients=smooth"
        run("ffmpeg", "-y", "-v", "error", "-i", seg, "-af", f, "-ar", "48000", "-ac", "2", dst)
        os.remove(seg)
        d = probe(dst)
        vo[vid]["audioFrom"] = int(start)
        vo[vid]["audioTo"] = int(round(start + d * FPS))
        prev_end = vo[vid]["audioTo"]
        report.append((vid, anchor, start, d, tempo))
    os.remove(clean)
    for v in tl["voiceOver"]:
        if v.get("silent"):
            v.pop("audioFrom", None); v.pop("audioTo", None)
    json.dump(tl, open(TLP, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    for vid, anchor, start, d, tempo in report:
        print(f"{vid}: text appears {anchor/FPS:6.2f}s | voice starts {start/FPS:6.2f}s "
              f"(offset {(start-anchor)/FPS*1000:+5.0f} ms) | {d:4.2f}s | tempo {tempo:.2f} | {vo[vid]['text'][:38]}")


if __name__ == "__main__":
    main()
