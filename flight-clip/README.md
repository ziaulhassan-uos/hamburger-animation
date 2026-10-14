# Flight clip: Pakistan to USA

A short Remotion animation of a flight from Islamabad (ISB) to New York (JFK) on a rotating 3D globe.
The plane follows the real great-circle route, the camera tracks it, and a HUD counts distance and flight time.

- Map: `world-atlas` country shapes rendered with `d3-geo` (orthographic projection), fully offline, no API key needed.
- Length: 11 seconds at 30 fps.

## Output

- `out/flight-pakistan-usa.mp4` (1920x1080, landscape)
- `out/flight-pakistan-usa-vertical.mp4` (1080x1920, for Shorts, Reels and TikTok)

## Commands

```bash
npm install
npm run studio            # live preview in Remotion Studio
npm run render            # landscape MP4
npm run render:vertical   # vertical MP4
```

Edit `ORIGIN` and `DESTINATION` in `src/FlightMap.tsx` to change the route.
