---
name: video-edit
description: Edit existing video and audio files with FFmpeg and MoviePy. Use for trimming, cutting, joining, resizing for social formats (9:16, 1:1, 16:9), speed changes, adding music or a logo, burning in subtitles, extracting audio, compressing, or converting to GIF.
---

# Video editing (FFmpeg + MoviePy)

FFmpeg is on the PATH. MoviePy 2.x is in `studio/.venv`. Put source footage in
`studio/media/` and write results to `studio/out/`. Never overwrite the source file.

## Pick the tool
- Single operation on one file (trim, convert, compress, scale, GIF): FFmpeg.
- Multi-clip edits, overlays, text, timing logic: a MoviePy script run with `studio/.venv/bin/python`.

## FFmpeg recipes
```bash
ffmpeg -ss 00:00:05 -to 00:00:20 -i in.mp4 -c copy out.mp4                          # lossless trim
ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:a copy out.mp4             # 9:16 vertical
ffmpeg -i in.mp4 -vf "scale=1080:1080:force_original_aspect_ratio=decrease,pad=1080:1080:(ow-iw)/2:(oh-ih)/2" out.mp4  # 1:1 padded
ffmpeg -i in.mp4 -vcodec libx264 -crf 28 -preset slow out.mp4                        # compress
ffmpeg -i in.mp4 -filter:v "setpts=0.5*PTS" -filter:a "atempo=2.0" out.mp4          # 2x speed
ffmpeg -i in.mp4 -i music.mp3 -map 0:v -map 1:a -shortest -c:v copy out.mp4         # replace audio
ffmpeg -i in.mp4 -i logo.png -filter_complex "overlay=W-w-40:40" out.mp4             # logo top right
ffmpeg -i in.mp4 -vf subtitles=subs.srt out.mp4                                      # burn subtitles
ffmpeg -i in.mp4 -vn -c:a libmp3lame -q:a 2 out.mp3                                  # extract audio
ffmpeg -i in.mp4 -vf "fps=12,scale=480:-1" out.gif                                   # GIF
ffmpeg -f concat -safe 0 -i list.txt -c copy out.mp4                                 # join same-format clips
```

## MoviePy (v2 API: `resized`, `with_*`, `subclipped`)
```python
from moviepy import VideoFileClip, TextClip, CompositeVideoClip, concatenate_videoclips
clip = VideoFileClip("studio/media/in.mp4").subclipped(2, 8).resized(height=1080)
```

## Always
- Check the result with `ffprobe -v error -show_entries format=duration -of csv=p=0 out.mp4`
  and grab a frame to look at before reporting done.
