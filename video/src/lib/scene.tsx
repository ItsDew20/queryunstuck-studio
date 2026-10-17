import React, { createContext, useContext } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Grid } from "./anim";

export interface SceneInfo {
  /** Length of the current scene in frames. */
  durationInFrames: number;
  /** Pixel size of the box the component is drawn into. */
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
  /** Music beat grid, when the piece has music with sync on. */
  grid?: Grid;
}

const SceneCtx = createContext<SceneInfo | null>(null);

export const SceneProvider: React.FC<{ value: SceneInfo; children: React.ReactNode }> = ({ value, children }) => (
  <SceneCtx.Provider value={value}>{children}</SceneCtx.Provider>
);

/** Frame (relative to scene start), fps, scene length and box size. */
export const useScene = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const ctx = useContext(SceneCtx);
  return {
    frame,
    fps,
    durationInFrames: ctx?.durationInFrames ?? durationInFrames,
    width: ctx?.width ?? width,
    height: ctx?.height ?? height,
    orientation: ctx?.orientation ?? (width >= height ? "landscape" : "portrait"),
    grid: ctx?.grid,
  } as const;
};
