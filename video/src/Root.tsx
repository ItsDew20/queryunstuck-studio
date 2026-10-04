import React from "react";
import { Composition } from "remotion";
import { layout } from "./brand";
import { calculateSpecMetadata, FromSpec, FromSpecLandscape } from "./compositions/FromSpec";
import demo from "./demos/demo-sql-order.json";
import type { Spec } from "./types";
import "./fonts";

const demoSpec = demo as unknown as Spec;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="FromSpec"
      component={FromSpec}
      width={layout.reel.width}
      height={layout.reel.height}
      fps={layout.reel.fps}
      durationInFrames={1}
      defaultProps={demoSpec}
      calculateMetadata={calculateSpecMetadata("portrait")}
    />
    <Composition
      id="FromSpecLandscape"
      component={FromSpecLandscape}
      width={layout.landscape.width}
      height={layout.landscape.height}
      fps={layout.landscape.fps}
      durationInFrames={1}
      defaultProps={demoSpec}
      calculateMetadata={calculateSpecMetadata("landscape")}
    />
  </>
);
