import React from "react";
import { alpha, colors, radius } from "../brand";
import { fonts } from "../fonts";
import { useScene } from "./scene";

export type Cell = string | number | null;

export interface RowVisual {
  /** Outline/tint colour for the row, or undefined for neutral. */
  color?: string;
  /** 0..1 strength of the tint. */
  strength?: number;
  opacity?: number;
  strike?: boolean;
  /** Horizontal offset in px (slide in/out). */
  dx?: number;
  /** Vertical offset in px (reordering). */
  dy?: number;
  /** Paint above sibling rows (useful while moving). */
  raised?: boolean;
}

export interface TableViewProps {
  columns: string[];
  rows: Cell[][];
  rowVisual?: (i: number) => RowVisual;
  /** Column indices to emphasise (header + cells in accent). */
  highlightCols?: number[];
  /** Per-cell override text colour. */
  cellColor?: (row: number, col: number) => string | undefined;
  /** Row height in px before scaling. */
  rowHeight?: number;
  fontSize?: number;
  minColWidth?: number;
  /** Space available (defaults to the scene box). The table shrinks to fit. */
  maxWidth?: number;
  maxHeight?: number;
  /** Visible body height in rows (fractional, animatable). Rows beyond it are clipped. */
  bodyRows?: number;
  style?: React.CSSProperties;
}

export const fmt = (c: Cell): string => (c === null ? "NULL" : String(c));

export interface TableMetricsInput {
  columns: string[];
  rows: Cell[][];
  rowHeight?: number;
  fontSize?: number;
  minColWidth?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/** Shared sizing so components can position things relative to rows (e.g. reorder offsets). */
export const useTableMetrics = ({
  columns,
  rows,
  rowHeight = 84,
  fontSize = 38,
  minColWidth = 120,
  maxWidth,
  maxHeight,
}: TableMetricsInput) => {
  const box = useScene();
  const boxW = maxWidth ?? box.width;
  const boxH = maxHeight ?? box.height;
  // Fixed column widths (monospace ~0.62em/char) so every row grid lines up; shrink to fit the box.
  const lens = columns.map((c, ci) => Math.max(c.length, ...rows.map((r) => fmt(r[ci] ?? null).length)));
  const colW = (k: number) => lens.map((l) => Math.max(minColWidth * k, l * 0.62 * fontSize * k + 44 * k));
  const natural = colW(1).reduce((a, b) => a + b, 0) + 4;
  const fitW = (boxW - 8) / natural;
  const fitH = (boxH - 8) / ((rows.length + 1) * rowHeight + 4);
  // Small tables may grow up to 1.35x so they read well on a phone.
  const s = Math.min(1.35, fitW, fitH);
  const widths = colW(s);
  return {
    s,
    rh: rowHeight * s,
    fs: fontSize * s,
    widths,
    tableWidth: widths.reduce((a, b) => a + b, 0) + 4,
    colTemplate: widths.map((w) => `${w}px`).join(" "),
  };
};

/** Fixed-row-height table so rows can be animated and positioned predictably. */
export const TableView: React.FC<TableViewProps> = ({
  columns,
  rows,
  rowVisual,
  highlightCols = [],
  cellColor,
  rowHeight = 84,
  fontSize = 38,
  minColWidth = 120,
  maxWidth,
  maxHeight,
  bodyRows,
  style,
}) => {
  const { s, rh, fs, colTemplate } = useTableMetrics({ columns, rows, rowHeight, fontSize, minColWidth, maxWidth, maxHeight });
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        background: colors.surface,
        border: `2px solid ${colors.border}`,
        borderRadius: radius.card,
        overflow: "hidden",
        fontFamily: fonts.code,
        fontSize: fs,
        ...(bodyRows !== undefined ? { height: rh * (1 + bodyRows) + 4, boxSizing: "border-box" as const } : {}),
        ...style,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: colTemplate,
          background: colors.surfaceAlt,
          height: rh,
          boxSizing: "border-box",
          flexShrink: 0,
          alignItems: "center",
        }}
      >
        {columns.map((c, ci) => (
          <div
            key={ci}
            style={{
              padding: `0 ${22 * s}px`,
              fontWeight: 700,
              color: highlightCols.includes(ci) ? colors.accent : colors.textMuted,
              whiteSpace: "nowrap",
            }}
          >
            {c}
          </div>
        ))}
      </div>
      {rows.map((r, ri) => {
        const v = rowVisual?.(ri) ?? {};
        const tint = v.color ? alpha(v.color, 0.22 * (v.strength ?? 1)) : "transparent";
        return (
          <div
            key={ri}
            style={{
              display: "grid",
              gridTemplateColumns: colTemplate,
              height: rh,
              boxSizing: "border-box",
              flexShrink: 0,
              alignItems: "center",
              background: tint,
              boxShadow: v.color ? `inset 6px 0 0 ${alpha(v.color, v.strength ?? 1)}` : "none",
              borderTop: `1px solid ${alpha(colors.border, 0.7)}`,
              opacity: v.opacity ?? 1,
              transform: `translate(${v.dx ?? 0}px, ${v.dy ?? 0}px)`,
              position: "relative",
              zIndex: v.raised ? 2 : 1,
            }}
          >
            {r.map((cell, ci) => (
              <div
                key={ci}
                style={{
                  padding: `0 ${22 * s}px`,
                  color:
                    cellColor?.(ri, ci) ??
                    (cell === null ? colors.textMuted : highlightCols.includes(ci) ? colors.accent : colors.text),
                  whiteSpace: "nowrap",
                  fontStyle: cell === null ? "italic" : "normal",
                }}
              >
                {fmt(cell)}
              </div>
            ))}
            {v.strike ? (
              <div
                style={{
                  position: "absolute",
                  left: 16 * s,
                  right: 16 * s,
                  top: "50%",
                  height: 4 * s,
                  background: v.color ?? colors.textMuted,
                  borderRadius: 2,
                }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
