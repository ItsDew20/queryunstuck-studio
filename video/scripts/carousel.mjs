// Render a spec's carousel slides as JPEGs (Instagram's API accepts JPEG only).
// Usage (from video/): node scripts/carousel.mjs ../content/<id>/spec.json [outDir]
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const [specPath, outArg] = process.argv.slice(2);
if (!specPath) {
  console.error("usage: node scripts/carousel.mjs <spec.json> [outDir]");
  process.exit(1);
}
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const slides = spec.carousel?.slides ?? [];
if (!slides.length) {
  console.error("spec has no carousel.slides");
  process.exit(1);
}
const outDir = outArg ?? `out/${spec.id}-carousel`;
mkdirSync(outDir, { recursive: true });
slides.forEach((_, i) => {
  const out = path.join(outDir, `slide-${String(i + 1).padStart(2, "0")}.jpg`);
  execFileSync(
    "npx",
    ["remotion", "still", "src/index.ts", "Carousel", out, `--props=${specPath}`, `--frame=${i}`, "--image-format=jpeg", "--jpeg-quality=92"],
    { stdio: ["ignore", "ignore", "inherit"] },
  );
  console.log(out);
});
