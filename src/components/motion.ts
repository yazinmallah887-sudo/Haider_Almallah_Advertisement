import {Easing, interpolate, spring} from 'remotion';

export const EXPO_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EXPO_IN_OUT = Easing.bezier(0.87, 0, 0.13, 1);
export const BACK_OUT = Easing.bezier(0.34, 1.56, 0.64, 1);
export const SOFT = Easing.bezier(0.45, 0, 0.55, 1);

/** Clamped interpolation with an easing curve. */
export const tween = (
  f: number,
  [a, b]: [number, number],
  [x, y]: [number, number],
  easing = EXPO_OUT,
) => interpolate(f, [a, b], [x, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

export const pop = (f: number, fps: number, delay = 0, damping = 13, mass = 0.8) =>
  spring({frame: f - delay, fps, config: {damping, mass, stiffness: 140}});

/** 0 → 1 → 0 envelope: fade in over `inLen`, hold, fade out over `outLen` ending at `end`. */
export const envelope = (f: number, start: number, end: number, inLen = 10, outLen = 10) =>
  Math.min(tween(f, [start, start + inLen], [0, 1]), tween(f, [end - outLen, end], [1, 0], SOFT));

export const wave = (f: number, period: number, amp = 1, phase = 0) =>
  Math.sin((f / period) * Math.PI * 2 + phase) * amp;
