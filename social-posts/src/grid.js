// Builds an Instagram profile grid preview (newest first, 3 columns) from the 4:5 feed exports.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const posts = require('./posts');
const dir = process.env.SRC_DIR || path.join(__dirname, '..', 'output', '1080x1350_instagram-facebook-linkedin-feed');
const DSF = Number(process.env.DSF || 1);
const OUTFILE = process.env.OUT_FILE || path.join(__dirname, '..', 'output', 'instagram-grid-preview.png');
const pad = (n) => String(n).padStart(2, '0');
const tiles = [...posts].reverse().map((p) => `<img src="file://${path.join(dir, `post-${pad(p.n)}-${p.slug}.png`)}">`).join('');
const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="styles.css"><style>
body{background:#fff;margin:0;font-family:Inter} .wrap{width:1080px;padding:48px 0 0}
.prof{display:flex;gap:56px;align-items:center;padding:0 56px 36px}
.pic{width:170px;height:170px;border-radius:50%;padding:6px;background:linear-gradient(140deg,#FFB317,#412B67)}
.pic div{width:100%;height:100%;border-radius:50%;background:#412B67;display:grid;place-items:center;border:5px solid #fff}
.pic .logo-mark{width:80px;height:80px;border-radius:22px;background:linear-gradient(145deg,#fff,#ECEAFF);border:0}
.pic .logo-mark::before{left:20px;top:20px;width:40px;height:40px;border-width:9px}
h2{font-family:Sora;font-size:34px;margin:0 0 14px} .st{display:flex;gap:40px;font-size:22px;margin-bottom:14px} .st b{font-family:Sora}
p{font-size:20px;line-height:1.45;margin:0;color:#222} .g{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;border-top:1px solid #ddd;padding-top:4px}
.g img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block}</style></head><body><div class="wrap">
<div class="prof"><div class="pic"><div><img src="file://${path.join(__dirname, "assets/logo/icon-light.png")}" style="width:96px;height:96px;object-fit:contain"></div></div><div><h2>invertodigital</h2>
<div class="st"><span><b>30</b> posts</span><span><b>GHL</b> &amp; CRM</span><span><b>Growth</b> systems</span></div>
<p><b>Inverto Digital</b><br>GoHighLevel, automation, social, web and white-label fulfillment.<br>Book a discovery call below.</p></div></div>
<div class="g">${tiles}</div></div></body></html>`;
(async () => {
  const tmp = path.join(__dirname, '.tmp-grid.html');
  fs.writeFileSync(tmp, html);
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1080, height: 800 }, deviceScaleFactor: DSF });
  await pg.goto('file://' + tmp);
  await pg.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode())); });
  await pg.screenshot({ path: OUTFILE, fullPage: true, ...(OUTFILE.endsWith('.jpg') ? { type: 'jpeg', quality: 92 } : {}) });
  await b.close();
  fs.unlinkSync(tmp);
})();
