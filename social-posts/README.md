# Inverto Digital Social Posts (30)

Brand: Deep Purple #412B67, Gold #FFB317, Border #4C3770, White #FFFFFF, Lavender #F6F6FF.
Type: Sora (headings), Inter (body). Cards use a 15px radius and purple-tinted shadows.

## Output sizes

| Folder | Size | Use on |
| --- | --- | --- |
| `output/1080x1350_instagram-facebook-linkedin-feed` | 1080 x 1350 (4:5) | Instagram feed, Facebook feed, LinkedIn feed (recommended main format) |
| `output/1080x1080_square-facebook-linkedin-x` | 1080 x 1080 (1:1) | Facebook, LinkedIn, X, Threads, Google Business Profile |
| `output/1080x1920_stories-reels-cover` | 1080 x 1920 (9:16) | Instagram and Facebook Stories, Reels covers, TikTok. Top 210px and bottom 300px kept clear for app UI |

`output/instagram-grid-preview.png` shows the profile grid (newest first, 3:4 crop as Instagram displays it). `output/instagram-grid-preview-4k.png` and `.jpg` are the same view at 3840px wide (4K). To rebuild the 4K version, see the commands below.

## Layout

- 1080px canvas, 80px side margins. All copy is centered.
- Stack, top to bottom: logo icon, hook (Title Case, no rule underneath), body, 3D CTA button, hero visual, handle. No category label.
- Logo icon: silver (light) version on Deep Purple and Gold posts, purple (dark) version on White and Lavender posts.
- Backgrounds are flat brand colors with no grid or numbering. Profile grid plan, read from the top-left of the finished grid (post 30 is top-left, since Instagram shows newest first). The rows alternate:
  - Purple, Light Purple, Purple
  - Light Purple, Orange, Light Purple

  So the middle post of every second row is orange. Purple is #412B67, Light Purple is #F6F6FF and Orange is #FFB317 (posts 2, 8, 14, 20 and 26). Post the images in number order, 1 to 30.
- On orange posts the heading and description are white, highlighted words are purple, and the logo is the light version.
- Highlighted words in headings change color only, with no background: gold on purple posts and purple on light purple and orange posts.

## Editing and rebuilding

- Copy: `src/posts.js` (wrap the highlight phrase in `*asterisks*`).
- Visuals: `src/visuals.js`. Styles and brand tokens: `src/styles.css`.
- Handle `@invertodigital` is set in `src/build.js`.

```
cd src
node build.js          # all posts, all sizes
node build.js 4 17     # selected posts
node grid.js           # grid preview
OUT_DIR=/tmp/hi DSF=1.2 FORMAT=portrait node build.js && SRC_DIR=/tmp/hi/1080x1350_instagram-facebook-linkedin-feed DSF=3.5556 OUT_FILE=../output/instagram-grid-preview-4k.png node grid.js   # 4K grid
```

## Image assets

- No emoji artwork. The 3D icons are brand-colored badges (gold, purple or white faces with a bevel, a gloss highlight and a contact shadow) drawn from the stroke icon set in `src/icons.js`. Their colors follow each post's theme.
- `src/assets/brands/`: platform logos from Simple Icons (CC0), shown as app tiles. The logos belong to their owners and are used only to name the platforms.
- Logo: put the official icon files in `src/assets/logo/` (see the README in that folder).
- In `src/visuals.js`: `obj(name, size, style)` places a 3D badge, `tile(name, size)` puts a small one inside a UI mockup, and `brand(name, size)` adds a logo tile.

Requires Node with Playwright (Chromium). Fonts are bundled in `src/fonts` (SIL Open Font License).
