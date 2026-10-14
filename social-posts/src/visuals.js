// Hero visuals for each post. Each returns { w, h, html } at its natural size;
// the page script scales it to fit the available area for every format.
const { ic, cursor } = require('./icons');

const floor = '<div class="shadow-floor"></div>';
const av = (n, txt, size = 56) => `<div class="avatar av${n}" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.38)}px">${txt}</div>`;
const statusBar = (dark) => `<div class="status" style="color:${dark ? '#fff' : '#111'}"><span>9:41</span><span style="display:flex;gap:6px;align-items:center"><svg width="22" height="14" viewBox="0 0 22 14"><rect x="0" y="9" width="4" height="5" rx="1" fill="currentColor"/><rect x="6" y="6" width="4" height="8" rx="1" fill="currentColor"/><rect x="12" y="3" width="4" height="11" rx="1" fill="currentColor"/><rect x="18" y="0" width="4" height="14" rx="1" fill="currentColor"/></svg><svg width="30" height="14" viewBox="0 0 30 14"><rect x=".5" y=".5" width="25" height="13" rx="4" fill="none" stroke="currentColor" opacity=".5"/><rect x="3" y="3" width="19" height="8" rx="2" fill="currentColor"/><rect x="27" y="4.5" width="2" height="5" rx="1" fill="currentColor" opacity=".5"/></svg></span></div>`;
const phone = (inner, { dark = false, style = '' } = {}) => `<div class="phone" style="${style}"><div class="screen" style="background:${dark ? '#140C22' : '#fff'}"><div class="island"></div>${statusBar(dark)}${inner}<div class="gloss"></div></div></div>`;
const browser = (url, inner, style = '') => `<div class="browser" style="${style}"><div class="bar"><span class="dot" style="background:#FF5F57"></span><span class="dot" style="background:#FEBC2E"></span><span class="dot" style="background:#28C840"></span><div class="url">${ic('shield')} ${url}</div></div>${inner}</div>`;
const notif = (icon, title, sub, style) => `<div class="float notif" style="${style}">${icon.startsWith('3d:') ? `<div class="tile3d" style="width:58px;height:58px"><img src="assets/3d/${icon.slice(3)}.png"></div>` : `<div class="ico">${ic(icon)}</div>`}<div><b>${title}</b><span>${sub}</span></div></div>`;
const key = (cls, label, w, h, fs, style = '') => `<div class="key ${cls}" style="width:${w}px;height:${h}px;${style}"><div class="face" style="font-size:${fs}px">${label}</div></div>`;


// 3D PNG object with layered drop shadow and a soft floor shadow.
const obj = (name, size, style = '', cls = '') => `<div class="obj ${cls}" style="width:${Math.min(250, Math.round(size * 1.22))}px;${style}"><img src="assets/3d/${name}.png"><div class="floor"></div></div>`;
// Rounded tile holding a small 3D PNG (replaces flat icons in UI mockups).
const tile = (name, size = 56, cls = '') => `<div class="tile3d ${cls}" style="width:${size}px;height:${size}px;border-radius:${Math.round(size * 0.28)}px"><img src="assets/3d/${name}.png"></div>`;
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

// 1. CRM cleanup
V[1] = () => {
  const row = (n, ini, name, mail, badge, faded) => `<div class="row" style="gap:18px;padding:18px 26px;border-top:1px solid #EEECF5;${faded ? 'opacity:.45' : ''}">${av(n, ini, 52)}<div style="flex:1"><div class="ttl" style="font-size:21px">${name}</div><div class="muted" style="font-size:16px">${mail}</div></div>${badge}</div>`;
  const dup = `<span class="pill red" style="font-size:15px;padding:8px 14px">${ic('x')} Duplicate</span>`;
  const okp = `<span class="pill green" style="font-size:15px;padding:8px 14px">${ic('check')} Clean</span>`;
  const chip = (txt, x, y, r) => `<div class="float pill soft" style="left:${x}px;top:${y}px;transform:rotate(${r}deg);font-size:17px;padding:10px 16px;box-shadow:0 10px 20px -8px rgba(65,43,103,.35);text-decoration:line-through;opacity:.92">${ic('tag')} ${txt}</div>`;
  return { w: 900, h: 600, html: `
    ${chip('old-list-2019', 6, 30, -8)}${chip('test tag', 720, 10, 7)}${chip('lead??', 760, 470, -6)}
    <div class="card" style="position:absolute;left:110px;top:70px;width:680px;overflow:hidden">
      <div class="row" style="justify-content:space-between;padding:24px 26px"><div class="ttl" style="font-size:25px">Contacts</div><div class="row" style="gap:10px"><span class="pill soft" style="font-size:16px;padding:9px 14px">${ic('filter')} 1,248</span><span class="pill gold" style="font-size:16px;padding:9px 14px">${ic('merge')} Merge 3</span></div></div>
      ${row(1, 'SL', 'Sarah Lee', 'sarah@northpeak.co', okp)}
      ${row(1, 'SL', 'Sarah  Lee', 'sarah@northpeak.co', dup, true)}
      ${row(3, 'MR', 'Marcus Reid', 'marcus@reidhvac.com', okp)}
      ${row(4, 'AK', 'A. Khan', 'akhan@gmail', dup, true)}
      ${row(5, 'JT', 'Jordan Tate', 'jordan@tateco.io', okp)}
    </div>
    ${notif('3d:check', 'Account cleaned', '312 duplicates merged', 'right:-10px;top:300px')}
    ${obj('broom', 210, 'left:-30px;top:360px;transform:rotate(-14deg)')}
    ${floor}` };
};

// 2. Workflow automation
V[2] = () => {
  const node = (icon, label, sub, gold) => `<div class="card" style="width:520px;padding:22px 26px;display:flex;align-items:center;gap:20px;${gold ? 'outline:3px solid var(--gold)' : ''}">${tile(icon, 66, gold ? 'gold' : '')}<div><div class="muted" style="font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase">${sub}</div><div class="ttl" style="font-size:24px">${label}</div></div></div>`;
  const link = `<div style="width:4px;height:44px;margin:0 auto;background:repeating-linear-gradient(180deg,var(--line) 0 8px,transparent 8px 14px)"></div>`;
  return { w: 900, h: 640, html: `
    <div style="position:absolute;left:190px;top:0;display:flex;flex-direction:column">
      ${node('phone', 'Missed call', 'Trigger', true)}${link}
      ${node('hourglass', 'Wait 30 seconds', 'Delay')}${link}
      ${node('speech', 'Send text back', 'Action')}${link}
      ${node('bell', 'Notify the team', 'Action')}
    </div>
    ${notif('3d:envelope', 'Text sent automatically', '"Sorry we missed you! How can we help?"', 'right:-30px;top:110px;max-width:360px')}
    ${obj('bolt', 150, 'left:20px;top:290px', 'glow-gold')}<div class="float pill gold" style="left:0;top:470px;font-size:20px;padding:14px 20px;box-shadow:0 14px 26px -10px rgba(0,0,0,.5)">${ic('bolt')} Runs 24/7</div>
    ${floor}` };
};

// 3. Funnels
V[3] = () => ({ w: 920, h: 640, html: `
  ${['Blog', 'About', 'Pricing', 'Careers'].map((t, i) => `<div class="float pill soft" style="left:${[10, 760, 20, 790][i]}px;top:${[60, 40, 420, 380][i]}px;font-size:18px;padding:10px 18px;opacity:.6;text-decoration:line-through;transform:rotate(${[-8, 6, 5, -7][i]}deg)">${t}</div>`).join('')}
  ${browser('yourbusiness.com/offer', `
    <div style="padding:46px 56px 54px;text-align:center;background:linear-gradient(180deg,#fff,#F6F6FF)">
      <span class="pill soft" style="font-size:15px;padding:8px 14px">ONE OFFER</span>
      <div class="ttl" style="font-size:42px;line-height:1.1;margin:18px auto 14px;max-width:520px">Get a free roof inspection this week</div>
      <div class="muted" style="font-size:19px;max-width:440px;margin:0 auto 26px">Book in 60 seconds. No obligation.</div>
      <div style="display:inline-flex;align-items:center;gap:12px;padding:20px 38px;border-radius:999px;background:linear-gradient(180deg,#4E3479,#412B67);color:#fff;font-family:Sora;font-weight:700;font-size:23px;box-shadow:0 14px 28px -10px rgba(65,43,103,.7)">Claim my inspection ${ic('arrow')}</div>
    </div>`, 'position:absolute;left:150px;top:40px;width:620px')}
  <div class="float" style="left:610px;top:430px">${cursor}</div>
  ${obj('target', 180, 'left:-10px;top:230px')}
  <div class="float card" style="right:0;top:470px;padding:18px 22px;display:flex;gap:14px;align-items:center"><div style="font-size:30px;color:var(--ok)">${ic('up')}</div><div><div class="muted" style="font-size:15px">Conversion rate</div><div class="ttl" style="font-size:30px">12.4%</div></div></div>
  ${floor}` });

// 4. Speed to lead
V[4] = () => ({ w: 860, h: 820, html: `
  ${phone(`<div style="padding:10px 22px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #EEE">${av(5, 'JT', 44)}<div><div class="ttl" style="font-size:18px">Jordan Tate</div><div class="meta">New lead from website form</div></div></div>
    <div style="padding:20px 18px;display:flex;flex-direction:column;gap:12px">
      <div class="meta" style="text-align:center">Today 2:41 PM</div>
      <div class="bub in">Hi, I need a quote for a kitchen remodel. Is anyone available this week?</div>
      <div class="bub out">Hi Jordan! Thanks for reaching out. We have openings Thursday and Friday. Which works best for you?</div>
      <div class="meta" style="text-align:right">Delivered 2:41 PM</div>
      <div class="bub in">Thursday morning please!</div>
      <div class="bub out gold">Booked: Thursday 9:00 AM. You will get a reminder the day before.</div>
    </div>`, { style: 'position:absolute;left:220px;top:0;transform:scale(.95);transform-origin:top center' })}
  <div class="float card" style="left:0;top:240px;padding:24px 28px;text-align:center"><div style="position:absolute;left:50%;top:-80px;transform:translateX(-50%);width:120px"><img src="assets/3d/stopwatch.png" style="width:120px;filter:drop-shadow(0 8px 8px rgba(30,10,60,.3))"></div><div class="ttl" style="font-size:54px;line-height:1;margin-top:40px">0:04</div><div class="muted" style="font-size:17px;margin-top:6px">first reply time</div></div>
  <div class="float pill gold" style="right:0;top:520px;font-size:20px;padding:14px 22px;box-shadow:0 14px 26px -10px rgba(0,0,0,.4)">${ic('bolt')} Instant reply on</div>
  ${obj('ice', 150, 'right:40px;top:150px;transform:rotate(8deg)')}
  ${floor}` });

// 5. AI conversation bots
V[5] = () => ({ w: 900, h: 720, html: `
  <div class="card" style="position:absolute;left:150px;top:20px;width:600px;overflow:hidden">
    <div class="row" style="gap:16px;padding:22px 26px;background:linear-gradient(180deg,#4E3479,#412B67);color:#fff">
      ${tile('robot', 58, 'gold')}
      <div><div class="ttl" style="font-size:22px">AI Assistant</div><div style="font-size:15px;opacity:.8"><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#3DDC84;margin-right:6px"></span>Online, always</div></div>
    </div>
    <div style="padding:24px;display:flex;flex-direction:column;gap:14px;background:#FAFAFF">
      <div class="bub in" style="font-size:19px">Do you offer weekend appointments?</div>
      <div class="bub out" style="font-size:19px">Yes! We have Saturday at 10 AM or 2 PM. Is this for a new or existing service?</div>
      <div class="bub in" style="font-size:19px">New. Saturday 10 AM please.</div>
      <div class="bub out gold" style="font-size:19px">${ic('calCheck')} You are booked for Saturday, 10:00 AM.</div>
    </div>
  </div>
  <div class="float card-dark" style="left:0;top:90px;padding:18px 22px;display:flex;align-items:center;gap:12px;font-family:Sora;font-weight:700;font-size:24px"><img src="assets/3d/moon.png" style="width:44px;filter:drop-shadow(0 8px 8px rgba(30,10,60,.3))">2:14 AM</div>
  ${obj('robot', 190, 'right:-30px;top:150px;transform:rotate(6deg)')}
  <div class="float pill green" style="right:10px;top:470px;font-size:19px;padding:14px 20px;box-shadow:0 14px 26px -12px rgba(0,0,0,.4)">${ic('check')} Lead qualified</div>
  ${floor}` });

// 6. White-label onboarding
V[6] = () => ({ w: 900, h: 680, html: `
  <div class="card" style="position:absolute;left:90px;top:40px;width:720px;overflow:hidden">
    <div class="row" style="justify-content:space-between;padding:22px 28px;border-bottom:1px solid #EEECF5">
      <div class="row" style="gap:14px"><div style="width:150px;height:50px;border-radius:12px;border:2.5px dashed #B9B3D1;display:grid;place-items:center;font-family:Sora;font-weight:700;font-size:16px;color:#8A84A0;letter-spacing:.08em">YOUR LOGO</div></div>
      <div class="row" style="gap:10px">${av(1, 'YB', 42)}</div>
    </div>
    <div style="display:flex">
      <div style="width:170px;padding:22px;display:flex;flex-direction:column;gap:12px;background:#FAFAFF">${['Dashboard', 'Contacts', 'Pipelines', 'Calendars', 'Automations'].map((t, i) => `<div style="font-size:16px;font-weight:600;padding:10px 12px;border-radius:10px;${i === 0 ? 'background:#412B67;color:#fff' : 'color:#5E5675'}">${t}</div>`).join('')}</div>
      <div style="flex:1;padding:26px">
        <div class="ttl" style="font-size:24px;margin-bottom:16px">Client onboarding</div>
        ${['Sub-account created', 'Branding applied', 'Calendars and pipelines built', 'Client training call'].map((t, i) => `<div class="row" style="gap:14px;padding:12px 0">${i < 3 ? `<div class="chk">${ic('check')}</div>` : '<div class="chk empty"></div>'}<span style="font-size:19px;font-weight:500">${t}</span></div>`).join('')}
      </div>
    </div>
  </div>
  <svg class="float" style="left:580px;top:0" width="200" height="90"><path d="M10 80 L100 10 L190 80" stroke="var(--line)" stroke-width="2.5" stroke-dasharray="3 5" fill="none"/><circle cx="100" cy="10" r="7" fill="var(--line)"/></svg>
  <div class="float" style="left:600px;top:72px;transform:rotate(-5deg);padding:16px 26px;border-radius:12px;background:linear-gradient(180deg,#FFCB55,#FFB317);border:2px solid #1E1233;font-family:Sora;font-weight:800;font-size:22px;color:#1E1233;letter-spacing:.04em;box-shadow:0 14px 24px -10px rgba(0,0,0,.45)">YOUR BRAND</div>
  ${obj('handshake', 170, 'left:-20px;top:250px')}<div class="float card-dark" style="left:0;top:470px;padding:16px 22px;display:flex;align-items:center;gap:14px"><div style="display:flex">${av(2, 'IN', 44)}<div style="margin-left:-12px">${av(3, 'GH', 44)}</div><div style="margin-left:-12px">${av(5, 'L', 44)}</div></div><div><div class="ttl" style="font-size:19px">GHL specialists</div><div style="font-size:15px;opacity:.75">behind the scenes</div></div></div>
  ${floor}` });

// 7. Three starter automations
V[7] = () => {
  const r = (n, t, s) => `<div class="row" style="gap:22px;padding:22px 28px;border-top:1px solid #EEECF5">${key('gold', n, 74, 82, 32, 'border-radius:22px;padding:8px 8px 18px')}<div style="flex:1"><div class="ttl" style="font-size:25px">${t}</div><div class="muted" style="font-size:17px;margin-top:4px">${s}</div></div><div class="toggle on"></div></div>`;
  return { w: 860, h: 600, html: `
    <div class="card" style="position:absolute;left:60px;top:40px;width:740px;overflow:hidden">
      <div class="row" style="justify-content:space-between;padding:22px 28px"><div class="ttl" style="font-size:22px;color:#5E5675">Automations</div><span class="pill green" style="font-size:16px;padding:8px 14px">3 active</span></div>
      ${r('1', 'New lead alerts', 'Ping your team the second a form is filled')}
      ${r('2', 'Missed call text back', 'Reply by SMS when you cannot pick up')}
      ${r('3', 'Appointment reminders', 'Cut no-shows with email and SMS nudges')}
    </div>
    <div class="float pill gold" style="right:0;top:0;font-size:21px;padding:14px 22px;box-shadow:0 14px 26px -10px rgba(0,0,0,.45)">${ic('clock')} Saves hours weekly</div>
    ${obj('alarm', 150, 'left:-30px;top:-30px;transform:rotate(-10deg)')}
    ${floor}` };
};

// 8. Tool consolidation
V[8] = () => {
  const tabs = ['Calendar', 'Pipeline', 'Forms', 'Email', 'SMS', 'Sheets', 'Invoices', 'Chat', 'Reviews', 'Funnels'];
  const tab = (t, i) => `<div class="float" style="left:${(i % 5) * 172 + (i > 4 ? 60 : 0)}px;top:${i > 4 ? 82 : 0}px;transform:rotate(${[-4, 3, -2, 5, -3, 4, -5, 2, -3, 3][i]}deg);padding:14px 20px;border-radius:12px 12px 4px 4px;background:#fff;color:#5E5675;font-size:17px;font-weight:600;box-shadow:0 10px 20px -8px rgba(10,4,24,.5);opacity:.85;white-space:nowrap">${t} <span style="opacity:.5;margin-left:6px">${ic('x')}</span></div>`;
  const mod = (icon, t) => `<div style="padding:20px;border-radius:15px;background:#F6F6FF;text-align:center"><div style="width:66px;margin:0 auto 10px">${tile(icon, 66)}</div><div style="font-size:17px;font-weight:600">${t}</div></div>`;
  return { w: 900, h: 720, html: `
    <div style="position:absolute;left:0;top:0;width:900px;height:150px;filter:blur(.4px)">${tabs.map(tab).join('')}</div>
    <div class="float" style="left:430px;top:166px;color:#FFB317;font-size:44px;transform:rotate(90deg)">${ic('arrow')}</div>
    ${obj('puzzle', 170, 'right:20px;top:200px;transform:rotate(12deg)')}
    <div class="card" style="position:absolute;left:150px;top:240px;width:600px;padding:26px">
      <div class="row" style="justify-content:space-between;margin-bottom:20px"><div class="ttl" style="font-size:25px">One platform</div><span class="pill gold" style="font-size:16px;padding:8px 14px">1 tab</span></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">${mod('calendar', 'Calendars')}${mod('trend', 'Pipelines')}${mod('memo', 'Forms')}${mod('email', 'Email')}${mod('speech', 'SMS')}${mod('barchart', 'Reports')}</div>
    </div>
    ${floor}` };
};

// 9. Account setup checklist
V[9] = () => {
  const items = [['calendar', 'Calendar connected'], ['email', 'Email domain verified'], ['phone', 'Phone number active'], ['globe', 'Google Business Profile linked'], ['link', 'Website forms connected']];
  return { w: 860, h: 680, html: `
    <div class="card" style="position:absolute;left:110px;top:30px;width:640px;padding:30px">
      <div class="row" style="justify-content:space-between"><div class="ttl" style="font-size:27px">Account setup</div><div class="ttl" style="font-size:24px;color:var(--purple)">5/5</div></div>
      <div style="height:12px;border-radius:8px;background:#EEECF5;margin:16px 0 18px;overflow:hidden"><div style="height:100%;width:100%;background:linear-gradient(90deg,#FFB317,#FFCB55);border-radius:8px"></div></div>
      ${items.map(([i, t]) => `<div class="row" style="gap:18px;padding:15px 0;border-top:1px solid #F0EEF7">${tile(i, 54)}<div style="flex:1;font-size:21px;font-weight:600">${t}</div><div class="chk">${ic('check')}</div></div>`).join('')}
    </div>
    ${obj('tools', 170, 'right:-20px;top:440px')}
    <div class="float pill purple" style="left:0;top:560px;font-size:19px;padding:14px 20px;box-shadow:0 14px 26px -10px rgba(65,43,103,.6)">${ic('shield')} No loose ends</div>
    ${floor}` };
};

// 10. Pipeline clarity
V[10] = () => {
  const col = (t, n, cards) => `<div style="width:236px;background:var(--colbg);border:1.5px solid var(--colbd);border-radius:15px;padding:14px"><div class="row" style="justify-content:space-between;color:var(--colfg);margin-bottom:12px"><span class="ttl" style="font-size:19px">${t}</span><span style="font-size:15px;opacity:.7">${n}</span></div>${cards}</div>`;
  const c = (a, ini, name, next, gold) => `<div class="card" style="padding:14px;margin-bottom:10px;${gold ? 'outline:3px solid #FFB317' : ''}"><div class="row" style="gap:10px">${av(a, ini, 36)}<div class="ttl" style="font-size:17px">${name}</div></div><div style="margin-top:10px;font-size:14px;color:#5E5675;display:flex;gap:6px;align-items:center">${ic('arrow')} ${next}</div></div>`;
  return { w: 1000, h: 520, html: `
    <div style="position:absolute;left:0;top:20px;display:flex;gap:18px">
      ${col('New', 2, c(1, 'SL', 'Sarah Lee', 'Call today') + c(4, 'AK', 'Amir Khan', 'Send intro'))}
      ${col('Contacted', 2, c(5, 'JT', 'Jordan Tate', 'Follow up Tue', true) + c(3, 'MR', 'Marcus Reid', 'Send quote'))}
      ${col('Booked', 1, c(2, 'EV', 'Elena Voss', 'Prep call notes'))}
      ${col('Won', 1, c(3, 'DB', 'Dana Brooks', 'Onboard'))}
    </div>
    ${obj('trend', 150, 'right:40px;top:300px;transform:rotate(-6deg)')}<div class="float pill gold" style="left:20px;top:440px;font-size:19px;padding:14px 20px;box-shadow:0 14px 26px -10px rgba(0,0,0,.5)">${ic('user')} Every lead has an owner</div>` };
};

// 11. Consistency
V[11] = () => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  let cells = '';
  for (let d = 0; d < 7; d++) {
    cells += `<div style="font-size:15px;color:#8A84A0;font-weight:600;display:grid;place-items:center">${days[d]}</div>`;
    for (let w = 0; w < 12; w++) {
      const on = d === 0 || d === 2 || d === 4;
      cells += `<div style="width:40px;height:40px;border-radius:10px;${on ? 'background:linear-gradient(160deg,#FFD25E,#FFB317);box-shadow:0 6px 10px -5px rgba(200,120,0,.6),inset 0 1px 0 rgba(255,255,255,.6)' : 'background:#F0EEF7'}"></div>`;
    }
  }
  return { w: 860, h: 600, html: `
    <div class="card" style="position:absolute;left:60px;top:40px;width:740px;padding:30px">
      <div class="row" style="justify-content:space-between;margin-bottom:22px"><div><div class="ttl" style="font-size:25px">Posting rhythm</div><div class="muted" style="font-size:17px">Last 12 weeks</div></div><span class="pill green" style="font-size:16px;padding:9px 14px">${ic('check')} 36 of 36 posts</span></div>
      <div style="display:grid;grid-template-columns:24px repeat(12,40px);gap:10px;justify-content:space-between">${cells}</div>
    </div>
    ${obj('trophy', 160, 'left:-30px;top:400px')}
    <div class="float card-dark" style="right:0;top:440px;padding:18px 24px"><div style="font-size:15px;opacity:.75">Schedule</div><div class="ttl" style="font-size:24px;color:#FFB317">Mon, Wed, Fri</div></div>
    ${floor}` };
};

// 12. Quality over volume
V[12] = () => {
  const ghost = (x, y, r) => `<div class="float card" style="left:${x}px;top:${y}px;width:240px;height:300px;transform:rotate(${r}deg);opacity:.5;padding:16px"><div style="height:170px;border-radius:10px;background:#E9E7F3"></div><div style="height:12px;width:80%;margin-top:16px;border-radius:6px;background:#E9E7F3"></div><div style="height:12px;width:55%;margin-top:10px;border-radius:6px;background:#E9E7F3"></div></div>`;
  const note = (t, x, y) => `<div class="float pill gold" style="left:${x}px;top:${y}px;font-size:18px;padding:11px 18px;box-shadow:0 12px 22px -10px rgba(0,0,0,.4)">${ic('check')} ${t}</div>`;
  return { w: 940, h: 700, html: `
    ${ghost(20, 120, -10)}${ghost(80, 90, -5)}${ghost(660, 110, 9)}${ghost(620, 80, 4)}
    <div class="card" style="position:absolute;left:280px;top:20px;width:380px;overflow:hidden">
      <div class="row" style="gap:12px;padding:14px 16px">${av(1, 'YB', 40)}<div class="ttl" style="font-size:17px">yourbrand</div><span style="margin-left:auto;color:#8A84A0;font-size:22px">${ic('more')}</span></div>
      <div style="height:340px;background:linear-gradient(150deg,#412B67,#2F1E4C);display:flex;flex-direction:column;justify-content:center;padding:30px;color:#fff;position:relative;overflow:hidden">
        <div style="position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:rgba(255,179,23,.25);filter:blur(30px)"></div>
        <div class="ttl" style="font-size:34px;line-height:1.1">Your quote is costing you <span style="color:#FFB317">jobs.</span></div>
        <div style="margin-top:18px;display:inline-block;align-self:flex-start;padding:10px 18px;border-radius:999px;background:#fff;color:#412B67;font-weight:700;font-size:15px">Book a free review</div>
      </div>
      <div class="row" style="gap:18px;padding:14px 16px;font-size:26px;color:#111">${ic('heartFill')}${ic('msg')}${ic('send')}<span style="margin-left:auto">${ic('bookmark')}</span></div>
    </div>
    ${obj('trash', 190, 'left:20px;top:420px')}${obj('gem', 120, 'left:600px;top:-10px;transform:rotate(10deg)')}${note('Clear message', 690, 420)}${note('Strong first line', 230, 610)}${note('One call to action', 640, 560)}
    ${floor}` };
};

// 13. Three seconds
V[13] = () => ({ w: 900, h: 560, html: `
  ${key('', '1', 230, 250, 110, 'position:absolute;left:30px;top:150px;opacity:.9')}
  ${key('', '2', 230, 250, 110, 'position:absolute;left:330px;top:150px;opacity:.9')}
  ${key('gold', '3', 250, 270, 120, 'position:absolute;left:630px;top:130px')}
  <div class="float card" style="left:280px;top:0;padding:14px 22px;display:flex;align-items:center;gap:14px"><div style="width:180px;height:10px;border-radius:6px;background:#EEECF5;overflow:hidden"><div style="width:22%;height:100%;background:#FFB317"></div></div><span class="ttl" style="font-size:20px">0:03</span><span class="muted" style="font-size:16px">Skip?</span></div>
  <div class="float" style="left:770px;top:410px">${cursor}</div>
  ${obj('hook', 170, 'left:40px;top:-40px;transform:rotate(-14deg)')}${obj('hourglass', 120, 'right:20px;top:-10px;transform:rotate(10deg)')}
  ${floor}` });

// 14. Engagement
V[14] = () => {
  const cm = (a, ini, name, txt, likes, reply) => `<div class="row" style="gap:16px;align-items:flex-start;${reply ? 'margin-left:70px;' : ''}padding:14px 0">${av(a, ini, reply ? 46 : 52)}<div style="flex:1"><div style="font-size:19px;line-height:1.4"><b class="ttl" style="font-size:18px">${name}</b> ${reply ? '<span class="pill gold" style="font-size:12px;padding:3px 8px;vertical-align:2px">Author</span> ' : ''}${txt}</div><div class="meta" style="margin-top:6px;font-size:15px">2m &nbsp; Reply &nbsp; ${likes} likes</div></div><span style="color:${reply ? '#E5484D' : '#8A84A0'};font-size:22px">${ic(reply ? 'heartFill' : 'heart')}</span></div>`;
  return { w: 860, h: 640, html: `
    <div class="card" style="position:absolute;left:70px;top:30px;width:720px;padding:22px 30px">
      <div class="ttl" style="font-size:22px;padding-bottom:6px;border-bottom:1px solid #EEECF5;margin-bottom:6px">Comments</div>
      ${cm(4, 'NP', 'nina.p', 'Do you work with small clinics too?', 12)}
      ${cm(1, 'YB', 'yourbrand', 'Yes, Nina! Most of our clients are local clinics. Want a quick checklist?', 24, true)}
      ${cm(3, 'TR', 'tom.r', 'This was super useful, saving it.', 8)}
      ${cm(1, 'YB', 'yourbrand', 'Thanks Tom! Part two drops Friday.', 15, true)}
    </div>
    ${obj('heart', 130, 'left:-10px;top:470px;transform:rotate(-12deg)')}${obj('wave', 130, 'right:-10px;top:460px')}
    <div class="float card-dark" style="right:0;top:0;padding:16px 22px;display:flex;align-items:center;gap:12px"><img src="assets/3d/speech.png" style="width:40px;filter:drop-shadow(0 8px 8px rgba(30,10,60,.3))"><span class="ttl" style="font-size:21px">100% replied</span></div>
    ${floor}` };
};

// 15. Content calendar
V[15] = () => {
  const d = [['Mon', 'Reel', 'av1'], ['Tue', 'Carousel', 'av2'], ['Wed', 'Story', 'av3'], ['Thu', 'Reel', 'av1'], ['Fri', 'Post', 'av5']];
  return { w: 900, h: 600, html: `
    <div class="card" style="position:absolute;left:40px;top:50px;width:820px;padding:28px">
      <div class="row" style="justify-content:space-between;margin-bottom:20px"><div class="ttl" style="font-size:26px">Next week</div><span class="pill soft" style="font-size:16px;padding:8px 14px;margin-right:150px">${ic('cal')} 5 posts</span></div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px">
        ${d.map(([day, f, c], i) => `<div style="border-radius:15px;background:#F6F6FF;padding:14px;height:250px;display:flex;flex-direction:column;gap:10px"><div class="ttl" style="font-size:18px;color:#5E5675">${day}</div><div class="avatar ${c}" style="border-radius:12px;height:120px;width:100%;font-size:16px;display:grid;place-items:center"><img src="assets/3d/${f === 'Reel' ? 'clapper' : f === 'Carousel' ? 'picture' : f === 'Story' ? 'mobile' : 'writing'}.png" style="width:78px;filter:drop-shadow(0 8px 8px rgba(0,0,0,.3))"></div><div style="font-size:16px;font-weight:700">${f}</div><div style="height:8px;width:${70 - i * 6}%;border-radius:4px;background:#E2DFF0"></div></div>`).join('')}
      </div>
    </div>
    ${obj('spiralcal', 150, 'left:-40px;top:400px;transform:rotate(-8deg)')}
    <div class="float" style="left:710px;top:0;width:150px;height:150px;border-radius:50%;background:linear-gradient(160deg,#FFD56B,#FFB317);box-shadow:0 20px 40px -14px rgba(160,90,0,.6),inset 0 3px 6px rgba(255,255,255,.6);display:grid;place-items:center;text-align:center;color:#1E1233"><div><div class="ttl" style="font-size:44px;line-height:1">1 hr</div><div style="font-size:15px;font-weight:600">to plan it all</div></div></div>
    ${floor}` };
};

// 16. Repurposing
V[16] = () => {
  const out = (icon, t, x, y) => `<div class="float card" style="left:${x}px;top:${y}px;width:200px;padding:18px;text-align:center"><div style="width:76px;margin:0 auto 10px">${tile(icon, 76)}</div><div class="ttl" style="font-size:20px">${t}</div></div>`;
  return { w: 900, h: 640, html: `
    <svg class="float" style="left:0;top:0" width="900" height="640" fill="none" stroke="var(--line)" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"><path d="M450 320 C 330 320 300 140 200 130"/><path d="M450 320 C 570 320 600 140 700 130"/><path d="M450 320 C 330 320 300 500 200 510"/><path d="M450 320 C 570 320 600 500 700 510"/></svg>
    ${out('clapper', 'Reel', 40, 30)}${out('picture', 'Carousel', 660, 30)}${out('mobile', 'Story', 40, 410)}${out('writing', 'Caption', 660, 410)}${obj('recycle', 110, 'left:395px;top:40px')}
    <div class="float" style="left:330px;top:200px;width:240px;height:240px;border-radius:50%;background:linear-gradient(160deg,#FFD56B,#FFB317 60%,#F0A000);box-shadow:0 30px 60px -20px rgba(10,4,24,.8),inset 0 4px 10px rgba(255,255,255,.6),inset 0 -12px 24px rgba(160,90,0,.35);display:grid;place-items:center;text-align:center;color:#1E1233"><div><img src="assets/3d/bulb.png" style="width:110px;filter:drop-shadow(0 8px 8px rgba(30,10,60,.3))"><div class="ttl" style="font-size:26px">1 idea</div></div></div>` };
};

// 17. Bio is a landing page
V[17] = () => {
  const call = (t, x, y) => `<div class="float pill gold" style="left:${x}px;top:${y}px;font-size:18px;padding:11px 18px;box-shadow:0 12px 22px -10px rgba(0,0,0,.35)">${t}</div>`;
  return { w: 920, h: 860, html: `
    ${phone(`<div style="padding:10px 24px">
      <div class="row" style="justify-content:space-between;font-family:Sora;font-weight:700;font-size:20px;margin-bottom:18px"><span>brightsmile.dental</span><span>${ic('more')}</span></div>
      <div class="row" style="gap:20px"><div style="padding:4px;border-radius:50%;background:linear-gradient(140deg,#FFB317,#412B67)">${av(1, 'BS', 92)}</div><div style="display:flex;gap:18px;text-align:center">${[['412', 'posts'], ['8.2k', 'followers'], ['210', 'following']].map(([a, b]) => `<div><div class="ttl" style="font-size:20px">${a}</div><div style="font-size:14px">${b}</div></div>`).join('')}</div></div>
      <div style="margin-top:14px;font-size:16px;line-height:1.5"><b>Bright Smile Dental</b><div style="background:rgba(255,179,23,.22);border-radius:6px;padding:2px 6px;margin:4px 0">Family dentist in Austin, TX</div><div style="background:rgba(65,43,103,.10);border-radius:6px;padding:2px 6px;margin:4px 0">Same-week cleanings and whitening</div><div style="background:rgba(255,179,23,.22);border-radius:6px;padding:2px 6px;margin:4px 0;color:#2C5EAF;font-weight:600">${ic('link')} Book your visit below</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px"><div style="padding:10px;border-radius:10px;background:#412B67;color:#fff;text-align:center;font-weight:600;font-size:15px">Book now</div><div style="padding:10px;border-radius:10px;background:#EFEEF6;text-align:center;font-weight:600;font-size:15px">Message</div></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin:16px -24px 0">${[1, 2, 3, 4, 5, 2].map((n) => `<div class="avatar av${n}" style="border-radius:0;height:118px;width:100%"></div>`).join('')}</div>
    </div>`, { style: 'position:absolute;left:250px;top:0' })}
    ${brand('instagram', 110, 'position:absolute;left:110px;top:110px;transform:rotate(-10deg);z-index:5')}${obj('idcard', 150, 'right:30px;top:150px;transform:rotate(8deg)')}
    ${call('Who you help', 20, 320)}${call('What you offer', 690, 370)}${call('What to do next', 30, 430)}
    ${floor}` };
};

// 18. Fast DM replies
V[18] = () => {
  const dm = (a, ini, n, t, time, unread) => `<div class="row" style="gap:14px;padding:13px 22px">${av(a, ini, 56)}<div style="flex:1;min-width:0"><div class="ttl" style="font-size:17px">${n}</div><div style="font-size:15px;color:${unread ? '#111' : '#8A84A0'};font-weight:${unread ? 600 : 400};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t}</div></div><div style="text-align:right"><div class="meta">${time}</div>${unread ? '<div style="width:12px;height:12px;border-radius:50%;background:#FFB317;margin:8px 0 0 auto"></div>' : ''}</div></div>`;
  return { w: 880, h: 860, html: `
    ${phone(`<div style="padding:4px 22px 12px;font-family:Sora;font-weight:700;font-size:24px">Messages</div>
      <div style="margin:0 22px 10px;padding:10px 14px;border-radius:12px;background:#EFEEF6;color:#8A84A0;font-size:15px">${ic('search')} Search</div>
      ${dm(4, 'NP', 'Nina Patel', 'Hi! What are your prices for...', '1m', true)}
      ${dm(5, 'JT', 'Jordan Tate', 'Can I book for Saturday?', '6m', true)}
      ${dm(3, 'MR', 'Marcus Reid', 'You: Sent you the details!', '12m')}
      ${dm(2, 'EV', 'Elena Voss', 'You: Thanks, see you then', '40m')}
      ${dm(1, 'DB', 'Dana Brooks', 'You: Here is the link', '55m')}`, { style: 'position:absolute;left:230px;top:0' })}
    <div class="float" style="left:600px;top:40px;width:100px;height:100px;border-radius:50%;background:linear-gradient(160deg,#FFD56B,#FFB317);color:#1E1233;display:grid;place-items:center;font-family:Sora;font-weight:800;font-size:44px;box-shadow:0 20px 34px -12px rgba(10,4,24,.7),inset 0 3px 6px rgba(255,255,255,.6)">2</div>
    ${notif('3d:stopwatch', 'Avg. reply time', '14 minutes', 'left:0;top:520px')}${obj('envelope', 170, 'left:20px;top:180px;transform:rotate(-10deg)')}${brand('instagram', 82, 'position:absolute;right:40px;top:300px;z-index:5;transform:rotate(6deg)')}${brand('facebook', 82, 'position:absolute;right:90px;top:420px;z-index:5;transform:rotate(-6deg)')}${brand('whatsapp', 82, 'position:absolute;right:30px;top:540px;z-index:5;transform:rotate(4deg)')}` };
};

// 19. Audience question
V[19] = () => {
  const opt = (t, p, top) => `<div style="position:relative;height:66px;border-radius:15px;background:#F1EFFB;overflow:hidden;margin-top:14px"><div style="position:absolute;inset:0;width:${p}%;background:${top ? 'linear-gradient(90deg,#FFB317,#FFCB55)' : '#DCD7F0'}"></div><div class="row" style="position:relative;justify-content:space-between;height:100%;padding:0 22px;font-size:21px;font-weight:600;color:#1E1233"><span>${t}</span><span class="ttl">${p}%</span></div></div>`;
  return { w: 860, h: 620, html: `
    <div class="card" style="position:absolute;left:150px;top:40px;width:560px;padding:32px;transform:rotate(-2deg)">
      <div class="ttl" style="font-size:28px;text-align:center;margin-bottom:10px">What should we cover next?</div>
      ${opt('Websites', 22)}${opt('Social media', 31)}${opt('Paid ads', 17)}${opt('Automation', 30, true)}
      <div class="muted" style="text-align:center;font-size:16px;margin-top:16px">1,284 votes</div>
    </div>
    ${obj('raisehand', 170, 'left:-20px;top:150px')}${obj('question', 120, 'right:20px;top:400px;transform:rotate(12deg)')}
    <div class="float" style="left:20px;top:420px;padding:18px 24px;border-radius:22px 22px 22px 6px;background:linear-gradient(180deg,#4E3479,#412B67);color:#fff;font-size:19px;box-shadow:0 18px 30px -12px rgba(65,43,103,.6)">More on GHL workflows please!</div>
    <div class="float" style="right:10px;top:10px;padding:18px 24px;border-radius:22px 22px 6px 22px;background:#fff;color:#111;font-size:19px;box-shadow:var(--shadow-light)">Ads for local businesses</div>
    ${floor}` };
};

// 20. Analytics
V[20] = () => {
  const bars = [38, 52, 44, 70, 58, 92, 66];
  const stat = (icon, t, v, d) => `<div style="flex:1;padding:16px;border-radius:15px;background:#F6F6FF"><div class="row" style="gap:8px;color:#5E5675;font-size:16px;font-weight:600">${ic(icon)} ${t}</div><div class="ttl" style="font-size:30px;margin-top:6px">${v}</div><div style="color:var(--ok);font-size:15px;font-weight:600">${ic('up')} ${d}</div></div>`;
  return { w: 900, h: 640, html: `
    <div class="card" style="position:absolute;left:40px;top:30px;width:820px;padding:28px">
      <div class="row" style="justify-content:space-between"><div class="row" style="gap:14px"><div class="ttl" style="font-size:25px">Monthly performance</div>${brand('instagram', 38)}${brand('facebook', 38)}${brand('tiktok', 38)}${brand('youtube', 38)}</div><span class="pill soft" style="font-size:16px;padding:8px 14px">${ic('cal')} Last 30 days</span></div>
      <div class="row" style="gap:14px;margin:20px 0">${stat('bookmark', 'Saves', '1,920', '+34%')}${stat('share', 'Shares', '846', '+21%')}${stat('clock', 'Watch time', '41h', '+18%')}</div>
      ${obj('search', 170, 'right:-50px;top:250px;transform:rotate(-8deg)')}
      <div style="display:flex;align-items:flex-end;gap:22px;height:190px;padding:0 10px;border-bottom:2px solid #EEECF5">${bars.map((b, i) => `<div style="flex:1;height:${b}%;border-radius:10px 10px 4px 4px;background:${i === 5 ? 'linear-gradient(180deg,#FFCB55,#FFB317)' : 'linear-gradient(180deg,#6A4BA0,#412B67)'};position:relative">${i === 5 ? '<div class="pill purple" style="position:absolute;top:-42px;left:50%;transform:translateX(-50%);font-size:14px;padding:6px 10px">Top reel</div>' : ''}</div>`).join('')}</div>
    </div>
    ${floor}` };
};

// 21. Video editing
V[21] = () => {
  const clip = (w, c, t) => `<div style="width:${w}px;height:46px;border-radius:8px;background:${c};color:#fff;font-size:13px;font-weight:600;padding:6px 10px;flex:none;overflow:hidden;white-space:nowrap">${t}</div>`;
  let wave = '';
  for (let i = 0; i < 90; i++) wave += `<div style="width:4px;border-radius:2px;background:#FFB317;height:${8 + Math.abs(Math.sin(i * 0.7) * 26 + Math.sin(i * 0.23) * 10)}px"></div>`;
  return { w: 940, h: 660, html: `
    <div class="card-dark" style="position:absolute;left:30px;top:20px;width:880px;padding:22px;background:linear-gradient(180deg,#1E1233,#170D29)">
      <div style="height:330px;border-radius:12px;position:relative;overflow:hidden;background:radial-gradient(80% 90% at 70% 30%,#6A4BA0,#2F1E4C 60%,#170D29)">
        <div style="position:absolute;left:40px;top:40px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#FFD56B,#FFB317 50%,rgba(255,179,23,0) 72%);opacity:.5;filter:blur(10px)"></div>
        <div style="position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:96px;height:96px;border-radius:50%;background:rgba(255,255,255,.95);display:grid;place-items:center;color:#412B67;font-size:40px;box-shadow:0 14px 30px rgba(0,0,0,.4)">${ic('play')}</div>
        <div style="position:absolute;left:50%;bottom:30px;transform:translateX(-50%);padding:10px 20px;border-radius:10px;background:#FFB317;color:#1E1233;font-family:Sora;font-weight:800;font-size:28px;white-space:nowrap">THIS CHANGED EVERYTHING</div>
      </div>
      <div class="row" style="justify-content:space-between;color:#fff;margin:16px 4px 10px;font-size:15px;opacity:.8"><span>${ic('scissors')} 00:14:22</span><span>1080 x 1920 &nbsp; 60 fps</span></div>
      <div style="position:relative;display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;gap:6px">${clip(180, '#6A4BA0', 'Hook')}${clip(240, '#5A3D8A', 'B-roll')}${clip(150, '#6A4BA0', 'Demo')}${clip(250, '#5A3D8A', 'CTA')}</div>
        <div style="display:flex;gap:6px">${clip(300, '#C98300', 'Captions')}${clip(200, '#C98300', 'Captions')}${clip(280, '#C98300', 'Captions')}</div>
        <div style="display:flex;gap:3px;align-items:center;height:46px;padding:0 6px;border-radius:8px;background:rgba(255,179,23,.12)">${wave}</div>
        <div style="position:absolute;left:330px;top:-8px;bottom:-8px;width:3px;background:#fff;border-radius:2px"><div style="width:16px;height:16px;border-radius:4px;background:#fff;margin:-6px 0 0 -6.5px"></div></div>
      </div>
    </div>
    <div class="float pill gold" style="right:0;top:0;font-size:19px;padding:12px 20px;box-shadow:0 12px 22px -10px rgba(0,0,0,.5)">${ic('wave')} SFX added</div>
    ${obj('clapper', 160, 'left:-30px;top:-30px;transform:rotate(-12deg)')}${obj('headphones', 150, 'right:-20px;top:400px')}` };
};

// 22. Graphic design: clear first
V[22] = () => ({ w: 920, h: 660, html: `
  ${browser('yourbusiness.com', `<div style="padding:30px 40px 36px;position:relative">
    <div class="row" style="justify-content:space-between;margin-bottom:34px"><div style="width:110px;height:22px;border-radius:6px;background:#412B67"></div><div class="row" style="gap:16px">${'<div style="width:60px;height:10px;border-radius:5px;background:#E2DFF0"></div>'.repeat(3)}</div></div>
    <div class="ttl" style="font-size:40px;line-height:1.12;max-width:360px">We fix leaky roofs in 48 hours.</div>
    <div style="height:12px;width:360px;border-radius:6px;background:#E2DFF0;margin:20px 0 10px"></div><div style="height:12px;width:280px;border-radius:6px;background:#E2DFF0"></div>
    <div style="margin-top:28px;display:inline-block;padding:16px 28px;border-radius:999px;background:#412B67;color:#fff;font-weight:700;font-size:18px">Get a free quote</div>
    <div style="position:absolute;right:40px;top:130px;width:200px;height:200px;border-radius:15px;background:linear-gradient(150deg,#EDEAFB,#DCD7F0)"></div>
  </div>`, 'position:absolute;left:60px;top:40px;width:680px')}
  <div class="float" style="left:84px;top:150px;width:420px;height:300px;border:3px solid #FFB317;border-radius:15px"></div>
  <div class="float pill gold" style="left:330px;top:132px;font-size:16px;padding:6px 12px">Message first</div>
  <div class="float card" style="right:0;top:220px;padding:22px;display:flex;flex-direction:column;gap:12px;align-items:center;opacity:.9"><div class="muted" style="font-size:15px;font-weight:600">Colors later</div>${['#412B67', '#FFB317', '#F6F6FF', '#1E1233'].map((c) => `<div style="width:64px;height:40px;border-radius:10px;background:${c};border:1px solid #E2DFF0"></div>`).join('')}</div>
  ${obj('palette', 150, 'right:-20px;top:60px;transform:rotate(10deg)')}${obj('ruler', 120, 'left:560px;top:480px')}
  <div class="float card-dark" style="left:0;top:480px;padding:18px 22px;display:flex;align-items:center;gap:12px"><img src="assets/3d/hourglass.png" style="width:44px;filter:drop-shadow(0 8px 8px rgba(30,10,60,.3))"><span class="ttl" style="font-size:24px">5 second test</span></div>
  ${floor}` });

// 23. WordPress speed
V[23] = () => {
  const r = 150, c = 2 * Math.PI * r, pct = 0.98, arc = c * 0.75;
  const metric = (t, v) => `<div style="flex:1;padding:14px;border-radius:15px;background:rgba(255,255,255,.07);border:1.5px solid #4C3770;text-align:center"><div style="font-size:15px;opacity:.75">${t}</div><div class="ttl" style="font-size:26px;color:#fff">${v}</div></div>`;
  return { w: 860, h: 640, html: `
    <div class="card-dark" style="position:absolute;left:130px;top:10px;width:600px;padding:30px;text-align:center">
      <div class="row" style="justify-content:center;gap:12px;font-size:17px;color:rgba(255,255,255,.85)">${brand('wordpress', 40)} yourbusiness.com</div>
      <div style="position:relative;width:340px;height:300px;margin:10px auto 0">
        <svg width="340" height="340" viewBox="0 0 340 340" style="transform:rotate(135deg)"><circle cx="170" cy="170" r="${r}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="26" stroke-dasharray="${arc} ${c}" stroke-linecap="round"/><circle cx="170" cy="170" r="${r}" fill="none" stroke="url(#gg)" stroke-width="26" stroke-dasharray="${arc * pct} ${c}" stroke-linecap="round"/><defs><linearGradient id="gg"><stop offset="0" stop-color="#FFCB55"/><stop offset="1" stop-color="#FFB317"/></linearGradient></defs></svg>
        <div style="position:absolute;left:0;right:0;top:96px;color:#fff"><div class="ttl" style="font-size:92px;line-height:1">98</div><div style="font-size:18px;opacity:.75">Performance</div></div>
      </div>
      <div class="row" style="gap:12px">${metric('Load time', '1.1s')}${metric('Page size', '780 KB')}${metric('Requests', '24')}</div>
    </div>
    ${obj('rocket', 190, 'right:-10px;top:-20px')}
    <div class="float pill gold" style="left:20px;top:110px;font-size:19px;padding:12px 20px;box-shadow:0 12px 22px -10px rgba(0,0,0,.5)">${ic('image')} Images compressed</div>
    <div class="float pill gold" style="right:10px;top:300px;font-size:19px;padding:12px 20px;box-shadow:0 12px 22px -10px rgba(0,0,0,.5)">${ic('zap')} Lean scripts</div>` };
};

// 24. Shopify
V[24] = () => ({ w: 920, h: 680, html: `
  <div class="card" style="position:absolute;left:80px;top:20px;width:720px;display:flex;overflow:hidden">
    <div style="width:330px;height:470px;background:radial-gradient(70% 60% at 50% 40%,#fff,#ECE9FA);position:relative;display:grid;place-items:center">
      <div style="position:relative;width:170px;height:260px">
        <div style="position:absolute;left:50px;top:0;width:70px;height:46px;border-radius:12px 12px 4px 4px;background:linear-gradient(90deg,#2F1E4C,#5A3D8A,#2F1E4C)"></div>
        <div style="position:absolute;left:0;top:40px;width:170px;height:220px;border-radius:40px 40px 26px 26px;background:linear-gradient(90deg,#2F1E4C 0%,#6A4BA0 35%,#8D6BD1 45%,#412B67 70%,#24163D 100%);box-shadow:0 30px 40px -16px rgba(40,20,80,.6)"></div>
        <div style="position:absolute;left:24px;top:110px;width:122px;height:90px;border-radius:10px;background:linear-gradient(180deg,#FFCB55,#FFB317);display:grid;place-items:center;font-family:Sora;font-weight:800;font-size:20px;color:#1E1233;letter-spacing:.06em">GLOW</div>
        <div style="position:absolute;left:40px;top:60px;width:18px;height:170px;border-radius:9px;background:linear-gradient(90deg,rgba(255,255,255,.0),rgba(255,255,255,.35),rgba(255,255,255,0))"></div>
      </div>
      <div style="position:absolute;bottom:60px;left:50%;transform:translateX(-50%);width:200px;height:24px;border-radius:50%;background:rgba(40,20,80,.25);filter:blur(8px)"></div>
    </div>
    <div style="flex:1;padding:34px 30px">
      <div class="row" style="gap:4px;color:#FFB317;font-size:20px">${ic('star').repeat(5)}<span class="muted" style="font-size:15px;margin-left:8px">(2,140)</span></div>
      <div class="ttl" style="font-size:30px;margin:10px 0 6px">Glow Serum</div>
      <div class="ttl" style="font-size:28px;color:var(--purple)">$34.00</div>
      <div class="muted" style="font-size:17px;line-height:1.5;margin:14px 0 22px">Lightweight daily serum. Ships in 24 hours. Free returns.</div>
      <div style="padding:18px;border-radius:999px;background:linear-gradient(180deg,#4E3479,#412B67);color:#fff;text-align:center;font-family:Sora;font-weight:700;font-size:20px;box-shadow:0 12px 24px -10px rgba(65,43,103,.7)">${ic('bag')} Add to cart</div>
      <div style="padding:16px;border-radius:999px;background:#FFB317;color:#1E1233;text-align:center;font-family:Sora;font-weight:700;font-size:18px;margin-top:12px">Buy now in 1 tap</div>
    </div>
  </div>
  ${obj('cart', 140, 'left:720px;top:-40px')}${brand('shopify', 84, 'position:absolute;left:40px;top:-20px;z-index:5;transform:rotate(-8deg)')}${obj('bags', 160, 'left:-20px;top:300px')}
  ${notif('3d:package', 'Order placed', 'Checkout in 38 seconds', 'left:120px;top:540px')}
  ${floor}` });

// 25. SEO and AEO
V[25] = () => ({ w: 920, h: 660, html: `
  <div class="card" style="position:absolute;left:60px;top:20px;width:800px;height:100px;border-radius:60px;display:flex;align-items:center;padding:0 36px;gap:22px">
    ${brand('google', 58)}<div style="width:2px;height:46px;background:#E2DFF0"></div>
    <span style="flex:1;font-size:27px;color:#1E1233">best family dentist near me</span><span style="font-size:34px;color:#412B67">${ic('mic')}</span>
  </div>
  <div class="card" style="position:absolute;left:60px;top:160px;width:420px;padding:24px">
    <div class="muted" style="font-size:15px;font-weight:600;letter-spacing:.08em">SEARCH RESULT</div>
    <div class="row" style="gap:12px;margin-top:12px"><div class="ttl" style="font-size:30px;color:var(--purple)">#1</div><div><div class="ttl" style="font-size:21px">Your Business</div><div style="font-size:15px;color:#137A4D">yourbusiness.com</div></div></div>
    <div class="row" style="gap:3px;color:#FFB317;font-size:18px;margin-top:10px">${ic('star').repeat(5)}<span class="muted" style="font-size:15px;margin-left:6px">4.9 (318)</span></div>
  </div>
  ${obj('search', 180, 'left:60px;top:380px;transform:rotate(-10deg)')}${obj('sparkles', 110, 'right:-20px;top:150px')}
  <div class="card-dark" style="position:absolute;left:440px;top:240px;width:420px;padding:24px">
    <div class="row" style="gap:10px;color:#FFB317;font-size:17px;font-weight:600"><img src="assets/3d/robot.png" style="width:34px;filter:drop-shadow(0 8px 8px rgba(30,10,60,.3))"> AI answer</div>
    <div style="font-size:18px;line-height:1.5;margin-top:10px;color:rgba(255,255,255,.9)">Top options nearby include <span style="background:#FFB317;color:#1E1233;border-radius:5px;padding:1px 6px;font-weight:700">Your Business</span>, known for same-week visits and strong reviews.</div>
    <div class="row" style="gap:8px;margin-top:14px"><span class="pill" style="font-size:13px;padding:6px 10px;background:rgba(255,255,255,.1);color:#fff">${ic('link')} yourbusiness.com</span></div>
  </div>
  ${floor}` });

// 26. Media buying
V[26] = () => {
  const ring = (s, c) => `<div style="position:absolute;left:50%;top:50%;width:${s}px;height:${s}px;margin:-${s / 2}px 0 0 -${s / 2}px;border-radius:50%;background:${c};box-shadow:inset 0 -8px 16px rgba(0,0,0,.18),inset 0 6px 10px rgba(255,255,255,.25)"></div>`;
  return { w: 900, h: 620, html: `
    <div class="float" style="left:40px;top:60px;width:440px;height:440px;filter:drop-shadow(0 30px 40px rgba(10,4,24,.6))">${ring(440, 'linear-gradient(160deg,#fff,#E7E4F4)')}${ring(350, 'linear-gradient(160deg,#6A4BA0,#412B67)')}${ring(260, 'linear-gradient(160deg,#fff,#E7E4F4)')}${ring(170, 'linear-gradient(160deg,#6A4BA0,#412B67)')}${ring(84, 'linear-gradient(160deg,#FFD56B,#FFB317)')}</div>
    <div class="float" style="left:250px;top:150px;width:180px;height:8px;background:linear-gradient(90deg,#1E1233,#5E5675);border-radius:4px;transform:rotate(-38deg);transform-origin:left center"><div style="position:absolute;right:-16px;top:-12px;width:0;height:0;border-left:22px solid #FFB317;border-top:16px solid transparent;border-bottom:16px solid transparent;filter:drop-shadow(0 2px 2px rgba(0,0,0,.4))"></div></div>
    ${obj('moneybag', 160, 'left:380px;top:400px')}${brand('facebook', 60, 'position:absolute;right:290px;top:-30px;z-index:5;transform:rotate(-8deg)')}${brand('google', 60, 'position:absolute;right:230px;top:-40px;z-index:6;transform:rotate(8deg)')}
    <div class="card" style="position:absolute;right:0;top:60px;width:360px;padding:24px">
      <div class="ttl" style="font-size:21px;margin-bottom:14px">Campaign results</div>
      ${[['Spend', '$1,000', '#1E1233'], ['Revenue', '$4,200', '#137A4D'], ['ROAS', '4.2x', '#412B67']].map(([a, b, c]) => `<div class="row" style="justify-content:space-between;padding:12px 0;border-top:1px solid #EEECF5"><span class="muted" style="font-size:18px">${a}</span><span class="ttl" style="font-size:26px;color:${c}">${b}</span></div>`).join('')}
      <div class="row" style="gap:10px;margin-top:14px"><span class="pill green" style="font-size:15px;padding:8px 12px">${ic('up')} Scale</span><span class="pill red" style="font-size:15px;padding:8px 12px">${ic('x')} Cut 2 ad sets</span></div>
    </div>` };
};

// 27. n8n and automation
V[27] = () => {
  const n = (icon, t, s, x, y, gold) => `<div class="float card" style="left:${x}px;top:${y}px;width:220px;padding:18px;display:flex;gap:14px;align-items:center;${gold ? 'outline:3px solid #FFB317' : ''}">${icon.startsWith('b:') ? brand(icon.slice(2), 58) : tile(icon, 58, gold ? 'gold' : '')}<div><div class="ttl" style="font-size:19px">${t}</div><div class="muted" style="font-size:14px">${s}</div></div></div>`;
  return { w: 940, h: 600, html: `
    <div class="float" style="inset:0;border-radius:20px;background-image:radial-gradient(var(--dots) 1.5px,transparent 1.5px);background-size:26px 26px"></div>
    <svg class="float" style="left:0;top:0" width="940" height="600" fill="none" stroke="var(--line)" stroke-width="3.5"><path d="M240 300 C 300 300 300 300 360 300"/><path d="M580 300 C 640 300 640 130 700 130"/><path d="M580 300 C 640 300 640 300 700 300"/><path d="M580 300 C 640 300 640 470 700 470"/></svg>
    ${n('memo', 'Form', 'New submission', 20, 255, true)}${n('cabinet', 'CRM', 'Create contact', 360, 255)}${n('b:gmail', 'Gmail', 'Send welcome', 700, 85)}${n('b:googlesheets', 'Sheets', 'Add row', 700, 255)}${n('bell', 'Team alert', 'Notify sales', 700, 425)}${brand('n8n', 96, 'position:absolute;left:420px;top:110px;z-index:5;transform:rotate(-6deg)')}${obj('plug', 140, 'left:60px;top:70px;transform:rotate(-20deg)')}
    <div class="float pill gold" style="left:330px;top:440px;font-size:19px;padding:12px 20px;box-shadow:0 12px 22px -10px rgba(0,0,0,.35)">${ic('zap')} 0 manual copy-paste</div>` };
};

// 28. Appointment setting
V[28] = () => {
  let cells = '';
  const booked = [2, 3, 5, 8, 9, 10, 12, 15, 16, 17, 19, 22, 23, 24, 26];
  for (let i = 1; i <= 28; i++) cells += `<div style="height:52px;border-radius:10px;display:grid;place-items:center;font-size:17px;font-weight:600;${booked.includes(i) ? 'background:linear-gradient(160deg,#FFD25E,#FFB317);color:#1E1233;box-shadow:0 6px 10px -6px rgba(200,120,0,.7)' : 'background:#F6F6FF;color:#5E5675'}">${i}</div>`;
  return { w: 900, h: 640, html: `
    <div class="card" style="position:absolute;left:40px;top:30px;width:520px;padding:26px">
      <div class="row" style="justify-content:space-between;margin-bottom:16px"><div class="ttl" style="font-size:24px">February</div><span class="pill green" style="font-size:15px;padding:7px 12px">15 booked</span></div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => `<div style="text-align:center;font-size:14px;color:#8A84A0;font-weight:600">${d}</div>`).join('')}${cells}</div>
    </div>
    <div class="card-dark" style="position:absolute;right:0;top:120px;width:320px;padding:24px;text-align:center">
      <div style="width:84px;margin:0 auto">${av(5, 'JT', 84)}</div>
      <div class="ttl" style="font-size:22px;margin-top:14px">Jordan Tate</div><div style="font-size:15px;opacity:.75">Calling... 00:42</div>
      <div class="row" style="justify-content:center;gap:16px;margin-top:18px"><div style="width:58px;height:58px;border-radius:50%;background:#E5484D;display:grid;place-items:center;font-size:26px;transform:rotate(135deg)">${ic('phone')}</div><div style="width:58px;height:58px;border-radius:50%;background:#22A06B;display:grid;place-items:center;font-size:26px">${ic('phone')}</div></div>
    </div>
    ${notif('3d:check', 'Call booked', 'Thu, Feb 22 at 10:00 AM', 'left:300px;top:520px')}${obj('phone', 140, 'left:-40px;top:450px;transform:rotate(-10deg)')}` };
};

// 29. Dedicated VAs
V[29] = () => ({ w: 900, h: 660, html: `
  <div class="card" style="position:absolute;left:60px;top:30px;width:480px;padding:28px">
    <div class="row" style="gap:18px">${tile('technologist', 90)}<div><div class="ttl" style="font-size:25px">Aisha M.</div><div class="muted" style="font-size:17px">Dedicated VA, CRM and admin</div><div class="row" style="gap:8px;margin-top:8px"><span style="width:10px;height:10px;border-radius:50%;background:#22A06B"></span><span style="font-size:15px;font-weight:600;color:#137A4D">Working now</span></div></div></div>
    <div style="margin:22px 0;padding:18px;border-radius:15px;background:#F6F6FF;display:flex;justify-content:space-between;align-items:center"><div><div class="muted" style="font-size:15px">Tracked today</div><div class="ttl" style="font-size:36px;font-variant-numeric:tabular-nums">04:32:18</div></div><img src="assets/3d/stopwatch.png" style="width:80px;filter:drop-shadow(0 8px 8px rgba(30,10,60,.3))"></div>
    <div class="ttl" style="font-size:19px;margin-bottom:8px">Daily update</div>
    ${['Inbox cleared, 48 emails', 'CRM updated, 22 leads', 'Calendar booked for Friday'].map((t) => `<div class="row" style="gap:12px;padding:8px 0;font-size:18px"><div class="chk" style="width:32px;height:32px">${ic('check')}</div>${t}</div>`).join('')}
  </div>
  ${obj('briefcase', 120, 'right:30px;top:-40px;transform:rotate(-8deg)')}
  <div class="card-dark" style="position:absolute;right:20px;top:110px;width:300px;padding:22px">
    <div style="font-size:15px;opacity:.75">Project manager</div>
    <div class="row" style="gap:12px;margin-top:10px">${av(1, 'PM', 52)}<div><div class="ttl" style="font-size:19px">Daniel R.</div><div style="font-size:14px;opacity:.75">Reviews every task</div></div></div>
  </div>
  <div class="float" style="right:40px;top:330px;width:200px;height:200px;border-radius:50%;background:linear-gradient(160deg,#FFD56B,#FFB317 60%,#F0A000);box-shadow:0 30px 50px -18px rgba(160,90,0,.7),inset 0 4px 10px rgba(255,255,255,.6);display:grid;place-items:center;text-align:center;color:#1E1233"><div><div style="font-size:16px;font-weight:600">from</div><div class="ttl" style="font-size:58px;line-height:1">$5</div><div style="font-size:16px;font-weight:600">per hour</div></div></div>
  ${floor}` });

// 30. White-label fulfillment
V[30] = () => {
  const svc = (icon, t, s) => `<div class="row" style="gap:16px;padding:16px 0;border-top:1px solid #EEECF5"><div style="width:52px;height:52px;border-radius:14px;display:grid;place-items:center;background:#F1EFFB;color:#412B67;font-size:26px">${ic(icon)}</div><div style="flex:1"><div class="ttl" style="font-size:20px">${t}</div><div class="muted" style="font-size:15px">${s}</div></div><span class="pill green" style="font-size:14px;padding:7px 12px">${ic('check')} Delivered</span></div>`;
  return { w: 900, h: 660, html: `
    <div class="card-dark" style="position:absolute;left:210px;top:0;width:500px;height:520px;transform:rotate(6deg);opacity:.7"></div>
    <div class="card-dark" style="position:absolute;left:190px;top:10px;width:520px;height:520px;transform:rotate(3deg);opacity:.85"></div>
    <div class="card" style="position:absolute;left:170px;top:30px;width:560px;padding:28px">
      <div class="row" style="justify-content:space-between;margin-bottom:10px"><div style="padding:10px 18px;border-radius:10px;border:2.5px dashed #B9B3D1;font-family:Sora;font-weight:800;font-size:16px;color:#8A84A0;letter-spacing:.08em">YOUR AGENCY</div><span class="muted" style="font-size:15px">Client report</span></div>
      <div class="ttl" style="font-size:26px;margin:10px 0 6px">Delivered this month</div>
      ${svc('chart', 'Marketing', 'Ads, social, content')}${svc('db', 'CRM', 'GHL builds and automations')}${svc('layout', 'Development', 'Websites and landing pages')}
    </div>
    ${obj('package', 180, 'left:-10px;top:170px;transform:rotate(-6deg)')}${obj('label', 120, 'right:60px;top:-80px;transform:rotate(14deg)')}
    <div class="float" style="left:0;top:420px;padding:20px 26px;border-radius:15px;background:linear-gradient(180deg,#FFCB55,#FFB317);color:#1E1233;box-shadow:0 20px 36px -14px rgba(10,4,24,.7)"><div style="font-size:15px;font-weight:600">New hires needed</div><div class="ttl" style="font-size:44px;line-height:1">0</div></div>` };
};

module.exports = V;
