// Single bridge between brand/brand.json and the video engine.
// Components import tokens from here; never hard-code colours or fonts.
import brandJson from "../../brand/brand.json";

export const brand = brandJson;
export const colors = brandJson.colors;
export const semantic = brandJson.semantic;
export const syntax = brandJson.syntax;
export const radius = brandJson.radius;
export const layout = brandJson.layout;

export type SemanticState = "active" | "match" | "noMatch" | "pending";

export const stateColor = (s: SemanticState): string => semantic[s];

export const partitionColor = (i: number): string =>
  semantic.partitionPalette[((i % semantic.partitionPalette.length) + semantic.partitionPalette.length) %
    semantic.partitionPalette.length];

/** Hex colour + alpha (0..1) -> 8-digit hex. Derives tints from tokens without new colours. */
export const alpha = (hex: string, a: number): string => {
  const v = Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex.slice(0, 7)}${v}`;
};
