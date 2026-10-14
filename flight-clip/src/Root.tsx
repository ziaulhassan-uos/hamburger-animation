import { Composition } from "remotion";
import { FlightMap, FPS, DURATION_IN_FRAMES } from "./FlightMap";

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
    </>
  );
};
