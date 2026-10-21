import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, useCurrentFrame } from "remotion";
import { alpha, brand, colors, layout, radius } from "../brand";
import { fonts } from "../fonts";
import type { Spec } from "../types";

// Instagram carousel: one 4:5 slide per frame (frame N = slide N). Rendered as JPEG stills by
// scripts/carousel.mjs. Carousels are for reading, so text-dense slides are fine here.
const L = layout.carousel;

export const calculateCarouselMetadata: CalculateMetadataFunction<Spec> = ({ props }) => ({
  durationInFrames: Math.max(1, props.carousel?.slides.length ?? 1),
  fps: 1,
  width: L.width,
  height: L.height,
});

const Background: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.background }}>
    <AbsoluteFill
      style={{ background: `radial-gradient(circle at 50% 0%, ${alpha(colors.primary, 0.55)} 0%, transparent 60%)` }}
    />
  </AbsoluteFill>
);

/** "Parquet: column-oriented file" → bold "Parquet", muted rest. */
const Line: React.FC<{ text: string; n?: number }> = ({ text, n }) => {
  const i = text.indexOf(":");
  const head = i > 0 ? text.slice(0, i) : text;
  const rest = i > 0 ? text.slice(i + 1).trim() : "";
  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
        padding: "26px 30px",
        background: colors.surface,
        border: `2px solid ${colors.border}`,
        borderRadius: radius.chip,
      }}
    >
      {n !== undefined ? (
        <div
          style={{
            minWidth: 58,
            height: 58,
            borderRadius: radius.chip,
            background: colors.accent,
            color: colors.background,
            fontFamily: fonts.heading,
            fontWeight: 900,
            fontSize: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {n}
        </div>
      ) : null}
      <div style={{ fontFamily: fonts.body, fontSize: 38, lineHeight: 1.3, color: colors.text }}>
        <span style={{ fontWeight: 800 }}>{head}</span>
        {rest ? <span style={{ fontWeight: 500, color: colors.textMuted }}>{`: ${rest}`}</span> : null}
      </div>
    </div>
  );
};

export const Carousel: React.FC<Spec> = (spec) => {
  const frame = useCurrentFrame();
  const slides = spec.carousel?.slides ?? [];
  const slide = slides[Math.min(frame, slides.length - 1)];
  if (!slide) return <Background />;
  const w = brand.watermarkStyle;
  return (
    <AbsoluteFill>
      <Background />
      <div
        style={{
          position: "absolute",
          top: 56,
          left: L.margin,
          right: L.margin,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: fonts.heading,
          fontWeight: w.fontWeight,
          fontSize: 26,
          color: alpha(colors.text, w.opacity),
        }}
      >
        <span>
          {frame + 1} / {slides.length}
        </span>
        <span>{brand.handle}</span>
      </div>
      <AbsoluteFill
        style={{
          padding: `150px ${L.margin}px 120px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: slide.kind === "list" ? "stretch" : "center",
          textAlign: slide.kind === "list" ? "left" : "center",
          gap: 22,
        }}
      >
        <div
          style={{
            fontFamily: fonts.heading,
            fontWeight: 900,
            fontSize: slide.kind === "cover" ? 92 : slide.kind === "takeaway" ? 78 : 60,
            lineHeight: 1.1,
            color: colors.text,
            whiteSpace: "pre-line",
            marginBottom: slide.kind === "list" ? 18 : 10,
          }}
        >
          {slide.title}
        </div>
        {slide.kind !== "list" ? (
          <div style={{ width: 200, height: 12, borderRadius: 6, background: colors.accent, margin: "14px auto 24px" }} />
        ) : null}
        {slide.subtitle ? (
          <div style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: 42, lineHeight: 1.35, color: colors.textMuted }}>
            {slide.subtitle}
          </div>
        ) : null}
        {slide.kind === "list"
          ? (slide.lines ?? []).map((l, i) => <Line key={i} text={l} n={slide.start !== undefined ? slide.start + i : undefined} />)
          : (slide.lines ?? []).map((l, i) => (
              <div key={i} style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: 40, color: colors.textMuted }}>
                {l}
              </div>
            ))}
        {slide.kind === "takeaway" ? (
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <div style={{ fontFamily: fonts.heading, fontWeight: 900, fontSize: 56, color: colors.accent }}>{brand.handle}</div>
            <div style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: 32, color: colors.textMuted }}>{brand.tagline}</div>
          </div>
        ) : null}
        {slide.kind === "cover" ? (
          <div style={{ marginTop: 50, fontFamily: fonts.heading, fontWeight: 800, fontSize: 36, color: colors.accent }}>
            Swipe →
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
