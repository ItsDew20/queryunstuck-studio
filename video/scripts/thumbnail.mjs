// Render thumbnail / cover options from spec.thumbnail.options (frame N = option N).
// For each option: extract its frame_sec from the rendered video into public/thumbs/<id>-<N>.png,
// render the option, and write a small preview (the size a phone feed shows) plus a contact sheet.
// Usage (from video/): node scripts/thumbnail.mjs <spec.json> <rendered.mp4> [Thumbnail|ReelCover]
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const [specPath, videoPath, comp = "Thumbnail"] = process.argv.slice(2);
if (!specPath || !videoPath) {
  console.error("usage: node scripts/thumbnail.mjs <spec.json> <rendered.mp4> [Thumbnail|ReelCover]");
  process.exit(1);
}
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const opts = spec.thumbnail?.options ?? [];
if (!opts.length) {
  console.error("spec.thumbnail.options is empty");
  process.exit(1);
}
mkdirSync("public/thumbs", { recursive: true });
mkdirSync("out/thumbs", { recursive: true });
const small = comp === "Thumbnail" ? "320:180" : "180:320"; // roughly a feed / suggested-video tile
const outs = [];
opts.forEach((o, n) => {
  const shot = path.join("public/thumbs", `${spec.id}-${n}.png`);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", String(o.frame_sec ?? 2), "-i", videoPath, "-frames:v", "1", shot]);
  const out = path.join("out/thumbs", `${spec.id}-${comp}-${n}.png`);
  execFileSync("npx", ["remotion", "still", "src/index.ts", comp, out, `--props=${specPath}`, `--frame=${n}`, "--log=error"], {
    stdio: "inherit",
  });
  const tiny = out.replace(/\.png$/, "-small.png");
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", out, "-vf", `scale=${small}`, tiny]);
  outs.push(out);
  console.log(`${out}  (+ ${path.basename(tiny)})`);
});
if (outs.length > 1) {
  const sheet = path.join("out/thumbs", `${spec.id}-${comp}-sheet.png`);
  const inputs = outs.flatMap((o) => ["-i", o]);
  const tile = comp === "Thumbnail" ? "vstack" : "hstack";
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...inputs, "-filter_complex", `${tile}=inputs=${outs.length},scale=iw/2:-1`, sheet]);
  console.log(sheet);
}
