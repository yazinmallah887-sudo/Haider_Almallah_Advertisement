import React from 'react';
import {Img, staticFile, useVideoConfig} from 'remotion';
import {scene, vo} from '../data/timeline';
import {GodRays, ShockRing} from '../components/Light';
import {IconArt} from '../components/Icons3D';
import {pop, SOFT, tween, wave} from '../components/motion';
import {Center, Parallax, SceneShell, useSceneFrame} from '../components/Scene';
import {GoldText, KineticWords, WhiteText} from '../components/Typography';
import {C, FONT_DISPLAY, GOLD_GRADIENT} from '../theme';

/** 3D staircase of glowing steps; a light orb climbs step by step to a star. */
const Stairs: React.FC<{f: number; climb: number}> = ({f, climb}) => {
  const steps = 6;
  return (
    <div style={{position: 'absolute', left: 540 - 450, top: 760, width: 900, height: 700, perspective: 1100}}>
      <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateX(18deg) rotateY(${-24 + wave(f, 200, 4)}deg)`}}>
        {new Array(steps).fill(0).map((_, i) => {
          const lit = climb * steps > i;
          const appear = tween(f, [i * 4, i * 4 + 14], [0, 1]);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 60 + i * 120,
                top: 560 - i * 95,
                width: 220,
                height: 70,
                borderRadius: 12,
                transform: `translateZ(${i * 10}px) translateY(${(1 - appear) * 200}px)`,
                opacity: appear,
                background: lit ? GOLD_GRADIENT : 'linear-gradient(180deg, #1b3f9e, #0b2163)',
                boxShadow: lit
                  ? '0 0 40px rgba(255,210,110,0.7), 0 20px 0 #6b4c12'
                  : '0 0 20px rgba(61,123,255,0.4), 0 20px 0 #06143d',
                border: '2px solid rgba(255,230,160,0.6)',
              }}
            />
          );
        })}
        {/* climbing orb */}
        <div
          style={{
            position: 'absolute',
            left: 60 + Math.min(steps - 1, climb * steps) * 120 + 80,
            top: 560 - Math.min(steps - 1, climb * steps) * 95 - 70 - Math.abs(Math.sin(climb * steps * Math.PI)) * 50,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fff 0%, #ffe39a 40%, rgba(255,200,90,0) 70%)',
            boxShadow: '0 0 60px 20px rgba(255,210,110,0.6)',
            transform: 'translateZ(80px)',
          }}
        />
      </div>
    </div>
  );
};

export const Promise: React.FC = () => {
  const {duration} = scene('promise');
  const f = useSceneFrame();
  const {fps} = useVideoConfig();
  const v = vo('v05', 'promise');
  const t1 = v.start + Math.round(v.len * 0.3); // "لا نكتفي بالشرح"
  const t2 = v.start + Math.round(v.len * 0.55); // "بل نرافقك..."
  const t3 = v.start + Math.round(v.len * 0.82); // "نحو النجاح"
  const climb = tween(f, [t2, t3 + 10], [0, 1], SOFT);
  const avatarS = pop(f, fps, v.start - 4, 13, 0.8);
  const successS = pop(f, fps, t3, 9, 0.9);
  const strike = tween(f, [t1 + 14, t1 + 24], [0, 1]);

  return (
    <SceneShell duration={duration} enter="zoomThrough" zoom={[1.0, 1.08]} driftX={-40} driftY={-20}>
      <Parallax depth={0.5}>
        <Stairs f={f} climb={climb} />
      </Parallax>

      {/* teacher mini avatar */}
      <Parallax depth={0.9}>
        <Center y={250}>
          <div dir="rtl" style={{display: 'flex', alignItems: 'center', gap: 26, opacity: avatarS, transform: `translateY(${(1 - avatarS) * -50}px)`}}>
            <div style={{width: 130, height: 130, borderRadius: '50%', padding: 6, background: GOLD_GRADIENT, boxShadow: '0 0 40px rgba(212,175,55,0.5)'}}>
              <Img src={staticFile('images/teacher.jpg')} style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 25%'}} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <WhiteText size={42} weight={600} style={{color: C.ice}}>
                مع الأستاذ
              </WhiteText>
              <GoldText size={70} depth={6}>
                حيدر الملاح
              </GoldText>
            </div>
          </div>
        </Center>
      </Parallax>

      <Parallax depth={1}>
        <Center y={540}>
          <div style={{position: 'relative', opacity: tween(f, [t2 - 4, t2 + 6], [1, 0.35])}}>
            <KineticWords text="لا نكتفي بالشرح" start={t1 - 8} stagger={5} size={84} />
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '52%',
                height: 8,
                width: `${strike * 100}%`,
                background: GOLD_GRADIENT,
                borderRadius: 4,
                boxShadow: '0 0 20px rgba(255,210,110,0.8)',
              }}
            />
          </div>
          <div style={{height: 18}} />
          <KineticWords text="بل نرافقك في كل خطوة" gold={['نرافقك']} start={t2} stagger={5} size={74} />
        </Center>
      </Parallax>

      <Parallax depth={1.3}>
        <Center y={1380}>
          <div style={{position: 'relative', transform: `scale(${0.4 + 0.6 * successS})`, opacity: Math.min(1, successS * 2), display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{position: 'absolute', top: '50%', left: '50%'}}>
              <GodRays size={1100} opacity={0.5 * successS} />
            </div>
            <div style={{position: 'absolute', top: -170, transform: `rotate(${f * 1.5}deg)`}}>
              <IconArt name="star" size={110} t={f} />
            </div>
            <WhiteText size={60}>نحو</WhiteText>
            <GoldText size={150} depth={14} font={FONT_DISPLAY}>
              النجاح
            </GoldText>
          </div>
        </Center>
      </Parallax>
      <ShockRing at={t3} y={1380} />
    </SceneShell>
  );
};
