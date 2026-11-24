import raw from './timeline.json';

export type SceneId =
  | 'opening' | 'teacher' | 'location' | 'promise'
  | 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'contact' | 'closing';

export type SceneDef = {id: SceneId; from: number; duration: number; label: string};
export type VoSegment = {id: string; from: number; to: number; text: string; voiced: string; emphasis: string[]};
export type SfxCue = {file: string; at: number; volume: number};

export const TIMELINE = raw as unknown as {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  scenes: SceneDef[];
  voiceOver: VoSegment[];
  sfx: SfxCue[];
};

export const scene = (id: SceneId): SceneDef => {
  const s = TIMELINE.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s;
};

/** VO segment with times relative to the start of the scene it belongs to. */
export const vo = (id: string, sceneId: SceneId) => {
  const v = TIMELINE.voiceOver.find((x) => x.id === id);
  if (!v) throw new Error(`Unknown VO ${id}`);
  const s = scene(sceneId);
  return {...v, start: v.from - s.from, end: v.to - s.from, len: v.to - v.from};
};

/** Lines whose full text is already shown big on screen → no burned caption. */
export const NO_CAPTION = new Set(['v12', 'v18']);
