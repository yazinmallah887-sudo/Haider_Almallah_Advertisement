import React from 'react';
import {Img, staticFile, useVideoConfig} from 'remotion';
import {scene, vo} from '../data/timeline';
import {Flare, GodRays, LightStreaks} from '../components/Light';
import {pop, SOFT, tween, wave} from '../components/motion';
import {Center, Parallax, SceneShell, useSceneFrame} from '../components/Scene';
import {GlassPill, GoldText, KineticWords, Ltr, WhiteText} from '../components/Typography';
import {C, FONT_DISPLAY, GOLD_GRADIENT} from '../theme';

/** Arched portrait frame with gold rim, light sweep and parallax inner image. */
const Portrait: React.FC<{f: number; s: number}> = ({f, s}) => {
  const W = 600;
  const H = 760;
  const sweep = tween(f, [40, 80], [-60, 160], SOFT);
  return (
    <div style={{position: 'relative', width: W, height: H, transform: `translateY(${(1 - s) * 900}px) rotateY(${wave(f, 160, 4)}deg)`}}>
      <div style={{position: 'absolute', inset: -60, borderRadius: '320px 320px 60px 60px', background: 'radial-gradient(circle at 50% 40%, rgba(255,210,110,0.4), rgba(0,0,0,0) 65%)'}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: '300px 300px 40px 40px', padding: 10, background: GOLD_GRADIENT, boxShadow: '0 40px 90px rgba(0,0,0,0.6), 0 0 60px rgba(212,175,55,0.35)'}}>
        <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: '290px 290px 32px 32px', background: C.navy900}}>
          <Img
            src={staticFile('images/teacher.jpg')}
            style={{position: 'absolute', width: '118%', left: '-9%', top: -10 + wave(f, 200, 8), transform: `scale(${1.05 + f * 0.0006})`}}
          />
          {/* navy grade at bottom */}
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,20,61,0) 55%, rgba(6,20,61,0.92) 100%)'}} />
          {/* light sweep */}
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(110deg, rgba(255,255,255,0) ${sweep}%, rgba(255,240,200,0.45) ${sweep + 10}%, rgba(255,255,255,0) ${sweep + 20}%)`, mixBlendMode: 'screen'}} />
        </div>
      </div>
    </div>
  );
};

export const Teacher: React.FC = () => {
  const {duration} = scene('teacher');
  const f = useSceneFrame();
  const {fps} = useVideoConfig();
  const v = vo('v03', 'teacher');
  const nameAt = v.start + Math.round(v.len * 0.68);
  const titleUp = tween(f, [44, 66], [0, 1]);
  const portraitS = pop(f, fps, 48, 15, 1);
  const nameS = pop(f, fps, nameAt, 12, 0.8);
  const logoS = pop(f, fps, 70, 11, 0.8);
  const yearS = pop(f, fps, 16, 10, 0.9);

  return (
    <SceneShell duration={duration} enter="zoomThrough" zoom={[1.04, 1.0]} driftX={-30}>
      <Parallax depth={0.3}>
        <LightStreaks every={100} count={2} angle={28} />
      </Parallax>

      {/* Titles: big centred → rise to the top */}
      <Parallax depth={0.8}>
        <Center y={760 - titleUp * 470} style={{transform: `translateY(-50%) scale(${1 - titleUp * 0.42})`}}>
          <div style={{opacity: tween(f, [0, 10], [0, 1])}}>
            <GlassPill size={46} gold>
              انطلاق التسجيل
            </GlassPill>
          </div>
          <div style={{height: 26}} />
          <KineticWords text="للدورات الصيفية" start={6} stagger={6} size={118} font={FONT_DISPLAY} weight={700} mode="drop" />
          <div style={{transform: `perspective(900px) rotateX(${(1 - yearS) * -80}deg) scale(${0.6 + 0.4 * yearS})`, opacity: Math.min(1, yearS * 2), marginTop: 8}}>
            <GoldText size={170} depth={14} font="'Cairo', sans-serif" weight={900}>
              <Ltr>2027 – 2028</Ltr>
            </GoldText>
          </div>
        </Center>
      </Parallax>

      {/* Portrait with god rays */}
      <Parallax depth={0.5}>
        <Center y={1070}>
          <div style={{position: 'absolute', top: '45%', left: '50%', opacity: portraitS}}>
            <GodRays size={1400} opacity={0.4} />
          </div>
        </Center>
      </Parallax>
      <Parallax depth={1}>
        <Center y={1060}>
          <Portrait f={f - 48} s={portraitS} />
        </Center>
      </Parallax>

      {/* logo medallion */}
      <Parallax depth={1.4}>
        <div
          style={{
            position: 'absolute',
            left: 760,
            top: 610,
            width: 250,
            transform: `scale(${logoS}) rotate(${(1 - logoS) * -120}deg) translateY(${wave(f, 90, 8)}px)`,
            filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.6)) drop-shadow(0 0 30px rgba(255,210,110,0.45))',
          }}
        >
          <img src={staticFile('images/logo.png')} style={{width: '100%'}} />
        </div>
      </Parallax>

      {/* Name plate */}
      <Parallax depth={1.2}>
        <Center y={1410}>
          <div style={{transform: `translateY(${(1 - nameS) * 60}px) scale(${0.8 + 0.2 * nameS})`, opacity: nameS, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <WhiteText size={52} weight={700}>
              الأستاذ
            </WhiteText>
            <GoldText size={128} depth={12}>
              حيدر الملاح
            </GoldText>
          </div>
        </Center>
      </Parallax>
      <Flare y={1410} strength={tween(f, [nameAt, nameAt + 6], [0, 1]) * tween(f, [nameAt + 6, nameAt + 30], [1, 0])} />
    </SceneShell>
  );
};
