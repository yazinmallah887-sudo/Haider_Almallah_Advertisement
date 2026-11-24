import React, {createContext, useContext} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {EXPO_IN_OUT, EXPO_OUT, SOFT, tween, wave} from './motion';

/** Frames each scene starts before / ends after its nominal slot, for overlapping transitions. */
export const PRE = 10;
export const POST = 10;

type Cam = {x: number; y: number; zoom: number};
const CamCtx = createContext<Cam>({x: 0, y: 0, zoom: 1});

/** Local scene frame (0 = nominal scene start). */
export const useSceneFrame = () => useCurrentFrame() - PRE;

export type Enter = 'zoomThrough' | 'slideUp' | 'blurIn' | 'flash';

/**
 * Scene wrapper: cinematic entrance/exit + a slow virtual camera (push-in, drift, roll).
 * Children can use <Parallax depth> to move relative to the camera.
 */
export const SceneShell: React.FC<{
  duration: number;
  children: React.ReactNode;
  enter?: Enter;
  zoom?: [number, number];
  driftX?: number;
  driftY?: number;
  roll?: number;
  background?: React.ReactNode;
}> = ({duration, children, enter = 'zoomThrough', zoom = [1, 1.08], driftX = 30, driftY = -20, roll = 0.6, background}) => {
  const f = useSceneFrame();
  const p = tween(f, [0, duration], [0, 1], SOFT);
  const camZoom = zoom[0] + (zoom[1] - zoom[0]) * p;
  const cam = {x: driftX * (p - 0.5) * 2 + wave(f, 200, 6), y: driftY * (p - 0.5) * 2 + wave(f, 260, 5), zoom: camZoom};

  // entrance
  const e = tween(f, [-PRE, 14], [0, 1], EXPO_OUT);
  // exit
  const x = tween(f, [duration - 8, duration + POST], [0, 1], EXPO_IN_OUT);
  let scale = 1;
  let blur = 0;
  let opacity = 1;
  let ty = 0;
  switch (enter) {
    case 'zoomThrough':
      scale *= 1.35 - 0.35 * e;
      break;
    case 'slideUp':
      ty += (1 - e) * 500;
      break;
    case 'flash':
      scale *= 1.1 - 0.1 * e;
      break;
    case 'blurIn':
      break;
  }
  blur += (1 - e) * 26;
  opacity *= Math.min(1, e * 1.4);
  // every exit pushes through the camera
  scale *= 1 + x * 0.55;
  blur += x * 30;
  opacity *= 1 - x;

  return (
    <AbsoluteFill style={{opacity}}>
      <AbsoluteFill
        style={{
          transform: `translate(${-cam.x * 0.3}px, ${-cam.y * 0.3}px) scale(${1.06 + (camZoom - 1) * 0.3})`,
        }}
      >
        {background}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `translateY(${ty}px) scale(${scale * camZoom}) rotate(${roll * (p - 0.5)}deg)`,
          filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
        }}
      >
        <CamCtx.Provider value={cam}>{children}</CamCtx.Provider>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Moves children opposite to the camera drift, scaled by depth (0 = background, 1+ = foreground). */
export const Parallax: React.FC<{depth: number; children: React.ReactNode; style?: React.CSSProperties}> = ({depth, children, style}) => {
  const cam = useContext(CamCtx);
  return (
    <AbsoluteFill style={{transform: `translate(${-cam.x * depth}px, ${-cam.y * depth}px)`, ...style}}>{children}</AbsoluteFill>
  );
};

/** Absolutely centred column at a given vertical position. */
export const Center: React.FC<{y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({y, children, style}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: y,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transform: 'translateY(-50%)',
      ...style,
    }}
  >
    {children}
  </div>
);
