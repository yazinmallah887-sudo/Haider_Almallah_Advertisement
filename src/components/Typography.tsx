import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT_BODY, FONT_DISPLAY, GOLD_GRADIENT} from '../theme';
import {EXPO_OUT, pop, tween} from './motion';

/** Wrap numbers / Latin runs so they keep LTR order inside RTL Arabic text (e.g. 2027–2028). */
export const Ltr: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <span dir="ltr" style={{unicodeBidi: 'isolate', display: 'inline-block', ...style}}>
    {children}
  </span>
);

const NUM_RE = /([0-9][0-9\s–\-]*[0-9]|[0-9])/g;
/** Auto-isolate digit runs inside a plain Arabic string. */
export const withLtrNumbers = (text: string): React.ReactNode[] =>
  text.split(NUM_RE).map((part, i) => (i % 2 === 1 ? <Ltr key={i}>{part}</Ltr> : <React.Fragment key={i}>{part}</React.Fragment>));

/**
 * Metallic 3D gold text. Back layer = solid extrusion built from stacked shadows,
 * front layer = gradient face with an animated specular sweep.
 */
export const GoldText: React.FC<{
  children: React.ReactNode;
  size: number;
  depth?: number;
  font?: string;
  weight?: number;
  shine?: boolean;
  glow?: number;
  style?: React.CSSProperties;
  face?: string;
}> = ({children, size, depth = 10, font = FONT_DISPLAY, weight = 700, shine = true, glow = 0.6, style, face}) => {
  const f = useCurrentFrame();
  const layers: string[] = [];
  for (let i = 1; i <= depth; i++) {
    const k = i / depth;
    const r = Math.round(150 - 90 * k);
    const g = Math.round(110 - 70 * k);
    const b = Math.round(25 - 15 * k);
    layers.push(`0 ${i * (size / 120)}px 0 rgb(${r},${g},${b})`);
  }
  layers.push(`0 ${depth * (size / 120) + 6}px ${size / 5}px rgba(0,0,0,0.75)`);
  const sweep = ((f * 2.2) % 300) - 100;
  const common: React.CSSProperties = {
    fontFamily: font,
    fontWeight: weight,
    fontSize: size,
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
  };
  return (
    <span
      dir="rtl"
      style={{
        position: 'relative',
        display: 'inline-block',
        filter: `drop-shadow(0 0 ${size / 6}px rgba(255,200,90,${glow * 0.55}))`,
        ...style,
      }}
    >
      <span style={{...common, color: '#7a5712', textShadow: layers.join(','), display: 'inline-block'}}>{children}</span>
      <span
        aria-hidden
        style={{
          ...common,
          position: 'absolute',
          inset: 0,
          backgroundImage: face ?? GOLD_GRADIENT,
          backgroundSize: '100% 100%',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {children}
      </span>
      {shine && (
        <span
          aria-hidden
          style={{
            ...common,
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) ${sweep}%, rgba(255,255,255,0.95) ${sweep + 8}%, rgba(255,255,255,0) ${sweep + 16}%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
          }}
        >
          {children}
        </span>
      )}
    </span>
  );
};

/** Clean white headline with soft blue glow. */
export const WhiteText: React.FC<{children: React.ReactNode; size: number; weight?: number; font?: string; style?: React.CSSProperties}> = ({
  children,
  size,
  weight = 800,
  font = FONT_BODY,
  style,
}) => (
  <span
    dir="rtl"
    style={{
      fontFamily: font,
      fontWeight: weight,
      fontSize: size,
      color: C.white,
      lineHeight: 1.35,
      textShadow: `0 0 ${size / 3}px rgba(90,150,255,0.55), 0 ${size / 25}px ${size / 10}px rgba(0,0,0,0.6)`,
      ...style,
    }}
  >
    {children}
  </span>
);

/**
 * Kinetic typography – words (never letters: Arabic letters must stay joined) fly in one by one
 * with blur, depth and a slight 3D rotation.
 */
export const KineticWords: React.FC<{
  text: string;
  start: number;
  stagger?: number;
  size: number;
  gold?: string[];
  weight?: number;
  font?: string;
  mode?: 'rise' | 'zoom' | 'drop';
  maxWidth?: number;
  out?: number;
  color?: string;
}> = ({text, start, stagger = 4, size, gold = [], weight = 800, font = FONT_BODY, mode = 'rise', maxWidth = 960, out, color = C.white}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(/\s+/).filter(Boolean);
  const outP = out !== undefined ? tween(f, [out, out + 12], [0, 1]) : 0;
  return (
    <div
      dir="rtl"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: size * 0.28,
        rowGap: size * 0.05,
        maxWidth,
        perspective: 900,
        opacity: 1 - outP,
        transform: `translateY(${-outP * 40}px) scale(${1 + outP * 0.06})`,
        filter: outP > 0 ? `blur(${outP * 12}px)` : undefined,
      }}
    >
      {words.map((w, i) => {
        const d = start + i * stagger;
        const s = pop(f, fps, d, 14, 0.7);
        const p = tween(f, [d, d + 14], [0, 1], EXPO_OUT);
        const isGold = gold.some((g) => g.split(/\s+/).includes(w.replace(/[،.!:…]/g, '')));
        const tf =
          mode === 'zoom'
            ? `scale(${2.2 - 1.2 * s}) translateZ(0)`
            : mode === 'drop'
              ? `translateY(${(1 - s) * -120}px) rotateX(${(1 - s) * 70}deg)`
              : `translateY(${(1 - s) * 70}px) rotateX(${(1 - s) * -60}deg)`;
        const content = withLtrNumbers(w);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              transform: tf,
              filter: p < 1 ? `blur(${(1 - p) * 14}px)` : undefined,
              transformOrigin: '50% 100%',
            }}
          >
            {isGold ? (
              <GoldText size={size} depth={6} font={font} weight={weight} glow={0.4}>
                {content}
              </GoldText>
            ) : (
              <WhiteText size={size} weight={weight} font={font} style={{color}}>
                {content}
              </WhiteText>
            )}
          </span>
        );
      })}
    </div>
  );
};

/** Glassmorphism pill/label used for badges. */
export const GlassPill: React.FC<{children: React.ReactNode; size?: number; style?: React.CSSProperties; gold?: boolean}> = ({
  children,
  size = 40,
  style,
  gold = false,
}) => (
  <div
    dir="rtl"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.4,
      padding: `${size * 0.32}px ${size * 0.9}px`,
      borderRadius: size * 2,
      fontFamily: FONT_BODY,
      fontWeight: 800,
      fontSize: size,
      color: gold ? C.navy950 : C.white,
      background: gold
        ? GOLD_GRADIENT
        : 'linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))',
      border: gold ? '2px solid rgba(255,240,190,0.9)' : '2px solid rgba(230,195,92,0.65)',
      boxShadow: gold
        ? '0 10px 40px rgba(212,175,55,0.45), inset 0 2px 0 rgba(255,255,255,0.7)'
        : '0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25), 0 0 30px rgba(61,123,255,0.25)',
      backdropFilter: 'blur(14px)',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);
