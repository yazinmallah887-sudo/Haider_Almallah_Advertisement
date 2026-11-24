# إعلان الدورات الصيفية 2027–2028 — الأستاذ حيدر الملاح

A cinematic motion-graphics ad built with **React + Remotion**: 9:16, 1080×1920, 30 fps, about 72 s.
The colours are royal navy, metallic gold and white, with Arabic RTL kinetic typography, 3D gold
type, animated 3D icon medallions, particles with depth of field, light streaks, god rays,
parallax camera moves, synced captions, an original procedural score and sound effects.

> Why about 72 s and not 60 s? The full script (about 175 words) is used **without cutting any
> sentence or information**. At an energetic but clear ad read that needs about 70 s. See
> "60-second cut" below.

---

## Quick start

```bash
npm install
npm run dev            # Remotion Studio → http://localhost:3000 (live preview, scrub, edit)
npm run render         # → out/haider-almallah-summer-2027-2028.mp4  (music + SFX + captions)
npm run render:guide   # same, with the scratch guide voice-over
npm run render:final   # same, with YOUR real voice-over (public/audio/vo/final/v01..v18.wav)
npm run render:mobile  # 540×960 light preview for phones / WhatsApp
npm run still          # poster / thumbnail PNG of the end card
```

Requirements: Node 18+ and FFmpeg (Remotion downloads its own headless Chrome on the first render).
Python 3 + numpy is needed only to regenerate the audio or timeline.

## Mobile preview

* `out/haider-almallah-summer-2027-2028.mp4`: open it from GitHub on your phone (**View raw** / Download).
* A mobile-friendly web page with the video player is also published as a private claude.ai Artifact (link in the delivery message).

---

## Storyboard

| # | Scene | Time | Visual treatment |
|---|---|---|---|
| 1 | Opening hook | 0–4 s | black → anamorphic flare burst, gold **light-tunnel** fly-through, kinetic words, giant 3D **«الأفضل!»** with god-rays and shock-ring |
| 1b | Registration + teacher | 4–10 s | gold pill «انطلاق التسجيل», 3D **2027 – 2028**, titles rise; arched gold portrait frame slides up with light sweep; logo spins in; name plate with lens flare |
| 2 | Location | 10–14 s | tilted **3D city map** with a river; the left bank lights up gold, the other bank dims, a pin medallion drops with pulse rings; glass card «معهد المتميزين – حي الحدباء» |
| 3 | Promise | 14–18 s | teacher avatar, «لا نكتفي بالشرح» struck through in gold, a light orb climbs **3D golden stairs** to «النجاح» |
| 3.1 | Feature 1 | 18–22 s | spinning book medallion (page flip), check-list rows plus an understanding bar |
| 3.2 | Feature 2 | 22–26 s | exam-sheet medallion (animated tick), 7-day calendar lighting up, weekly frame, badge «شاملة لكل وحدة» |
| 3.3 | Feature 3 | 26–32 s | monitor medallion, live dashboard: attendance ✓, grade bars, level trend line, scan light |
| 3.4 | Feature 4 | 32–37 s | parent/chat medallion, chat bubbles «نجاح الطالب مسؤوليتنا» … «مع ولي الأمر» |
| 3.5 | Feature 5 | 37–43 s | graduation-cap medallion, glowing path from «أول محاضرة» to «قاعة الامتحان» |
| 4 | Registration | 43–56 s | ringing phone medallion; **0773 822 3960** slams in group by group (synced ticks), glowing panel, flare; institute reminder card |
| 5 | Closing | 56–72 s | riser → impact, «لا تؤجل مستقبلك!», key promise words, glossy gold CTA button **«احجز مقعدك الآن!»**, «الدرجة الكاملة تبدأ من هنا.», gold wash → **end card**: logo with god-rays, 3D gold «الأستاذ حيدر الملاح», «الدورات الصيفية 2027–2028», phone number |

Every scene animates relative to its own duration, so the whole video re-syncs automatically when the timeline changes.

---

## Project structure

```
src/
  Root.tsx              composition registration + Arabic fonts (Cairo, Reem Kufi – bundled via @fontsource)
  Ad.tsx                master composition: global stage, scenes, transitions, captions, audio
  theme.ts              palette & fonts
  data/timeline.json    ★ single source of truth: scene lengths, VO lines (plain + diacritised), SFX cues
  data/timeline.ts      typed helpers
  components/
    Background.tsx      navy stage, light orbs, volumetric beams, perspective gold floor, vignette, grain
    Particles.tsx       bokeh dust with depth of field + parallax
    Light.tsx           light streaks, anamorphic flare, god-rays, shock rings
    Typography.tsx      3D metallic GoldText, KineticWords (word-level, keeps Arabic joined), RTL/LTR isolation
    Icons3D.tsx         animated SVG icons + 3D gold medallion (thick spinning coin)
    Scene.tsx           SceneShell (entrances/exits, virtual camera), Parallax layers
    Transitions.tsx     gold light-sweep + bloom flash on every cut
    Captions.tsx        burned-in synced subtitles with karaoke highlight
    AudioLayer.tsx      music (auto-ducking), SFX cues, VO lines
  scenes/               Opening, Teacher, Location, Promise, Features (×5), Contact, Closing
public/
  images/               logo.png (background removed), teacher.jpg (navy-graded)
  audio/music.wav       original procedural cinematic score (D minor, 100 BPM, synced sections)
  audio/sfx/*.wav       whoosh, impact, hit, riser, shimmer, ding, pop, tick
  audio/vo/guide/       scratch guide VO (v01–v18)
  audio/vo/final/       ← put the real recorded VO here
scripts/
  prepare_images.py     logo cut-out + portrait colour grade
  build_timeline.py     (re)time the whole ad from VO lengths   → npm run retime
  generate_audio.py     score + SFX generator (numpy)
  generate_guide_vo.py  guide VO (espeak-ng + MBROLA)
  export_srt.py         out/subtitles-ar.srt
props/                  render presets (no-vo / guide / final)
docs/VOICE_OVER.md      voice casting brief, line table, diacritised script, AI-voice settings
assets/source/          original logo & photo
```

---

## Adding the professional voice-over

1. Record or generate the 18 lines described in **[docs/VOICE_OVER.md](docs/VOICE_OVER.md)** (one file per line: `v01.wav` … `v18.wav`).
2. Put them in `public/audio/vo/final/`.
3. `npm run retime`: measures each recording, re-times every scene, cue, music section and subtitle.
4. `npm run render:final`.

The music automatically ducks by about 10 dB under every line.

## What this repo does vs. what needs an external tool

| Item | Status |
|---|---|
| Full animation, typography, 3D elements, transitions, captions | ✅ done in code, renders to MP4 |
| Music bed & SFX | ✅ original, generated in code (replace with a licensed library track of the same file name for an even bigger sound) |
| Professional Arabic male VO | ⚠️ needs a **voice artist** or a premium neural TTS (ElevenLabs / Azure). A guide VO is included for timing; the pipeline is ready (`npm run retime && npm run render:final`) |
| Background removal of the teacher photo | Optional: for a cut-out (no backdrop) portrait, export a transparent PNG (remove.bg / Photoshop) as `public/images/teacher.png` and point `Teacher.tsx` to it |

## 60-second cut (optional)

If a platform needs ≤ 60 s, set `PACE=2.4 npm run retime` for a faster read, or record VO at an
energetic pace. Every scene stretches or compresses automatically.

## Safe zones

Key content stays between y ≈ 180 and 1560 px. Captions sit at about 1590 px, above the Reels / TikTok UI.
Captions can be switched off (`captions: false` in `props/*.json`) when you upload `out/subtitles-ar.srt` instead.
