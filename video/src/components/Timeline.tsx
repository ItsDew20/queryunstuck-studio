import React from "react";
import { alpha, colors, semantic } from "../brand";
import { fonts } from "../fonts";
import { enter, progress, stepStarts, Timed } from "../lib/anim";
import { useScene } from "../lib/scene";
import { Fill, useScale } from "../lib/ui";
import { noteFor, type CueFn } from "../lib/sfx";

export interface TimelineEvent extends Timed {
  /** Short marker, e.g. "1", "09:00", "2017". */
  marker?: string;
  label: string;
  detail?: string;
}

export interface TimelineProps {
  events: TimelineEvent[];
  /** Keep earlier events lit (default true) or only the current one. */
  cumulative?: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({ events, cumulative = true }) => {
  const { frame, fps, durationInFrames } = useScene();
  const s = useScale();
  const starts = stepStarts(events, fps, durationInFrames);
  const dense = events.length > 8;
  const gap = (dense ? 16 : 30) * s;
  const dot = (dense ? 52 : 72) * s;
  return (
    <Fill style={{ padding: 24 * s, alignItems: "stretch" }}>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap }}>
        <div
          style={{
            position: "absolute",
            left: dot / 2 - 3 * s,
            top: dot / 2,
            bottom: dot / 2,
            width: 6 * s,
            background: colors.border,
            borderRadius: 3 * s,
          }}
        />
        {events.map((e, i) => {
          const p = progress(frame, starts[i], 10);
          const next = starts[i + 1] ?? Infinity;
          const current = frame >= starts[i] && frame < next;
          const lit = cumulative ? frame >= starts[i] : current;
          const c = current ? colors.accent : lit ? semantic.match : semantic.pending;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 28 * s, ...enter(Math.max(0.35, p), 0) }}>
              <div
                style={{
                  width: dot,
                  height: dot,
                  minWidth: dot,
                  borderRadius: dot,
                  background: lit ? c : colors.surface,
                  border: `4px solid ${c}`,
                  color: lit ? colors.background : colors.textMuted,
                  fontFamily: fonts.heading,
                  fontWeight: 900,
                  fontSize: dot * 0.42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                  boxShadow: current ? `0 0 30px ${alpha(c, 0.6)}` : "none",
                }}
              >
                {e.marker ?? i + 1}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: fonts.heading,
                    fontWeight: 800,
                    fontSize: (dense ? 40 : 50) * s,
                    color: lit ? colors.text : colors.textMuted,
                  }}
                >
                  {e.label}
                </div>
                {e.detail ? (
                  <div
                    style={{
                      fontFamily: fonts.body,
                      fontWeight: 500,
                      fontSize: (dense ? 28 : 34) * s,
                      color: colors.textMuted,
                      opacity: lit ? 1 : 0.5,
                    }}
                  >
                    {e.detail}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Fill>
  );
};

export const timelineCues: CueFn<TimelineProps> = ({ events }, { fps, durationInFrames }) =>
  stepStarts(events, fps, durationInFrames).map((f, i) => ({ frame: f, ...noteFor(i) }));
