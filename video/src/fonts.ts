import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { brand } from "./brand";

const montserrat = loadMontserrat("normal", {
  weights: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});
const mono = loadJetBrainsMono("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});

const byName: Record<string, string> = {
  Montserrat: montserrat.fontFamily,
  "JetBrains Mono": mono.fontFamily,
};

const resolve = (name: string) => `${byName[name] ?? name}, sans-serif`;

export const fonts = {
  heading: resolve(brand.fonts.heading),
  body: resolve(brand.fonts.body),
  code: `${byName[brand.fonts.code] ?? brand.fonts.code}, monospace`,
};
