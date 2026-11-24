import React from 'react';
import {AbsoluteFill, Img, staticFile, useVideoConfig} from 'remotion';
import {scene, vo} from '../data/timeline';
import {Flare, GodRays, LightStreaks, ShockRing} from '../components/Light';
import {Particles} from '../components/Particles';
import {pop, SOFT, tween, wave} from '../components/motion';
import {Center, Parallax, SceneShell, useSceneFrame} from '../components/Scene';
import {GlassPill, GoldText, KineticWords, Ltr, WhiteText} from '../components/Typography';
import {C, FONT_BODY, FONT_DISPLAY, GOLD_GRADIENT} from '../theme';

/** Glossy golden CTA button with pulse + specular sweep. */
const CtaButton: React.FC<{f: number; s: number; size?: number}> = ({f, s, size = 92}) => {
  const pulse = 1 + 0.035 * Math.sin(f / 5);
  const sweep = ((f * 3) % 260) - 80;
  return (
    <div
      dir="rtl"
      style={{
        position: 'relative',
        padding: `${size * 0.32}px ${size * 0.9}px`,
        borderRadius: size,
        background: GOLD_GRADIENT,
        boxShadow: `0 0 ${50 + 30 * Math.sin(f / 5)}px rgba(255,210,110,0.75), 0 14px 0 #6b4c12, 0 30px 60px rgba(0,0,0,0.6), inset 0 3px 0 rgba(255,255,255,0.8)`,
        transform: `scale(${s * pulse}) perspective(900px) rotateX(${(1 - s) * 60}deg)`,
        opacity: Math.min(1, s * 2),
        overflow: 'hidden',
      }}
    >
      <span style={{fontFamily: FONT_BODY, fontWeight: 900, fontSize: size, color: C.navy950, whiteSpace: 'nowrap', textShadow: '0 2px 0 rgba(255,255,255,0.5)'}}>
        احجز مقعدك الآن!
      </span>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(110deg, rgba(255,255,255,0) ${sweep}%, rgba(255,255,255,0.85) ${sweep + 8}%, rgba(255,255,255,0) ${sweep + 16}%)`}} />
    </div>
  );
};

export const Closing: React.FC = () => {
  const {duration} = scene('closing');
  const f = useSceneFrame();
  const {fps} = useVideoConfig();
  const a = vo('v14', 'closing'); // لا تؤجل مستقبلك!
  const b = vo('v15', 'closing'); // احجز مقعدك الآن، وابدأ ...
  const c = vo('v16', 'closing'); // احجز مقعدك الآن!
  const d = vo('v17', 'closing'); // الدرجة الكاملة تبدأ من هنا.
  const e = vo('v18', 'closing'); // الأستاذ حيدر الملاح – الدورات الصيفية

  // phase visibility
  const ph1 = tween(f, [b.start + Math.round(b.len * 0.35), b.start + Math.round(b.len * 0.35) + 10], [1, 0]);
  const ph2in = b.start + Math.round(b.len * 0.35);
  const ph2out = c.start - 4;
  const ctaS = pop(f, fps, c.start - 2, 10, 0.8);
  const ctaOut = tween(f, [e.start - 10, e.start], [0, 1]);
  const fullS = pop(f, fps, d.start, 11, 0.9);
  const endIn = e.start - 4;
  const end = tween(f, [endIn, endIn + 20], [0, 1]);
  const logoS = pop(f, fps, endIn, 12, 1);
  const nameS = pop(f, fps, endIn + 8, 12, 0.9);
  const subS = pop(f, fps, endIn + Math.round(e.len * 0.45), 13, 0.8);
  const goldWash = tween(f, [endIn - 2, endIn + 4], [0, 1]) * tween(f, [endIn + 4, endIn + 30], [1, 0], SOFT);

  return (
    <SceneShell duration={duration} enter="flash" zoom={[1.0, 1.1]} driftX={0} driftY={-30} roll={0}>
      <Parallax depth={0.3}>
        <LightStreaks every={60} count={4} />
      </Parallax>
      <ShockRing at={0} y={800} max={1800} />
      <ShockRing at={6} y={800} max={1400} color="140,185,255" />

      {/* phase 1 – "لا تؤجل مستقبلك!" + journey words */}
      <Parallax depth={1}>
        <Center y={620} style={{opacity: ph1 * (1 - end)}}>
          <KineticWords text="لا تؤجل مستقبلك!" gold={['مستقبلك']} start={a.start - 2} stagger={4} size={130} font={FONT_DISPLAY} weight={700} mode="zoom" />
        </Center>
        <Center y={1000} style={{opacity: ph1 * (1 - end)}}>
          <KineticWords text="احجز مقعدك الآن" start={b.start} stagger={4} size={80} />
        </Center>
      </Parallax>

      {/* phase 2 – key promise words */}
      <Parallax depth={1.1}>
        <Center y={640} style={{opacity: tween(f, [ph2in, ph2in + 8], [0, 1]) * tween(f, [ph2out, ph2out + 8], [1, 0])}}>
          <KineticWords text="وابدأ رحلة التفوق والتميز" gold={['التفوق', 'والتميز']} start={ph2in} stagger={4} size={82} />
          <div style={{height: 30}} />
          <KineticWords text="واضمن استعدادك لتحقيق" start={b.start + Math.round(b.len * 0.62)} stagger={3} size={62} color={C.ice} />
          <div style={{height: 6}} />
          <div style={{transform: `scale(${pop(f, fps, b.start + Math.round(b.len * 0.75), 10, 0.8)})`}}>
            <GoldText size={128} depth={14} font={FONT_DISPLAY}>
              الدرجة الكاملة
            </GoldText>
          </div>
          <KineticWords text="في الامتحانات الوزارية" start={b.start + Math.round(b.len * 0.85)} stagger={3} size={62} />
        </Center>
      </Parallax>

      {/* phase 3 – CTA + "الدرجة الكاملة تبدأ من هنا." */}
      <Parallax depth={1.2}>
        <Center y={820} style={{opacity: 1 - ctaOut}}>
          <CtaButton f={f} s={ctaS} />
        </Center>
        <Center y={1150} style={{opacity: (1 - ctaOut) * Math.min(1, fullS * 2)}}>
          <div style={{transform: `scale(${0.6 + 0.4 * fullS})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <GoldText size={112} depth={12} font={FONT_DISPLAY}>
              الدرجة الكاملة
            </GoldText>
            <WhiteText size={70} weight={800}>
              تبدأ من هنا.
            </WhiteText>
          </div>
        </Center>
      </Parallax>
      <ShockRing at={c.start} y={820} max={1200} />

      {/* phase 4 – END CARD (golden cinematic) */}
      <AbsoluteFill style={{opacity: end}}>
        <AbsoluteFill style={{background: 'radial-gradient(70% 45% at 50% 40%, rgba(212,175,55,0.28), rgba(3,10,31,0) 70%)'}} />
        <Particles count={40} seed="end" intensity={1.2} />
        <Center y={620}>
          <div style={{position: 'absolute', top: '50%', left: '50%'}}>
            <GodRays size={1900} opacity={0.6} speed={0.25} />
          </div>
          <div
            style={{
              width: 560,
              transform: `scale(${0.3 + 0.7 * logoS}) rotate(${(1 - logoS) * 200 + wave(f, 120, 2)}deg)`,
              filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.6)) drop-shadow(0 0 50px rgba(255,210,110,0.55))',
            }}
          >
            <Img src={staticFile('images/logo.png')} style={{width: '100%'}} />
          </div>
        </Center>
        <Center y={1080}>
          <div style={{opacity: nameS, transform: `translateY(${(1 - nameS) * 60}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <WhiteText size={60} weight={700}>
              الأستاذ
            </WhiteText>
            <GoldText size={168} depth={18} glow={1.1}>
              حيدر الملاح
            </GoldText>
          </div>
        </Center>
        <Center y={1330}>
          <div style={{opacity: subS, transform: `scale(${0.8 + 0.2 * subS})`}}>
            <GlassPill size={50}>
              <span>الدورات الصيفية</span>
              <Ltr style={{color: '#f3d77e', fontWeight: 900}}>2027–2028</Ltr>
            </GlassPill>
          </div>
        </Center>
        <Center y={1480}>
          <div dir="ltr" style={{opacity: subS * 0.95, fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 56, color: C.white, letterSpacing: 2, textShadow: '0 0 24px rgba(255,210,110,0.6)'}}>
            0773 822 3960
          </div>
        </Center>
        <Flare y={1080 + 40} strength={tween(f, [endIn + 8, endIn + 14], [0, 1]) * tween(f, [endIn + 14, endIn + 60], [1, 0.35])} color="255,220,150" width={1900} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(255,236,180,1), rgba(212,175,55,0.6) 50%, rgba(212,175,55,0) 85%)', opacity: goldWash * 0.85, mixBlendMode: 'screen'}} />
    </SceneShell>
  );
};
