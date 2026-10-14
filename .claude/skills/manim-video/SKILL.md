---
name: manim-video
description: Create explainer, math, diagram or educational animations with Manim (Python) and render them to MP4. Use when the user asks for a Manim scene, an explainer animation, a math or diagram animation, or a 3Blue1Brown style video.
---

# Manim video

Manim (Community edition) is installed in `studio/.venv`. Always call it through that venv.

## Where things live
- Scenes: `studio/manim/*.py` (example: `studio/manim/hamburger.py`, class `HamburgerToX`)
- Output: `studio/out/`

## Render
```bash
cd studio/manim
../.venv/bin/manim -ql --media_dir ../out/manim <file>.py <SceneClass>   # fast 480p draft
../.venv/bin/manim -qh --media_dir ../out/manim <file>.py <SceneClass>   # 1080p final
```
Add `--format gif` for a GIF, `-t` for a transparent background, and
`-r 1080,1920` for vertical 9:16. The MP4 lands in
`studio/out/manim/videos/<file>/<quality>/<SceneClass>.mp4`; copy it to
`studio/out/` with a clear name.

## Rules
- One `Scene` subclass per animation; build with `self.play(...)` and `self.wait(...)`.
- Prefer `Text` over `Tex`/`MathTex`: LaTeX is not installed here. Install `texlive` first if real equations are needed.
- Render a `-ql` draft first, check a frame with `ffmpeg -ss <t> -i file.mp4 -frames:v 1 frame.png`, then render final.
