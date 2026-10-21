import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, Img, staticFile, useCurrentFrame } from "remotion";
import { alpha, brand, colors, radius } from "../brand";
import { fonts } from "../fonts";
import type { Spec } from "../types";

// YouTube thumbnail (1280x720) and reel cover (1080x1920): one option per frame
// (frame N = spec.thumbnail.options[N]). Rendered by scripts/thumbnail.mjs, which first extracts each
// option's video frame to public/thumbs/<id>-<N>.png. Big short text + one real frame from the video.

export type ThumbOption = {
  text: string; // <= 5 words, the promise the video delivers
  accent?: string; // word(s) inside `text` drawn in the accent colour
  badge?: string; // tiny label, e.g. "INTERVIEW Q"
  frame_sec?: number; // which moment of the video to show
};

const options = (spec: Spec): ThumbOption[] =>
  ((spec as unknown as { thumbnail?: { options?: ThumbOption[] } }).thumbnail?.options ?? []).slice(0, 6);

export const calculateThumbnailMetadata =
  (orientation: "landscape" | "portrait"): CalculateMetadataFunction<Spec> =>
  ({ props }) => ({
    durationInFrames: Math.max(1, options(props).length),
    fps: 1,
    width: orientation === "landscape" ? 1280 : 1080,
    height: orientation === "landscape" ? 720 : 1920,
  });

/** Largest size (up to max) at which the longest word fits the column (Montserrat 900 ≈ 0.68 em/char). */
const fit = (text: string, width: number, max: number): number =>
  Math.min(max, Math.floor(width / (Math.max(...text.split(/\s+/).map((w) => w.length)) * 0.68)));

const Headline: React.FC<{ o: ThumbOption; size: number }> = ({ o, size }) => {
  const parts = o.accent && o.text.includes(o.accent) ? o.text.split(o.accent) : [o.text];
  return (
    <div
      style={{
        fontFamily: fonts.heading,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.02,
        color: colors.text,
        letterSpacing: -1,
        textShadow: `0 6px 24px ${alpha(colors.background, 0.9)}`,
      }}
    >
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {p}
          {i < parts.length - 1 ? <span style={{ color: colors.accent }}>{o.accent}</span> : null}
        </React.Fragment>
      ))}
    </div>
  );
};

const Badge: React.FC<{ text: string; size: number }> = ({ text, size }) => (
  <div
    style={{
      alignSelf: "flex-start",
      padding: `${size * 0.35}px ${size * 0.7}px`,
      borderRadius: radius.chip,
      background: colors.accent,
      color: colors.background,
      fontFamily: fonts.heading,
      fontWeight: 900,
      fontSize: size,
      letterSpacing: 1,
    }}
  >
    {text}
  </div>
);

const Shot: React.FC<{ src: string; style: React.CSSProperties }> = ({ src, style }) => (
  <Img
    src={src}
    style={{
      position: "absolute",
      objectFit: "cover",
      borderRadius: radius.card,
      border: `6px solid ${colors.accent}`,
      boxShadow: `0 20px 60px ${alpha(colors.background, 0.85)}`,
      ...style,
    }}
  />
);

const Thumb: React.FC<{ spec: Spec; orientation: "landscape" | "portrait" }> = ({ spec, orientation }) => {
  const frame = useCurrentFrame();
  const opts = options(spec);
  const o = opts[Math.min(frame, opts.length - 1)];
  const bg = (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <AbsoluteFill
        style={{ background: `radial-gradient(circle at 80% 40%, ${alpha(colors.primary, 0.7)} 0%, transparent 65%)` }}
      />
    </AbsoluteFill>
  );
  if (!o) return bg;
  const src = staticFile(`thumbs/${spec.id}-${Math.min(frame, opts.length - 1)}.png`);
  const w = brand.watermarkStyle;
  const land = orientation === "landscape";
  return (
    <AbsoluteFill>
      {bg}
      {land ? (
        <Shot src={src} style={{ right: -30, top: 150, width: 620, height: 349, transform: "rotate(-3deg)" }} />
      ) : (
        <Shot src={src} style={{ left: 60, right: 60, top: 980, height: 540 }} />
      )}
      <AbsoluteFill
        style={{
          padding: land ? "56px 0 56px 64px" : "200px 72px 0",
          width: land ? 640 : "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: land ? "center" : "flex-start",
          gap: land ? 22 : 36,
        }}
      >
        {o.badge ? <Badge text={o.badge} size={land ? 30 : 44} /> : null}
        <Headline o={o} size={fit(o.text, land ? 640 - 64 - 24 : 1080 - 144, land ? 104 : 132)} />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: land ? 64 : 72,
          bottom: land ? 36 : 300,
          fontFamily: fonts.heading,
          fontWeight: w.fontWeight,
          fontSize: land ? 26 : 34,
          color: alpha(colors.text, w.opacity),
        }}
      >
        {brand.handle}
      </div>
    </AbsoluteFill>
  );
};

export const Thumbnail: React.FC<Spec> = (spec) => <Thumb spec={spec} orientation="landscape" />;
export const ReelCover: React.FC<Spec> = (spec) => <Thumb spec={spec} orientation="portrait" />;
