// Prints the real timeline of a spec, after auto-stretching and the final sound mix.
// Usage (via npm): npm run timeline -- <spec.json> [--json] [--landscape]
//   default: human-readable scenes + sound cues;  --json: machine-readable for scripts/agents.
import { readFileSync } from "node:fs";
import { layout } from "../src/brand";
import { planScenes } from "../src/compositions/FromSpec";
import { dedupe } from "../src/lib/sfx";
import { musicFor, beatFrames } from "../src/lib/music";
import type { Spec } from "../src/types";

const args = process.argv.slice(2);
const specPath = args.find((a) => !a.startsWith("--"));
if (!specPath) {
  console.error("usage: npm run timeline -- <spec.json> [--json] [--landscape]");
  process.exit(1);
}
const fps = args.includes("--landscape") ? layout.landscape.fps : layout.reel.fps;
const spec = JSON.parse(readFileSync(specPath, "utf8")) as Spec;
const plan = planScenes(spec, fps);
const durationInFrames = plan.reduce((a, p) => a + p.durationInFrames, 0);
const cues = dedupe(
  plan.flatMap((p) => p.cues.map((c) => ({ ...c, frame: c.frame + p.from }))),
  fps,
  durationInFrames,
);
const sec = (f: number) => Number((f / fps).toFixed(3));
const music = musicFor(spec);
const beat = music ? beatFrames(music.bpm, fps) : 0;
/** Distance (in frames) from the nearest eighth-note grid line, for checking beat sync. */
const offGrid = (f: number) => (beat ? Math.abs(f - Math.round(f / (beat / 2)) * (beat / 2)) : 0);

const scenes = plan.map((p) => ({
  id: p.scene.id,
  component: p.scene.component ?? null,
  from: p.from,
  durationInFrames: p.durationInFrames,
  start_sec: sec(p.from),
  end_sec: sec(p.from + p.durationInFrames),
  spec_duration_sec: p.scene.duration_sec,
  stretched: p.stretched,
  beat_aligned: !!p.grid,
  continuation: p.links.prevSameData,
}));

if (args.includes("--json")) {
  const out = {
    fps,
    durationInFrames,
    duration_sec: sec(durationInFrames),
    music: music ? { ...music, beat_frames: beat } : null,
    scenes,
    cues: cues.map((c) => ({ ...c, sec: sec(c.frame), off_grid_frames: Number(offGrid(c.frame).toFixed(2)) })),
  };
  console.log(JSON.stringify(out, null, 2));
} else {
  console.log(`${spec.id} · ${sec(durationInFrames)}s @ ${fps}fps · ${cues.length} sound cues` +
    (music ? ` · music: ${music.bed} ${music.bpm} BPM, ${music.gainDb} dB, sync ${music.sync ? "on" : "off"}` : " · no music"));
  for (const s of scenes) {
    const tags = [s.stretched ? `stretched from ${s.spec_duration_sec}s` : "", s.continuation ? "continuation" : ""].filter(Boolean);
    console.log(`\n## ${s.id} [${s.component ?? "text"}] ${s.start_sec.toFixed(2)}s – ${s.end_sec.toFixed(2)}s${tags.length ? ` (${tags.join(", ")})` : ""}`);
    cues
      .filter((c) => c.frame >= s.from && c.frame < s.from + s.durationInFrames)
      .forEach((c) =>
        console.log(
          `  ${(c.frame / fps).toFixed(2)}s  +${((c.frame - s.from) / fps).toFixed(2)}  ${c.sound}-${c.variant}` +
            (beat && offGrid(c.frame) > 1.01 ? "  (off-beat)" : ""),
        ),
      );
  }
}
