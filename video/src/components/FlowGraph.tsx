import React from "react";
import { alpha, colors, radius, semantic } from "../brand";
import { fonts } from "../fonts";
import { linear, pop, progress, snapToGrid, coarseGrid, type Grid } from "../lib/anim";
import { useScene } from "../lib/scene";
import { useScale } from "../lib/ui";
import { minGapFrames, type CueFn } from "../lib/sfx";

export interface FlowNode {
  id: string;
  label: string;
  /** Optional second line in muted text. */
  sublabel?: string;
  /** Position of the node centre as a fraction of the box (0..1). */
  x: number;
  y: number;
  /** "active" (accent), "match", "noMatch", "pending" or default surface. */
  tone?: "active" | "match" | "noMatch" | "pending";
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  /** Number of travelling dots on this edge (default 2, 0 to disable). */
  dots?: number;
  /** Dot colour: partition palette index; default accent. */
  colorIndex?: number;
}

export interface FlowGraphProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  /** Reveal nodes then edges in array order (default true). */
  reveal?: boolean;
  /** Seconds for a dot to cross an edge. Default 1.6. */
  dotSpeed?: number;
}

export const flowTiming = (
  nodeCount: number,
  edgeCount: number,
  reveal: boolean,
  durationInFrames: number,
  grid?: Grid,
  fps = 30,
) => {
  if (!reveal) return { nodeDelay: () => 0, edgeDelay: () => 0 };
  // Nodes pop in, then edges draw; with synced music every appearance snaps to the beat grid.
  // Edges (each with a swoosh) use beat multiples that respect the swoosh minimum gap.
  const nodes = snapToGrid(
    Array.from({ length: nodeCount }, (_, i) => 4 + i * 6),
    grid,
    durationInFrames,
  );
  const firstEdge = (nodes[nodes.length - 1] ?? 0) + 6;
  const edges = snapToGrid(
    Array.from({ length: edgeCount }, (_, i) => firstEdge + i * 14),
    coarseGrid(grid, minGapFrames("swoosh", fps)),
    durationInFrames,
  );
  return { nodeDelay: (i: number) => nodes[i], edgeDelay: (i: number) => edges[i] };
};

export const FlowGraph: React.FC<FlowGraphProps> = ({ nodes, edges, reveal = true, dotSpeed = 1.6 }) => {
  const { frame, fps, width, height, durationInFrames, grid } = useScene();
  const s = useScale();
  const nw = 330 * s;
  const nh = 140 * s;
  const pad = { x: nw / 2 + 8, y: nh / 2 + 8 };
  const pos = (n: FlowNode) => ({
    x: pad.x + n.x * (width - pad.x * 2),
    y: pad.y + n.y * (height - pad.y * 2),
  });
  const byId = new Map(nodes.map((n, i) => [n.id, { n, i }]));
  const { nodeDelay, edgeDelay } = flowTiming(nodes.length, edges.length, reveal, durationInFrames, grid, fps);
  const cycle = Math.round(dotSpeed * fps);

  // Point where the segment from centre a to b leaves a's rectangle.
  const exitPoint = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const tx = dx === 0 ? Infinity : nw / 2 / Math.abs(dx);
    const ty = dy === 0 ? Infinity : nh / 2 / Math.abs(dy);
    const t = Math.min(tx, ty);
    return { x: a.x + dx * t, y: a.y + dy * t };
  };

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <marker id="qu-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth={6} markerHeight={6} orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={colors.textMuted} />
          </marker>
        </defs>
        {edges.map((e, i) => {
          const A = byId.get(e.from);
          const B = byId.get(e.to);
          if (!A || !B) return null;
          const a = exitPoint(pos(A.n), pos(B.n));
          const b = exitPoint(pos(B.n), pos(A.n));
          const draw = progress(frame, edgeDelay(i), 14);
          const ex = a.x + (b.x - a.x) * draw;
          const ey = a.y + (b.y - a.y) * draw;
          const nd = e.dots ?? 2;
          const dotColor = e.colorIndex !== undefined
            ? semantic.partitionPalette[e.colorIndex % semantic.partitionPalette.length]
            : colors.accent;
          const live = frame - edgeDelay(i) - 14;
          return (
            <g key={i}>
              <line
                x1={a.x}
                y1={a.y}
                x2={ex}
                y2={ey}
                stroke={colors.border}
                strokeWidth={5 * s}
                markerEnd={draw > 0.98 ? "url(#qu-arrow)" : undefined}
              />
              {live > 0
                ? Array.from({ length: nd }, (_, k) => {
                    const t = linear(((live + (k * cycle) / nd) % cycle), 0, cycle);
                    return (
                      <circle
                        key={k}
                        cx={a.x + (b.x - a.x) * t}
                        cy={a.y + (b.y - a.y) * t}
                        r={10 * s}
                        fill={dotColor}
                        style={{ filter: `drop-shadow(0 0 ${8 * s}px ${dotColor})` }}
                      />
                    );
                  })
                : null}
            </g>
          );
        })}
        {/* Edge labels last, with a dark outline, so travelling dots never cover them. */}
        {edges.map((e, i) => {
          const A = byId.get(e.from);
          const B = byId.get(e.to);
          if (!e.label || !A || !B) return null;
          const a = exitPoint(pos(A.n), pos(B.n));
          const b = exitPoint(pos(B.n), pos(A.n));
          return (
            <text
              key={`label-${i}`}
              x={(a.x + b.x) / 2}
              y={(a.y + b.y) / 2 - 16 * s}
              textAnchor="middle"
              fill={colors.textMuted}
              stroke={colors.background}
              strokeWidth={8 * s}
              paintOrder="stroke"
              fontFamily={fonts.code}
              fontSize={28 * s}
              opacity={progress(frame, edgeDelay(i), 14)}
            >
              {e.label}
            </text>
          );
        })}
      </svg>
      {nodes.map((n, i) => {
        const p = pop(frame, fps, nodeDelay(i));
        const c = pos(n);
        const tone = n.tone ? semantic[n.tone] : colors.border;
        return (
          <div
            key={n.id}
            style={{
              position: "absolute",
              left: c.x - nw / 2,
              top: c.y - nh / 2,
              width: nw,
              height: nh,
              borderRadius: radius.chip,
              background: n.tone ? alpha(tone, 0.16) : colors.surface,
              border: `3px solid ${tone}`,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              opacity: p,
              transform: `scale(${0.8 + 0.2 * p})`,
            }}
          >
            <div
              style={{
                fontFamily: fonts.heading,
                fontWeight: 800,
                // Shrink long labels to fit the node (Montserrat ExtraBold ~0.62em per glyph).
                fontSize: Math.min(42 * s, (nw - 28 * s) / Math.max(1, n.label.length * 0.62)),
                color: colors.text,
                whiteSpace: "nowrap",
              }}
            >
              {n.label}
            </div>
            {n.sublabel ? (
              <div
                style={{
                  fontFamily: fonts.code,
                  fontSize: Math.min(26 * s, (nw - 24 * s) / Math.max(1, n.sublabel.length * 0.6)),
                  color: colors.textMuted,
                  marginTop: 4 * s,
                  whiteSpace: "nowrap",
                }}
              >
                {n.sublabel}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export const flowGraphCues: CueFn<FlowGraphProps> = ({ nodes, edges, reveal = true }, { durationInFrames, grid, fps }) => {
  const { nodeDelay, edgeDelay } = flowTiming(nodes.length, edges.length, reveal, durationInFrames, grid, fps);
  return [
    ...nodes.map((_, i) => ({ frame: nodeDelay(i), sound: "pop" as const })),
    ...edges.map((_, i) => ({ frame: edgeDelay(i), sound: "swoosh" as const, gain: 0.8 })),
  ];
};
