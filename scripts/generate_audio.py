"""Procedural cinematic soundtrack + sound-effects generator.

Generates, with numpy only (no samples, no copyright issues):
  public/audio/music.wav          – 70 s hybrid-orchestral motivational score (D minor),
                                    structured to the scene timeline in src/data/timeline.json
  public/audio/sfx/*.wav          – whoosh, impact, hit, riser, shimmer, ding, pop, tick

Run:  python3 scripts/generate_audio.py
Replace any file with a licensed library track/SFX of the same name for an even richer mix.
"""
import json
import os
import wave

import numpy as np

SR = 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, "src", "data", "timeline.json"), encoding="utf-8"))
FPS = TL["fps"]
TOTAL = TL["durationInFrames"] / FPS
rng = np.random.default_rng(2027)


# ----------------------------------------------------------------- helpers
def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def write_wav(path, x):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    peak = np.max(np.abs(x)) + 1e-9
    x = x / peak * 0.89  # normalise to about -1 dBFS
    data = (x * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def fft_filter(x, lo=None, hi=None, slope=1.0):
    """Zero-phase spectral filter (soft-knee low/high pass)."""
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    g = np.ones_like(f)
    if hi is not None:
        g *= 1 / (1 + (f / hi) ** (4 * slope))
    if lo is not None:
        g *= 1 / (1 + (lo / np.maximum(f, 1e-3)) ** (4 * slope))
    return np.fft.irfft(X * g, n)


def conv(x, ir):
    n = len(x) + len(ir) - 1
    N = 1 << (n - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, N) * np.fft.rfft(ir, N), N)[:n]
    return y


def make_ir(dur=2.8, decay=2.2, bright=6000, seed=1):
    r = np.random.default_rng(seed)
    t = t_axis(dur)
    ir = r.standard_normal(len(t)) * np.exp(-t * decay)
    ir = fft_filter(ir, lo=120, hi=bright)
    ir[:200] *= np.linspace(0, 1, 200)
    return ir / np.sqrt(np.sum(ir ** 2))


IR_L, IR_R = make_ir(seed=11), make_ir(seed=12)


def reverb(x, wet=0.35):
    l = conv(x, IR_L)[: len(x)]
    r = conv(x, IR_R)[: len(x)]
    return np.stack([x * (1 - wet) + l * wet, x * (1 - wet) + r * wet], axis=1)


def adsr(n, a=0.01, d=0.1, s=0.7, r=0.2):
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    s_n = max(n - a_n - d_n - r_n, 0)
    env = np.concatenate([
        np.linspace(0, 1, max(a_n, 1)),
        np.linspace(1, s, max(d_n, 1)),
        np.full(s_n, s),
        np.linspace(s, 0, max(r_n, 1)),
    ])
    return env[:n] if len(env) >= n else np.pad(env, (0, n - len(env)))


def saw(freq, t, phase=0.0):
    # band-limited saw by additive synthesis (warm, alias-free)
    y = np.zeros_like(t)
    k = 1
    while k * freq < 9000 and k < 40:
        y += np.sin(2 * np.pi * k * freq * t + phase * k) / k
        k += 1
    return y * 0.6


def note(n):  # midi -> Hz
    return 440.0 * 2 ** ((n - 69) / 12)


def place(buf, x, at):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(x))
    buf[i:j] += x[: j - i]


# ----------------------------------------------------------------- SFX
def sfx_whoosh(dur=0.9):
    t = t_axis(dur)
    n = len(t)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    hop, win = 512, 2048
    w = np.hanning(win)
    for s in range(0, n - win, hop):
        p = s / n
        fc = 300 + 5200 * np.sin(np.pi * p) ** 2
        seg = noise[s:s + win] * w
        S = np.fft.rfft(seg)
        f = np.fft.rfftfreq(win, 1 / SR)
        g = np.exp(-((np.log(f + 1) - np.log(fc)) ** 2) / 0.35)
        out[s:s + win] += np.fft.irfft(S * g, win) * w
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.6
    out *= env
    pan = np.linspace(-0.8, 0.8, n)
    st = np.stack([out * (1 - pan) / 2 + out * 0.3, out * (1 + pan) / 2 + out * 0.3], axis=1)
    return st


def sfx_impact(dur=4.0):
    t = t_axis(dur)
    f = 30 + 70 * np.exp(-t * 9)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.4)
    crack = fft_filter(rng.standard_normal(len(t)), lo=200, hi=5000) * np.exp(-t * 18)
    boom = fft_filter(rng.standard_normal(len(t)), hi=180) * np.exp(-t * 3) * 3
    x = sub * 1.2 + crack * 0.5 + boom * 0.4
    return reverb(x, 0.4)


def sfx_hit(dur=2.2):
    t = t_axis(dur)
    body = np.sin(2 * np.pi * (55 + 40 * np.exp(-t * 20)) * t) * np.exp(-t * 4)
    metal = sum(np.sin(2 * np.pi * f0 * t) * np.exp(-t * d) for f0, d in [(523, 3), (1310, 5), (2093, 6), (3271, 8)])
    trans = fft_filter(rng.standard_normal(len(t)), lo=800) * np.exp(-t * 40)
    return reverb(body * 1.1 + metal * 0.12 + trans * 0.4, 0.45)


def sfx_riser(dur=2.6):
    t = t_axis(dur)
    p = t / dur
    noise = rng.standard_normal(len(t))
    hp = fft_filter(noise, lo=1500) * p ** 2.5
    tone_f = 110 * 2 ** (p * 3)
    tone = np.sin(2 * np.pi * np.cumsum(tone_f) / SR) * 0.35 * p ** 2
    tone += np.sin(2 * np.pi * np.cumsum(tone_f * 1.5) / SR) * 0.2 * p ** 3
    x = hp * 0.6 + tone
    x[-int(0.03 * SR):] *= np.linspace(1, 0, int(0.03 * SR))
    return reverb(x, 0.3)


def sfx_shimmer(dur=2.6):
    t = t_axis(dur)
    x = np.zeros(len(t))
    for i in range(14):
        f0 = note(rng.choice([86, 88, 89, 91, 93, 96, 98, 100, 101]))
        st = rng.uniform(0, 0.9)
        env = np.where(t > st, np.exp(-(t - st) * rng.uniform(2.5, 4.5)), 0)
        x += np.sin(2 * np.pi * f0 * t) * env * rng.uniform(0.3, 1)
    return reverb(x, 0.6)


def sfx_ding(dur=1.8):
    t = t_axis(dur)
    f0 = note(86)
    x = sum(a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t * d) for r, a, d in [(1, 1, 3), (2.76, 0.4, 5), (5.4, 0.2, 7), (0.5, 0.3, 4)])
    return reverb(x, 0.5)


def sfx_pop(dur=0.5):
    t = t_axis(dur)
    x = np.sin(2 * np.pi * (300 + 900 * np.exp(-t * 30)) * t) * np.exp(-t * 18)
    return reverb(x, 0.3)


def sfx_tick(dur=0.35):
    t = t_axis(dur)
    x = np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 60) + fft_filter(rng.standard_normal(len(t)), lo=3000) * np.exp(-t * 90) * 0.4
    return reverb(x, 0.25)


# ----------------------------------------------------------------- MUSIC
def music():
    n = int((TOTAL + 0.2) * SR)
    L = np.zeros(n)
    R = np.zeros(n)
    bpm = 100
    beat = 60 / bpm
    bar = beat * 4
    S = {s["id"]: s for s in TL["scenes"]}
    V = {v["id"]: v for v in TL["voiceOver"]}
    climax = S["closing"]["from"] / FPS  # closing scene start
    final_hit = (V["v18"]["from"] - 4) / FPS  # name reveal
    contact_start = S["contact"]["from"] / FPS
    contact_end = climax
    features_start = S["f1"]["from"] / FPS

    # chord progression (D minor): Dm – Bb – F – C | Dm – Bb – Gm – A
    prog = [
        [50, 57, 62, 65, 69], [46, 53, 58, 62, 65], [53, 57, 60, 65, 69], [48, 55, 60, 64, 67],
        [50, 57, 62, 65, 69], [46, 53, 58, 62, 65], [43, 50, 55, 58, 62], [45, 52, 57, 61, 64],
    ]
    roots = [38, 34, 41, 36, 38, 34, 31, 33]

    def intensity(tt):
        if tt < 5:
            return 0.35
        if tt < features_start:
            return 0.6
        if tt < contact_start:
            return 0.8
        if tt < contact_end:
            return 0.6
        if tt < final_hit:
            return 1.0
        return 0.7

    # --- pads (two bars per chord) -----------------------------------
    pad = np.zeros(n)
    t_bar2 = 2 * bar
    k = 0
    tt = 0.0
    while tt < TOTAL:
        dur = min(t_bar2, final_hit - tt) if tt < final_hit else TOTAL + 0.2 - tt
        if dur <= 0.05:
            tt = final_hit
            continue
        chord = prog[k % len(prog)] if tt < final_hit else [50, 57, 62, 66, 69, 74]  # final: D major (Picardy) lift
        t = t_axis(dur + 0.6)
        seg = np.zeros(len(t))
        for m in chord:
            for det in (-0.08, 0.0, 0.08):
                seg += saw(note(m + det), t, rng.uniform(0, 6))
        seg = fft_filter(seg, hi=1400 + 1600 * intensity(tt), lo=80)
        seg *= adsr(len(t), a=0.5, d=0.4, s=0.85, r=0.6) * (0.5 + 0.5 * intensity(tt))
        place(pad, seg / len(chord), tt)
        tt += dur
        k += 1

    # --- pulse bass (8th notes, sidechained feel) ------------------------
    bass = np.zeros(n)
    eighth = beat / 2
    i = 0
    tt = 5.0 - eighth * 2
    while tt < final_hit - 0.05:
        idx = int(tt // t_bar2) % len(roots)
        r = roots[idx]
        if tt >= contact_start and tt < contact_end and i % 2 == 1:
            tt += eighth; i += 1; continue
        t = t_axis(eighth * 0.95)
        f0 = note(r)
        b = np.sin(2 * np.pi * f0 * t) + 0.35 * saw(f0, t)
        if tt >= climax:
            b += 0.6 * np.sin(2 * np.pi * f0 * 2 * t)
        b = b * adsr(len(t), 0.004, 0.08, 0.55, 0.05) * (0.45 + 0.45 * intensity(tt))
        place(bass, b, tt)
        tt += eighth
        i += 1
    bass = fft_filter(bass, hi=900)

    # --- arpeggio pluck (golden sparkle) ----------------------------------
    arp = np.zeros(n)
    sixteenth = beat / 4
    tt = features_start
    j = 0
    while tt < final_hit - 0.05:
        if contact_start <= tt < contact_end and j % 2:
            tt += sixteenth; j += 1; continue
        chord = prog[int(tt // t_bar2) % len(prog)]
        pattern = [0, 2, 4, 2, 1, 3, 4, 3]
        m = chord[pattern[j % 8]] + 12
        t = t_axis(0.5)
        f0 = note(m)
        p = (np.sin(2 * np.pi * f0 * t) + 0.3 * np.sin(2 * np.pi * 2 * f0 * t) + 0.12 * np.sin(2 * np.pi * 3 * f0 * t)) * np.exp(-t * 9)
        place(arp, p * (0.25 + 0.2 * intensity(tt)), tt)
        tt += sixteenth
        j += 1

    # --- drums ------------------------------------------------------------
    drums = np.zeros(n)

    def kick():
        t = t_axis(0.45)
        f = 45 + 90 * np.exp(-t * 28)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)

    def taiko():
        t = t_axis(0.9)
        body = np.sin(2 * np.pi * (70 + 30 * np.exp(-t * 15)) * t) * np.exp(-t * 5)
        skin = fft_filter(rng.standard_normal(len(t)), hi=900) * np.exp(-t * 14)
        return body + skin * 0.8

    def hat():
        t = t_axis(0.08)
        return fft_filter(rng.standard_normal(len(t)), lo=7000) * np.exp(-t * 70)

    def snare():
        t = t_axis(0.35)
        return fft_filter(rng.standard_normal(len(t)), lo=1200, hi=9000) * np.exp(-t * 16) + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 22) * 0.6

    K, T, H, S = kick(), taiko(), hat(), snare()
    tt = 5.0
    b = 0
    while tt < final_hit - 0.05:
        in_contact = contact_start <= tt < contact_end
        lvl = intensity(tt)
        pos = b % 4
        if tt >= features_start and not in_contact:
            if pos in (0, 2):
                place(drums, K * 0.9 * lvl, tt)
            if pos in (1, 3) and tt >= climax:
                place(drums, S * 0.45, tt)
            if b % 8 == 7:
                place(drums, T * 0.7 * lvl, tt + beat / 2)
        elif in_contact and pos == 0:
            place(drums, K * 0.6, tt)
        if tt >= 8:
            place(drums, H * 0.18 * lvl, tt + beat / 2)
            if tt >= climax:
                place(drums, H * 0.12, tt)
        tt += beat
        b += 1
    # taiko roll into climax
    for q in range(8):
        place(drums, T * (0.4 + q * 0.08), climax - 2 * beat + q * beat / 4)

    # --- mix ----------------------------------------------------------------
    dry = pad * 0.55 + bass * 0.55 + arp * 0.35 + drums * 0.75
    wet_src = pad * 0.6 + arp * 0.6 + drums * 0.15
    l_rev = conv(wet_src, IR_L)[:n]
    r_rev = conv(wet_src, IR_R)[:n]
    # stereo width: arp slightly panned with slow LFO
    tt_all = np.arange(n) / SR
    lfo = 0.3 * np.sin(2 * np.pi * 0.1 * tt_all)
    L = dry + arp * 0.1 * (1 + lfo) + l_rev * 0.45
    R = dry + arp * 0.1 * (1 - lfo) + r_rev * 0.45
    # global sidechain pump on kicks from features onward (subtle)
    st = np.stack([L, R], axis=1)
    # fade in / out
    fi = int(0.25 * SR)
    st[:fi] *= np.linspace(0, 1, fi)[:, None]
    fo_start = int((TOTAL - 1.6) * SR)
    st[fo_start:] *= np.linspace(1, 0, n - fo_start)[:, None] ** 1.5
    # soft clip
    st = np.tanh(st / (np.max(np.abs(st)) + 1e-9) * 1.6) / np.tanh(1.6)
    return st


def main():
    sfx_dir = os.path.join(ROOT, "public", "audio", "sfx")
    os.makedirs(sfx_dir, exist_ok=True)
    for name, fn in [("whoosh", sfx_whoosh), ("impact", sfx_impact), ("hit", sfx_hit), ("riser", sfx_riser),
                     ("shimmer", sfx_shimmer), ("ding", sfx_ding), ("pop", sfx_pop), ("tick", sfx_tick)]:
        write_wav(os.path.join(sfx_dir, f"{name}.wav"), fn())
        print("sfx", name)
    write_wav(os.path.join(ROOT, "public", "audio", "music.wav"), music())
    print("music.wav written")


if __name__ == "__main__":
    main()
