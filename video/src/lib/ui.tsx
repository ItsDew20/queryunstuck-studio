import React from "react";
import { alpha, colors, radius } from "../brand";
import { fonts } from "../fonts";
import { useScene } from "./scene";

/** Font scale relative to the reference box width (portrait anim zone, 936px). */
export const useScale = () => {
  const { width } = useScene();
  return Math.max(0.6, Math.min(1.3, width / 936));
};

export const Fill: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  glow?: string;
}> = ({ children, style, glow }) => (
  <div
    style={{
      background: colors.surface,
      border: `2px solid ${glow ?? colors.border}`,
      borderRadius: radius.card,
      boxShadow: glow ? `0 0 40px ${alpha(glow, 0.35)}` : `0 18px 50px ${alpha(colors.background, 0.6)}`,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({
  children,
  color = colors.accent,
  style,
}) => {
  const s = useScale();
  return (
    <span
      style={{
        display: "inline-block",
        padding: `${8 * s}px ${20 * s}px`,
        borderRadius: radius.chip,
        background: alpha(color, 0.16),
        border: `2px solid ${color}`,
        color,
        fontFamily: fonts.heading,
        fontWeight: 800,
        fontSize: 30 * s,
        letterSpacing: 1,
        textTransform: "uppercase",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/** Small heading drawn above a component (e.g. a table name). */
export const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const s = useScale();
  return (
    <div
      style={{
        fontFamily: fonts.code,
        fontSize: 32 * s,
        color: colors.textMuted,
        marginBottom: 14 * s,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
