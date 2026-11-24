import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {tween, SOFT} from './motion';

/** Diagonal light streaks that sweep across the frame in a loop. */
export const LightStreaks: React.FC<{every?: number; count?: number; angle?: number; color?: string}> = ({
  every = 90,
  count = 3,
  angle = -32,
  color = '255,226,150',
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', overflow: 'hidden', pointerEvents: 'none'}}>
      {new Array(count).fill(0).map((_, i) => {
        const local = (f + i * (every / count) * 1.7) % every;
        const p = local / every;
        const x = -900 + p * 2900;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: 200 + i * 520,
              width: 900,
              height: 3 + (i % 2) * 2,
              transform: `rotate(${angle}deg)`,
              background: `linear-gradient(90deg, rgba(${color},0), rgba(${color},0.95) 50%, rgba(${color},0))`,
              boxShadow: `0 0 24px 6px rgba(${color},0.45)`,
              opacity: Math.sin(p * Math.PI),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Horizontal anamorphic lens flare centred at (x, y). */
export const Flare: React.FC<{x?: number; y?: number; strength?: number; width?: number; color?: string}> = ({
  x = 540,
  y = 960,
  strength = 1,
  width = 1600,
  color = '150,190,255',
}) => (
  <div style={{position: 'absolute', left: x - width / 2, top: y - 40, width, height: 80, pointerEvents: 'none', mixBlendMode: 'screen', opacity: strength}}>
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 37,
        height: 6,
        background: `linear-gradient(90deg, rgba(${color},0), rgba(${color},0.9) 40%, rgba(255,255,255,1) 50%, rgba(${color},0.9) 60%, rgba(${color},0))`,
        filter: 'blur(1.5px)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: width / 2 - 90,
        top: -50,
        width: 180,
        height: 180,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,230,160,0.5) 25%, rgba(0,0,0,0) 65%)',
      }}
    />
  </div>
);

/** Golden god-rays rotating behind a focal element. */
export const GodRays: React.FC<{size?: number; opacity?: number; speed?: number}> = ({
  size = 1800,
  opacity = 0.5,
  speed = 0.15,
}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: '50%',
        transform: `rotate(${f * speed}deg)`,
        background:
          'repeating-conic-gradient(from 0deg, rgba(255,215,120,0.55) 0deg 4deg, rgba(255,215,120,0) 4deg 15deg)',
        maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 62%)',
        WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 62%)',
        mixBlendMode: 'screen',
        opacity,
        filter: 'blur(2px)',
      }}
    />
  );
};

/** Expanding shock-wave ring (used on impacts). */
export const ShockRing: React.FC<{at: number; x?: number; y?: number; color?: string; max?: number}> = ({
  at,
  x = 540,
  y = 960,
  color = '255,215,120',
  max = 1500,
}) => {
  const f = useCurrentFrame();
  const p = tween(f, [at, at + 28], [0, 1], SOFT);
  if (f < at || p >= 1) return null;
  const s = 40 + p * max;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - s / 2,
        top: y - s / 2,
        width: s,
        height: s,
        borderRadius: '50%',
        border: `${6 * (1 - p) + 1}px solid rgba(${color},${1 - p})`,
        boxShadow: `0 0 40px rgba(${color},${0.6 * (1 - p)}), inset 0 0 40px rgba(${color},${0.4 * (1 - p)})`,
        mixBlendMode: 'screen',
      }}
    />
  );
};
