import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {scene, vo} from '../data/timeline';
import {Medallion} from '../components/Icons3D';
import {pop, SOFT, tween, wave} from '../components/motion';
import {Center, Parallax, SceneShell, useSceneFrame} from '../components/Scene';
import {GlassPill, GoldText, KineticWords, WhiteText} from '../components/Typography';
import {C, FONT_DISPLAY} from '../theme';

/**
 * Stylised 3D city map (river through the middle). The east bank – Mosul's "left side" –
 * lights up in gold, the other bank dims, then a pin drops on Al-Hadbaa.
 */
const CityMap: React.FC<{f: number; highlight: number; pinS: number}> = ({f, highlight, pinS}) => {
  const tilt = tween(f, [0, 60], [40, 58], SOFT);
  const rot = tween(f, [0, 120], [-14, -4], SOFT);
  return (
    <div style={{position: 'absolute', left: 540 - 700, top: 980 - 700, width: 1400, height: 1400, perspective: 1300}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt}deg) rotateZ(${rot}deg)`,
        }}
      >
        {/* west bank */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 640,
            height: 1400,
            background: 'linear-gradient(135deg, #0b1d52, #06143d)',
            backgroundImage:
              'linear-gradient(rgba(120,160,255,0.18) 2px, transparent 2px), linear-gradient(90deg, rgba(120,160,255,0.18) 2px, transparent 2px)',
            backgroundSize: '70px 70px',
            opacity: 1 - highlight * 0.55,
          }}
        />
        {/* east bank = الجانب الأيسر */}
        <div
          style={{
            position: 'absolute',
            left: 760,
            top: 0,
            width: 640,
            height: 1400,
            backgroundColor: `rgba(${20 + 120 * highlight},${40 + 80 * highlight},${100 - 60 * highlight},0.9)`,
            backgroundImage: `linear-gradient(rgba(255,220,130,${0.2 + 0.5 * highlight}) 2px, transparent 2px), linear-gradient(90deg, rgba(255,220,130,${0.2 + 0.5 * highlight}) 2px, transparent 2px)`,
            backgroundSize: '70px 70px',
            boxShadow: `0 0 ${120 * highlight}px rgba(255,200,90,${0.6 * highlight}), inset 0 0 120px rgba(0,0,0,0.5)`,
          }}
        />
        {/* river */}
        <svg width="1400" height="1400" style={{position: 'absolute', left: 0, top: 0}}>
          <defs>
            <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3d7bff" />
              <stop offset="1" stopColor="#9cc2ff" />
            </linearGradient>
          </defs>
          <path d="M700 -20 C620 250, 780 420, 700 700 S 640 1150, 700 1420" stroke="url(#river)" strokeWidth="120" fill="none" opacity="0.85" />
          <path
            d="M700 -20 C620 250, 780 420, 700 700 S 640 1150, 700 1420"
            stroke="#ffffff"
            strokeWidth="6"
            fill="none"
            strokeDasharray="30 50"
            strokeDashoffset={-f * 4}
            opacity="0.6"
          />
        </svg>
        {/* pulse at pin location */}
        {[0, 1, 2].map((i) => {
          const p = ((f + i * 20) % 60) / 60;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 1060 - 30 - p * 160,
                top: 640 - 30 - p * 160,
                width: 60 + p * 320,
                height: 60 + p * 320,
                borderRadius: '50%',
                border: `4px solid rgba(255,215,120,${(1 - p) * pinS})`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export const Location: React.FC = () => {
  const {duration} = scene('location');
  const f = useSceneFrame();
  const {fps} = useVideoConfig();
  const v = vo('v04', 'location');
  const highlight = tween(f, [v.start + 10, v.start + 30], [0, 1]);
  const pinS = pop(f, fps, v.start + Math.round(v.len * 0.45), 9, 0.9);
  const cardS = pop(f, fps, v.start + Math.round(v.len * 0.45), 14, 0.8);
  const hoodS = pop(f, fps, v.start + Math.round(v.len * 0.78), 14, 0.8);

  return (
    <SceneShell duration={duration} enter="slideUp" zoom={[1.0, 1.1]} driftX={40} driftY={30}>
      <Parallax depth={0.4}>
        <CityMap f={f} highlight={highlight} pinS={pinS} />
      </Parallax>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(3,10,31,0.92) 0%, rgba(3,10,31,0) 30%, rgba(3,10,31,0) 65%, rgba(3,10,31,0.9) 100%)'}} />

      <Parallax depth={0.9}>
        <Center y={380}>
          <KineticWords text="نستقبلكم في" start={v.start} stagger={5} size={70} />
          <div style={{height: 14}} />
          <div style={{transform: `scale(${0.5 + 0.5 * pop(f, fps, v.start + 12, 12, 0.8)})`, opacity: tween(f, [v.start + 12, v.start + 20], [0, 1])}}>
            <GoldText size={130} depth={12}>
              الجانب الأيسر
            </GoldText>
          </div>
          <div style={{opacity: tween(f, [v.start + 26, v.start + 34], [0, 1]), transform: `translateY(${tween(f, [v.start + 26, v.start + 40], [30, 0])}px)`}}>
            <GlassPill size={46} gold>
              حصراً
            </GlassPill>
          </div>
        </Center>
      </Parallax>

      {/* pin */}
      <Parallax depth={1.3}>
        <div
          style={{
            position: 'absolute',
            left: 660,
            top: 640 + (1 - pinS) * -500,
            width: 260,
            height: 260,
            opacity: Math.min(1, pinS * 3),
            transform: `translateY(${wave(f, 60, 8)}px)`,
          }}
        >
          <Medallion name="pin" size={260} delay={v.start + Math.round(v.len * 0.45)} />
        </div>
      </Parallax>

      {/* institute card */}
      <Parallax depth={1.1}>
        <Center y={1230}>
          <div
            dir="rtl"
            style={{
              transform: `perspective(1000px) rotateY(${(1 - cardS) * 70}deg) scale(${0.7 + 0.3 * cardS})`,
              opacity: cardS,
              padding: '34px 70px 40px',
              borderRadius: 40,
              background: 'linear-gradient(160deg, rgba(27,63,158,0.55), rgba(3,10,31,0.75))',
              border: '2px solid rgba(230,195,92,0.7)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.25), 0 0 50px rgba(212,175,55,0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backdropFilter: 'blur(10px)',
            }}
          >
            <WhiteText size={44} weight={600} style={{color: C.ice}}>
              في
            </WhiteText>
            <GoldText size={108} depth={10} font={FONT_DISPLAY}>
              معهد المتميزين
            </GoldText>
            <div style={{height: 14}} />
            <div style={{opacity: hoodS, transform: `translateY(${(1 - hoodS) * 30}px)`}}>
              <WhiteText size={60} weight={800}>
                الكائن في <span style={{color: C.goldLight}}>حي الحدباء</span>
              </WhiteText>
            </div>
          </div>
        </Center>
      </Parallax>
    </SceneShell>
  );
};
