import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {scene, vo} from '../data/timeline';
import {Flare, GodRays, LightStreaks, ShockRing} from '../components/Light';
import {pop, SOFT, tween, wave} from '../components/motion';
import {Center, Parallax, SceneShell, useSceneFrame} from '../components/Scene';
import {GlassPill, GoldText, KineticWords, Ltr} from '../components/Typography';
import {FONT_DISPLAY} from '../theme';

/** Light tunnel: golden rings rushing towards the camera (hook in the first second). */
const Tunnel: React.FC<{f: number}> = ({f}) => {
  const rings = 9;
  return (
    <AbsoluteFill style={{perspective: 900, overflow: 'hidden'}}>
      {new Array(rings).fill(0).map((_, i) => {
        const z = ((f * 14 + i * (2400 / rings)) % 2400) - 2000; // -2000 … 400
        const op = tween(z, [-2000, -1400], [0, 1]) * tween(z, [100, 400], [1, 0]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 540 - 520,
              top: 900 - 520,
              width: 1040,
              height: 1040,
              borderRadius: '50%',
              border: `${i % 3 === 0 ? 6 : 3}px solid rgba(240,205,110,${0.75 * op})`,
              boxShadow: `0 0 30px rgba(255,200,90,${0.5 * op}), inset 0 0 30px rgba(61,123,255,${0.45 * op})`,
              transform: `translateZ(${z}px) rotate(${i * 20 + f}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Opening: React.FC = () => {
  const {duration} = scene('opening');
  const f = useSceneFrame();
  const {fps} = useVideoConfig();
  const v1 = vo('v01', 'opening');
  const v2 = vo('v02', 'opening');

  // frame-0 hook: black → flare burst → stage
  const burst = tween(f, [0, 10], [0, 1]);
  const blackout = tween(f, [0, 8], [1, 0], SOFT);
  const bestS = pop(f, fps, v2.end - 22, 9, 0.9);

  return (
    <SceneShell duration={duration} enter="flash" zoom={[1.0, 1.12]} roll={1}>
      <Parallax depth={0.2}>
        <Tunnel f={f + 40} />
      </Parallax>
      <Parallax depth={0.4}>
        <LightStreaks every={70} count={3} />
      </Parallax>

      {/* top badge – brand context from the first frames */}
      <Center y={330}>
        <div style={{opacity: tween(f, [6, 18], [0, 1]), transform: `translateY(${tween(f, [6, 22], [-40, 0])}px)`}}>
          <GlassPill size={38}>
            <span>الدورات الصيفية</span>
            <Ltr style={{color: '#f3d77e'}}>2027–2028</Ltr>
          </GlassPill>
        </div>
      </Center>

      {/* line 1 */}
      <Parallax depth={1}>
        <Center y={860}>
          <KineticWords text="طريقك نحو التفوق" gold={['التفوق']} start={v1.start} stagger={6} size={116} mode="zoom" out={v2.start - 6} weight={900} />
          <div style={{height: 20}} />
          <KineticWords text="يبدأ من هنا..." start={v1.start + 20} stagger={6} size={88} out={v2.start - 6} />
        </Center>
      </Parallax>

      {/* line 2 */}
      <Parallax depth={1.1}>
        <Center y={800}>
          <KineticWords text="ومستقبلك يستحق" start={v2.start} stagger={5} size={84} mode="rise" />
          <KineticWords text="أن تختار له" start={v2.start + 12} stagger={5} size={84} mode="rise" />
        </Center>
        <Center y={1110}>
          <div style={{position: 'relative', transform: `scale(${0.3 + 0.7 * bestS}) rotateX(${(1 - bestS) * 50}deg)`, opacity: Math.min(1, bestS * 2)}}>
            <div style={{position: 'absolute', left: '50%', top: '50%'}}>
              <GodRays size={1300} opacity={0.55 * bestS} />
            </div>
            <GoldText size={230} depth={16} glow={1}>
              الأفضل!
            </GoldText>
          </div>
        </Center>
      </Parallax>
      <ShockRing at={v2.end - 22} y={1110} />

      {/* hook flare + blackout */}
      <Flare y={900 + wave(f, 80, 10)} strength={tween(f, [0, 6], [0, 1]) * tween(f, [8, 30], [1, 0.25])} width={1800 * burst + 200} />
      <AbsoluteFill style={{background: '#000', opacity: blackout}} />
    </SceneShell>
  );
};
