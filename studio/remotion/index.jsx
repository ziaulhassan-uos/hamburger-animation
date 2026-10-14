import { registerRoot, Composition } from 'remotion';
import { HamburgerIntro } from './HamburgerIntro.jsx';

const Root = () => (
  <Composition
    id="HamburgerIntro"
    component={HamburgerIntro}
    durationInFrames={90}
    fps={30}
    width={1080}
    height={1080}
  />
);

registerRoot(Root);
