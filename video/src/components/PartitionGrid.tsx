import React from "react";
import { alpha, colors, partitionColor, radius } from "../brand";
import { fonts } from "../fonts";
import { enter, progress } from "../lib/anim";
import { useScene } from "../lib/scene";
import { useScale } from "../lib/ui";
import type { CueFn } from "../lib/sfx";

export interface PartitionItem {
  label: string;
  /** Partition index the item starts in. */
  from: number;
  /** Partition index the item ends in (e.g. hash(key) % n). Defaults to `from`. */
  to?: number;
}

export interface PartitionGridProps {
  /** Partition labels, e.g. ["P0", "P1", "P2"]. */
  partitions: string[];
  items: PartitionItem[];
  /** Caption before / after the move, e.g. "before shuffle" / "after shuffle". */
  beforeLabel?: string;
  afterLabel?: string;
  /** Seconds from scene start when items begin moving. Default 1/3 of the scene. */
  moveAt?: number;
  /** Fraction of the scene over which partition-crossing moves are staggered (0.1-0.8, default 0.35). */
  moveSpan?: number;
  /** Colour items by destination partition from the start (default true). */
  colorByDestination?: boolean;
}

/** Frames an item takes to travel to its new partition. */
const MOVE_FRAMES = 18;

/** Start and end (bin, slot) of every item: slots stack items in arrival order within a bin. */
export const partitionSlots = (items: PartitionItem[], n: number) => {
  const perBin = (key: "from" | "to") => {
    const counts = new Array(n).fill(0);
    return items.map((it) => {
      const b = key === "to" ? (it.to ?? it.from) : it.from;
      return { bin: b, slot: counts[b]++ };
    });
  };
  return { start: perBin("from"), end: perBin("to") };
};

/**
 * Shared timing for visuals and sound. Only items that cross partitions are staggered (each gets a
 * swoosh); items that merely slide to a new slot in the same partition move quietly together, and
 * items that don't change position don't move at all.
 */
export const partitionTiming = (
  items: PartitionItem[],
  n: number,
  moveAt: number | undefined,
  moveSpan: number | undefined,
  fps: number,
  durationInFrames: number,
) => {
  const { start, end } = partitionSlots(items, n);
  const moveStart = Math.round((moveAt ?? durationInFrames / fps / 3) * fps);
  const span = Math.max(1, Math.round(durationInFrames * Math.min(0.8, Math.max(0.1, moveSpan ?? 0.35))));
  const crossers = items.map((_, i) => i).filter((i) => start[i].bin !== end[i].bin);
  const stagger = crossers.length > 1 ? span / crossers.length : 0;
  const order = new Map(crossers.map((i, k) => [i, k]));
  /** Frame item i starts moving, or null if it never moves. */
  const moveStartFor = (i: number): number | null => {
    if (order.has(i)) return moveStart + order.get(i)! * stagger;
    if (start[i].slot !== end[i].slot) return moveStart; // quiet slide within its partition
    return null;
  };
  const lastCross = crossers.length ? moveStart + (crossers.length - 1) * stagger : null;
  return { start, end, moveStart, moveStartFor, crossers, lastCross, appearAt: (i: number) => 4 + i * 2 };
};

export const PartitionGrid: React.FC<PartitionGridProps> = ({
  partitions,
  items,
  beforeLabel,
  afterLabel,
  moveAt,
  moveSpan,
  colorByDestination = true,
}) => {
  const { frame, fps, durationInFrames, width, height } = useScene();
  const s = useScale();
  const n = partitions.length;
  const gap = 24 * s;
  const captionH = 80 * s;
  const headerH = 70 * s;
  const colW = (width - gap * (n - 1)) / n;
  const binTop = captionH + headerH;
  const binH = height - binTop;

  const { start, end, moveStart, moveStartFor, appearAt } = partitionTiming(
    items,
    n,
    moveAt,
    moveSpan,
    fps,
    durationInFrames,
  );
  const maxSlots = Math.max(
    ...partitions.map((_, b) => Math.max(start.filter((x) => x.bin === b).length, end.filter((x) => x.bin === b).length)),
    1,
  );
  const itemH = Math.min(84 * s, (binH - 24 * s) / maxSlots - 12 * s);
  const itemGap = 12 * s;
  const fs = Math.min(32 * s, itemH * 0.45);

  const place = (b: number, slot: number) => ({
    x: b * (colW + gap) + 14 * s,
    y: binTop + 14 * s + slot * (itemH + itemGap),
  });

  const anyMoving = frame >= moveStart;
  const caption = anyMoving && afterLabel ? afterLabel : beforeLabel;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: captionH,
          textAlign: "center",
          fontFamily: fonts.heading,
          fontWeight: 800,
          fontSize: 38 * s,
          color: colors.accent,
        }}
      >
        {caption}
      </div>
      {partitions.map((p, b) => (
        <div key={b}>
          <div
            style={{
              position: "absolute",
              top: captionH,
              left: b * (colW + gap),
              width: colW,
              height: headerH,
              textAlign: "center",
              fontFamily: fonts.code,
              fontWeight: 700,
              fontSize: 30 * s,
              color: partitionColor(b),
              ...enter(progress(frame, b * 3, 10), 10),
            }}
          >
            {p}
          </div>
          <div
            style={{
              position: "absolute",
              top: binTop,
              left: b * (colW + gap),
              width: colW,
              height: binH,
              borderRadius: radius.card,
              border: `2px dashed ${alpha(partitionColor(b), 0.6)}`,
              background: alpha(partitionColor(b), 0.05),
              boxSizing: "border-box",
            }}
          />
        </div>
      ))}
      {items.map((it, i) => {
        const dest = it.to ?? it.from;
        const ms = moveStartFor(i);
        const t = ms === null ? 0 : progress(frame, ms, MOVE_FRAMES);
        const a = place(start[i].bin, start[i].slot);
        const z = place(end[i].bin, end[i].slot);
        const arc = Math.sin(t * Math.PI) * -40 * s;
        const c = colorByDestination || t > 0.5 ? partitionColor(dest) : partitionColor(it.from);
        const appear = progress(frame, appearAt(i), 10);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: a.x + (z.x - a.x) * t,
              top: a.y + (z.y - a.y) * t + arc,
              width: colW - 28 * s,
              height: itemH,
              borderRadius: radius.chip,
              background: alpha(c, 0.2),
              border: `3px solid ${c}`,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: fonts.code,
              fontWeight: 700,
              fontSize: fs,
              color: colors.text,
              opacity: appear,
              zIndex: t > 0 && t < 1 ? 2 : 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {it.label}
          </div>
        );
      })}
    </div>
  );
};

export const partitionGridCues: CueFn<PartitionGridProps> = (
  { partitions, items, moveAt, moveSpan },
  { fps, durationInFrames },
) => {
  const { moveStartFor, crossers, lastCross, appearAt } = partitionTiming(
    items,
    partitions.length,
    moveAt,
    moveSpan,
    fps,
    durationInFrames,
  );
  return [
    ...items.map((_, i) => ({ frame: appearAt(i), sound: "tick" as const })),
    // One swoosh per item that actually crosses partitions; quiet slides and static items are silent.
    ...crossers.map((i) => ({ frame: Math.round(moveStartFor(i)!), sound: "swoosh" as const })),
    // Everything has settled into its partition.
    ...(lastCross !== null ? [{ frame: Math.round(lastCross) + MOVE_FRAMES, sound: "snap" as const }] : []),
  ];
};
