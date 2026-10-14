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
// Gold accent posts on every sixth slot (4, 10, 16, 22, 28) for highlighted topics.
const themeFor = (n) => (n % 2 ? 'dark' : n % 6 === 4 ? 'gold' : (n / 2) % 2 ? 'white' : 'lav');

// Logo icon. Drop the official files into assets/logo/ as icon-light.(svg|png) for
// dark backgrounds and icon-dark.(svg|png) for light backgrounds; a placeholder
// mark is used until they exist.
const findLogo = (v) => ['svg', 'png', 'webp'].map((e) => `assets/logo/icon-${v}.${e}`).find((f) => fs.existsSync(path.join(__dirname, f)));
const logoIcon = (theme) => {
  const f = findLogo(theme === 'dark' || theme === 'gold' ? 'light' : 'dark');
  return f ? `<img class="logo-icon" src="${f}" alt="Inverto Digital">` : '<div class="logo-mark"></div>';
};

const tc = (t) => t.replace(/(^|[\s*-])([a-z])/g, (m, a, b) => a + b.toUpperCase());

function page(p, fmt) {
  const theme = themeFor(p.n);
  V.setTheme(theme);
  const v = V[p.n]();
  // Title Case: first letter of every word capitalized, rest left as written (keeps CRM, GHL, AI, DMs).
  const hook = tc(p.hook).replace(/\*(.+?)\*/g, '<em>$1</em>');
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="styles.css"></head><body>
  <div class="post ${fmt.key} theme-${theme} align-center" style="height:${fmt.h}px">
    <header class="top">${logoIcon(theme)}</header>
    <section class="copy"><h1 class="hook ${p.size || ''}">${hook}</h1><p class="body">${p.body}</p><div class="cta-row"><div class="cta">${tc(p.cta)}<span class="arrow">${ic('arrow')}</span></div></div></section>
    <div class="visual-wrap"><div class="visual" style="width:${v.w}px;height:${v.h}px">${v.html}</div></div>
    <footer class="foot"><div class="handle">@invertodigital<small>Save &amp; share</small></div></footer>
  </div>
  <script>
    window.__fit = () => {
      const wrap = document.querySelector('.visual-wrap'), vis = document.querySelector('.visual');
      vis.style.transform = 'none';
      const o = vis.getBoundingClientRect();
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      const els = new Set([...vis.children, ...vis.querySelectorAll('.obj, .float')]);
      els.forEach((el) => {
        if (el.matches('.shadow-floor, .floor')) return;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        x0 = Math.min(x0, r.left - o.left); y0 = Math.min(y0, r.top - o.top);
        x1 = Math.max(x1, r.right - o.left); y1 = Math.max(y1, r.bottom - o.top);
      });
      const W = wrap.clientWidth, H = wrap.clientHeight, bw = x1 - x0, bh = y1 - y0;
      const s = Math.min(W * 0.95 / bw, H * 0.94 / bh, ${fmt.key === 'story' ? 1.3 : 1.22});
      const tx = W / 2 - s * (x0 + bw / 2), ty = H / 2 - s * (y0 + bh / 2);
      vis.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')';
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
