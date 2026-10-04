import React from "react";
import { alpha, colors, semantic } from "../brand";
import { fonts } from "../fonts";
import { enter, progress, stepStarts } from "../lib/anim";
import { useScene } from "../lib/scene";
import { Card, Fill, useScale } from "../lib/ui";
import type { CueFn } from "../lib/sfx";

export interface ComparisonSide {
  title: string;
  points: string[];
  /** Optional semantic tint: "match" (good), "noMatch" (bad), "active" (accent) or none. */
  tone?: "match" | "noMatch" | "active";
}

export interface ComparisonProps {
  left: ComparisonSide;
  right: ComparisonSide;
  /** One-line conclusion shown at the end. */
  verdict?: string;
}

const toneColor = (t?: ComparisonSide["tone"]) => (t ? semantic[t] : colors.border);

/** Point i of both columns appears at starts[i]; the verdict at starts[n]. */
export const comparisonStarts = (n: number, hasVerdict: boolean, fps: number, durationInFrames: number) =>
  stepStarts(Array.from({ length: n + (hasVerdict ? 1 : 0) }, () => ({})), fps, durationInFrames, 0.5, 1.2);

export const Comparison: React.FC<ComparisonProps> = ({ left, right, verdict }) => {
  const { frame, fps, durationInFrames } = useScene();
  const s = useScale();
  const n = Math.max(left.points.length, right.points.length);
  const starts = comparisonStarts(n, !!verdict, fps, durationInFrames);
  const column = (side: ComparisonSide, dir: number) => {
    const c = toneColor(side.tone);
    return (
      <Card
        glow={side.tone ? c : undefined}
        style={{
          flex: 1,
          padding: `${34 * s}px ${30 * s}px`,
          ...enter(progress(frame, 0, 14), 0),
          transform: `translateX(${(1 - progress(frame, 0, 14)) * 60 * dir}px)`,
        }}
      >
        <div
          style={{
            fontFamily: fonts.heading,
            fontWeight: 900,
            fontSize: 58 * s,
            color: side.tone ? c : colors.accent,
            marginBottom: 26 * s,
          }}
        >
          {side.title}
        </div>
        {side.points.map((pt, i) => (
          <div
            key={i}
            style={{
              fontFamily: fonts.body,
              fontWeight: 600,
              fontSize: 40 * s,
              lineHeight: 1.3,
              color: colors.text,
              padding: `${14 * s}px 0`,
              borderTop: `1px solid ${alpha(colors.border, 0.8)}`,
              ...enter(progress(frame, starts[i], 10), 16),
            }}
          >
            {pt}
          </div>
        ))}
      </Card>
    );
  };
  return (
    <Fill style={{ padding: 16 * s, alignItems: "stretch" }}>
      <div style={{ display: "flex", gap: 28 * s, alignItems: "stretch" }}>
        {column(left, -1)}
        {column(right, 1)}
      </div>
      {verdict ? (
        <div
          style={{
            marginTop: 34 * s,
            textAlign: "center",
            fontFamily: fonts.heading,
            fontWeight: 800,
            fontSize: 48 * s,
            color: colors.accent,
            ...enter(progress(frame, starts[n], 12), 20),
          }}
        >
          {verdict}
        </div>
      ) : null}
    </Fill>
  );
};

export const comparisonCues: CueFn<ComparisonProps> = ({ left, right, verdict }, { fps, durationInFrames }) => {
  const n = Math.max(left.points.length, right.points.length);
  const starts = comparisonStarts(n, !!verdict, fps, durationInFrames);
  return [
    { frame: 0, sound: "slide" as const },
    ...starts.slice(0, n).map((f) => ({ frame: f, sound: "tick" as const })),
    ...(verdict ? [{ frame: starts[n], sound: "chime" as const }] : []),
  ];
};
