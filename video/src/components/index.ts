import type React from "react";
import type { CueFn } from "../lib/sfx";
import type { ComponentName } from "../types";
import { Callout, calloutCues } from "./Callout";
import { CodePanel, codePanelCues } from "./CodePanel";
import { Comparison, comparisonCues } from "./Comparison";
import { DataTable, dataTableCues } from "./DataTable";
import { EndCard, endCardCues } from "./EndCard";
import { FlowGraph, flowGraphCues } from "./FlowGraph";
import { JoinMatcher, joinMatcherCues } from "./JoinMatcher";
import { ListCard, listCardCues } from "./ListCard";
import { PartitionGrid, partitionGridCues } from "./PartitionGrid";
import { RowHighlight, rowHighlightCues } from "./RowHighlight";
import { Timeline, timelineCues } from "./Timeline";
import { TitleCard, titleCardCues } from "./TitleCard";
import { WindowFrame, windowFrameCues } from "./WindowFrame";

export {
  Callout,
  CodePanel,
  Comparison,
  DataTable,
  EndCard,
  FlowGraph,
  JoinMatcher,
  ListCard,
  PartitionGrid,
  RowHighlight,
  Timeline,
  TitleCard,
  WindowFrame,
};

// Keep in sync with the `component` enum in schemas/content-spec.schema.json.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registry: Record<ComponentName, React.FC<any>> = {
  TitleCard,
  ListCard,
  CodePanel,
  DataTable,
  RowHighlight,
  JoinMatcher,
  WindowFrame,
  FlowGraph,
  PartitionGrid,
  Comparison,
  Timeline,
  Callout,
  EndCard,
};

/** Sound-effect cues per component, computed from the same timing helpers as the visuals. */
export const cueRegistry: Record<ComponentName, CueFn> = {
  TitleCard: titleCardCues,
  ListCard: listCardCues,
  CodePanel: codePanelCues,
  DataTable: dataTableCues,
  RowHighlight: rowHighlightCues,
  JoinMatcher: joinMatcherCues,
  WindowFrame: windowFrameCues,
  FlowGraph: flowGraphCues,
  PartitionGrid: partitionGridCues,
  Comparison: comparisonCues,
  Timeline: timelineCues,
  Callout: calloutCues,
  EndCard: endCardCues,
};

/** Components that own the whole frame instead of the title/animation/code zones. */
export const FULL_FRAME: ReadonlySet<ComponentName> = new Set(["TitleCard", "EndCard", "ListCard"]);
