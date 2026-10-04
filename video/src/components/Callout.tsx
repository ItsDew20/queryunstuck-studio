import React from "react";
import { alpha, colors, semantic } from "../brand";
import { fonts } from "../fonts";
import { enter, pop } from "../lib/anim";
import { useScene } from "../lib/scene";
import { Card, Fill, useScale } from "../lib/ui";
import type { CueFn } from "../lib/sfx";

export type CalloutTone = "tip" | "warning" | "info" | "success";

export interface CalloutProps {
  text: string;
  /** Short heading such as "Interview tip". Defaults per tone. */
  label?: string;
  tone?: CalloutTone;
  /** Optional secondary line in muted text. */
  detail?: string;
}

const toneColor = (t: CalloutTone) =>
  t === "warning" ? semantic.noMatch : t === "success" ? semantic.match : t === "info" ? colors.textMuted : colors.accent;

const toneLabel: Record<CalloutTone, string> = {
  tip: "Interview tip",
  warning: "Gotcha",
  info: "Note",
  success: "Rule of thumb",
};

const CALLOUT_DETAIL_AT = 8;

export const Callout: React.FC<CalloutProps> = ({ text, label, tone = "tip", detail }) => {
  const { frame, fps } = useScene();
  const s = useScale();
  const c = toneColor(tone);
  const p = pop(frame, fps);
  return (
    <Fill style={{ padding: 24 * s }}>
      <Card
        glow={c}
        style={{
          padding: `${48 * s}px ${56 * s}px`,
          maxWidth: 900 * s,
          background: alpha(c, 0.1),
          transform: `scale(${0.9 + 0.1 * p})`,
          opacity: p,
        }}
      >
        <div
          style={{
            fontFamily: fonts.heading,
            fontWeight: 800,
            fontSize: 30 * s,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: c,
            marginBottom: 20 * s,
          }}
        >
          {label ?? toneLabel[tone]}
        </div>
        <div style={{ fontFamily: fonts.heading, fontWeight: 800, fontSize: 56 * s, lineHeight: 1.2, color: colors.text }}>
          {text}
        </div>
        {detail ? (
          <div
            style={{
              fontFamily: fonts.body,
              fontWeight: 500,
              fontSize: 36 * s,
              lineHeight: 1.4,
              color: colors.textMuted,
              marginTop: 22 * s,
              ...enter(pop(frame, fps, CALLOUT_DETAIL_AT), 20),
            }}
          >
            {detail}
          </div>
        ) : null}
      </Card>
    </Fill>
  );
};

export const calloutCues: CueFn<CalloutProps> = ({ detail, tone = "tip" }) => [
  { frame: 0, sound: ({ tip: "sparkle", warning: "buzz", info: "pop", success: "ding" } as const)[tone] },
  ...(detail ? [{ frame: CALLOUT_DETAIL_AT, sound: "tick" as const }] : []),
];
