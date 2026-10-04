import React from "react";
import { alpha, colors, radius } from "../brand";
import { fonts } from "../fonts";
import { enter, progress, stepStarts } from "../lib/anim";
import { useScene } from "../lib/scene";
import { Fill, useScale } from "../lib/ui";
import { noteFor, type CueFn } from "../lib/sfx";

export interface ListCardItem {
  text: string;
  /** Optional short muted note shown after the text. */
  note?: string;
}

export interface ListCardProps {
  title?: string;
  items: Array<string | ListCardItem>;
  numbered?: boolean;
  /** If true (default) items reveal one by one; false shows the full list at once (cheat-sheet). */
  stagger?: boolean;
  /** Index of an item to keep highlighted in the accent colour. */
  activeIndex?: number;
}

/** Start frame of each item. Shared by the component and its sound cues. */
export const listStarts = (count: number, stagger: boolean, fps: number, durationInFrames: number): number[] =>
  stagger
    ? stepStarts(
        Array.from({ length: count }, () => ({})),
        fps,
        durationInFrames,
        0.4,
        Math.max(1.2, durationInFrames / fps / 3),
      )
    : Array.from({ length: count }, (_, i) => i * 2);

export const ListCard: React.FC<ListCardProps> = ({ title, items, numbered = true, stagger = true, activeIndex }) => {
  const { frame, fps, durationInFrames } = useScene();
  const s = useScale();
  const norm = items.map((it) => (typeof it === "string" ? { text: it } : it));
  const starts = listStarts(norm.length, stagger, fps, durationInFrames);
  const dense = norm.length > 8;
  const fs = (dense ? 34 : 42) * s;
  return (
    <Fill style={{ padding: 32 * s, alignItems: "stretch" }}>
      {title ? (
        <div
          style={{
            fontFamily: fonts.heading,
            fontWeight: 900,
            fontSize: 72 * s,
            color: colors.text,
            textAlign: "center",
            marginBottom: 36 * s,
            ...enter(progress(frame, 0, 14)),
          }}
        >
          {title}
        </div>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", gap: (dense ? 12 : 20) * s }}>
        {norm.map((it, i) => {
          const p = progress(frame, starts[i], 12);
          const active = activeIndex === i;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24 * s,
                padding: `${(dense ? 14 : 22) * s}px ${28 * s}px`,
                background: active ? alpha(colors.accent, 0.14) : colors.surface,
                border: `2px solid ${active ? colors.accent : colors.border}`,
                borderRadius: radius.chip,
                ...enter(p, 24),
              }}
            >
              {numbered ? (
                <div
                  style={{
                    minWidth: fs * 1.5,
                    height: fs * 1.5,
                    borderRadius: radius.chip,
                    background: colors.accent,
                    color: colors.background,
                    fontFamily: fonts.heading,
                    fontWeight: 900,
                    fontSize: fs * 0.8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </div>
              ) : null}
              <div style={{ fontFamily: fonts.body, fontWeight: 700, fontSize: fs, color: colors.text }}>
                {it.text}
                {it.note ? (
                  <span style={{ fontWeight: 500, color: colors.textMuted, fontSize: fs * 0.75 }}> · {it.note}</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Fill>
  );
};

export const listCardCues: CueFn<ListCardProps> = ({ title, items, stagger = true }, { fps, durationInFrames }) => [
  ...(title ? [{ frame: 0, sound: "pop" as const }] : []),
  ...(stagger
    ? listStarts(items.length, true, fps, durationInFrames).map((f, i) => ({ frame: f, ...noteFor(i) }))
    : [{ frame: 2, sound: "swoosh" as const }]),
];
