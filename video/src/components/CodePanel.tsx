import React from "react";
import { alpha, colors, radius, syntax } from "../brand";
import { fonts } from "../fonts";
import { activeStep, linear, progress, stepStarts, Timed } from "../lib/anim";
import { tokenizeLine } from "../lib/highlight";
import { useScene } from "../lib/scene";
import type { CodeLang } from "../types";
import { noteFor, type CueFn } from "../lib/sfx";

export interface CodeStep extends Timed {
  /** 1-based line numbers to highlight during this step. */
  lines: number[];
  /** Optional caption shown in the panel header during this step. */
  note?: string;
}

export interface CodePanelProps {
  code: string;
  lang?: CodeLang;
  /** Header label; defaults to the language name. */
  title?: string;
  /** Static 1-based highlighted lines (used when `steps` is absent). */
  activeLines?: number[];
  /** Timed highlight sequence. Lines outside the active set are dimmed. */
  steps?: CodeStep[];
  /** Lines shown as active before the first step (e.g. carried over from the previous scene). */
  initialLines?: number[];
  /** Reveal lines one by one at scene start. */
  typeIn?: boolean;
  showLineNumbers?: boolean;
  /** Max font size in px; the panel shrinks text to fit its box. */
  maxFontSize?: number;
}

const HEADER = 56;
const PAD = 22;
const LH = 1.4;

export const codeTiming = { lineAt: (i: number) => i * 4 };

export const CodePanel: React.FC<CodePanelProps> = ({
  code,
  lang = "sql",
  title,
  activeLines,
  steps,
  initialLines,
  typeIn = false,
  showLineNumbers = true,
  maxFontSize = 46,
}) => {
  const { frame, fps, durationInFrames, width, height } = useScene();
  const lines = code.replace(/\s+$/, "").split("\n");
  const numW = String(lines.length).length;
  const gutter = showLineNumbers ? numW + 1 : 0;
  const longest = Math.max(...lines.map((l) => l.length), 10) + gutter;

  // Fit: JetBrains Mono glyph = 0.6em wide.
  const fitW = (width - PAD * 2 - 12) / (longest * 0.6);
  const fitH = (height - HEADER - PAD * 2 - 4) / (lines.length * LH);
  const fs = Math.max(14, Math.min(maxFontSize, fitW, fitH));
  const lh = fs * LH;
  // Hug the content and centre vertically instead of stretching to the whole box.
  const panelH = Math.min(height, HEADER + PAD * 2 + lines.length * lh + 4);

  const starts = steps ? stepStarts(steps, fps, durationInFrames) : [];
  const si = steps ? activeStep(starts, frame) : -1;
  const before = initialLines ?? [];
  const active = new Set(steps ? (si >= 0 ? steps[si].lines : before) : (activeLines ?? []));
  const prevActive = new Set(steps && si > 0 ? steps[si - 1].lines : steps && si === 0 ? before : []);
  const stepP = steps && si >= 0 ? progress(frame, starts[si], 8) : 1;
  const hasFocus = active.size > 0;
  const note = steps && si >= 0 ? steps[si].note : undefined;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: (height - panelH) / 2,
        height: panelH,
        boxSizing: "border-box",
        background: colors.surface,
        border: `2px solid ${colors.border}`,
        borderRadius: radius.card,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: HEADER,
          minHeight: HEADER,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: `0 ${PAD}px`,
          background: colors.surfaceAlt,
          borderBottom: `2px solid ${colors.border}`,
        }}
      >
        {[colors.textMuted, colors.textMuted, colors.accent].map((c, i) => (
          <div key={i} style={{ width: 16, height: 16, borderRadius: 8, background: alpha(c, 0.6) }} />
        ))}
        <div
          style={{
            marginLeft: 12,
            fontFamily: fonts.code,
            fontWeight: 700,
            fontSize: 26,
            color: colors.textMuted,
            textTransform: title ? "none" : "uppercase",
          }}
        >
          {title ?? lang}
        </div>
        {note ? (
          <div
            style={{
              marginLeft: "auto",
              fontFamily: fonts.heading,
              fontWeight: 800,
              fontSize: 26,
              color: colors.accent,
              opacity: stepP,
            }}
          >
            {note}
          </div>
        ) : null}
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: `${PAD}px ${PAD}px`,
          fontFamily: fonts.code,
          fontSize: fs,
          lineHeight: `${lh}px`,
        }}
      >
        {lines.map((line, i) => {
          const n = i + 1;
          const isActive = active.has(n);
          const wasActive = prevActive.has(n);
          const strength = isActive ? (wasActive ? 1 : stepP) : wasActive ? 1 - stepP : 0;
          const reveal = typeIn ? linear(frame, codeTiming.lineAt(i), 6) : 1;
          const dim = hasFocus && !isActive ? 0.38 : 1;
          return (
            <div
              key={i}
              style={{
                position: "relative",
                whiteSpace: "pre",
                opacity: reveal * dim,
                margin: `0 -${PAD}px`,
                padding: `0 ${PAD}px`,
                background: alpha(colors.accent, 0.16 * strength),
                boxShadow: strength > 0 ? `inset ${8 * strength}px 0 0 ${colors.accent}` : "none",
              }}
            >
              {showLineNumbers ? (
                <span style={{ color: isActive ? colors.accent : alpha(colors.textMuted, 0.6) }}>
                  {String(n).padStart(numW, " ")}
                  {" "}
                </span>
              ) : null}
              {tokenizeLine(line, lang).map((t, ti) => (
                <span
                  key={ti}
                  style={{
                    color: t.type === "space" ? undefined : syntax[t.type],
                    fontWeight: t.type === "keyword" ? 700 : 400,
                  }}
                >
                  {t.text}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const codePanelCues: CueFn<
  Pick<CodePanelProps, "code" | "steps" | "typeIn"> & {
    /** Pitch for a step (e.g. a line's pitch fixed across the whole video). Defaults to the step index. */
    noteOf?: (step: CodeStep, index: number) => number;
  }
> = ({ code, steps, typeIn, noteOf }, { fps, durationInFrames }) => [
  ...(typeIn
    ? code
        .replace(/\s+$/, "")
        .split("\n")
        .map((_, i) => ({ frame: codeTiming.lineAt(i), sound: "type" as const }))
    : []),
  // Each highlight step climbs the scale, so a walkthrough sounds like progress.
  ...(steps
    ? stepStarts(steps, fps, durationInFrames).map((f, i) => ({
        frame: f,
        ...noteFor(noteOf ? noteOf(steps[i], i) : i),
      }))
    : []),
];
