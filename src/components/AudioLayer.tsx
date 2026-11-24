import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import {TIMELINE} from '../data/timeline';

export type VoiceOverMode = 'none' | 'guide' | 'final';

/** Music volume with automatic ducking under the voice-over (sidechain-style). */
const musicVolume = (frame: number, duck: boolean) => {
  const base = 0.85;
  if (!duck) return base;
  let d = 0;
  for (const v of TIMELINE.voiceOver) {
    const a = interpolate(frame, [v.from - 8, v.from, v.to, v.to + 10], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    d = Math.max(d, a);
  }
  return base * (1 - d * 0.88); // ≈ -18 dB under the voice
};

export const AudioLayer: React.FC<{voiceOver: VoiceOverMode; voExt?: string; music?: boolean; sfx?: boolean}> = ({
  voiceOver,
  voExt = 'wav',
  music = true,
  sfx = true,
}) => {
  const duck = voiceOver !== 'none';
  return (
    <>
      {music && <Audio src={staticFile('audio/music.wav')} volume={(f) => musicVolume(f, duck)} />}
      {sfx &&
        TIMELINE.sfx.map((c, i) => (
          <Sequence key={`sfx-${i}`} from={c.at} layout="none" name={`SFX ${c.file}`}>
            <Audio src={staticFile(`audio/sfx/${c.file}`)} volume={c.volume * (duck ? 0.55 : 1)} />
          </Sequence>
        ))}
      {voiceOver !== 'none' &&
        TIMELINE.voiceOver.map((v) => (
          <Sequence key={v.id} from={v.from} layout="none" name={`VO ${v.id}`}>
            <Audio
              src={staticFile(voiceOver === 'guide' ? `audio/vo/guide/${v.id}.wav` : `audio/vo/final/${v.id}.${voExt}`)}
              volume={1}
            />
          </Sequence>
        ))}
    </>
  );
};
