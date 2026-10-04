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
): number[] => {
  const start = Math.round(leadIn * fps);
  const end = Math.max(start + 1, durationInFrames - Math.round(hold * fps));
  const n = steps.length;
  return steps.map((s, i) =>
    s.at !== undefined ? Math.round(s.at * fps) : Math.round(start + ((end - start) * i) / Math.max(1, n)),
  );
};

/** Index of the active step at `frame` (-1 before the first step starts). */
export const activeStep = (starts: number[], frame: number): number => {
  let idx = -1;
  starts.forEach((s, i) => {
    if (frame >= s) idx = i;
  });
  return idx;
};
