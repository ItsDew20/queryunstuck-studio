import React from "react";
import { alpha, colors, radius } from "../brand";
import { fonts } from "../fonts";
import { mix, progress, stepStarts } from "../lib/anim";
import { useScene } from "../lib/scene";
import { Cell, TableView, useTableMetrics } from "../lib/table";
import { Chip, Fill, useScale } from "../lib/ui";
import { colIndex } from "./DataTable";
import type { CueFn } from "../lib/sfx";

export type WindowAggregate = "sum" | "avg" | "count" | "min" | "max";

export interface WindowFrameProps {
  /** Rows must already be in ORDER BY order (and grouped by partition, if any). */
  columns: string[];
  rows: Cell[][];
  /** Column the aggregate reads. */
  valueColumn: string | number;
  aggregate: WindowAggregate;
  /** Rows before the current row; "unbounded" for UNBOUNDED PRECEDING. */
  preceding: number | "unbounded";
  /** Rows after the current row; "unbounded" for UNBOUNDED FOLLOWING. Default 0 (CURRENT ROW). */
  following?: number | "unbounded";
  /** Optional PARTITION BY column: the frame never crosses a partition boundary. */
  partitionColumn?: string | number;
  /** Header of the computed column, e.g. "running_total". */
  outputColumn?: string;
  /** Decimal places for avg. Default 2. */
  decimals?: number;
  /** Chip text shown above, e.g. "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW". */
  label?: string;
}

const aggregateValues = (vals: number[], agg: WindowAggregate, decimals: number): number => {
  if (agg === "count") return vals.length;
  if (agg === "sum") return vals.reduce((a, b) => a + b, 0);
  if (agg === "min") return Math.min(...vals);
  if (agg === "max") return Math.max(...vals);
  const m = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Number(m.toFixed(decimals));
};

/** Inclusive [lo, hi] frame bounds for row i, clipped to its partition. */
export const frameBounds = (
  i: number,
  part: Array<Cell>,
  preceding: number | "unbounded",
  following: number | "unbounded",
): [number, number] => {
  let pStart = i;
  while (pStart > 0 && part[pStart - 1] === part[i]) pStart--;
  let pEnd = i;
  while (pEnd < part.length - 1 && part[pEnd + 1] === part[i]) pEnd++;
  const lo = preceding === "unbounded" ? pStart : Math.max(pStart, i - preceding);
  const hi = following === "unbounded" ? pEnd : Math.min(pEnd, i + following);
  return [lo, hi];
};

/** Frames for the frame outline to slide one row. */
const MOVE = 10;

export const windowStarts = (count: number, fps: number, durationInFrames: number) =>
  stepStarts(Array.from({ length: count }, () => ({})), fps, durationInFrames, 0.6, 1.5);

export const WindowFrame: React.FC<WindowFrameProps> = ({
  columns,
  rows,
  valueColumn,
  aggregate,
  preceding,
  following = 0,
  partitionColumn,
  outputColumn,
  decimals = 2,
  label,
}) => {
  const { frame, fps, durationInFrames, height } = useScene();
  const s = useScale();
  const vi = colIndex(columns, valueColumn);
  const pi = partitionColumn !== undefined ? colIndex(columns, partitionColumn) : -1;
  const part = rows.map((r) => (pi >= 0 ? r[pi] : 0));
  const outName = outputColumn ?? `${aggregate}_${columns[vi]}`;
  const bounds = rows.map((_, i) => frameBounds(i, part, preceding, following));
  const outputs = bounds.map(([lo, hi]) =>
    aggregateValues(
      rows.slice(lo, hi + 1).map((r) => Number(r[vi])),
      aggregate,
      decimals,
    ),
  );

  const starts = windowStarts(rows.length, fps, durationInFrames);
  // Continuous cursor position for smooth sliding.
  let cursor = 0;
  starts.forEach((st, i) => {
    if (i === 0) cursor = 0;
    else cursor = mix(cursor, i, progress(frame, st, MOVE));
  });
  const shown = progress(frame, starts[0], MOVE);
  const ci = Math.round(cursor);

  const allCols = [...columns, outName];
  const allRows: Cell[][] = rows.map((r, i) => [
    ...r,
    // Pad with spaces until revealed so column widths stay fixed.
    frame >= starts[i] + MOVE ? outputs[i] : " ".repeat(Math.max(outName.length, String(outputs[i]).length)),
  ]);
  const reserve = 110 * s;
  const m = useTableMetrics({ columns: allCols, rows: allRows, maxHeight: height - reserve });

  const fi = Math.floor(cursor);
  const ft = cursor - fi;
  const [lo0, hi0] = bounds[fi];
  const [lo1, hi1] = bounds[Math.min(rows.length - 1, fi + 1)];
  const lo = mix(lo0, lo1, ft);
  const hi = mix(hi0, hi1, ft);

  return (
    <Fill>
      <div style={{ height: reserve, display: "flex", alignItems: "center" }}>
        {label ? <Chip style={{ fontSize: 24 * s }}>{label}</Chip> : null}
      </div>
      <div style={{ position: "relative" }}>
        <TableView
          columns={allCols}
          rows={allRows}
          maxHeight={height - reserve}
          highlightCols={[vi, allCols.length - 1]}
          rowVisual={(i) => ({
            color: i === ci && shown > 0 ? colors.accent : undefined,
            strength: shown,
            opacity: i >= bounds[ci][0] && i <= bounds[ci][1] ? 1 : 0.55,
          })}
          cellColor={(r, c) => (c === allCols.length - 1 && r === ci ? colors.accent : undefined)}
        />
        {/* Sliding frame outline */}
        <div
          style={{
            position: "absolute",
            left: -10 * s,
            width: m.tableWidth + 20 * s,
            top: 2 + m.rh * (1 + lo) - 6 * s,
            height: m.rh * (hi - lo + 1) + 12 * s,
            border: `${5 * s}px solid ${colors.accent}`,
            borderRadius: radius.chip,
            boxShadow: `0 0 36px ${alpha(colors.accent, 0.45)}`,
            opacity: shown,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: 12 * s,
              top: -22 * s,
              background: colors.accent,
              color: colors.background,
              fontFamily: fonts.heading,
              fontWeight: 900,
              fontSize: 22 * s,
              padding: `${4 * s}px ${14 * s}px`,
              borderRadius: radius.chip,
              letterSpacing: 1,
            }}
          >
            FRAME
          </div>
        </div>
      </div>
    </Fill>
  );
};

export const windowFrameCues: CueFn<WindowFrameProps> = ({ rows }, { fps, durationInFrames }) =>
  // One sound per slide; the output value appearing right after stays silent.
  windowStarts(rows.length, fps, durationInFrames).map((f, i) => ({
    frame: f,
    sound: i === 0 ? ("pop" as const) : ("slide" as const),
  }));
