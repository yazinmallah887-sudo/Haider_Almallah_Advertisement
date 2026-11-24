import React from 'react';
import {Composition} from 'remotion';
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/600.css';
import '@fontsource/cairo/700.css';
import '@fontsource/cairo/800.css';
import '@fontsource/cairo/900.css';
import '@fontsource/reem-kufi/700.css';
import {AdProps, HaiderSummerAd} from './Ad';
import {TIMELINE} from './data/timeline';

const defaults: AdProps = {voiceOver: 'none', voExt: 'wav', captions: true, music: true, sfx: true};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="HaiderSummerAd"
      component={HaiderSummerAd}
      durationInFrames={TIMELINE.durationInFrames}
      fps={TIMELINE.fps}
      width={TIMELINE.width}
      height={TIMELINE.height}
      defaultProps={defaults}
    />
  </>
);
