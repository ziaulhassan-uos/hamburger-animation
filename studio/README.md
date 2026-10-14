# Studio: video editing and motion graphics with Claude Code

Everything here runs from a Claude Code chat. Type a `/skill` name, or just
describe what you want using the keywords below and Claude picks the right skill.

## What is installed

| Tool | Used for | Skills (type these) |
|---|---|---|
| Remotion | Videos built with React: templates, branded clips, data videos | `/remotion-create`, `/remotion-best-practices`, `/remotion-render`, `/remotion-captions` |
| HyperFrames | Videos built with HTML and GSAP: promos, explainers, captions, overlays | `/hyperframes`, `/motion-graphics`, `/general-video`, `/product-launch-video` |
| GSAP | Animation on websites (like the hamburger button) | `/gsap-core`, `/gsap-timeline`, `/gsap-scrolltrigger`, `/gsap-react` |
| Manim | Explainer, math and diagram animations | `/manim-video` |
| FFmpeg + MoviePy | Editing footage you already have | `/video-edit` |
| Lottie | Playing After Effects animations on the web | (use with `/gsap-core` or plain JS) |

## Keywords: what to type

| You want to... | Type this | Example prompt |
|---|---|---|
| Not sure where to start | `/hyperframes` | "/hyperframes I need a 15 second intro for my YouTube channel" |
| Short motion graphic (logo sting, kinetic text, count-up, lower third) | `/motion-graphics` | "/motion-graphics logo sting for Inverto Digital, 5 seconds, dark background" |
| Product or website promo video | `/product-launch-video` | "/product-launch-video make a 30s promo from https://example.com" |
| Explainer video from a topic or script (no footage) | `/faceless-explainer` | "/faceless-explainer 60s video on why websites need SEO" |
| Add captions or subtitles to a talking video | `/embedded-captions` | "/embedded-captions add bold captions to studio/media/interview.mp4" |
| Add titles, lower thirds, callouts to a talking video | `/talking-head-recut` | "/talking-head-recut add a lower third with my name and 3 stat callouts" |
| Video cut to the beat of music | `/music-to-video` | "/music-to-video beat-synced slideshow of these 10 photos with track.mp3" |
| Slide deck or pitch presentation | `/slideshow` | "/slideshow 8 slide pitch deck for my agency" |
| Turn a GitHub PR into a video | `/pr-to-video` | "/pr-to-video this PR" |
| Anything else (sizzle reel, montage, title card) | `/general-video` | "/general-video 20s brand reel with these clips" |
| Build a video in React | `/remotion-create` | "/remotion-create Instagram story template with my logo and a headline prop" |
| Render or export a Remotion video | `/remotion-render` | "/remotion-render HamburgerIntro as a 1080x1920 MP4" |
| Captions in a Remotion video | `/remotion-captions` | "/remotion-captions transcribe and caption studio/media/clip.mp4" |
| Animated map | `/remotion-maps` | "/remotion-maps flight path from London to Dubai" |
| Math, diagram or 3Blue1Brown style animation | `/manim-video` | "/manim-video animate a sales funnel shrinking from 1000 to 50" |
| Trim, cut, join clips | `/video-edit` | "/video-edit trim studio/media/raw.mp4 from 0:12 to 0:45" |
| Resize for Reels, TikTok, Shorts (9:16) or square | `/video-edit` | "/video-edit make a 9:16 version and a 1:1 version" |
| Add music, logo or watermark | `/video-edit` | "/video-edit add logo.png top right and music.mp3 underneath" |
| Compress, convert, or make a GIF | `/video-edit` | "/video-edit compress to under 10MB" or "make a GIF" |
| Animate something on a website | `/gsap-core`, `/gsap-timeline` | "/gsap-timeline rebuild the hamburger animation with GSAP" |
| Scroll animations, parallax, pinned sections | `/gsap-scrolltrigger` | "/gsap-scrolltrigger fade sections in as I scroll" |
| Smoother, faster animation | `/gsap-performance` | "/gsap-performance why is my animation janky?" |

### Helpful words to include in any prompt

- **Format:** `9:16`, `vertical`, `Reels`, `TikTok`, `Shorts`, `1:1`, `square`, `16:9`, `4K`
- **Length:** `5 seconds`, `30s`, `60 to 90 seconds`
- **Style:** `minimal`, `bold`, `kinetic type`, `dark background`, `brand colors #hex`
- **Output:** `MP4`, `GIF`, `WebM`, `transparent background`, `render it`, `preview it`
- **Inputs:** put files in `studio/media/` and name them in the prompt

## Examples already in this repo

All three animate the hamburger button into an X and back:

| Tool | Source | Render command (run inside `studio/`) |
|---|---|---|
| Remotion | `remotion/HamburgerIntro.jsx` | `npx remotion render remotion/index.jsx HamburgerIntro out/hamburger-remotion.mp4` |
| HyperFrames | `hyperframes/index.html` | `cd hyperframes && npx hyperframes render -o ../out/hamburger-hyperframes.mp4` |
| Manim | `manim/hamburger.py` | `cd manim && ../.venv/bin/manim -qh --media_dir ../out/manim hamburger.py HamburgerToX` |

Rendered files go to `studio/out/` (not committed).

## Setup

Cloud sessions run `studio/setup.sh` automatically on start (via
`.claude/hooks/session-start.sh`). On your own computer, run it once:

```bash
./studio/setup.sh
```

## Not installed (desktop apps)

Kdenlive, Shotcut, LosslessCut, Blender, Natron and Graphite are desktop apps
with a visual interface, so they cannot run inside a Claude Code session.
Download them directly if you want to edit by hand:

- Kdenlive: https://kdenlive.org
- Shotcut: https://shotcut.org
- LosslessCut: https://github.com/mifi/lossless-cut/releases
- Blender: https://www.blender.org/download
