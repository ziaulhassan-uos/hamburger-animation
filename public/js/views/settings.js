import { ghl as ghlApi } from '../api.js';
import { getState } from '../state.js';
import { toast } from '../components/toast.js';

export async function renderSettings(container) {
  const { account } = getState();

  container.innerHTML = `
    <div class="page-header"><h2>Settings</h2></div>
    <div class="settings-grid">
      <div class="settings-nav">
        <div class="settings-nav-item active" data-section="ghl">GHL Integration</div>
        <div class="settings-nav-item" data-section="account">Account</div>
        ${account?.type === 'agency' ? '<div class="settings-nav-item" data-section="locations">Sub-accounts</div>' : ''}
      </div>
      <div id="settings-content"></div>
    </div>`;

  container.querySelectorAll('.settings-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      container.querySelectorAll('.settings-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      renderSection(container.querySelector('#settings-content'), item.dataset.section, account);
    });
  });

  renderSection(container.querySelector('#settings-content'), 'ghl', account);
}

async function renderSection(el, section, account) {
  if (section === 'ghl') renderGhlSection(el, account);
  else if (section === 'account') renderAccountSection(el, account);
  else if (section === 'locations') await renderLocationsSection(el, account);
}

function renderGhlSection(el, account) {
  el.innerHTML = `
    <div class="settings-section">
      <div class="settings-section-title">Go High Level Integration</div>
      <div class="settings-section-desc">Connect your GHL account to sync sub-accounts and users.</div>

      <div class="connection-status">
        <div class="status-dot ${account ? 'connected' : 'disconnected'}"></div>
        <div>
          <div class="status-text">${account ? '✓ Connected to GHL' : 'Not connected'}</div>
          ${account ? `<div class="text-muted" style="margin-top:2px">${account.email} · ${account.type === 'agency' ? 'Agency account' : 'Sub-account'}</div>` : ''}
        </div>
        ${account ? `<a href="/auth/login" class="btn btn-secondary btn-sm" style="margin-left:auto">Reconnect</a>` : `<a href="/auth/login" class="btn btn-primary btn-sm" style="margin-left:auto">Connect GHL</a>`}
      </div>

      <hr class="divider">

      <div class="settings-section-title" style="font-size:14px;margin-bottom:8px">OAuth Setup Guide</div>
      <ol style="padding-left:20px;font-size:13px;color:var(--text-secondary);line-height:2">
        <li>Go to <strong>GHL Marketplace → Apps</strong> and create a new private integration.</li>
        <li>Set the <strong>Redirect URI</strong> to: <code style="background:var(--bg);padding:2px 6px;border-radius:4px">${window.location.origin}/auth/callback</code></li>
        <li>Enable scopes: <code style="background:var(--bg);padding:2px 6px;border-radius:4px">businesses.readonly locations.readonly users.readonly contacts.readonly</code></li>
        <li>Copy the <strong>Client ID</strong> and <strong>Client Secret</strong> into your <code>.env</code> file.</li>
        <li>Restart the server and click <strong>Connect GHL</strong>.</li>
      </ol>
    </div>`;
}

function renderAccountSection(el, account) {
  el.innerHTML = `
    <div class="settings-section">
      <div class="settings-section-title">Account Details</div>
      <div class="settings-section-desc">Your current session information.</div>
      <table style="font-size:13px;border-collapse:collapse;width:100%">
        <tr><td style="padding:8px 0;color:var(--text-secondary);width:140px">Name</td><td style="font-weight:500">${esc(account?.name || '—')}</td></tr>
        <tr><td style="padding:8px 0;color:var(--text-secondary)">Email</td><td>${esc(account?.email || '—')}</td></tr>
        <tr><td style="padding:8px 0;color:var(--text-secondary)">Account type</td><td><span class="account-type" style="text-transform:capitalize">${account?.type || '—'}</span></td></tr>
        <tr><td style="padding:8px 0;color:var(--text-secondary)">GHL Company ID</td><td class="text-muted">${account?.ghl_company_id || 'N/A'}</td></tr>
        <tr><td style="padding:8px 0;color:var(--text-secondary)">GHL Location ID</td><td class="text-muted">${account?.ghl_location_id || 'N/A'}</td></tr>
      </table>
      <div style="margin-top:20px">
        <button class="btn btn-danger btn-sm" id="logout-settings-btn">Sign out</button>
      </div>
    </div>`;

  el.querySelector('#logout-settings-btn').onclick = async () => {
    await fetch('/auth/logout', { method: 'POST' });
    window.location.reload();
  };
}

async function renderLocationsSection(el, account) {
  el.innerHTML = `<div class="settings-section"><div class="text-muted">Loading sub-accounts…</div></div>`;
  try {
    const locations = await ghlApi.locations();
    el.innerHTML = `
      <div class="settings-section">
        <div class="settings-section-title">Sub-accounts (${locations.length})</div>
        <div class="settings-section-desc">All GHL locations linked to your agency.</div>
        <table class="locations-table">
          <thead><tr><th>Name</th><th>ID</th><th>Phone</th><th>Email</th></tr></thead>
          <tbody>
            ${locations.map(loc => `
              <tr>
                <td>${esc(loc.name || '—')}</td>
                <td class="text-muted">${loc.id}</td>
                <td class="text-muted">${esc(loc.phone || '—')}</td>
                <td class="text-muted">${esc(loc.email || '—')}</td>
              </tr>`).join('')}
          </tbody>
        </table>
        ${!locations.length ? '<p class="text-muted" style="margin-top:12px">No sub-accounts found. Make sure your GHL agency account is connected with the correct scopes.</p>' : ''}
      </div>`;
  } catch (e) {
    el.innerHTML = `<div class="settings-section"><p class="text-muted">Failed to load sub-accounts: ${e.message}</p></div>`;
  }
}

function esc(str) { return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
