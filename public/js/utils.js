export function qs(sel, ctx = document) { return ctx.querySelector(sel); }
export function qsa(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

export function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const child of children.flat()) {
    if (child == null) continue;
    e.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return e;
}

export function html(strings, ...vals) {
  const raw = strings.reduce((acc, s, i) => acc + escape(vals[i - 1]) + s);
  const d = document.createElement('div');
  d.innerHTML = raw;
  return d.firstElementChild;
}

function escape(v) {
  if (v == null) return '';
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Produce raw HTML string (unsafe — only use with controlled data)
export function htmlStr(strings, ...vals) {
  return strings.reduce((acc, s, i) => acc + (vals[i - 1] ?? '') + s);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

export function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date() && new Date(dateStr).toDateString() !== new Date().toDateString();
}

export function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

export function priorityLabel(p) {
  return { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' }[p] || p;
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export const COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f43f5e','#ef4444',
  '#f97316','#f59e0b','#eab308','#84cc16','#22c55e',
  '#10b981','#14b8a6','#06b6d4','#0ea5e9','#3b82f6',
  '#6b7280','#475569','#1e293b',
];
