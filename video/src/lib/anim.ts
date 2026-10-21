import { Easing, interpolate, spring } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 -> 1 over [start, start + dur] frames with ease-out. */
export const progress = (frame: number, start: number, dur: number): number =>
  interpolate(frame, [start, start + Math.max(1, dur)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

/** Linear 0 -> 1, used for travelling dots and sliding frames. */
export const linear = (frame: number, start: number, dur: number): number =>
  interpolate(frame, [start, start + Math.max(1, dur)], [0, 1], clamp);

export const pop = (frame: number, fps: number, delay = 0): number =>
  spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 160, mass: 0.7 } });

/** Fade + rise entrance style. */
export const enter = (p: number, distance = 40): React.CSSProperties => ({
  opacity: p,
  transform: `translateY(${(1 - p) * distance}px)`,
});

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export interface Timed {
  /** Seconds from scene start. Omit to spread steps evenly across the scene. */
  at?: number;
}

/**
 * Start frame for each step. Explicit `at` wins; otherwise steps are spread evenly between
 * a short lead-in and a hold at the end so the last state is readable.
 */
export const stepStarts = (
  steps: Timed[],
  fps: number,
  durationInFrames: number,
  leadIn = 0.5,
  hold = 1.2,
  grid?: Grid,
): number[] => {
  const start = Math.round(leadIn * fps);
  const end = Math.max(start + 1, durationInFrames - Math.round(hold * fps));
  const n = steps.length;
  const raw = steps.map((s, i) =>
    s.at !== undefined ? Math.round(s.at * fps) : Math.round(start + ((end - start) * i) / Math.max(1, n)),
  );
  return snapToGrid(raw, grid, durationInFrames);
};

/** Music beat grid for the current scene: grid lines every `step` frames, counted from composition frame 0. */
export interface Grid {
  /** Composition frame where this scene starts. */
  offset: number;
  /** Frames between grid lines (an eighth note of the bed's tempo). */
  step: number;
}

/** A coarser grid whose lines are a whole number of `grid` steps apart and at least `minFrames` apart. */
export const coarseGrid = (grid: Grid | undefined, minFrames: number): Grid | undefined =>
  grid ? { offset: grid.offset, step: grid.step * Math.max(1, Math.ceil((minFrames - 1e-6) / grid.step)) } : undefined;

/**
 * Snap scene-relative frames to the music grid so steps (and their sounds) land on the beat.
 * Negative frames (silent initial-state steps) are left alone; order is preserved.
 */
export const snapToGrid = (frames: number[], grid: Grid | undefined, durationInFrames: number): number[] => {
  if (!grid || grid.step <= 0) return frames;
  let prev = -Infinity;
  return frames.map((f) => {
    if (f < 0) return f;
    let snapped = Math.round(Math.round((grid.offset + f) / grid.step) * grid.step - grid.offset);
    if (snapped < 0) snapped = Math.round(Math.ceil(grid.offset / grid.step) * grid.step - grid.offset);
    // Collision: move to the next grid line after the previous step (computed exactly, no drift).
    if (snapped <= prev) snapped = Math.round(Math.ceil((grid.offset + prev + 1) / grid.step) * grid.step - grid.offset);
    snapped = Math.min(snapped, durationInFrames - 1);
    prev = snapped;
    return snapped;
  });
};

/** Index of the active step at `frame` (-1 before the first step starts). */
export const activeStep = (starts: number[], frame: number): number => {
  let idx = -1;
  starts.forEach((s, i) => {
    if (frame >= s) idx = i;
  });
  return idx;
};
