import React from "react";
import { colors, SemanticState, stateColor } from "../brand";
import { activeStep, progress, stepStarts, Timed, mix } from "../lib/anim";
import { useScene } from "../lib/scene";
import { Cell, TableView, useTableMetrics } from "../lib/table";
import { Chip, Fill, Label, useScale } from "../lib/ui";
import { colIndex, TABLE_BAND } from "./DataTable";
import type { CueFn } from "../lib/sfx";

export interface RowHighlightStep extends Timed {
  /** Caption chip for this step, e.g. "WHERE status = 'paid'". */
  label?: string;
  /** 0-based rows whose state changes in this step. */
  rows?: number[];
  /** State applied to `rows`. noMatch rows are struck through and dimmed. */
  state?: SemanticState;
  /** Clear all row states before applying this step. */
  reset?: boolean;
  /** New display order as original row indices. Rows left out fade away (use for ORDER BY / LIMIT). */
  order?: number[];
  /** Column names/indices to emphasise from this step on. */
  highlightCols?: Array<string | number>;
}

export interface RowHighlightProps {
  columns: string[];
  rows: Cell[][];
  title?: string;
  steps: RowHighlightStep[];
}

const TRANSITION = 12;

export const RowHighlight: React.FC<RowHighlightProps> = ({ columns, rows, title, steps }) => {
  const { frame, fps, durationInFrames, height } = useScene();
  const s = useScale();
  const reserve = TABLE_BAND * s + (title ? 60 * s : 0);
  const { rh } = useTableMetrics({ columns, rows, maxHeight: height - reserve });
  const starts = stepStarts(steps, fps, durationInFrames);
  const si = activeStep(starts, frame);
  const p = si >= 0 ? progress(frame, starts[si], TRANSITION) : 0;

  // Row states up to (and including) the current step; remember the previous state for tweening.
  const stateAt = (upto: number): Array<SemanticState | undefined> => {
    let st: Array<SemanticState | undefined> = rows.map(() => undefined);
    for (let k = 0; k <= upto; k++) {
      const step = steps[k];
      if (step.reset) st = rows.map(() => undefined);
      step.rows?.forEach((r) => {
        st[r] = step.state ?? "active";
      });
    }
    return st;
  };
  const orderAt = (upto: number): number[] => {
    let o = rows.map((_, i) => i);
    for (let k = 0; k <= upto; k++) if (steps[k].order) o = steps[k].order!;
    return o;
  };
  const cur = stateAt(si);
  const prev = stateAt(si - 1);
  const ordCur = orderAt(si);
  const ordPrev = orderAt(si - 1);
  const slot = (ord: number[], r: number) => {
    const k = ord.indexOf(r);
    return k >= 0 ? k : r;
  };
  let hl: Array<string | number> = [];
  for (let k = 0; k <= si; k++) if (steps[k].highlightCols) hl = steps[k].highlightCols!;

  const label = si >= 0 ? steps[si].label : undefined;

  return (
    <Fill>
      <div style={{ height: TABLE_BAND * s, display: "flex", alignItems: "center" }}>
        {label ? (
          <div style={{ opacity: p, transform: `scale(${0.9 + 0.1 * p})` }}>
            <Chip>{label}</Chip>
          </div>
        ) : null}
      </div>
      {title ? <Label>{title}</Label> : null}
      <TableView
        columns={columns}
        rows={rows}
        maxHeight={height - reserve}
        highlightCols={hl.map((c) => colIndex(columns, c))}
        bodyRows={mix(ordPrev.length, ordCur.length, p)}
        rowVisual={(i) => {
          const c = cur[i];
          const was = prev[i];
          const changed = c !== was;
          const strength = c ? (changed ? p : 1) : was ? 1 - p : 0;
          const shown = c ?? was;
          const inCur = ordCur.includes(i);
          const inPrev = ordPrev.includes(i);
          const opacityOrder = inCur ? (inPrev ? 1 : p) : inPrev ? 1 - p : 0;
          const struck = c === "noMatch";
          const moving = slot(ordCur, i) !== slot(ordPrev, i);
          return {
            color: shown ? stateColor(shown) : undefined,
            strength,
            strike: struck && p > 0.5,
            opacity: opacityOrder * (struck ? mix(1, 0.45, changed ? p : 1) : 1),
            // Rows dropped from the order fade out where they were instead of jumping.
            dy: (mix(slot(ordPrev, i), inCur ? slot(ordCur, i) : slot(ordPrev, i), p) - i) * rh,
            raised: moving,
          };
        }}
        cellColor={(r) => (cur[r] === "noMatch" && p > 0.5 ? colors.textMuted : undefined)}
      />
    </Fill>
  );
};

export const rowHighlightCues: CueFn<RowHighlightProps> = ({ steps, rows }, { fps, durationInFrames }) =>
  stepStarts(steps, fps, durationInFrames).flatMap((frame, i) => {
    const st = steps[i];
    const out: Array<{ frame: number; sound: "ding" | "thud" | "swoosh" | "glide" | "click" }> = [];
    if (st.order) {
      // Fewer rows than before = rows leaving (swoosh); same rows in a new order = a sort (glide).
      const before = steps.slice(0, i).reduce<number>((n, s) => (s.order ? s.order.length : n), rows.length);
      out.push({ frame, sound: st.order.length < before ? "swoosh" : "glide" });
    }
    if (st.rows?.length && st.state === "match") out.push({ frame, sound: "ding" });
    else if (st.rows?.length && st.state === "noMatch") out.push({ frame, sound: "thud" });
    else if (!st.order) out.push({ frame, sound: "click" });
    return out;
  });
