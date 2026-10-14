# Inverto Digital Social Posts (30)

Brand: Deep Purple #412B67, Gold #FFB317, Border #4C3770, White #FFFFFF, Lavender #F6F6FF.
Type: Sora (headings), Inter (body). Cards use a 15px radius and purple-tinted shadows.

## Output sizes

| Folder | Size | Use on |
| --- | --- | --- |
| `output/1080x1350_instagram-facebook-linkedin-feed` | 1080 x 1350 (4:5) | Instagram feed, Facebook feed, LinkedIn feed (recommended main format) |
| `output/1080x1080_square-facebook-linkedin-x` | 1080 x 1080 (1:1) | Facebook, LinkedIn, X, Threads, Google Business Profile |
| `output/1080x1920_stories-reels-cover` | 1080 x 1920 (9:16) | Instagram and Facebook Stories, Reels covers, TikTok. Top 210px and bottom 300px kept clear for app UI |

`output/instagram-grid-preview.png` shows the profile grid (newest first, 3:4 crop as Instagram displays it).

## Layout grid

- 1080px canvas, 80px outer margins, 12 columns with 24px gutters.
- Fixed zones: header (logo + category tag), hook, gold rule, body, hero visual, footer (CTA pill + handle).
- Feed rhythm: odd posts are Deep Purple, even posts alternate White and Lavender. Posted in order 1 to 30, the 3 column profile grid forms a checkerboard.
- Highlight words: gold text on purple; gold marker under purple text on light backgrounds.

## Editing and rebuilding

- Copy: `src/posts.js` (wrap the highlight phrase in `*asterisks*`).
- Visuals: `src/visuals.js`. Styles and brand tokens: `src/styles.css`.
- The logo is a placeholder wordmark (`.logo` in `src/build.js` and `src/styles.css`). Swap in the official Inverto Digital logo file there.
- Handle `@invertodigital` is set in `src/build.js`.

```
cd src
node build.js          # all posts, all sizes
node build.js 4 17     # selected posts
node grid.js           # grid preview
```

## Image assets

- `src/assets/3d/`: 72 transparent 3D PNG objects from Microsoft Fluent Emoji 3D (MIT license, via the `@lobehub/fluent-emoji-3d` package). Source size is 256px, so they are kept at about 250px or smaller on the canvas to stay sharp.
- `src/assets/brands/`: platform logos (Instagram, Facebook, WordPress, Shopify, Google, n8n, Gmail, Sheets and others) from Simple Icons (CC0), shown as glossy app tiles. Logos stay the property of their owners and are used only to name the platforms.
- Shadows: every 3D object gets two drop shadows plus a blurred contact shadow underneath. On purple posts the shadows are tinted dark purple, never black.
- In `src/visuals.js`: `obj(name, size, style)` places a 3D object, `tile(name, size)` puts one inside a UI tile, and `brand(name, size)` adds a logo tile.

Requires Node with Playwright (Chromium). Fonts are bundled in `src/fonts` (SIL Open Font License).
