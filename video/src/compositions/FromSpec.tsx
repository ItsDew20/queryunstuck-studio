import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, interpolate, Sequence, useCurrentFrame } from "remotion";
import { alpha, brand, colors, layout } from "../brand";
import { CodePanel, codePanelCues, CodeStep } from "../components/CodePanel";
import { cueRegistry, FULL_FRAME, registry } from "../components";
import { fonts } from "../fonts";
import { enter, progress } from "../lib/anim";
import { SceneProvider } from "../lib/scene";
import { Cue, dedupe, minGapFrames, SfxTrack, tightestGap } from "../lib/sfx";
import type { CodeBlock, Scene, Spec } from "../types";

type Orientation = "portrait" | "landscape";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Reserved scene.props key that drives the bottom/side code panel. Not passed to the component. */
export interface CodeHighlight {
  steps?: CodeStep[];
  activeLines?: number[];
  title?: string;
}

export const sceneFrames = (scene: Scene, fps: number) => Math.max(1, Math.round(scene.duration_sec * fps));

interface PlannedScene {
  scene: Scene;
  from: number;
  /** Frames actually played: duration_sec, stretched if its swooshes would crowd together. */
  durationInFrames: number;
  cues: Cue[];
  links: Links;
}

/** How a scene connects to its neighbours; continuations skip the fade and the whoosh. */
export interface Links {
  /** Previous / next scene shows the same table (same columns + rows), just a new step on it. */
  prevSameData: boolean;
  nextSameData: boolean;
  /** Previous / next scene keeps the same side/bottom code panel. */
  prevSameCode: boolean;
  nextSameCode: boolean;
}

const zoned = (s?: Scene) => !!s?.component && !FULL_FRAME.has(s.component) && s.component !== "CodePanel";

const sameData = (a?: Scene, b?: Scene) => {
  if (!zoned(a) || !zoned(b)) return false;
  const pa = a!.props ?? {};
  const pb = b!.props ?? {};
  return (
    pa.columns !== undefined &&
    JSON.stringify(pa.columns) === JSON.stringify(pb.columns) &&
    JSON.stringify(pa.rows) === JSON.stringify(pb.rows)
  );
};

const sameCode = (a?: Scene, b?: Scene) =>
  zoned(a) && zoned(b) && a!.code_block !== undefined && a!.code_block === b!.code_block;

export const sceneLinks = (scenes: Scene[], i: number): Links => ({
  prevSameData: sameData(scenes[i - 1], scenes[i]),
  nextSameData: sameData(scenes[i], scenes[i + 1]),
  prevSameCode: sameCode(scenes[i - 1], scenes[i]),
  nextSameCode: sameCode(scenes[i], scenes[i + 1]),
});

/**
 * Lay scenes out on the timeline. A scene whose swoosh cues are closer than
 * brand.audio.minGapMs.swoosh is slowed down (up to brand.audio.maxStretch x) so movements
 * get room to breathe; any swooshes still too close are merged by `dedupe`.
 */
export const planScenes = (spec: Spec, fps: number): PlannedScene[] => {
  const codeBlocks = spec.code_blocks ?? [];
  const pitches = linePitches(spec.scenes ?? []);
  const target = minGapFrames("swoosh", fps);
  const scenes = spec.scenes ?? [];
  let from = 0;
  return scenes.map((scene, i) => {
    const links = sceneLinks(scenes, i);
    const base = sceneFrames(scene, fps);
    let d = base;
    let cues = sceneCues(scene, i, links, codeBlocks, pitches, fps, d);
    for (let k = 1.05; k <= brand.audio.maxStretch + 1e-9 && tightestGap(cues, "swoosh") < target; k += 0.05) {
      d = Math.round(base * k);
      cues = sceneCues(scene, i, links, codeBlocks, pitches, fps, d);
    }
    const planned = { scene, from, durationInFrames: d, cues, links };
    from += d;
    return planned;
  });
};

export const calculateSpecMetadata =
  (orientation: Orientation): CalculateMetadataFunction<Spec> =>
  ({ props }) => {
    const L = orientation === "portrait" ? layout.reel : layout.landscape;
    const total = planScenes(props, L.fps).reduce((a, p) => a + p.durationInFrames, 0);
    return { durationInFrames: Math.max(1, total), fps: L.fps, width: L.width, height: L.height };
  };

// ---------- layout: every rect is derived from brand.layout ----------
interface SceneRects {
  full: Rect;
  title: Rect;
  anim: Rect;
  code: Rect | null;
  /** Anim rect when there is no code panel. */
  animNoCode: Rect;
  /** Rect for a CodePanel that is the scene's main component. */
  codeMain: Rect;
}

const rects = (o: Orientation): SceneRects => {
  if (o === "portrait") {
    const L = layout.reel;
    const m = L.margin;
    const [t0, t1] = L.titleZone;
    const [a0, a1] = L.animZone;
    const [c0, c1] = L.codeZone;
    const top = 150; // clears the watermark row
    const inner = L.width - m * 2;
    return {
      full: { x: m, y: top, w: inner, h: L.height - L.safeBottom - top },
      title: { x: m, y: Math.max(t0, top - 20), w: inner, h: t1 - Math.max(t0, top - 20) },
      anim: { x: m, y: a0 + 20, w: inner, h: a1 - a0 - 40 },
      code: { x: m, y: c0, w: L.width - m - L.safeRight, h: c1 - c0 },
      animNoCode: { x: m, y: a0 + 20, w: inner, h: c1 - a0 - 20 },
      codeMain: { x: m, y: a0 + 20, w: L.width - m - L.safeRight, h: c1 - a0 - 20 },
    };
  }
  const L = layout.landscape;
  const m = L.margin;
  const [t0, t1] = L.titleZone;
  const [c0, c1] = L.contentZone;
  const inner = L.width - m - L.safeRight;
  const gap = 48;
  const codeW = Math.round(inner * L.codeSplit);
  return {
    full: { x: m, y: 110, w: inner, h: L.height - L.safeBottom - 110 },
    title: { x: m, y: t0 + 40, w: inner - 360, h: t1 - t0 - 40 },
    anim: { x: m, y: c0, w: inner - codeW - gap, h: c1 - c0 },
    code: { x: m + inner - codeW, y: c0, w: codeW, h: c1 - c0 },
    animNoCode: { x: m, y: c0, w: inner, h: c1 - c0 },
    codeMain: { x: m, y: c0, w: inner, h: c1 - c0 },
  };
};

// ---------- chrome ----------
const Background: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.background }}>
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${alpha(colors.border, 0.22)} 2px, transparent 2px), linear-gradient(90deg, ${alpha(
          colors.border,
          0.22,
        )} 2px, transparent 2px)`,
        backgroundSize: "72px 72px",
        maskImage: "radial-gradient(ellipse at 50% 35%, black 10%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse at 50% 35%, black 10%, transparent 75%)",
      }}
    />
    <AbsoluteFill
      style={{ background: `radial-gradient(circle at 50% 0%, ${alpha(colors.primary, 0.55)} 0%, transparent 55%)` }}
    />
  </AbsoluteFill>
);

const Watermark: React.FC<{ o: Orientation }> = ({ o }) => {
  const right = o === "portrait" ? layout.reel.safeRight : layout.landscape.safeRight;
  const top = o === "portrait" ? 64 : 48;
  return (
    <div
      style={{
        position: "absolute",
        top,
        right,
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontFamily: fonts.heading,
        fontWeight: 800,
        fontSize: o === "portrait" ? 32 : 28,
        letterSpacing: 0.5,
        color: alpha(colors.text, 0.85),
        zIndex: 10,
      }}
    >
      <div style={{ width: 14, height: 14, borderRadius: 4, background: colors.accent }} />
      {brand.watermark}
    </div>
  );
};

const Box: React.FC<{ r: Rect; o: Orientation; durationInFrames: number; children: React.ReactNode }> = ({
  r,
  o,
  durationInFrames,
  children,
}) => (
  <div style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h }}>
    <SceneProvider value={{ width: r.w, height: r.h, orientation: o, durationInFrames }}>{children}</SceneProvider>
  </div>
);

const SceneTitle: React.FC<{ r: Rect; o: Orientation; text: string[] }> = ({ r, o, text }) => {
  const frame = useCurrentFrame();
  const [title, definition] = text;
  if (!title) return null;
  const portrait = o === "portrait";
  // Montserrat Black averages ~0.66em per glyph; shrink long titles to one line where possible.
  const maxFs = portrait ? 80 : 66;
  const titleFs = Math.max(portrait ? 54 : 46, Math.min(maxFs, r.w / (title.length * 0.66)));
  return (
    <div
      style={{
        position: "absolute",
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: portrait ? "center" : "flex-start",
        textAlign: portrait ? "center" : "left",
      }}
    >
      <div
        style={{
          fontFamily: fonts.heading,
          fontWeight: 900,
          fontSize: titleFs,
          lineHeight: 1.08,
          color: colors.text,
          letterSpacing: -0.5,
          ...enter(progress(frame, 0, 12), 24),
        }}
      >
        {title}
      </div>
      {definition ? (
        <div
          style={{
            marginTop: 18,
            fontFamily: fonts.body,
            fontWeight: 600,
            fontSize: portrait ? 38 : 32,
            lineHeight: 1.3,
            color: colors.textMuted,
            ...enter(progress(frame, 5, 12), 16),
          }}
        >
          {definition}
        </div>
      ) : null}
    </div>
  );
};

/** Scene with no component: show on_screen_text as big centred lines. */
const TextOnly: React.FC<{ text: string[] }> = ({ text }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", gap: 24 }}>
      {text.map((t, i) => (
        <div
          key={i}
          style={{
            fontFamily: fonts.heading,
            fontWeight: i === 0 ? 900 : 600,
            fontSize: i === 0 ? 80 : 44,
            color: i === 0 ? colors.text : colors.textMuted,
            ...enter(progress(frame, i * 5, 12), 24),
          }}
        >
          {t}
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ---------- scene ----------
/** Separate reserved keys (`codeHighlight`, `sfx`, `transition`) from the component's own props. */
const splitProps = (scene: Scene) => {
  const { codeHighlight, sfx, transition, ...props } = (scene.props ?? {}) as {
    codeHighlight?: CodeHighlight;
    sfx?: boolean;
    transition?: "whoosh" | "none";
  } & Record<string, unknown>;
  return { codeHighlight, sfx, transition, props };
};

/**
 * Whoosh only on a real change of view: not on the first scene, not when the same table carries
 * on, and not into the EndCard (its outro already marks the moment). `props.transition` overrides.
 */
const wantsWhoosh = (scene: Scene, index: number, links: Links): boolean => {
  const { transition } = splitProps(scene);
  if (transition) return transition === "whoosh";
  return index > 0 && !links.prevSameData && scene.component !== "EndCard";
};

/** code_block index -> line number -> scale degree. */
type LinePitches = Map<number, Map<number, number>>;

/**
 * Give every highlighted code line one pitch for the whole video: the first time a line is
 * highlighted it takes the next note up; whenever it lights up again it replays that note.
 * So a walkthrough climbs the scale, and later scenes "quote" it consistently.
 */
const linePitches = (scenes: Scene[]): LinePitches => {
  const out: LinePitches = new Map();
  for (const scene of scenes) {
    if (scene.code_block === undefined) continue;
    const { codeHighlight, props } = splitProps(scene);
    const steps = (scene.component === "CodePanel" ? (props.steps as CodeStep[] | undefined) : codeHighlight?.steps) ?? [];
    const map = out.get(scene.code_block) ?? new Map<number, number>();
    for (const st of steps) {
      const line = st.lines[0];
      if (line !== undefined && !map.has(line)) map.set(line, map.size);
    }
    out.set(scene.code_block, map);
  }
  return out;
};

const pitchOf =
  (pitches: LinePitches, block: number | undefined) =>
  (step: CodeStep, index: number): number =>
    (block !== undefined ? pitches.get(block)?.get(step.lines[0]) : undefined) ?? index;

/** All sound cues for one scene, in scene-relative frames. */
const sceneCues = (
  scene: Scene,
  index: number,
  links: Links,
  codeBlocks: CodeBlock[],
  pitches: LinePitches,
  fps: number,
  d: number,
): Cue[] => {
  const { codeHighlight, sfx, props } = splitProps(scene);
  if (sfx === false) return [];
  const ctx = { fps, durationInFrames: d };
  const block = scene.code_block !== undefined ? codeBlocks[scene.code_block] : undefined;
  const cues: Cue[] = wantsWhoosh(scene, index, links) ? [{ frame: 0, sound: "whoosh" }] : [];
  const name = scene.component;
  if (name === "CodePanel") {
    const noteOf = pitchOf(pitches, scene.code_block);
    cues.push(...codePanelCues({ ...(block ? { code: block.code } : {}), ...props, noteOf } as never, ctx));
  } else if (name) {
    cues.push(...cueRegistry[name](props, ctx));
    if (block && !FULL_FRAME.has(name) && codeHighlight?.steps) {
      cues.push(
        ...codePanelCues({ code: block.code, steps: codeHighlight.steps, noteOf: pitchOf(pitches, scene.code_block) }, ctx),
      );
    }
  } else {
    cues.push({ frame: 0, sound: "pop" });
  }
  return cues.filter((c) => c.frame < d);
};

/** Code lines highlighted at the end of a scene (last step, or its static activeLines). */
const lastCodeLines = (scene: Scene): number[] | undefined => {
  const h = splitProps(scene).codeHighlight;
  return h?.steps?.length ? h.steps[h.steps.length - 1].lines : h?.activeLines;
};

const SceneView: React.FC<{
  scene: Scene;
  codeBlocks: CodeBlock[];
  o: Orientation;
  durationInFrames: number;
  links: Links;
  /** Previous scene, used to carry the code highlight across a continuation. */
  prev?: Scene;
}> = ({ scene, codeBlocks, o, durationInFrames, links, prev }) => {
  const frame = useCurrentFrame();
  const R = rects(o);
  const fadeIn = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  // Parts that carry on into the neighbouring scene stay put instead of blinking.
  const fade = (keepIn: boolean, keepOut: boolean) => Math.min(keepIn ? 1 : fadeIn, keepOut ? 1 : fadeOut);
  const opacity = fade(false, false);
  const animOpacity = fade(links.prevSameData, links.nextSameData);
  const codeOpacity = fade(links.prevSameCode, links.nextSameCode);

  const { codeHighlight, props } = splitProps(scene);
  const block = scene.code_block !== undefined ? codeBlocks[scene.code_block] : undefined;
  const name = scene.component;

  let body: React.ReactNode;
  if (!name) {
    body = (
      <Box r={R.full} o={o} durationInFrames={durationInFrames}>
        <TextOnly text={scene.on_screen_text} />
      </Box>
    );
  } else if (FULL_FRAME.has(name)) {
    const C = registry[name];
    body = (
      <Box r={R.full} o={o} durationInFrames={durationInFrames}>
        <C {...props} />
      </Box>
    );
  } else if (name === "CodePanel") {
    const merged = { ...(block ? { code: block.code, lang: block.lang } : {}), ...props };
    body = (
      <>
        <SceneTitle r={R.title} o={o} text={scene.on_screen_text} />
        <Box r={R.codeMain} o={o} durationInFrames={durationInFrames}>
          <CodePanel {...(merged as unknown as React.ComponentProps<typeof CodePanel>)} />
        </Box>
      </>
    );
  } else {
    const C = registry[name];
    body = (
      <>
        <div style={{ opacity }}>
          <SceneTitle r={R.title} o={o} text={scene.on_screen_text} />
        </div>
        <div style={{ opacity: animOpacity }}>
          <Box r={block && R.code ? R.anim : R.animNoCode} o={o} durationInFrames={durationInFrames}>
            <C {...props} />
          </Box>
        </div>
        {block && R.code ? (
          <div style={{ opacity: codeOpacity }}>
            <Box r={R.code} o={o} durationInFrames={durationInFrames}>
              <CodePanel
                code={block.code}
                lang={block.lang}
                title={codeHighlight?.title}
                steps={codeHighlight?.steps}
                activeLines={codeHighlight?.activeLines}
                initialLines={links.prevSameCode && prev ? lastCodeLines(prev) : undefined}
              />
            </Box>
          </div>
        ) : null}
      </>
    );
    return <AbsoluteFill>{body}</AbsoluteFill>;
  }
  return <AbsoluteFill style={{ opacity }}>{body}</AbsoluteFill>;
};

const SpecPlayer: React.FC<{ spec: Spec; o: Orientation }> = ({ spec, o }) => {
  const fps = o === "portrait" ? layout.reel.fps : layout.landscape.fps;
  const plan = planScenes(spec, fps);
  const end = plan.reduce((a, p) => a + p.durationInFrames, 0);
  const allCues = plan.flatMap((p) => p.cues.map((c) => ({ ...c, frame: c.frame + p.from })));
  return (
    <AbsoluteFill>
      <Background />
      {plan.map(({ scene, from, durationInFrames: d, links }, i) => (
        <Sequence key={scene.id} from={from} durationInFrames={d} name={`${scene.id} · ${scene.component ?? "text"}`}>
          <SceneView scene={scene} codeBlocks={spec.code_blocks ?? []} o={o} durationInFrames={d} links={links} prev={plan[i - 1]?.scene} />
        </Sequence>
      ))}
      <Watermark o={o} />
      <SfxTrack cues={dedupe(allCues, fps, end)} fps={fps} />
    </AbsoluteFill>
  );
};

export const FromSpec: React.FC<Spec> = (spec) => <SpecPlayer spec={spec} o="portrait" />;
export const FromSpecLandscape: React.FC<Spec> = (spec) => <SpecPlayer spec={spec} o="landscape" />;
