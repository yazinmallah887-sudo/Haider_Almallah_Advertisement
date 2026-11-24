import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Sequence, continueRender, delayRender, useCurrentFrame} from 'remotion';
import {AudioLayer, VoiceOverMode} from './components/AudioLayer';
import {Background} from './components/Background';
import {Captions} from './components/Captions';
import {Particles} from './components/Particles';
import {POST, PRE} from './components/Scene';
import {TransitionLayer} from './components/Transitions';
import {SceneId, TIMELINE} from './data/timeline';
import {Closing} from './scenes/Closing';
import {Contact} from './scenes/Contact';
import {Feature} from './scenes/Features';
import {Location} from './scenes/Location';
import {Opening} from './scenes/Opening';
import {Promise as PromiseScene} from './scenes/Promise';
import {Teacher} from './scenes/Teacher';

export type AdProps = {
  voiceOver: VoiceOverMode;
  voExt: string;
  captions: boolean;
  music: boolean;
  sfx: boolean;
};

const SCENES: Record<SceneId, React.FC> = {
  opening: Opening,
  teacher: Teacher,
  location: Location,
  promise: PromiseScene,
  f1: () => <Feature id="f1" />,
  f2: () => <Feature id="f2" />,
  f3: () => <Feature id="f3" />,
  f4: () => <Feature id="f4" />,
  f5: () => <Feature id="f5" />,
  contact: Contact,
  closing: Closing,
};

const FONT_FACES = ['400 40px Cairo', '700 40px Cairo', '800 40px Cairo', '900 40px Cairo', '700 40px "Reem Kufi"'];

const useFonts = () => {
  const [handle] = useState(() => delayRender('Loading Arabic fonts'));
  useEffect(() => {
    Promise.all(FONT_FACES.map((ff) => document.fonts.load(ff, 'أبجد 0123')))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
  }, [handle]);
};

/** Slow global camera "breathing" applied to the persistent background. */
const GlobalStage: React.FC = () => {
  const f = useCurrentFrame();
  const closing = TIMELINE.scenes.find((s) => s.id === 'closing')!;
  return (
    <AbsoluteFill style={{transform: `scale(${1.05 + 0.03 * Math.sin(f / 120)})`}}>
      <Background tint={f >= closing.from ? 'gold' : 'blue'} />
      <Particles count={60} drift={Math.sin(f / 90) * 30} />
    </AbsoluteFill>
  );
};

export const HaiderSummerAd: React.FC<AdProps> = ({voiceOver, voExt, captions, music, sfx}) => {
  useFonts();
  return (
    <AbsoluteFill style={{backgroundColor: '#020716', direction: 'rtl'}}>
      <GlobalStage />
      {TIMELINE.scenes.map((s) => {
        const C = SCENES[s.id];
        return (
          <Sequence key={s.id} name={s.label} from={s.from - PRE} durationInFrames={s.duration + PRE + POST}>
            <C />
          </Sequence>
        );
      })}
      <TransitionLayer />
      {captions && <Captions />}
      <AudioLayer voiceOver={voiceOver} voExt={voExt} music={music} sfx={sfx} />
    </AbsoluteFill>
  );
};
