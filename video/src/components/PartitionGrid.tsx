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
  /** Colour items by destination partition from the start (default true). */
  colorByDestination?: boolean;
}

/** Frames an item takes to travel to its new partition. */
const MOVE_FRAMES = 18;

export const partitionTiming = (count: number, moveAt: number | undefined, fps: number, durationInFrames: number) => {
  const moveStart = Math.round((moveAt ?? durationInFrames / fps / 3) * fps);
  const moveSpan = Math.max(1, Math.round(durationInFrames * 0.35));
  return {
    moveStart,
    stagger: count > 1 ? moveSpan / count : 0,
    appearAt: (i: number) => 4 + i * 2,
  };
};

export const PartitionGrid: React.FC<PartitionGridProps> = ({
  partitions,
  items,
  beforeLabel,
  afterLabel,
  moveAt,
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

  const perBin = (key: "from" | "to") => {
    const counts = new Array(n).fill(0);
    return items.map((it) => {
      const b = key === "to" ? (it.to ?? it.from) : it.from;
      return { bin: b, slot: counts[b]++ };
    });
  };
  const start = perBin("from");
  const end = perBin("to");
  const maxSlots = Math.max(
    ...partitions.map((_, b) => Math.max(start.filter((x) => x.bin === b).length, end.filter((x) => x.bin === b).length)),
    1,
  );
  const itemH = Math.min(84 * s, (binH - 24 * s) / maxSlots - 12 * s);
  const itemGap = 12 * s;
  const fs = Math.min(32 * s, itemH * 0.45);

  const { moveStart, stagger, appearAt } = partitionTiming(items.length, moveAt, fps, durationInFrames);

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
        const t = progress(frame, moveStart + i * stagger, MOVE_FRAMES);
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

export const partitionGridCues: CueFn<PartitionGridProps> = ({ items, moveAt }, { fps, durationInFrames }) => {
  const { moveStart, stagger, appearAt } = partitionTiming(items.length, moveAt, fps, durationInFrames);
  return [
    ...items.map((_, i) => ({ frame: appearAt(i), sound: "tick" as const })),
    ...items.map((_, i) => ({ frame: Math.round(moveStart + i * stagger), sound: "swoosh" as const })),
    // Everything has settled into its partition.
    { frame: Math.round(moveStart + (items.length - 1) * stagger) + MOVE_FRAMES, sound: "snap" as const },
  ];
};
