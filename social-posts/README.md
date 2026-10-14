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

## Image assets and credits

- `src/assets/3d/`: 20 realistic 3D renders from the free **Icons8 3D Kit** (github.com/icons8/3d-kit), recolored from orange to brand gold. **License: the free use requires a link back to Icons8 (https://icons8.com).** Add "3D illustrations by Icons8 (icons8.com)" to your website credits or an occasional caption, or buy an Icons8 plan to skip the link.
- `src/assets/photos/`: 7 photos from **Unsplash** (Unsplash License: free for commercial use, no attribution required). Photographers: Guilain Demoutiers (man-laptop), GlassesShop (woman-laptop), May Gauthier (man-glasses), MD Duran (man-cap), Abenezer Shewaga (woman-arms), Mario La Pergola (woman-blonde), Cecep Rahmat (woman-phone). The source files are 400px, so photos are kept at circle and avatar sizes.
- `src/assets/brands/`: platform logos from Simple Icons (CC0). The logos belong to their owners and are used only to name the platforms.
- `src/assets/logo/`: the official Inverto Digital icon, used as a faint watermark at the top center of each post.
- No emoji artwork is used anywhere.

## Layout

- Minimal: one focal visual per post, centered copy, no CTA button, and no handle or footer text. Backgrounds alternate plain Deep Purple and Light Purple in a checkerboard across the profile grid.
- The visual style rotates through photo heroes with feature chips, 3D renders with chips, message-pair cards, keycaps, notification pills and simple UI pieces, so neighbouring posts look different.
- Orange posts use dark headings and descriptions.

Requires Node with Playwright (Chromium). Fonts are bundled in `src/fonts` (SIL Open Font License).
