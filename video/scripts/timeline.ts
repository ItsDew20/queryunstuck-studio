// Prints the real timeline of a spec, after auto-stretching and the final sound mix.
// Usage (via npm): npm run timeline -- <spec.json> [--json] [--landscape]
//   default: human-readable scenes + sound cues;  --json: machine-readable for scripts/agents.
import { readFileSync } from "node:fs";
import { layout } from "../src/brand";
import { planScenes } from "../src/compositions/FromSpec";
import { dedupe } from "../src/lib/sfx";
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

const scenes = plan.map((p) => ({
  id: p.scene.id,
  component: p.scene.component ?? null,
  from: p.from,
  durationInFrames: p.durationInFrames,
  start_sec: sec(p.from),
  end_sec: sec(p.from + p.durationInFrames),
  spec_duration_sec: p.scene.duration_sec,
  stretched: p.durationInFrames !== Math.max(1, Math.round(p.scene.duration_sec * fps)),
  continuation: p.links.prevSameData,
}));

if (args.includes("--json")) {
  const out = { fps, durationInFrames, duration_sec: sec(durationInFrames), scenes, cues: cues.map((c) => ({ ...c, sec: sec(c.frame) })) };
  console.log(JSON.stringify(out, null, 2));
} else {
  console.log(`${spec.id} · ${sec(durationInFrames)}s @ ${fps}fps · ${cues.length} sound cues`);
  for (const s of scenes) {
    const tags = [s.stretched ? `stretched from ${s.spec_duration_sec}s` : "", s.continuation ? "continuation" : ""].filter(Boolean);
    console.log(`\n## ${s.id} [${s.component ?? "text"}] ${s.start_sec.toFixed(2)}s – ${s.end_sec.toFixed(2)}s${tags.length ? ` (${tags.join(", ")})` : ""}`);
    cues
      .filter((c) => c.frame >= s.from && c.frame < s.from + s.durationInFrames)
      .forEach((c) => console.log(`  ${(c.frame / fps).toFixed(2)}s  +${((c.frame - s.from) / fps).toFixed(2)}  ${c.sound}-${c.variant}`));
  }
}
