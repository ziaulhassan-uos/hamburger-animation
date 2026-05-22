import * as authApi from './api.js';
import { getState, setState } from './state.js';
import { toast } from './components/toast.js';
import { renderDashboard } from './views/dashboard.js';
import { renderWorkspace } from './views/workspace.js';
import { renderBoard } from './views/board.js';
import { renderAllTasks } from './views/all-tasks.js';
import { renderSettings } from './views/settings.js';
import { workspaces as wsApi, ghl as ghlApi } from './api.js';

// ── Bootstrap ─────────────────────────────────────────────────────────────────

async function boot() {
  try {
    const { authenticated, account } = await authApi.auth.me();

    if (!authenticated) {
      showAuthScreen();
      return;
    }

    setState({ account });
    showMainApp(account);
    setupTopbarFilters(account);

    // Load workspaces & GHL users in parallel
    const [wsList] = await Promise.all([
      wsApi.list(),
      loadGhlData(account),
    ]);
    setState({ workspaces: wsList });
    renderSidebar();

    // Route to current hash
    routeHash(window.location.hash);
  } catch (e) {
    console.error('Boot error', e);
    showAuthScreen();
  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}

// ── Auth screen ───────────────────────────────────────────────────────────────

function showAuthScreen() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('auth-screen').classList.remove('hidden');

  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');
  if (error) {
    const el = document.getElementById('auth-error');
    el.textContent = error === 'oauth_denied'
      ? 'OAuth cancelled — please try again.'
      : 'GHL connection failed. Check your credentials and try again.';
    el.classList.remove('hidden');
  }
}

function showMainApp(account) {
  document.getElementById('main-app').classList.remove('hidden');

  // Populate account badge
  document.getElementById('account-name').textContent = account.name || account.email || 'User';
  document.getElementById('account-type').textContent = account.type === 'agency' ? 'Agency' : 'Sub-account';
  document.getElementById('account-avatar').textContent = initials(account.name || 'U');

  // Sidebar toggle
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });

  // New workspace button in sidebar
  document.getElementById('new-workspace-btn').addEventListener('click', () => {
    navigate('dashboard');
    setTimeout(() => document.getElementById('dash-new-ws')?.click(), 100);
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await authApi.auth.logout();
    window.location.reload();
  });

  // Navigation items
  document.getElementById('sidebar').addEventListener('click', e => {
    const item = e.target.closest('[data-view]');
    if (item) {
      e.preventDefault();
      navigate(item.dataset.view);
    }
  });

  // Hash-based routing
  window.addEventListener('hashchange', () => routeHash(window.location.hash));
}

// ── GHL data ──────────────────────────────────────────────────────────────────

async function loadGhlData(account) {
  try {
    if (account.type === 'agency') {
      const locations = await ghlApi.locations();
      setState({ ghlLocations: Array.isArray(locations) ? locations : [] });
    }
    const users = await ghlApi.users();
    setState({ ghlUsers: Array.isArray(users) ? users : [] });
  } catch {
    // GHL not connected or missing scopes — non-fatal
  }
}

// ── Top bar filters ───────────────────────────────────────────────────────────

function setupTopbarFilters(account) {
  const agencyFilter = document.getElementById('agency-filter');
  const userFilter = document.getElementById('user-filter');

  if (account.type === 'agency') agencyFilter.classList.remove('hidden');
  userFilter.classList.remove('hidden');

  document.getElementById('location-filter').addEventListener('change', e => {
    setState({ filterLocationId: e.target.value });
    rerenderCurrentView();
  });

  document.getElementById('assignee-filter').addEventListener('change', e => {
    setState({ filterAssigneeId: e.target.value });
    rerenderCurrentView();
  });

  // Populate after GHL data loads (wait for DOM update)
  setTimeout(() => {
    const { ghlLocations, ghlUsers } = getState();
    const locSel = document.getElementById('location-filter');
    ghlLocations.forEach(loc => {
      const o = document.createElement('option');
      o.value = loc.id; o.textContent = loc.name || loc.id;
      locSel.appendChild(o);
    });

    const userSel = document.getElementById('assignee-filter');
    ghlUsers.forEach(u => {
      const o = document.createElement('option');
      o.value = u.id; o.textContent = u.name || u.email || u.id;
      userSel.appendChild(o);
    });
  }, 2000);
}

// ── Router ────────────────────────────────────────────────────────────────────

let currentView = null;

function routeHash(hash) {
  const path = (hash || '#dashboard').replace(/^#/, '');
  const [view, id] = path.split('/');

  // Mark active nav items
  document.querySelectorAll('.nav-item[data-view]').forEach(el => {
    el.classList.toggle('active', el.dataset.view === view);
  });

  currentView = { view, id };
  const container = document.getElementById('view');
  const title = document.getElementById('page-title');

  switch (view) {
    case 'workspace':
      title.textContent = getState().workspaces.find(w => w.id === id)?.name || 'Workspace';
      renderWorkspace(container, id);
      break;
    case 'project':
      title.textContent = 'Project Board';
      renderBoard(container, id);
      break;
    case 'all-tasks':
      title.textContent = 'All Tasks';
      renderAllTasks(container);
      break;
    case 'settings':
      title.textContent = 'Settings';
      renderSettings(container);
      break;
    default:
      title.textContent = 'Dashboard';
      renderDashboard(container);
  }
}

function rerenderCurrentView() {
  if (currentView) routeHash(`#${currentView.view}${currentView.id ? '/' + currentView.id : ''}`);
}

export function navigate(path) {
  window.location.hash = path;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function renderSidebar() {
  const { workspaces } = getState();
  const list = document.getElementById('workspace-list');
  if (!list) return;

  const hash = window.location.hash.replace(/^#/, '');

  list.innerHTML = workspaces.map(ws => `
    <div class="workspace-item ${hash === `workspace/${ws.id}` ? 'active' : ''}" data-nav="workspace/${ws.id}">
      <span class="workspace-dot" style="background:${ws.color}"></span>
      <span class="workspace-name">${esc(ws.name)}</span>
      <span class="workspace-count">${ws.project_count}</span>
    </div>
  `).join('');

  list.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.nav));
  });
}

// Expose so dashboard view can call it
window.__refreshSidebar = renderSidebar;

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name) {
  const parts = (name || '').trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (name || 'U').slice(0, 2).toUpperCase();
}

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Start ─────────────────────────────────────────────────────────────────────
boot();
