#!/usr/bin/env bash
# Installs the video and motion graphics toolkit used in studio/.
# Safe to re-run; each step skips work that is already done.
set -euo pipefail
cd "$(dirname "$0")"

# Manim needs the Pango/Cairo headers to build.
if ! pkg-config --exists pangocairo 2>/dev/null; then
  if command -v apt-get >/dev/null; then
    DEBIAN_FRONTEND=noninteractive apt-get install -y -qq libpango1.0-dev pkg-config >/dev/null
  else
    echo "Install Pango and Cairo dev headers (e.g. brew install pango) before Manim." >&2
  fi
fi

# Remotion, HyperFrames, GSAP, Lottie.
if [ ! -d node_modules ]; then
  npm ci --no-audit --no-fund
fi

# Manim and MoviePy live in a venv so the system Python stays untouched.
if [ ! -x .venv/bin/manim ]; then
  python3 -m venv .venv
  .venv/bin/pip install -q --upgrade pip setuptools wheel
  .venv/bin/pip install -q -r requirements.txt
fi

# Headless Chrome for HyperFrames renders.
npx hyperframes browser ensure >/dev/null 2>&1 || echo "HyperFrames could not fetch Chrome; run: npx hyperframes browser ensure" >&2

echo "Studio ready: Remotion, HyperFrames, GSAP, Lottie, Manim, MoviePy, FFmpeg."
