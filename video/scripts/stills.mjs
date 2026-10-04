// Render stills at real scene positions (after auto-stretch): 70% into each picked scene.
// Usage: node scripts/stills.mjs <spec.json> <outDir> [composition=FromSpec] [count=5]
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const [specPath, outDir = "out/stills", comp = "FromSpec", countArg = "5"] = process.argv.slice(2);
if (!specPath) {
  console.error("usage: node scripts/stills.mjs <spec.json> <outDir> [composition] [count]");
  process.exit(1);
}
const tlArgs = ["run", "-s", "timeline", "--", specPath, "--json"];
if (comp === "FromSpecLandscape") tlArgs.push("--landscape");
const timeline = JSON.parse(execFileSync("npm", tlArgs, { encoding: "utf8" }));
const mids = timeline.scenes.map((s) => ({ id: s.id, frame: s.from + Math.round(s.durationInFrames * 0.7) }));
const count = Math.min(Number(countArg), mids.length);
const picks = Array.from({ length: count }, (_, i) => mids[Math.round((i * (mids.length - 1)) / Math.max(1, count - 1))]);
mkdirSync(outDir, { recursive: true });
for (const p of picks) {
  const out = path.join(outDir, `${comp}-${p.id}-f${p.frame}.png`);
  execFileSync("npx", ["remotion", "still", "src/index.ts", comp, out, `--props=${specPath}`, `--frame=${p.frame}`], {
    stdio: "inherit",
  });
}
