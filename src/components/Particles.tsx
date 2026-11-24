import React, {useMemo} from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';

type P = {x: number; y: number; z: number; speed: number; phase: number; gold: boolean};

/**
 * Bokeh dust with depth of field: particles near the focal plane are sharp and small,
 * near/far particles are large and blurred. `drift` adds a parallax push driven by camera.
 */
export const Particles: React.FC<{count?: number; seed?: string; drift?: number; intensity?: number}> = ({
  count = 70,
  seed = 'dust',
  drift = 0,
  intensity = 1,
}) => {
  const f = useCurrentFrame();
  const parts = useMemo<P[]>(
    () =>
      new Array(count).fill(0).map((_, i) => ({
        x: random(`${seed}x${i}`) * 1080,
        y: random(`${seed}y${i}`) * 1920,
        z: random(`${seed}z${i}`),
        speed: 0.4 + random(`${seed}s${i}`) * 1.4,
        phase: random(`${seed}p${i}`) * Math.PI * 2,
        gold: random(`${seed}g${i}`) > 0.35,
      })),
    [count, seed],
  );
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
      {parts.map((p, i) => {
        const depth = 0.3 + p.z * 1.7; // 0.3 (far) … 2 (near)
        const focus = Math.abs(p.z - 0.45); // focal plane around z=0.45
        const size = 4 + depth * 9 + focus * 30;
        const blur = focus * 16;
        const y = ((p.y - f * p.speed * depth * 1.2 + 4000) % 2100) - 90;
        const x = p.x + Math.sin(f / 50 + p.phase) * 18 * depth + drift * depth;
        const tw = 0.55 + 0.45 * Math.sin(f / 9 + p.phase);
        const color = p.gold ? '255,214,120' : '140,185,255';
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(${color},${0.95 * tw * intensity}) 0%, rgba(${color},${0.25 * tw * intensity}) 45%, rgba(0,0,0,0) 70%)`,
              filter: blur > 1 ? `blur(${blur}px)` : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
