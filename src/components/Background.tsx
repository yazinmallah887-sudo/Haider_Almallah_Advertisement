import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {wave} from './motion';

/**
 * Cinematic navy stage: deep gradient, drifting blue/gold light orbs, a perspective
 * golden floor grid, volumetric beams, vignette and animated film grain.
 */
export const Background: React.FC<{tint?: 'blue' | 'gold'; floor?: boolean; beams?: boolean}> = ({
  tint = 'blue',
  floor = true,
  beams = true,
}) => {
  const f = useCurrentFrame();
  const goldAmt = tint === 'gold' ? 0.55 : 0.28;
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 75% at 50% 38%, ${C.navy800} 0%, ${C.navy900} 38%, ${C.navy950} 70%, ${C.ink} 100%)`,
        }}
      />
      {/* light orbs */}
      <Orb x={540 + wave(f, 260, 220)} y={520 + wave(f, 330, 140)} size={1100} color={`rgba(61,123,255,0.40)`} />
      <Orb x={300 + wave(f, 400, 160, 1)} y={1350 + wave(f, 290, 120, 2)} size={900} color={`rgba(27,63,158,0.55)`} />
      <Orb x={820 + wave(f, 350, 140, 3)} y={1050 + wave(f, 410, 160)} size={850} color={`rgba(212,175,55,${goldAmt})`} />
      {beams && <Beams />}
      {floor && <Floor />}
      {/* vignette */}
      <AbsoluteFill
        style={{background: 'radial-gradient(85% 60% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,10,0.85) 100%)'}}
      />
      <Grain />
    </AbsoluteFill>
  );
};

const Orb: React.FC<{x: number; y: number; size: number; color: string}> = ({x, y, size, color}) => (
  <div
    style={{
      position: 'absolute',
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 65%)`,
      mixBlendMode: 'screen',
    }}
  />
);

const Floor: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: -1200,
        right: -1200,
        bottom: -420,
        height: 1100,
        transform: 'perspective(700px) rotateX(72deg)',
        transformOrigin: '50% 100%',
        backgroundImage:
          'linear-gradient(rgba(230,195,92,0.55) 2px, transparent 2px), linear-gradient(90deg, rgba(230,195,92,0.55) 2px, transparent 2px)',
        backgroundSize: '120px 120px',
        backgroundPosition: `0 ${(f * 3) % 120}px`,
        maskImage: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0) 85%)',
        WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0) 85%)',
        opacity: 0.22,
      }}
    />
  );
};

const Beams: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.55}}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: -300,
            left: 540 - 160 + i * 160 - 80,
            width: 160 + i * 40,
            height: 2400,
            transformOrigin: '50% 0%',
            transform: `rotate(${-18 + i * 18 + wave(f, 240 + i * 50, 4, i)}deg)`,
            background:
              'linear-gradient(to bottom, rgba(156,194,255,0.30), rgba(156,194,255,0.06) 45%, rgba(0,0,0,0) 75%)',
            filter: 'blur(22px)',
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: 0.07, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <svg width="100%" height="100%">
        <filter id={`grain-${f % 6}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 6} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${f % 6})`} />
      </svg>
    </AbsoluteFill>
  );
};
