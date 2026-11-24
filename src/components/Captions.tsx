import React from 'react';
import {useCurrentFrame} from 'remotion';
import {NO_CAPTION, audioRange, spokenLines} from '../data/timeline';
import {C, FONT_BODY} from '../theme';
import {tween} from './motion';
import {withLtrNumbers} from './Typography';

const MAX_WORDS = 6;

type Chunk = {words: string[]; from: number; to: number; wordTimes: number[]};

/** Split each VO line into short caption chunks with per-word timing (proportional to length). */
const buildChunks = (): Chunk[] => {
  const out: Chunk[] = [];
  for (const v of spokenLines()) {
    if (NO_CAPTION.has(v.id)) continue;
    const words = v.text.split(/\s+/).filter(Boolean);
    // prefer breaking after punctuation
    const groups: string[][] = [];
    let cur: string[] = [];
    words.forEach((w, i) => {
      cur.push(w);
      const punct = /[،,:.!…]$/.test(w);
      const remaining = words.length - i - 1;
      if ((punct && cur.length >= 2 && remaining >= 2) || cur.length >= MAX_WORDS) {
        groups.push(cur);
        cur = [];
      }
    });
    if (cur.length) {
      if (cur.length <= 1 && groups.length) groups[groups.length - 1].push(...cur);
      else groups.push(cur);
    }
    const weight = (w: string) => w.replace(/[^؀-ۿ0-9]/g, '').length + 2;
    const total = words.reduce((a, w) => a + weight(w), 0);
    const r = audioRange(v);
    const span = r.to - r.from;
    let t = r.from;
    for (const g of groups) {
      const gw = g.reduce((a, w) => a + weight(w), 0);
      const len = (gw / total) * span;
      const wordTimes: number[] = [];
      let wt = t;
      for (const w of g) {
        wordTimes.push(wt);
        wt += (weight(w) / gw) * len;
      }
      out.push({words: g, from: t, to: t + len, wordTimes});
      t += len;
    }
  }
  return out;
};

const CHUNKS = buildChunks();

/** Burned-in synchronized Arabic subtitles with karaoke-style gold highlight. */
export const Captions: React.FC<{y?: number}> = ({y = 1590}) => {
  const f = useCurrentFrame();
  const chunk = CHUNKS.find((c) => f >= c.from - 2 && f < c.to + 6);
  if (!chunk) return null;
  const inP = tween(f, [chunk.from - 2, chunk.from + 6], [0, 1]);
  const outP = tween(f, [chunk.to, chunk.to + 6], [0, 1]);
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: y, display: 'flex', justifyContent: 'center'}}>
      <div
        dir="rtl"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: 14,
          padding: '14px 34px',
          borderRadius: 22,
          background: 'linear-gradient(180deg, rgba(3,10,31,0.72), rgba(3,10,31,0.55))',
          border: '1.5px solid rgba(230,195,92,0.35)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
          opacity: inP * (1 - outP),
          transform: `translateY(${(1 - inP) * 20}px)`,
          maxWidth: 940,
        }}
      >
        {chunk.words.map((w, i) => {
          const spoken = f >= chunk.wordTimes[i];
          return (
            <span
              key={i}
              style={{
                fontFamily: FONT_BODY,
                fontWeight: 700,
                fontSize: 46,
                lineHeight: 1.5,
                color: spoken ? C.goldLight : 'rgba(255,255,255,0.92)',
                textShadow: spoken ? '0 0 18px rgba(255,210,110,0.6)' : '0 2px 6px rgba(0,0,0,0.6)',
              }}
            >
              {withLtrNumbers(w)}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Export captions as SRT text (used by scripts/export-srt). */
export const captionsToSrt = (fps: number) => {
  const ts = (fr: number) => {
    const ms = Math.round((fr / fps) * 1000);
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const r = ms % 1000;
    const p = (n: number, l = 2) => String(n).padStart(l, '0');
    return `${p(h)}:${p(m)}:${p(s)},${p(r, 3)}`;
  };
  return CHUNKS.map((c, i) => `${i + 1}\n${ts(c.from)} --> ${ts(c.to)}\n${c.words.join(' ')}\n`).join('\n');
};
