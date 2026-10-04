import React from "react";
import { colors } from "../brand";
import { fonts } from "../fonts";
import { enter, pop, progress } from "../lib/anim";
import { useScene } from "../lib/scene";
import { Chip, Fill, useScale } from "../lib/ui";
import type { CueFn } from "../lib/sfx";

export interface TitleCardProps {
  title: string;
  subtitle?: string;
  /** Small label above the title, e.g. "SQL" or "Interview Q". */
  kicker?: string;
  /** Words in `title` rendered in the accent colour. */
  highlight?: string[];
}

/** Shared timing (frames) so visuals and sound cues stay in sync. */
export const titleTiming = { wordDelay: (i: number) => 4 + i * 3, subtitleAt: 14 };

export const TitleCard: React.FC<TitleCardProps> = ({ title, subtitle, kicker, highlight = [] }) => {
  const { frame, fps } = useScene();
  const s = useScale();
  const hl = new Set(highlight.map((w) => w.toLowerCase()));
  const words = title.split(" ");
  const bar = progress(frame, 4, 18);
  return (
    <Fill style={{ padding: 40 * s, textAlign: "center" }}>
      {kicker ? (
        <div style={{ ...enter(pop(frame, fps), 30), marginBottom: 40 * s }}>
          <Chip>{kicker}</Chip>
        </div>
      ) : null}
      <div
        style={{
          fontFamily: fonts.heading,
          fontWeight: 900,
          fontSize: 104 * s,
          lineHeight: 1.08,
          color: colors.text,
          letterSpacing: -1,
        }}
      >
        {words.map((w, i) => {
          const p = pop(frame, fps, titleTiming.wordDelay(i));
          const clean = w.replace(/[^\w-]/g, "").toLowerCase();
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: "0.25em",
                color: hl.has(clean) ? colors.accent : colors.text,
                ...enter(p, 50),
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <div
        style={{
          width: 220 * s * bar,
          height: 12 * s,
          background: colors.accent,
          borderRadius: 6 * s,
          margin: `${44 * s}px auto`,
        }}
      />
      {subtitle ? (
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: 500,
            fontSize: 46 * s,
            lineHeight: 1.35,
            color: colors.textMuted,
            maxWidth: 900 * s,
            ...enter(progress(frame, titleTiming.subtitleAt, 16), 30),
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </Fill>
  );
};

export const titleCardCues: CueFn<TitleCardProps> = ({ title, subtitle, kicker, highlight = [] }) => [
  ...(kicker ? [{ frame: 0, sound: "pop" as const }] : []),
  // Accent words get a sparkle; the rest pop.
  ...title.split(" ").map((w, i) => ({
    frame: titleTiming.wordDelay(i),
    sound: highlight.some((h) => h.toLowerCase() === w.replace(/[^\w-]/g, "").toLowerCase())
      ? ("sparkle" as const)
      : ("pop" as const),
    gain: 0.8,
  })),
  ...(subtitle ? [{ frame: titleTiming.subtitleAt, sound: "tick" as const }] : []),
];
