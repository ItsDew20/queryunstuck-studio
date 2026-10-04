import React from "react";
import { brand, colors } from "../brand";
import { fonts } from "../fonts";
import { enter, pop, progress } from "../lib/anim";
import { useScene } from "../lib/scene";
import { Chip, Fill, useScale } from "../lib/ui";
import type { CueFn } from "../lib/sfx";

export interface EndCardProps {
  /** Big line, e.g. the one-sentence takeaway. */
  headline?: string;
  /** Call to action, e.g. "Save this for your next interview". */
  cta?: string;
  /** Optional teaser for the next piece. */
  next?: string;
}

export const EndCard: React.FC<EndCardProps> = ({ headline, cta = "Follow for more", next }) => {
  const { frame, fps } = useScene();
  const s = useScale();
  return (
    <Fill style={{ padding: 40 * s, textAlign: "center" }}>
      {headline ? (
        <div
          style={{
            fontFamily: fonts.heading,
            fontWeight: 900,
            fontSize: 80 * s,
            lineHeight: 1.12,
            color: colors.text,
            maxWidth: 940 * s,
            ...enter(pop(frame, fps), 40),
          }}
        >
          {headline}
        </div>
      ) : null}
      <div
        style={{
          marginTop: 70 * s,
          fontFamily: fonts.heading,
          fontWeight: 900,
          fontSize: 64 * s,
          color: colors.accent,
          ...enter(pop(frame, fps, 8), 30),
        }}
      >
        {brand.handle}
      </div>
      <div
        style={{
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize: 34 * s,
          color: colors.textMuted,
          marginTop: 14 * s,
          ...enter(progress(frame, 12, 14), 20),
        }}
      >
        {brand.tagline}
      </div>
      <div style={{ marginTop: 56 * s, ...enter(pop(frame, fps, 16), 20) }}>
        <Chip>{cta}</Chip>
      </div>
      {next ? (
        <div
          style={{
            marginTop: 48 * s,
            fontFamily: fonts.body,
            fontWeight: 600,
            fontSize: 34 * s,
            color: colors.text,
            ...enter(progress(frame, 24, 14), 20),
          }}
        >
          Next: {next}
        </div>
      ) : null}
    </Fill>
  );
};

export const endCardCues: CueFn<EndCardProps> = () => [{ frame: 0, sound: "outro" }];
