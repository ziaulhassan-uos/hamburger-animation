const overlay = () => document.getElementById('modal-overlay');
const box     = () => document.getElementById('modal-box');

let closeCallback = null;

export function openModal(contentEl, { onClose } = {}) {
  closeCallback = onClose || null;
  box().innerHTML = '';
  box().appendChild(contentEl);
  overlay().classList.remove('hidden');
  overlay().onclick = e => { if (e.target === overlay()) closeModal(); };
  document.addEventListener('keydown', onEsc);
}

export function closeModal() {
  overlay().classList.add('hidden');
  box().innerHTML = '';
  document.removeEventListener('keydown', onEsc);
  closeCallback?.();
  closeCallback = null;
}

function onEsc(e) { if (e.key === 'Escape') closeModal(); }

export function confirmModal(message, onConfirm) {
  const el = document.createElement('div');
  el.className = 'modal modal-sm';
  el.innerHTML = `
    <div class="modal-header">
      <h3>Confirm</h3>
      <button class="modal-close" data-close>×</button>
    </div>
    <p style="color:var(--text-secondary);font-size:14px;line-height:1.6">${message}</p>
    <div class="modal-footer">
      <button class="btn btn-secondary" data-close>Cancel</button>
      <button class="btn btn-danger" data-confirm>Delete</button>
    </div>
  `;
  el.querySelector('[data-close]').onclick = closeModal;
  el.querySelector('[data-confirm]').onclick = () => { closeModal(); onConfirm(); };
  openModal(el);
}

// ── Generic form modal ────────────────────────────────────────────────────────
export function formModal({ title, fields, submitLabel = 'Save', onSubmit }) {
  const el = document.createElement('div');
  el.className = 'modal modal-md';

  const fieldHtml = fields.map(f => {
    if (f.type === 'color') {
      return `
        <div class="form-group">
          <label>${f.label}</label>
          <div class="color-swatches" data-field="${f.name}">
            ${COLORS.map(c => `<div class="color-swatch${c === f.value ? ' selected' : ''}" data-color="${c}" style="background:${c}" title="${c}"></div>`).join('')}
          </div>
          <input type="hidden" name="${f.name}" value="${f.value || COLORS[0]}">
        </div>`;
    }
    if (f.type === 'select') {
      return `<div class="form-group"><label>${f.label}</label>
        <select name="${f.name}" class="form-control">
          ${f.options.map(o => `<option value="${o.value}"${o.value === f.value ? ' selected' : ''}>${o.label}</option>`).join('')}
        </select></div>`;
    }
    if (f.type === 'textarea') {
      return `<div class="form-group"><label>${f.label}</label>
        <textarea name="${f.name}" class="form-control" rows="3" placeholder="${f.placeholder || ''}">${f.value || ''}</textarea></div>`;
    }
    return `<div class="form-group"><label>${f.label}</label>
      <input name="${f.name}" type="${f.type || 'text'}" class="form-control" value="${f.value || ''}" placeholder="${f.placeholder || ''}"></div>`;
  }).join('');

  el.innerHTML = `
    <div class="modal-header">
      <h3>${title}</h3>
      <button class="modal-close" data-close>×</button>
    </div>
    <form id="modal-form">${fieldHtml}</form>
    <div class="modal-footer">
      <button class="btn btn-secondary" data-close>Cancel</button>
      <button class="btn btn-primary" data-submit>${submitLabel}</button>
    </div>
  `;

  el.querySelector('[data-close]').onclick = closeModal;
  el.querySelector('[data-submit]').onclick = () => {
    const form = el.querySelector('#modal-form');
    const data = Object.fromEntries(new FormData(form));
    onSubmit(data);
  };

  // Color swatch interaction
  el.querySelectorAll('[data-field]').forEach(sw => {
    sw.addEventListener('click', e => {
      const swatch = e.target.closest('.color-swatch');
      if (!swatch) return;
      sw.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
      el.querySelector(`input[name="${sw.dataset.field}"]`).value = swatch.dataset.color;
    });
  });

  openModal(el);
}

const COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f43f5e','#ef4444',
  '#f97316','#f59e0b','#eab308','#84cc16','#22c55e',
  '#10b981','#14b8a6','#06b6d4','#0ea5e9','#3b82f6',
  '#6b7280','#475569',
];
