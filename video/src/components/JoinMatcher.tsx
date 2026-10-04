import React from "react";
import { alpha, colors, semantic } from "../brand";
import { fonts } from "../fonts";
import { activeStep, linear, progress, stepStarts } from "../lib/anim";
import { useScene } from "../lib/scene";
import { Cell, TableView, useTableMetrics } from "../lib/table";
import { Chip, useScale } from "../lib/ui";
import { colIndex } from "./DataTable";
import type { CueFn } from "../lib/sfx";

export interface JoinSide {
  /** Table name, e.g. "orders". */
  name: string;
  columns: string[];
  rows: Cell[][];
  /** Join key column (name or index). */
  key: string | number;
}

export interface JoinMatcherProps {
  left: JoinSide;
  right: JoinSide;
  /** inner: unmatched left rows marked noMatch. left: unmatched left rows kept (pending, "NULL"). */
  joinType?: "inner" | "left";
  /** Chip text, e.g. "orders.customer_id = customers.id". Defaults to the key condition. */
  label?: string;
  /** Show a running "result rows" counter. Default true. */
  showCount?: boolean;
}

const LABEL_H = 110;
/** Frames from a left row's start until its match result settles. */
const SCAN = 14;

/** Indices of matching right rows for each left row (NULL never matches). */
export const joinMatches = (left: JoinSide, right: JoinSide): number[][] => {
  const lk = colIndex(left.columns, left.key);
  const rk = colIndex(right.columns, right.key);
  return left.rows.map((lr) =>
    right.rows.map((rr, j) => (rr[rk] !== null && rr[rk] === lr[lk] ? j : -1)).filter((j) => j >= 0),
  );
};

export const joinStarts = (count: number, fps: number, durationInFrames: number) =>
  stepStarts(Array.from({ length: count }, () => ({})), fps, durationInFrames, 0.6, 1.4);
const NAME_H = 56;

export const JoinMatcher: React.FC<JoinMatcherProps> = ({ left, right, joinType = "inner", label, showCount = true }) => {
  const { frame, fps, durationInFrames, width, height } = useScene();
  const s = useScale();
  const gap = 90 * s;
  const tableMaxW = (width - gap) / 2;
  const tableMaxH = height - (LABEL_H + NAME_H + 70) * s;
  const lk = colIndex(left.columns, left.key);
  const rk = colIndex(right.columns, right.key);

  // Same scale for both tables so rows line up nicely.
  const lm = useTableMetrics({ columns: left.columns, rows: left.rows, maxWidth: tableMaxW, maxHeight: tableMaxH });
  const rm = useTableMetrics({ columns: right.columns, rows: right.rows, maxWidth: tableMaxW, maxHeight: tableMaxH });
  const k = Math.min(lm.s, rm.s) / Math.max(lm.s, rm.s);
  const lW = lm.s > rm.s ? lm.tableWidth * k : lm.tableWidth;
  const rW = rm.s > lm.s ? rm.tableWidth * k : rm.tableWidth;
  const rh = Math.min(lm.rh, rm.rh);
  const total = lW + gap + rW;
  const x0 = (width - total) / 2;
  const tablesTop = (LABEL_H + NAME_H) * s;

  const matches = joinMatches(left, right);
  const starts = joinStarts(left.rows.length, fps, durationInFrames);
  const si = activeStep(starts, frame);

  const leftState = (i: number) => {
    if (i > si) return undefined;
    if (i === si && frame < starts[i] + SCAN) return { color: semantic.active, p: progress(frame, starts[i], 6) };
    return matches[i].length
      ? { color: semantic.match, p: 1 }
      : { color: joinType === "left" ? semantic.pending : semantic.noMatch, p: 1 };
  };

  const resultCount = left.rows.reduce((acc, _, i) => {
    if (i > si || (i === si && frame < starts[i] + SCAN)) return acc;
    return acc + (matches[i].length || (joinType === "left" ? 1 : 0));
  }, 0);

  const rowY = (i: number) => tablesTop + 2 + rh * (i + 1) + rh / 2;
  const cur = si >= 0 ? si : -1;
  const curMatches = cur >= 0 ? matches[cur] : [];
  const lineP = cur >= 0 ? linear(frame, starts[cur] + 4, SCAN - 4) : 0;
  const settled = cur >= 0 && frame >= starts[cur] + SCAN;
  const lineColor = settled ? semantic.match : semantic.active;

  const nameStyle: React.CSSProperties = {
    position: "absolute",
    top: LABEL_H * s,
    height: NAME_H * s,
    fontFamily: fonts.code,
    fontSize: 28 * s,
    color: colors.textMuted,
  };

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: LABEL_H * s,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20 * s,
        }}
      >
        <Chip style={{ fontSize: 24 * s }}>
          {label ?? `${joinType.toUpperCase()} JOIN ON ${left.name}.${left.columns[lk]} = ${right.name}.${right.columns[rk]}`}
        </Chip>
      </div>
      <div style={{ ...nameStyle, left: x0 }}>{left.name}</div>
      <div style={{ ...nameStyle, left: x0 + lW + gap }}>{right.name}</div>
      <div style={{ position: "absolute", left: x0, top: tablesTop }}>
        <TableView
          columns={left.columns}
          rows={left.rows}
          maxWidth={tableMaxW}
          maxHeight={tableMaxH}
          highlightCols={[lk]}
          rowVisual={(i) => {
            const st = leftState(i);
            return st ? { color: st.color, strength: st.p } : {};
          }}
          style={lm.s > rm.s ? { transform: `scale(${k})`, transformOrigin: "top left" } : undefined}
        />
      </div>
      <div style={{ position: "absolute", left: x0 + lW + gap, top: tablesTop }}>
        <TableView
          columns={right.columns}
          rows={right.rows}
          maxWidth={tableMaxW}
          maxHeight={tableMaxH}
          highlightCols={[rk]}
          rowVisual={(j) => (curMatches.includes(j) ? { color: lineColor, strength: lineP } : {})}
          style={rm.s > lm.s ? { transform: `scale(${k})`, transformOrigin: "top left" } : undefined}
        />
      </div>
      <svg style={{ position: "absolute", inset: 0, overflow: "visible" }} width={width} height={height}>
        {cur >= 0
          ? (curMatches.length ? curMatches : [-1]).map((j, n) => {
              const x1 = x0 + lW;
              const y1 = rowY(cur);
              const x2 = j >= 0 ? x0 + lW + gap : x0 + lW + gap * 0.55;
              const y2 = j >= 0 ? rowY(j) : y1;
              const xe = x1 + (x2 - x1) * lineP;
              const ye = y1 + (y2 - y1) * lineP;
              const c = j >= 0 ? lineColor : settled ? leftState(cur)!.color : semantic.active;
              return (
                <g key={n}>
                  <line x1={x1} y1={y1} x2={xe} y2={ye} stroke={c} strokeWidth={5 * s} strokeLinecap="round" />
                  <circle cx={x1} cy={y1} r={9 * s} fill={c} />
                  {lineP > 0.95 ? <circle cx={x2} cy={y2} r={9 * s} fill={c} /> : null}
                  {j < 0 && settled ? (
                    <text
                      x={x2 + 14 * s}
                      y={y2 + 10 * s}
                      fill={c}
                      fontFamily={fonts.heading}
                      fontWeight={900}
                      fontSize={30 * s}
                    >
                      {joinType === "left" ? "NULL" : "✕"}
                    </text>
                  ) : null}
                </g>
              );
            })
          : null}
      </svg>
      {showCount ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: tablesTop + rh * (Math.max(left.rows.length, right.rows.length) + 1) + 40 * s,
            textAlign: "center",
            fontFamily: fonts.heading,
            fontWeight: 800,
            fontSize: 38 * s,
            color: colors.text,
          }}
        >
          result rows:{" "}
          <span
            style={{
              color: colors.accent,
              background: alpha(colors.accent, 0.14),
              padding: `${4 * s}px ${16 * s}px`,
              borderRadius: 10 * s,
            }}
          >
            {resultCount}
          </span>
        </div>
      ) : null}
    </div>
  );
};

export const joinMatcherCues: CueFn<JoinMatcherProps> = ({ left, right }, { fps, durationInFrames }) => {
  const matches = joinMatches(left, right);
  return joinStarts(left.rows.length, fps, durationInFrames).flatMap((f, i) => [
    { frame: f, sound: "blip" as const },
    { frame: f + SCAN, sound: matches[i].length ? ("ding" as const) : ("thud" as const) },
  ]);
};
