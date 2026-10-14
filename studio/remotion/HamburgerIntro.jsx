import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// Same look as the CSS button in ../../style.css, scaled up for video.
const bar = {
  position: 'absolute',
  width: 250,
  height: 30,
  borderRadius: 25,
  background: '#fff',
  boxShadow: '0 10px 25px rgba(255,101,47,.2)',
};

export const HamburgerIntro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Open between frames 20 and 50, then close again from frame 60.
  const open = spring({ frame: frame - 20, fps, config: { damping: 14 } });
  const close = spring({ frame: frame - 60, fps, config: { damping: 14 } });
  const p = open - close;

  const middleX = interpolate(p, [0, 1], [0, -250]);
  const middleOpacity = interpolate(p, [0, 1], [1, 0]);
  const offset = interpolate(p, [0, 1], [80, 0]);
  const angle = interpolate(p, [0, 1], [0, 45]);

  return (
    <AbsoluteFill style={{ background: '#272727', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ ...bar, transform: `translateY(${-offset}px) rotate(${angle}deg)` }} />
      <div style={{ ...bar, opacity: middleOpacity, transform: `translateX(${middleX}px)` }} />
      <div style={{ ...bar, transform: `translateY(${offset}px) rotate(${-angle}deg)` }} />
    </AbsoluteFill>
  );
};
