import React from 'react';
import {useVideoConfig} from 'remotion';
import {scene, vo} from '../data/timeline';
import {Medallion} from '../components/Icons3D';
import {Flare, GodRays, ShockRing} from '../components/Light';
import {pop, tween, wave} from '../components/motion';
import {Center, Parallax, SceneShell, useSceneFrame} from '../components/Scene';
import {GoldText, KineticWords, WhiteText} from '../components/Typography';
import {C, FONT_DISPLAY, GOLD_GRADIENT} from '../theme';

const PHONE_GROUPS = ['0773', '822', '3960']; // 0773 822 3960 – do not change

export const Contact: React.FC = () => {
  const {duration} = scene('contact');
  const f = useSceneFrame();
  const {fps} = useVideoConfig();
  const a = vo('v11', 'contact');
  const b = vo('v12', 'contact');
  const c = vo('v13', 'contact');
  const step = b.len / 3;
  const panelS = pop(f, fps, b.start - 10, 14, 0.9);
  const instS = pop(f, fps, c.start, 13, 0.8);
  const glowPulse = 0.6 + 0.4 * Math.sin(f / 7);

  return (
    <SceneShell duration={duration} enter="zoomThrough" zoom={[1.0, 1.06]} driftX={20} driftY={-20} roll={0.4}>
      <Parallax depth={0.8}>
        <Center y={330}>
          <Medallion name="phone" size={300} delay={0} />
        </Center>
      </Parallax>

      <Parallax depth={1}>
        <Center y={640}>
          <KineticWords text="للاستفسار والتسجيل" gold={['والتسجيل']} start={a.start} stagger={5} size={96} font={FONT_DISPLAY} weight={700} />
          <div style={{height: 10}} />
          <KineticWords text="يمكنكم الاتصال على الرقم التالي" start={a.start + Math.round(a.len * 0.45)} stagger={4} size={58} weight={700} color={C.ice} />
          <KineticWords text="أو مراجعة المعهد مباشرة" start={a.start + Math.round(a.len * 0.75)} stagger={4} size={46} weight={600} color="rgba(255,255,255,0.75)" />
        </Center>
      </Parallax>

      {/* PHONE NUMBER – big, high contrast, LTR */}
      <Parallax depth={1.15}>
        <Center y={1010}>
          <div style={{position: 'absolute', top: '50%', left: '50%', opacity: panelS}}>
            <GodRays size={1500} opacity={0.35} speed={0.3} />
          </div>
          <div
            dir="ltr"
            style={{
              position: 'relative',
              display: 'flex',
              gap: 30,
              alignItems: 'center',
              padding: '40px 46px',
              borderRadius: 46,
              background: 'linear-gradient(160deg, rgba(11,33,99,0.92), rgba(3,10,31,0.95))',
              border: '4px solid transparent',
              backgroundClip: 'padding-box',
              boxShadow: `0 0 0 4px rgba(230,195,92,${0.7 + 0.3 * glowPulse}), 0 0 ${60 * glowPulse}px rgba(255,210,110,0.55), 0 40px 90px rgba(0,0,0,0.6)`,
              transform: `perspective(1200px) rotateX(${(1 - panelS) * 70}deg) scale(${0.6 + 0.4 * panelS})`,
              opacity: panelS,
            }}
          >
            {PHONE_GROUPS.map((g, i) => {
              const at = b.start + i * step;
              const s = pop(f, fps, at, 10, 0.7);
              const flash = tween(f, [at, at + 12], [1, 0]);
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 900,
                    fontSize: 124,
                    lineHeight: 1.1,
                    letterSpacing: 2,
                    color: C.white,
                    display: 'inline-block',
                    transform: `translateY(${(1 - s) * -140}px) scale(${1 + (1 - s) * 0.8})`,
                    opacity: Math.min(1, s * 2),
                    textShadow: `0 0 ${20 + 50 * flash}px rgba(255,215,120,${0.6 + 0.4 * flash}), 0 6px 0 #8f6a1a, 0 12px 24px rgba(0,0,0,0.7)`,
                  }}
                >
                  {g}
                </span>
              );
            })}
          </div>
        </Center>
      </Parallax>
      {[0, 1, 2].map((i) => (
        <ShockRing key={i} at={Math.round(b.start + i * step)} y={1010} max={1100} />
      ))}
      <Flare y={1010} strength={tween(f, [b.end - 6, b.end], [0, 1]) * tween(f, [b.end, b.end + 26], [1, 0])} />

      {/* institute reminder */}
      <Parallax depth={1.3}>
        <Center y={1320}>
          <div
            dir="rtl"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 26,
              opacity: instS,
              transform: `translateY(${(1 - instS) * 80}px) scale(${0.8 + 0.2 * instS})`,
              padding: '22px 46px',
              borderRadius: 80,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))',
              border: '2px solid rgba(230,195,92,0.6)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
            }}
          >
            <div style={{width: 74, height: 74, borderRadius: 37, background: GOLD_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${wave(f, 40, 4)}px)`}}>
              <svg width="44" height="44" viewBox="0 0 200 200">
                <path d="M100 16 C58 16 32 46 32 84 C32 130 100 186 100 186 C100 186 168 130 168 84 C168 46 142 16 100 16 Z" fill={C.navy900} />
                <circle cx="100" cy="82" r="26" fill="#f3d77e" />
              </svg>
            </div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <WhiteText size={38} weight={600} style={{color: C.ice, lineHeight: 1.2}}>
                أو مراجعة
              </WhiteText>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
                <GoldText size={68} depth={6} font={FONT_DISPLAY}>
                  معهد المتميزين
                </GoldText>
                <WhiteText size={44} weight={700}>
                  للتسجيل
                </WhiteText>
              </div>
            </div>
          </div>
        </Center>
      </Parallax>
    </SceneShell>
  );
};
