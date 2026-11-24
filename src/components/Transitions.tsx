import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {TIMELINE} from '../data/timeline';
import {SOFT, tween} from './motion';

/**
 * Global transition layer: at each scene cut a golden light-sweep crosses the frame,
 * with a soft bloom flash exactly on the cut (hides the overlap between scenes).
 */
export const TransitionLayer: React.FC = () => {
  const f = useCurrentFrame();
  const cuts = TIMELINE.scenes.slice(1).map((s) => s.from);
  const cut = cuts.find((c) => f >= c - 12 && f <= c + 12);
  if (cut === undefined) return null;
  const i = cuts.indexOf(cut);
  const p = tween(f, [cut - 12, cut + 12], [0, 1], SOFT);
  const flash = Math.max(0, 1 - Math.abs(f - cut) / 7);
  const dir = i % 2 === 0 ? 1 : -1;
  const angle = dir * 24;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          top: 960 - 1600,
          left: dir > 0 ? -1400 + p * 3600 : 2400 - p * 3600,
          width: 520,
          height: 3200,
          transform: `rotate(${angle}deg)`,
          background:
            'linear-gradient(90deg, rgba(255,215,120,0) 0%, rgba(255,215,120,0.35) 35%, rgba(255,255,255,0.95) 50%, rgba(255,215,120,0.35) 65%, rgba(255,215,120,0) 100%)',
          filter: 'blur(18px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 960 - 1600,
          left: dir > 0 ? -1100 + p * 3300 : 2100 - p * 3300,
          width: 14,
          height: 3200,
          transform: `rotate(${angle}deg)`,
          background: 'rgba(255,255,255,0.95)',
          boxShadow: '0 0 40px 12px rgba(120,170,255,0.7)',
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, rgba(255,240,200,0.9), rgba(120,160,255,0.25) 55%, rgba(0,0,0,0) 80%)', opacity: flash * 0.55}} />
    </AbsoluteFill>
  );
};
