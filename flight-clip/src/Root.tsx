import { Composition } from "remotion";
import { FlightMap, FPS, DURATION_IN_FRAMES } from "./FlightMap";
import {
  PakistanHighlight,
  PAKISTAN_FPS,
  PAKISTAN_DURATION_IN_FRAMES,
} from "./PakistanHighlight";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FlightPakistanToUSA"
        component={FlightMap}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="FlightPakistanToUSAVertical"
        component={FlightMap}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="PakistanHighlight"
        component={PakistanHighlight}
        durationInFrames={PAKISTAN_DURATION_IN_FRAMES}
        fps={PAKISTAN_FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="PakistanHighlightVertical"
        component={PakistanHighlight}
        durationInFrames={PAKISTAN_DURATION_IN_FRAMES}
        fps={PAKISTAN_FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
