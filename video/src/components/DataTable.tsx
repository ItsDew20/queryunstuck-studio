import React from "react";
import { semantic } from "../brand";
import { enter, progress } from "../lib/anim";
import { useScene } from "../lib/scene";
import { Cell, TableView } from "../lib/table";
import { Fill, Label, useScale } from "../lib/ui";
import type { CueFn } from "../lib/sfx";

export interface DataTableProps {
  columns: string[];
  rows: Cell[][];
  /** Table name shown above, e.g. "orders". */
  title?: string;
  /** Column names or indices to emphasise. */
  highlightCols?: Array<string | number>;
  /** 0-based row indices tinted with the active colour. */
  highlightRows?: number[];
  /** Reveal rows one by one (default true). */
  revealRows?: boolean;
}

/** Height of the caption band above tables (RowHighlight puts its step chip here). */
export const TABLE_BAND = 110;

// 5 frames (167 ms) between rows: just over the tick dedupe window, so every row gets its tick.
export const tableTiming = { rowAt: (i: number) => 6 + i * 5 };

export const colIndex = (columns: string[], c: string | number): number =>
  typeof c === "number" ? c : columns.indexOf(c);

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  title,
  highlightCols = [],
  highlightRows = [],
  revealRows = true,
}) => {
  const { frame, height } = useScene();
  const s = useScale();
  // Same band + label layout as RowHighlight, so a table that carries on between scenes doesn't jump.
  const reserve = TABLE_BAND * s + (title ? 60 * s : 0);
  return (
    <Fill>
      <div style={{ height: TABLE_BAND * s }} />
      {title ? <Label style={enter(progress(frame, 0, 10), 10)}>{title}</Label> : null}
      <TableView
        columns={columns}
        rows={rows}
        maxHeight={height - reserve}
        highlightCols={highlightCols.map((c) => colIndex(columns, c))}
        rowVisual={(i) => {
          const p = revealRows ? progress(frame, tableTiming.rowAt(i), 10) : 1;
          return {
            opacity: p,
            dx: (1 - p) * -40,
            color: highlightRows.includes(i) ? semantic.active : undefined,
          };
        }}
      />
    </Fill>
  );
};

export const dataTableCues: CueFn<DataTableProps> = ({ rows, revealRows = true }) =>
  revealRows
    ? rows.map((_, i) => ({ frame: tableTiming.rowAt(i), sound: "tick" as const }))
    : [{ frame: 0, sound: "pop" as const }];
