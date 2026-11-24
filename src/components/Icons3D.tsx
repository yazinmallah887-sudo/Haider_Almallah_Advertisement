import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../theme';
import {pop, wave} from './motion';

/** Shared SVG gradient defs for all icons (gold metal + blue glass). */
const Defs: React.FC<{id: string}> = ({id}) => (
  <defs>
    <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stopColor="#fff6d0" />
      <stop offset="0.35" stopColor="#f0cf6c" />
      <stop offset="0.6" stopColor="#b98a24" />
      <stop offset="0.8" stopColor="#f3d77e" />
      <stop offset="1" stopColor="#8f6a1a" />
    </linearGradient>
    <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#5d93ff" />
      <stop offset="1" stopColor="#0b2163" />
    </linearGradient>
    <linearGradient id={`${id}-w`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="1" stopColor="#c9d8ff" />
    </linearGradient>
    <filter id={`${id}-s`} x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000" floodOpacity="0.55" />
    </filter>
  </defs>
);

export type IconName = 'book' | 'exam' | 'system' | 'parent' | 'cap' | 'pin' | 'phone' | 'star';

/** Animated icon artwork. `t` = local frame for internal micro-animations. */
export const IconArt: React.FC<{name: IconName; size?: number; t: number}> = ({name, size = 220, t}) => {
  const id = `ic-${name}`;
  const G = `url(#${id}-g)`;
  const B = `url(#${id}-b)`;
  const W = `url(#${id}-w)`;
  const sh = `url(#${id}-s)`;
  let body: React.ReactNode = null;
  switch (name) {
    case 'book': {
      const flip = ((t % 40) / 40) * 180;
      body = (
        <g filter={sh}>
          <path d="M20 60 Q60 40 100 58 L100 168 Q60 150 20 168 Z" fill={W} stroke={G} strokeWidth="5" />
          <path d="M180 60 Q140 40 100 58 L100 168 Q140 150 180 168 Z" fill={W} stroke={G} strokeWidth="5" />
          {[78, 96, 114, 132].map((y) => (
            <g key={y}>
              <line x1="34" y1={y} x2="88" y2={y - 6} stroke="#9fb6e8" strokeWidth="4" strokeLinecap="round" />
              <line x1="112" y1={y - 6} x2="166" y2={y} stroke="#9fb6e8" strokeWidth="4" strokeLinecap="round" />
            </g>
          ))}
          <g style={{transformOrigin: '100px 110px', transform: `rotateY(${flip}deg)`}}>
            <path d="M100 58 Q140 40 172 60 L172 162 Q140 146 100 164 Z" fill="#ffffff" opacity="0.85" />
          </g>
          <rect x="94" y="52" width="12" height="122" rx="5" fill={G} />
          <path d="M100 8 l6 16 17 1 -13 10 5 17 -15 -10 -15 10 5 -17 -13 -10 17 -1z" fill={G} opacity={0.6 + 0.4 * Math.sin(t / 6)} />
        </g>
      );
      break;
    }
    case 'exam': {
      const check = Math.min(1, Math.max(0, (t % 60) / 25));
      body = (
        <g filter={sh}>
          <rect x="38" y="22" width="124" height="160" rx="14" fill={W} stroke={G} strokeWidth="6" />
          <rect x="72" y="12" width="56" height="24" rx="8" fill={G} />
          {[64, 96, 128].map((y, i) => (
            <g key={y}>
              <rect x="56" y={y - 9} width="18" height="18" rx="4" fill="none" stroke={B} strokeWidth="4" />
              <line x1="86" y1={y} x2="144" y2={y} stroke="#8aa2d6" strokeWidth="6" strokeLinecap="round" />
              {i < 2 || check > 0.5 ? <path d={`M58 ${y} l6 6 10 -12`} stroke="#1a9b54" strokeWidth="5" fill="none" strokeLinecap="round" /> : null}
            </g>
          ))}
          <path
            d="M120 150 l18 18 36 -44"
            stroke={G}
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="90"
            strokeDashoffset={90 - 90 * check}
          />
        </g>
      );
      break;
    }
    case 'system': {
      const bars = [0.5, 0.75, 0.6, 0.95];
      body = (
        <g filter={sh}>
          <rect x="14" y="30" width="172" height="118" rx="14" fill={B} stroke={G} strokeWidth="6" />
          <rect x="26" y="42" width="148" height="94" rx="6" fill="#06143d" />
          {bars.map((b, i) => {
            const h = 70 * b * (0.75 + 0.25 * Math.sin(t / 8 + i));
            return <rect key={i} x={40 + i * 30} y={124 - h} width="20" height={h} rx="4" fill={G} />;
          })}
          <polyline points="40,100 70,84 100,92 130,64 160,54" fill="none" stroke="#9cc2ff" strokeWidth="4" />
          <rect x="84" y="148" width="32" height="18" fill={G} />
          <rect x="58" y="164" width="84" height="10" rx="5" fill={G} />
        </g>
      );
      break;
    }
    case 'parent': {
      const ring = (t % 30) / 30;
      body = (
        <g filter={sh}>
          <circle cx="62" cy="62" r="24" fill={G} />
          <path d="M22 140 q40 -70 80 0 z" fill={G} />
          <circle cx="140" cy="76" r="18" fill={W} />
          <path d="M110 140 q30 -55 60 0 z" fill={W} />
          <path d="M96 30 h76 a10 10 0 0 1 10 10 v28 a10 10 0 0 1 -10 10 h-46 l-14 14 v-14 h-16 a10 10 0 0 1 -10 -10 v-28 a10 10 0 0 1 10 -10z" fill={B} stroke={G} strokeWidth="4" />
          {[118, 134, 150].map((x, i) => (
            <circle key={x} cx={x} cy="54" r="5" fill="#fff" opacity={0.4 + 0.6 * Math.abs(Math.sin(t / 6 + i))} />
          ))}
          <path d="M40 160 C80 190, 120 190, 160 160" stroke={G} strokeWidth="5" fill="none" strokeDasharray="8 8" strokeDashoffset={-t * 2} />
          <circle cx="100" cy="100" r={20 + ring * 70} fill="none" stroke="#f3d77e" strokeWidth="3" opacity={1 - ring} />
        </g>
      );
      break;
    }
    case 'cap': {
      body = (
        <g filter={sh}>
          <path d="M100 40 L190 82 L100 124 L10 82 Z" fill={B} stroke={G} strokeWidth="6" strokeLinejoin="round" />
          <path d="M50 102 v40 q50 30 100 0 v-40 l-50 22z" fill={G} />
          <line x1="168" y1="92" x2="168" y2="150" stroke={G} strokeWidth="5" />
          <g style={{transformOrigin: '168px 150px', transform: `rotate(${wave(t, 50, 10)}deg)`}}>
            <path d="M160 150 h16 l6 26 h-28z" fill={G} />
          </g>
          <circle cx="100" cy="82" r="8" fill={G} />
        </g>
      );
      break;
    }
    case 'pin': {
      body = (
        <g filter={sh}>
          <path d="M100 16 C58 16 32 46 32 84 C32 130 100 186 100 186 C100 186 168 130 168 84 C168 46 142 16 100 16 Z" fill={G} />
          <circle cx="100" cy="82" r="30" fill={B} />
          <circle cx="100" cy="82" r="12" fill="#fff" />
        </g>
      );
      break;
    }
    case 'phone': {
      const shake = Math.sin(t * 1.6) * (t % 40 < 18 ? 10 : 0);
      body = (
        <g filter={sh} style={{transformOrigin: '100px 100px', transform: `rotate(${shake}deg)`}}>
          <path
            d="M58 24 c10 -6 22 -2 26 8 l14 34 c4 10 0 20 -8 26 l-14 10 c10 22 28 40 50 50 l10 -14 c6 -8 16 -12 26 -8 l34 14 c10 4 14 16 8 26 l-12 20 c-8 12 -24 18 -38 14 C88 186 14 112 -6 46 c-4 -14 2 -30 14 -38z"
            transform="translate(20 4) scale(0.86)"
            fill={G}
          />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${128 + i * 0} ${40 - i * 14} a${30 + i * 16} ${30 + i * 16} 0 0 1 ${30 + i * 16} ${30 + i * 16}`} stroke="#9cc2ff" strokeWidth="6" fill="none" strokeLinecap="round" opacity={0.3 + 0.7 * Math.abs(Math.sin(t / 5 - i))} />
          ))}
        </g>
      );
      break;
    }
    case 'star':
      body = <path d="M100 14 l24 56 60 5 -46 39 14 59 -52 -32 -52 32 14 -59 -46 -39 60 -5z" fill={G} filter={sh} />;
      break;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: 'visible'}}>
      <Defs id={id} />
      {body}
    </svg>
  );
};

/**
 * 3D gold medallion: a thick coin (stacked layers in preserve-3d) that spins in on entry,
 * then floats with a gentle Y-rotation. Children are rendered on its face.
 */
export const Medallion: React.FC<{name: IconName; size?: number; delay?: number; float?: boolean}> = ({
  name,
  size = 360,
  delay = 0,
  float = true,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(f, fps, delay, 12, 0.9);
  const spin = (1 - s) * 540;
  const rotY = spin + (float ? wave(f, 120, 18) : 0);
  const rotX = float ? wave(f, 160, 8, 1) : 0;
  const y = float ? wave(f, 90, 10) : 0;
  const thickness = 14;
  return (
    <div style={{width: size, height: size, perspective: 1200, transform: `translateY(${y}px) scale(${0.2 + 0.8 * s})`, opacity: Math.min(1, s * 2)}}>
      {/* glow */}
      <div
        style={{
          position: 'absolute',
          inset: -size * 0.25,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,210,110,0.45) 0%, rgba(61,123,255,0.15) 45%, rgba(0,0,0,0) 70%)',
        }}
      />
      <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateY(${rotY}deg) rotateX(${rotX}deg)`}}>
        {new Array(thickness).fill(0).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              transform: `translateZ(${-i * 1.6}px)`,
              background: i === 0 ? 'transparent' : `rgb(${150 - i * 5},${110 - i * 4},${30 - i})`,
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'conic-gradient(from 200deg, #fff3c4, #c79a2e, #f8e08b, #8f6a1a, #f3d77e, #fff3c4)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.55)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: size * 0.06,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 30%, ${C.royal} 0%, ${C.navy900} 60%, ${C.navy950} 100%)`,
            boxShadow: 'inset 0 6px 20px rgba(0,0,0,0.7), inset 0 -3px 10px rgba(120,170,255,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconArt name={name} size={size * 0.58} t={f - delay} />
        </div>
        {/* specular highlight */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `linear-gradient(${115 + rotY / 3}deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.35) 48%, rgba(255,255,255,0) 60%)`,
            mixBlendMode: 'screen',
          }}
        />
      </div>
    </div>
  );
};
