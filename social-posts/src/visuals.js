// Minimal hero visuals: one focal object per post.
// Hero visuals for each post. Each returns { w, h, html } at its natural size;
// the page script scales it to fit the available area for every format.
const { ic, cursor, raw } = require('./icons');

const floor = '<div class="shadow-floor"></div>';
const av = (n, txt, size = 56) => `<div class="avatar av${n}" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.38)}px">${txt}</div>`;
const statusBar = (dark) => `<div class="status" style="color:${dark ? '#fff' : '#111'}"><span>9:41</span><span style="display:flex;gap:6px;align-items:center"><svg width="22" height="14" viewBox="0 0 22 14"><rect x="0" y="9" width="4" height="5" rx="1" fill="currentColor"/><rect x="6" y="6" width="4" height="8" rx="1" fill="currentColor"/><rect x="12" y="3" width="4" height="11" rx="1" fill="currentColor"/><rect x="18" y="0" width="4" height="14" rx="1" fill="currentColor"/></svg><svg width="30" height="14" viewBox="0 0 30 14"><rect x=".5" y=".5" width="25" height="13" rx="4" fill="none" stroke="currentColor" opacity=".5"/><rect x="3" y="3" width="19" height="8" rx="2" fill="currentColor"/><rect x="27" y="4.5" width="2" height="5" rx="1" fill="currentColor" opacity=".5"/></svg></span></div>`;
const phone = (inner, { dark = false, style = '' } = {}) => `<div class="phone" style="${style}"><div class="screen" style="background:${dark ? '#140C22' : '#fff'}"><div class="island"></div>${statusBar(dark)}${inner}<div class="gloss"></div></div></div>`;
const browser = (url, inner, style = '') => `<div class="browser" style="${style}"><div class="bar"><span class="dot" style="background:#FF5F57"></span><span class="dot" style="background:#FEBC2E"></span><span class="dot" style="background:#28C840"></span><div class="url">${ic('shield')} ${url}</div></div>${inner}</div>`;
const notif = (icon, title, sub, style) => `<div class="float notif" style="${style}">${icon.startsWith('3d:') ? tile(icon.slice(3), 58) : `<div class="ico">${ic(icon)}</div>`}<div><b>${title}</b><span>${sub}</span></div></div>`;
const key = (cls, label, w, h, fs, style = '') => `<div class="key ${cls}" style="width:${w}px;height:${h}px;${style}"><div class="face" style="font-size:${fs}px">${label}</div></div>`;


// Brand-colored 3D badge icons. Variant follows the post theme and alternates.
const MAP = {"broom": "wand", "dividers": "layers", "bolt": "zap", "gear": "gear", "phone": "phone", "mouse": "target", "laptop": "layout", "ice": "zap", "stopwatch": "clock", "speech": "msg", "robot": "spark", "moon": "moon", "sparkles": "spark", "label": "tag", "handshake": "users", "bell": "bell", "alarm": "clock", "puzzle": "grid", "calendar": "cal", "barchart": "chart", "memo": "form", "email": "mail", "trend": "up", "check": "check", "link": "link", "tools": "gear", "globe": "globe", "tearcal": "cal", "trophy": "trophy", "gem": "gem", "trash": "trash", "hourglass": "hourglass", "hook": "hook", "heart": "heartFill", "wave": "msg", "spiralcal": "cal", "recycle": "recycle", "bulb": "bulb", "clapper": "video", "picture": "image", "mobile": "mobile", "writing": "type", "idcard": "user", "inbox": "inbox", "envelope": "send", "question": "question", "ballot": "chart", "raisehand": "users", "search": "search", "film": "video", "headphones": "headphones", "palette": "palette", "brush": "brush", "ruler": "layout", "rocket": "rocket", "bags": "bag", "cart": "cart", "card": "dollar", "searchr": "search", "target": "target", "moneybag": "dollar", "dollar": "dollar", "plug": "link", "cabinet": "db", "technologist": "user", "briefcase": "briefcase", "package": "package"};
const ICO = (n) => `<svg viewBox="0 0 24 24">${raw(MAP[n] || n)}</svg>`;
const VARIANTS = { dark: ['gold', 'white'], white: ['purple', 'gold'], lav: ['purple', 'gold'], gold: ['purple', 'white'] };
let THEME = 'dark', SEQ = 0;
const obj = (name, size, style = '', cls = '') => {
  const v = VARIANTS[THEME][SEQ++ % 2];
  const w = Math.round(size * 0.92);
  return `<div class="obj ${cls}" style="width:${w}px;${style}"><div class="badge v-${v}"><div class="face">${ICO(name)}</div><div class="floor"></div></div></div>`;
};
// Small 3D tile with a stroke icon, used inside UI mockups.
const tile = (name, size = 56, cls = '') => `<div class="tile3d ${cls}" style="width:${size}px;height:${size}px;border-radius:${Math.round(size * 0.28)}px">${ICO(name)}</div>`;
// Glossy app-style tile with an official platform logo (Simple Icons, CC0).
const fs = require('fs');
const path = require('path');
const BR = { instagram: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', facebook: 'linear-gradient(180deg,#1877F2,#0A5BD3)', wordpress: 'linear-gradient(180deg,#2A8BB8,#1B6187)', shopify: 'linear-gradient(180deg,#A6CC5A,#7BA33A)', n8n: 'linear-gradient(180deg,#F25D84,#D93A63)', google: 'linear-gradient(180deg,#FFFFFF,#EEF1F6)', youtube: 'linear-gradient(180deg,#FF2B2B,#D90000)', tiktok: 'linear-gradient(180deg,#2A2A2A,#000)', x: 'linear-gradient(180deg,#2A2A2A,#000)', threads: 'linear-gradient(180deg,#2A2A2A,#000)', pinterest: 'linear-gradient(180deg,#F0233A,#C4001C)', whatsapp: 'linear-gradient(180deg,#3BE07C,#1EB457)', gmail: 'linear-gradient(180deg,#FFFFFF,#EEF1F6)', googlecalendar: 'linear-gradient(180deg,#FFFFFF,#EEF1F6)', googlesheets: 'linear-gradient(180deg,#2DB06A,#0F8F4B)' };
const BRFILL = { google: '#4285F4', gmail: '#EA4335', googlecalendar: '#4285F4' };
const brand = (name, size = 64, style = '') => {
  const svg = fs.readFileSync(path.join(__dirname, 'assets', 'brands', `${name}.svg`), 'utf8').replace('<svg', `<svg style="fill:${BRFILL[name] || '#fff'}"`);
  return `<div class="brand" style="width:${size}px;height:${size}px;background:${BR[name]};${style}">${svg}</div>`;
};


const V = {};
const LOGO = path.join(__dirname, 'assets', 'logo', 'icon-dark.png');

// ---------- Minimal building blocks ----------
// Two stacked message cards (client ask, Inverto Digital answer), second card tilted with a gold edge.
const pair = (who1, msg1, who2, msg2, ic1 = 'user') => ({ w: 820, h: 470, html: `
  <div class="mcard" style="position:absolute;left:0;top:0;width:780px">
    <div class="m-av">${ic(ic1)}</div><div><div class="m-who">${who1}</div><div class="m-msg">${msg1}</div></div></div>
  <div class="mcard hi" style="position:absolute;left:30px;top:220px;width:790px;transform:rotate(3deg)">
    <div class="m-av"><img src="assets/logo/icon-dark.png"></div><div><div class="m-who">${who2}</div><div class="m-msg">${msg2}</div></div></div>` });

// Big single 3D keycap, label top-left like a real key.
const bigkey = (label, sub = '') => ({ w: 420, h: 440, html: `
  <div class="key gold" style="position:absolute;left:20px;top:0;width:380px;height:390px;border-radius:56px;padding:22px 22px 44px">
    <div class="face" style="border-radius:40px;place-items:start;padding:40px 44px;font-size:76px;font-weight:600">${label}</div></div>
  ${sub ? `<div class="m-cap" style="position:absolute;left:0;right:0;top:410px">${sub}</div>` : ''}` });

// Row of keycaps with captions.
const keys = (items) => ({ w: items.length * 260, h: 330, html: items.map(([k, cap, gold], i) => `
  <div class="key ${gold ? 'gold' : ''}" style="position:absolute;left:${i * 260 + 15}px;top:0;width:230px;height:240px;border-radius:40px;padding:16px 16px 32px">
    <div class="face" style="border-radius:28px;font-size:${k.length > 2 ? 54 : 96}px">${k}</div></div>
  <div class="m-cap" style="position:absolute;left:${i * 260}px;width:260px;top:270px">${cap}</div>`).join('') });

// Stacked notification pills.
const notifs = (items) => ({ w: 760, h: items.length * 150, html: items.map(([icon, t, s], i) => `
  <div class="mnotif ${i === items.length - 1 ? 'hi' : ''}" style="position:absolute;left:${i % 2 ? 40 : 0}px;top:${i * 150}px;width:720px;transform:rotate(${i % 2 ? 2 : -1.5}deg)">
    ${tile(icon, 84, i === items.length - 1 ? 'gold' : '')}<div><div class="m-who">${t}</div><div class="m-msg">${s}</div></div></div>`).join('') });

// Feature chips like "icon | label".
const chipEl = (icon, label) => `<div class="mchip">${tile(icon, 60)}<span class="sep"></span><span>${label}</span></div>`;
const chipRow = (items, top, w) => `<div style="position:absolute;left:0;top:${top}px;width:${w}px;display:flex;flex-wrap:wrap;justify-content:center;gap:22px">${items.map(([i, l]) => chipEl(i, l)).join('')}</div>`;

// One big 3D badge with a chip row underneath.
const hero = (icon, chips = []) => ({ w: 900, h: chips.length ? 520 : 340, html: `
  ${obj(icon, 330, 'left:300px;top:0')}
  ${chips.length ? chipRow(chips, 400, 900) : ''}` });

// Horizontal steps joined by arrows.
const steps = (items) => {
  const w = items.length * 250 - 30;
  return { w, h: 300, html: items.map(([icon, label], i) => `
    ${obj(icon, 200, `left:${i * 250 + 10}px;top:0`)}
    <div class="m-cap" style="position:absolute;left:${i * 250 - 20}px;width:250px;top:225px">${label}</div>
    ${i < items.length - 1 ? `<div class="m-arrow" style="position:absolute;left:${i * 250 + 200}px;top:62px">${ic('arrow')}</div>` : ''}`).join('') };
};


// ---------- Real assets: Icons8 3D renders and Unsplash photos ----------
const r3d = (name, size, style = '', cls = '') => `<div class="r3d ${cls}" style="width:${size}px;${style}"><img src="assets/3d/${name}.png"><div class="floor"></div></div>`;
const photo = (name, size, cls = '') => `<div class="mphoto ${cls}" style="width:${size}px;height:${size}px"><img src="assets/photos/${name}.jpg"></div>`;
// Floating chips placed around a hero, alternating left and right.
const SPOTS = [[-30, 40, -4], [500, 110, 3], [-10, 320, 3], [480, 390, -3]];
const around = (items) => items.map(([i, l], k) => `<div style="position:absolute;left:${SPOTS[k][0]}px;top:${SPOTS[k][1]}px;transform:rotate(${SPOTS[k][2]}deg);z-index:6">${chipEl(i, l)}</div>`).join('');
// Big 3D render in the middle with chips around it.
const render = (name, chips = []) => ({ w: 760, h: 480, html: `${r3d(name, 380, 'position:absolute;left:190px;top:30px', 'anchor')}${around(chips)}` });
// Circular photo hero with rings and chips around it.
const photoHero = (name, chips = []) => ({ w: 760, h: 500, html: `
  <div class="ring r1 anchor" style="left:130px;top:0"></div><div class="ring r2" style="left:180px;top:50px"></div>
  <div style="position:absolute;left:215px;top:85px">${photo(name, 330, 'big')}</div>${around(chips)}` });
// Message pair with a photo avatar on the first card.
const pairP = (img, who1, msg1, who2, msg2) => ({ w: 820, h: 470, html: `
  <div class="mcard" style="position:absolute;left:0;top:0;width:780px">${photo(img, 124)}<div><div class="m-who">${who1}</div><div class="m-msg">${msg1}</div></div></div>
  <div class="mcard hi" style="position:absolute;left:30px;top:220px;width:790px;transform:rotate(3deg)">
    <div class="m-av"><img src="assets/logo/icon-dark.png"></div><div><div class="m-who">${who2}</div><div class="m-msg">${msg2}</div></div></div>` });

// ---------- Posts (mixed formats so the feed does not repeat) ----------
V[1] = () => render('folder', [['merge', 'Duplicates Merged'], ['tag', 'Tags Cleaned'], ['layers', 'Pipelines Rebuilt']]);
V[2] = () => ({ w: 900, h: 470, html: `${r3d('bell', 220, 'position:absolute;left:0;top:0;transform:rotate(-12deg);z-index:7')}
  <div style="position:absolute;left:150px;top:90px;width:760px;height:300px">${notifs([['phone', 'Missed Call', 'New lead, 2:41 PM'], ['msg', 'Text Sent Automatically', 'Sorry we missed you! How can we help?']]).html}</div>` });
V[3] = () => render('magnet', [['form', 'One Offer'], ['layout', 'One Page'], ['zap', 'One Button']]);
V[4] = () => ({ w: 760, h: 300, html: `
  <div class="mnotif" style="position:absolute;left:0;top:0;width:720px;transform:rotate(-1.5deg)">${photo('man-cap', 84)}<div><div class="m-who">New Lead: Jordan</div><div class="m-msg">Website form, just now</div></div></div>
  <div class="mnotif hi" style="position:absolute;left:40px;top:150px;width:720px;transform:rotate(2deg)">${tile('zap', 84, 'gold')}<div><div class="m-who">Replied In 4 Seconds</div><div class="m-msg">Instant text and email sent</div></div></div>` });
V[5] = () => pairP('woman-blonde', 'Lead, 2:14 AM', 'Do you offer weekend appointments?', 'AI Assistant', 'Yes! Saturday at 10 AM is open. Want me to book it?');
V[6] = () => pairP('woman-arms', 'Agency Owner', 'Can you onboard my clients under my brand?', 'Inverto Digital', 'Yes. Your logo and name, our GHL specialists.');
V[7] = () => keys([['1', 'New Lead Alerts'], ['2', 'Missed Call Text Back'], ['3', 'Appointment Reminders', true]]);
V[8] = () => bigkey('Tab', 'One platform, not ten tabs');
V[9] = () => render('shield', [['cal', 'Calendar'], ['mail', 'Email'], ['phone', 'Phone'], ['globe', 'Google Profile']]);
V[10] = () => ({ w: 980, h: 520, html: `${r3d('clipboard', 320, 'position:absolute;left:330px;top:20px')}
  <div style="position:absolute;left:0;top:400px;width:980px;display:flex;justify-content:center;align-items:center;gap:14px">${['New', 'Contacted', 'Booked', 'Won'].map((t, i) => `${i ? `<span class="m-arrow">${ic('arrow')}</span>` : ''}<div class="mchip" style="padding:16px 28px">${t}</div>`).join('')}</div>` });
V[11] = () => keys([['Mon', 'Post'], ['Wed', 'Post'], ['Fri', 'Post', true]]);
V[12] = () => render('megaphone', [['msg', 'Clear Message'], ['type', 'Strong First Line'], ['target', 'One Call To Action']]);
V[13] = () => bigkey('3s', 'Lead with the point');
V[14] = () => pairP('woman-phone', 'nina.p', 'Do you work with small clinics too?', 'yourbrand', 'Yes, Nina! Most of our clients are local clinics.');
V[15] = () => render('notebook', [['layers', 'Themes'], ['video', 'Formats'], ['clock', 'Dates']]);
V[16] = () => render('bulb', [['video', 'Reel'], ['layers', 'Carousel'], ['mobile', 'Story'], ['type', 'Caption']]);
V[17] = () => ({ w: 760, h: 430, html: `<div class="mlist" style="position:absolute;left:0;top:0;width:760px;padding:40px">
  <div class="row" style="gap:26px;margin-bottom:26px">${photo('woman-arms', 110)}<div style="text-align:left"><div class="m-who" style="font-size:32px">Bright Smile Dental</div><div class="m-msg">@brightsmile.dental</div></div></div>
  ${[['user', 'Family dentist in Austin, TX'], ['star', 'Same-week cleanings and whitening'], ['link', 'Book your visit below']].map(([i, t]) => `<div class="mrow" style="padding:14px 0">${tile(i, 52)}<span>${t}</span></div>`).join('')}</div>` });
V[18] = () => photoHero('woman-phone', [['inbox', '3 New Messages'], ['send', 'Replied In 14 Min'], ['heart', 'Warm Leads']]);
V[19] = () => render('question', [['layout', 'Websites'], ['users', 'Social'], ['target', 'Ads'], ['zap', 'Automation']]);
V[20] = () => render('chart', [['bookmark', 'Saves'], ['share', 'Shares'], ['clock', 'Watch Time']]);
V[21] = () => photoHero('man-laptop', [['scissors', 'Expert Editing'], ['type', 'Captions'], ['wave', 'Sound Effects'], ['clock', 'Sharp Pacing']]);
V[22] = () => bigkey('5s', 'Message first, colors later');
V[23] = () => {
  const r = 150, c = 2 * Math.PI * r, arc = c * 0.75;
  return { w: 380, h: 360, html: `<div style="position:absolute;left:20px;top:0;width:340px;height:340px">
    <svg width="340" height="340" viewBox="0 0 340 340" style="transform:rotate(135deg)"><circle cx="170" cy="170" r="${r}" fill="none" stroke="var(--track)" stroke-width="28" stroke-dasharray="${arc} ${c}" stroke-linecap="round"/><circle cx="170" cy="170" r="${r}" fill="none" stroke="#FFB317" stroke-width="28" stroke-dasharray="${arc * 0.98} ${c}" stroke-linecap="round"/></svg>
    <div class="m-gauge"><div>98</div><span>Speed Score</span></div></div>${brand('wordpress', 76, 'position:absolute;left:300px;top:-10px;transform:rotate(10deg)')}` };
};
V[24] = () => render('cart', [['layout', 'Clear Product Pages'], ['check', 'Simple Checkout'], ['zap', 'Fast Load Times']]);
V[25] = () => ({ w: 820, h: 300, html: `<div class="m-search" style="position:absolute;left:0;top:0;width:820px">${brand('google', 64)}<span class="sep"></span><span style="flex:1">best family dentist near me</span><span style="font-size:36px;color:#412B67">${ic('mic')}</span></div>
  ${chipRow([['search', 'Search Results'], ['spark', 'AI Answers']], 170, 820)}` });
V[26] = () => render('moneybag', [['form', 'One Offer'], ['users', 'One Audience'], ['target', 'One Action']]);
V[27] = () => steps([['form', 'Form'], ['db', 'CRM'], ['mail', 'Email']]);
V[28] = () => photoHero('man-glasses', [['phone', 'Fast Follow Up'], ['calCheck', 'Call Booked'], ['clock', 'Reminder Sent']]);
V[29] = () => photoHero('woman-laptop', [['users', 'Project Manager'], ['check', 'Daily Updates'], ['clock', 'Time Tracking'], ['dollar', 'From $5 Per Hour']]);
V[30] = () => pairP('man-cap', 'Agency Owner', 'We need to deliver more without hiring.', 'Inverto Digital', 'We deliver marketing, CRM and development under your brand.');

// ======== Unique compositions (override the shared patterns above) ========
const mini = (img, name, dup, x, y, r) => `<div class="mmini" style="left:${x}px;top:${y}px;transform:rotate(${r}deg)">${photo(img, 52)}<span>${name}</span>${dup ? '<em>Duplicate</em>' : ''}</div>`;

V[1] = () => ({ w: 780, h: 560, html: `${r3d('folder', 360, 'position:absolute;left:210px;top:170px', 'anchor')}
  ${mini('man-cap', 'Sarah Lee', 1, 0, 40, -8)}${mini('woman-blonde', 'Sarah  Lee', 1, 420, 0, 6)}${mini('woman-arms', 'Old Tag 2019', 0, 30, 300, 5)}${mini('man-glasses', 'Marcus Reid', 1, 470, 330, -5)}` });

V[3] = () => ({ w: 820, h: 420, html: `${r3d('magnet', 300, 'position:absolute;left:0;top:40px;transform:rotate(-90deg)', 'anchor')}
  <svg style="position:absolute;left:250px;top:0" width="200" height="420" fill="none" stroke="var(--line)" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round"><path d="M10 210 C 100 210 100 70 200 70"/><path d="M10 210 H 200"/><path d="M10 210 C 100 210 100 350 200 350"/></svg>
  <div style="position:absolute;left:440px;top:38px">${chipEl('form', 'One Offer')}</div><div style="position:absolute;left:440px;top:178px">${chipEl('layout', 'One Page')}</div><div style="position:absolute;left:440px;top:318px">${chipEl('zap', 'One Button')}</div>` });

V[4] = () => {
  const r = 170, c = 2 * Math.PI * r;
  return { w: 760, h: 620, html: `<div class="anchor" style="position:absolute;left:180px;top:0;width:400px;height:400px">
    <svg width="400" height="400" viewBox="0 0 400 400" style="transform:rotate(-90deg)"><circle cx="200" cy="200" r="${r}" fill="none" stroke="var(--track)" stroke-width="34"/><circle cx="200" cy="200" r="${r}" fill="none" stroke="#FFB317" stroke-width="34" stroke-linecap="round" stroke-dasharray="${c * 0.07} ${c}"/></svg>
    <div class="m-gauge" style="top:120px"><div style="font-size:150px">4s</div><span>First Reply</span></div></div>
    <div class="mnotif hi" style="position:absolute;left:20px;top:450px;width:720px">${photo('man-cap', 84)}<div><div class="m-who">New Lead: Jordan</div><div class="m-msg">Replied instantly by text and email</div></div></div>` };
};

V[5] = () => ({ w: 760, h: 820, html: `${phone(`<div class="row" style="gap:12px;padding:8px 22px 14px;border-bottom:1px solid #EEE"><div class="m-av" style="width:52px;height:52px;border-radius:14px"><img src="assets/logo/icon-dark.png"></div><div style="text-align:left"><div class="ttl" style="font-size:19px">AI Assistant</div><div class="meta" style="color:#22A06B">Online, day or night</div></div></div>
    <div style="padding:18px;display:flex;flex-direction:column;gap:12px;text-align:left">
      <div class="meta" style="text-align:center">Today 2:14 AM</div>
      <div class="bub in">Do you offer weekend appointments?</div>
      <div class="bub out">Yes! Saturday 10 AM or 2 PM. Is this a new visit?</div>
      <div class="bub in">New. 10 AM please.</div>
      <div class="bub out gold">Booked: Saturday, 10:00 AM.</div></div>`, { style: 'position:absolute;left:170px;top:0;transform:scale(.95);transform-origin:top center' })}
  <div style="position:absolute;left:0;top:120px;transform:rotate(-5deg);z-index:6">${chipEl('moon', '2:14 AM')}</div>
  <div style="position:absolute;left:540px;top:560px;transform:rotate(4deg);z-index:6">${chipEl('check', 'Lead Qualified')}</div>` });

V[6] = () => ({ w: 760, h: 520, html: `<svg style="position:absolute;left:180px;top:0" width="400" height="140" fill="none" stroke="var(--line)" stroke-width="3" stroke-dasharray="3 7"><path d="M20 130 L200 14 L380 130"/></svg><div style="position:absolute;left:370px;top:2px;width:22px;height:22px;border-radius:50%;background:#FFB317;box-shadow:0 4px 8px rgba(0,0,0,.3)"></div>
  <div class="m-tag anchor" style="left:120px;top:120px">YOUR BRAND</div>
  <div style="position:absolute;left:170px;top:400px;z-index:6">${chipEl('users', 'Built By GHL Specialists')}</div>` });

V[9] = () => ({ w: 820, h: 520, html: `<div class="mlist anchor" style="position:absolute;left:0;top:30px;width:620px">
  ${[['cal', 'Calendar Connected'], ['mail', 'Email Verified'], ['phone', 'Phone Number Active'], ['globe', 'Google Business Profile'], ['link', 'Website Connected']].map(([i, t]) => `<div class="mrow">${tile(i, 52)}<span>${t}</span><div class="chk">${ic('check')}</div></div>`).join('')}</div>
  ${r3d('shield', 260, 'position:absolute;left:540px;top:0;transform:rotate(10deg)')}` });

V[10] = () => {
  const col = (t, cards, hi) => `<div class="mcol ${hi ? 'hi' : ''}"><div class="mcol-h">${t}</div>${cards.map(([img, n]) => `<div class="mcol-c">${photo(img, 40)}<span>${n}</span></div>`).join('')}</div>`;
  return { w: 920, h: 400, html: `<div style="position:absolute;left:0;top:0;width:920px;display:flex;gap:16px">${col('New', [['man-cap', 'Sarah'], ['woman-arms', 'Amir']])}${col('Contacted', [['woman-blonde', 'Jordan']], 1)}${col('Booked', [['man-glasses', 'Elena']])}${col('Won', [['woman-phone', 'Dana']])}</div>` };
};

V[11] = () => {
  let cells = '';
  for (let d = 0; d < 7; d++) for (let w = 0; w < 10; w++) cells += `<div class="hm ${[0, 2, 4].includes(d) ? 'on' : ''}"></div>`;
  return { w: 760, h: 470, html: `<div class="mlist" style="position:absolute;left:0;top:0;width:760px;padding:34px 40px">
    <div class="row" style="justify-content:space-between;margin-bottom:22px"><div class="m-who" style="margin:0">Posting Rhythm</div><span class="pill gold" style="font-size:18px;padding:10px 16px">Mon, Wed, Fri</span></div>
    <div style="display:grid;grid-template-columns:repeat(10,1fr);gap:12px">${cells}</div></div>` };
};

V[12] = () => ({ w: 820, h: 520, html: `${r3d('megaphone', 360, 'position:absolute;left:0;top:150px;transform:rotate(-18deg)')}
  <div class="m-bubble anchor" style="left:300px;top:0">One Clear<br>Message.</div>` });

V[13] = () => ({ w: 640, h: 560, html: `<div class="m-giant anchor" style="left:0;top:-40px;width:640px">3</div>
  <div class="m-progress" style="left:80px;top:460px;width:480px"><div style="width:22%"></div><span>0:03</span></div>` });

V[14] = () => {
  const cm = (img, name, txt, likes, reply) => `<div class="mrow" style="align-items:flex-start;${reply ? 'margin-left:70px;' : ''}">${photo(img, reply ? 46 : 56)}<div style="flex:1"><div style="font-size:22px;line-height:1.4"><b>${name}</b>${reply ? ' <span class="pill gold" style="font-size:13px;padding:3px 9px">Author</span>' : ''} ${txt}</div><div class="meta" style="font-size:16px;margin-top:4px">2m · Reply · ${likes} likes</div></div><span style="color:#E5484D;font-size:26px">${ic(reply ? 'heartFill' : 'heart')}</span></div>`;
  return { w: 780, h: 480, html: `<div class="mlist anchor" style="position:absolute;left:0;top:0;width:780px;padding:24px 36px">
    ${cm('woman-phone', 'nina.p', 'Do you work with small clinics too?', 12)}${cm('woman-arms', 'yourbrand', 'Yes, Nina! Most of our clients are clinics.', 24, 1)}${cm('man-cap', 'tom.r', 'Saving this one.', 8)}</div>` };
};

V[15] = () => {
  const d = [['Mon', 'video', 'Reel'], ['Tue', 'layers', 'Carousel'], ['Wed', 'mobile', 'Story'], ['Thu', 'video', 'Reel'], ['Fri', 'type', 'Post']];
  return { w: 900, h: 420, html: `<div class="anchor" style="position:absolute;left:0;top:120px;width:900px;display:flex;gap:16px">${d.map(([day, i, f], k) => `<div class="mday ${k === 2 ? 'hi' : ''}"><div class="mday-d">${day}</div>${tile(i, 70, k === 2 ? 'gold' : '')}<div class="mday-f">${f}</div></div>`).join('')}</div>
    ${r3d('notebook', 220, 'position:absolute;left:700px;top:0;transform:rotate(12deg)')}` };
};

V[16] = () => ({ w: 760, h: 600, html: `${r3d('bulb', 280, 'position:absolute;left:240px;top:0', 'anchor')}
  ${[['video', 'Reel', -14, 40, 330], ['layers', 'Carousel', -5, 210, 360], ['mobile', 'Story', 5, 380, 360], ['type', 'Caption', 14, 550, 330]].map(([i, t, r, x, y]) => `<div class="mfan" style="left:${x}px;top:${y}px;transform:rotate(${r}deg)">${tile(i, 70)}<span>${t}</span></div>`).join('')}` });

V[17] = () => ({ w: 460, h: 860, html: `${phone(`<div style="padding:10px 26px;text-align:left">
    <div class="row" style="justify-content:space-between;font-family:Sora;font-weight:700;font-size:20px;margin-bottom:18px"><span>brightsmile.dental</span><span>${ic('more')}</span></div>
    <div class="row" style="gap:18px">${photo('woman-arms', 96)}<div style="display:flex;gap:16px;text-align:center">${[['412', 'posts'], ['8.2k', 'followers'], ['210', 'following']].map(([a, b]) => `<div><div class="ttl" style="font-size:20px">${a}</div><div style="font-size:14px">${b}</div></div>`).join('')}</div></div>
    <div style="margin-top:16px;font-size:16px;line-height:1.6"><b>Bright Smile Dental</b><div class="hl">Family dentist in Austin, TX</div><div class="hl p">Same-week cleanings and whitening</div><div class="hl" style="font-weight:600">${ic('link')} Book your visit below</div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px"><div style="padding:11px;border-radius:10px;background:#412B67;color:#fff;text-align:center;font-weight:600;font-size:15px">Book Now</div><div style="padding:11px;border-radius:10px;background:#EFEEF6;text-align:center;font-weight:600;font-size:15px">Message</div></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin:16px -26px 0">${['#412B67', '#FFB317', '#6A4BA0', '#FFCB55', '#412B67', '#E9E7FA'].map((c) => `<div style="height:120px;background:${c}"></div>`).join('')}</div></div>`, { style: 'position:absolute;left:20px;top:0' })}` });

V[19] = () => ({ w: 800, h: 560, html: `<div class="mlist anchor" style="position:absolute;left:120px;top:60px;width:600px;padding:34px">
  <div class="m-who" style="text-align:center;margin-bottom:6px">What Should We Cover Next?</div>
  ${[['Websites', 22], ['Social Media', 31], ['Paid Ads', 17], ['Automation', 30, 1]].map(([t, p, top]) => `<div class="mpoll ${top ? "win" : ""}"><div class="fill" style="width:${p}%"></div><span>${t}</span><b>${p}%</b></div>`).join('')}</div>
  ${r3d('question', 230, 'position:absolute;left:0;top:0;transform:rotate(-12deg)')}` });

V[20] = () => ({ w: 900, h: 520, html: `${r3d('chart', 300, 'position:absolute;left:300px;top:0', 'anchor')}
  <div style="position:absolute;left:0;top:300px;width:900px;display:flex;gap:20px;justify-content:center">${[['bookmark', 'Saves', '+34%'], ['share', 'Shares', '+21%'], ['clock', 'Watch Time', '+18%']].map(([i, t, v]) => `<div class="mstat">${tile(i, 60)}<div><div class="mstat-v">${v}</div><div class="mstat-l">${t}</div></div></div>`).join('')}</div>` });

V[21] = () => ({ w: 820, h: 560, html: `<div class="mvideo anchor" style="left:60px;top:0;width:700px;height:420px"><img src="assets/photos/man-laptop.jpg"><div class="play">${ic('play')}</div><div class="cap">WATCH THIS</div></div>
  <div class="mtimeline" style="left:60px;top:430px;width:700px"><i style="width:22%"></i><i style="width:30%"></i><i class="g" style="width:18%"></i><i style="width:26%"></i></div>
  <div style="position:absolute;left:0;top:30px;transform:rotate(-5deg);z-index:6">${chipEl('scissors', 'Expert Editing')}</div>
  <div style="position:absolute;left:560px;top:330px;transform:rotate(4deg);z-index:6">${chipEl('wave', 'Sound Effects')}</div>` });

V[22] = () => ({ w: 800, h: 500, html: `${browser('yourbusiness.com', `<div style="padding:36px 44px;text-align:left;position:relative">
    <div class="ttl" style="font-size:42px;line-height:1.12;max-width:340px">We fix leaky roofs in 48 hours.</div>
    <div style="height:12px;width:340px;border-radius:6px;background:#E2DFF0;margin:20px 0 10px"></div><div style="height:12px;width:260px;border-radius:6px;background:#E2DFF0"></div>
    <div style="margin-top:26px;display:inline-block;padding:16px 28px;border-radius:999px;background:#412B67;color:#fff;font-weight:700;font-size:18px">Get A Free Quote</div>
    <div style="position:absolute;right:44px;top:40px;width:150px;height:150px;border-radius:15px;background:linear-gradient(150deg,#EDEAFB,#DCD7F0)"></div></div>`, 'position:absolute;left:0;top:60px;width:680px')}
  <div class="m-timer" style="left:600px;top:0">5s</div>` });

V[24] = () => ({ w: 820, h: 480, html: `<div class="mlist anchor" style="position:absolute;left:220px;top:20px;width:560px;padding:34px 36px">
    <div class="row" style="gap:4px;color:#FFB317;font-size:22px">${ic('star').repeat(5)}<span style="font-size:16px;margin-left:8px;opacity:.8">(2,140)</span></div>
    <div class="m-who" style="font-size:36px;margin:12px 0 4px;color:var(--mc-fg)">Glow Serum</div><div class="m-who" style="font-size:32px">$34.00</div>
    <div class="m-msg" style="margin:10px 0 22px;opacity:.85">Ships in 24 hours. Free returns.</div>
    <div class="m-buy">${ic('bag')} Add To Cart</div></div>
  ${r3d('cart', 300, 'position:absolute;left:0;top:150px;transform:rotate(-8deg)')}` });

V[26] = () => ({ w: 900, h: 470, html: `<div class="anchor" style="position:absolute;left:0;top:40px;width:900px;display:flex;align-items:center;justify-content:center;gap:26px">
    <div class="mbig"><span>Ad Spend</span><b>$1,000</b></div><span class="m-arrow">${ic('arrow')}</span><div class="mbig hi"><span>Revenue</span><b>$4,200</b></div></div>
  ${r3d('moneybag', 230, 'position:absolute;left:335px;top:230px')}` });

V[28] = () => ({ w: 760, h: 600, html: `<div class="mportrait anchor" style="left:190px;top:0;width:380px;height:460px"><img src="assets/photos/man-glasses.jpg"></div>
  <div class="mcall" style="left:60px;top:400px;width:640px">${photo('man-cap', 72)}<div style="flex:1;text-align:left"><div class="m-who" style="color:#fff;margin:0;white-space:nowrap">Calling Jordan Tate</div><div style="font-size:20px;opacity:.75">Follow up, 00:42</div></div><span class="cbtn r">${ic('phone')}</span><span class="cbtn g">${ic('phone')}</span></div>
  <div style="position:absolute;left:470px;top:40px;transform:rotate(5deg);z-index:6">${chipEl('calCheck', 'Call Booked')}</div>` });

V[29] = () => ({ w: 760, h: 660, html: `<div class="mid anchor" style="left:150px;top:0;width:460px">
    <div class="mid-photo"><img src="assets/photos/woman-laptop.jpg"></div>
    <div style="padding:26px 30px 30px;text-align:left"><div class="m-who" style="color:var(--mc-fg);font-size:32px;margin:0">Aisha M.</div><div class="m-msg" style="opacity:.8">Dedicated VA</div>
    <div class="row" style="gap:10px;margin-top:18px;flex-wrap:wrap">${['Project Manager', 'Daily Updates', 'Time Tracking'].map((t) => `<span class="pill soft" style="font-size:16px;padding:9px 14px">${t}</span>`).join('')}</div></div></div>
  <div class="m-coin" style="position:absolute;left:540px;top:180px;width:220px;height:220px;z-index:6"><span>from</span><b style="font-size:80px">$5</b><span>per hour</span></div>` });

V[30] = () => ({ w: 760, h: 540, html: `
  ${['Marketing', 'CRM', 'Development'].map((t, i) => `<div class="mlayer" style="left:${90 + i * 40}px;top:${i * 50}px;width:${580 - i * 80}px;opacity:${0.55 + i * 0.15}">${t}</div>`).join('')}
  <div class="mlist anchor" style="position:absolute;left:90px;top:200px;width:580px;padding:30px 36px;background:#FFFFFF;color:#1E1233">
    <div class="row" style="justify-content:space-between"><div style="padding:12px 20px;border-radius:12px;border:2.5px dashed #B9B3D1;font-family:Sora;font-weight:800;font-size:20px;color:#8A84A0;letter-spacing:.08em">YOUR AGENCY</div><span class="pill green" style="font-size:16px;padding:9px 14px">${ic('check')} Delivered</span></div>
    <div class="m-who" style="color:#412B67;font-size:32px;margin:22px 0 6px">Delivered Under Your Brand</div><div class="m-msg" style="color:#5E5675">Marketing, CRM and development, handled behind the scenes.</div></div>` });

V.setTheme = (t) => { THEME = t; SEQ = 0; };
module.exports = V;
