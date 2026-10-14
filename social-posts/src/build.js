// Renders every post to PNG in each platform format.
// Usage: node build.js [postNumbers...]   e.g. node build.js 1 2 3
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const posts = require('./posts');
const V = require('./visuals');
const { ic } = require('./icons');

const FORMATS = [
  { key: 'portrait', dir: '1080x1350_instagram-facebook-linkedin-feed', w: 1080, h: 1350 },
  { key: 'square', dir: '1080x1080_square-facebook-linkedin-x', w: 1080, h: 1080 },
  { key: 'story', dir: '1080x1920_stories-reels-cover', w: 1080, h: 1920 },
];
const OUT = path.join(__dirname, '..', 'output');
const pad = (n) => String(n).padStart(2, '0');

// Checkerboard feed: odd posts dark purple, even posts alternate white and lavender.
const themeFor = (n) => (n % 2 ? 'dark' : (n / 2) % 2 ? 'white' : 'lav');

function page(p, fmt) {
  const theme = themeFor(p.n);
  const v = V[p.n]();
  const hook = p.hook.replace(/\*(.+?)\*/g, '<em>$1</em>');
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="styles.css"></head><body>
  <div class="post ${fmt.key} theme-${theme} align-${p.align || 'left'}" style="height:${fmt.h}px">
    <div class="bg-grid"></div><div class="glow g1"></div><div class="glow g2"></div><div class="bg-num">${pad(p.n)}</div>
    <header class="top"><div class="logo"><div class="logo-mark"></div><div class="logo-word"><b>inverto</b> <span>digital</span></div></div><span class="tag">${p.cat} <i>/ ${pad(p.n)}</i></span></header>
    <section class="copy"><h1 class="hook ${p.size || ''}">${hook}</h1><div class="rule"></div><p class="body">${p.body}</p></section>
    <div class="visual-wrap"><div class="visual" style="width:${v.w}px;height:${v.h}px">${v.html}</div></div>
    <footer class="foot"><div class="cta">${p.cta}<span class="arrow">${ic('arrow')}</span></div><div class="handle">@invertodigital<small>Save &amp; share</small></div></footer>
  </div>
  <script>
    window.__fit = () => {
      const wrap = document.querySelector('.visual-wrap'), vis = document.querySelector('.visual');
      const s = Math.min(wrap.clientWidth * 0.96 / ${v.w}, wrap.clientHeight * 0.96 / ${v.h}, ${fmt.key === 'story' ? 1.12 : 1});
      vis.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
      return s;
    };
  </script></body></html>`;
}

(async () => {
  const only = process.argv.slice(2).map(Number);
  const list = only.length ? posts.filter((p) => only.includes(p.n)) : posts;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  const report = [];
  for (const fmt of FORMATS) {
    fs.mkdirSync(path.join(OUT, fmt.dir), { recursive: true });
    await pg.setViewportSize({ width: fmt.w, height: fmt.h });
    for (const p of list) {
      const tmp = path.join(__dirname, `.tmp-${p.n}-${fmt.key}.html`);
      fs.writeFileSync(tmp, page(p, fmt));
      await pg.goto('file://' + tmp);
      const scale = await pg.evaluate(async () => { await document.fonts.ready; return window.__fit(); });
      const file = path.join(OUT, fmt.dir, `post-${pad(p.n)}-${p.slug}.png`);
      await pg.locator('.post').screenshot({ path: file });
      fs.unlinkSync(tmp);
      report.push(`${fmt.key} ${pad(p.n)} scale=${scale.toFixed(2)}`);
    }
  }
  await browser.close();
  console.log(report.join('\n'));
})();
