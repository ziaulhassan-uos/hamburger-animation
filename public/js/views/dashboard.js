import { workspaces as wsApi, projects as projApi } from '../api.js';
import { getState, setState } from '../state.js';
import { formModal, confirmModal, closeModal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { navigate } from '../app.js';

export async function renderDashboard(container) {
  container.innerHTML = `<div class="page-header">
    <div><h2>Dashboard</h2><p class="text-muted" style="margin-top:4px">All workspaces at a glance</p></div>
    <button class="btn btn-primary" id="dash-new-ws">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      New Workspace
    </button>
  </div>
  <div id="ws-grid" class="dashboard-grid"><div class="text-muted">Loading…</div></div>`;

  container.querySelector('#dash-new-ws').onclick = showNewWorkspaceModal;

  await refreshGrid(container);
}

async function refreshGrid(container) {
  try {
    const wsList = await wsApi.list();
    setState({ workspaces: wsList });
    renderGrid(container, wsList);
    renderSidebar();
  } catch (e) {
    container.querySelector('#ws-grid').innerHTML = `<p class="text-muted">Failed to load workspaces.</p>`;
  }
}

function renderGrid(container, wsList) {
  const grid = container.querySelector('#ws-grid');
  if (!wsList.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        <h3>No workspaces yet</h3>
        <p>Create a workspace to start organising your projects</p>
        <button class="btn btn-primary" onclick="document.getElementById('dash-new-ws').click()">Create workspace</button>
      </div>`;
    return;
  }
  grid.innerHTML = wsList.map(ws => `
    <div class="workspace-card" data-ws-id="${ws.id}">
      <div class="workspace-card-header">
        <div class="workspace-card-icon" style="background:${ws.color}22">
          <span style="font-size:20px">${ws.icon}</span>
        </div>
        <div style="flex:1;min-width:0">
          <div class="workspace-card-title">${esc(ws.name)}</div>
          ${ws.ghl_location_id ? `<div class="workspace-card-sub">📍 Sub-account</div>` : ''}
        </div>
        <div style="display:flex;gap:4px">
          <button class="icon-btn" title="Edit workspace" onclick="event.stopPropagation();editWs('${ws.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn" title="Delete workspace" onclick="event.stopPropagation();deleteWs('${ws.id}','${esc(ws.name)}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          </button>
        </div>
      </div>
      <div class="workspace-card-stats">
        <div class="stat">
          <span class="stat-value" style="color:${ws.color}">${ws.project_count}</span>
          <span class="stat-label">Projects</span>
        </div>
      </div>
    </div>
  `).join('');

  // Navigate on card click
  grid.querySelectorAll('.workspace-card').forEach(card => {
    card.addEventListener('click', () => navigate(`workspace/${card.dataset.wsId}`));
  });

  // Expose edit/delete to inline onclick handlers
  window.editWs = (id) => {
    const ws = getState().workspaces.find(w => w.id === id);
    if (!ws) return;
    showEditWorkspaceModal(ws, container);
  };
  window.deleteWs = (id, name) => {
    confirmModal(`Delete workspace "<strong>${name}</strong>" and all its projects?`, async () => {
      try { await wsApi.remove(id); toast('Workspace deleted', 'success'); await refreshGrid(container); }
      catch (e) { toast(e.message, 'error'); }
    });
  };
}

function showNewWorkspaceModal() {
  formModal({
    title: 'New Workspace',
    fields: [
      { name: 'name', label: 'Name', placeholder: 'e.g. Client Projects' },
      { name: 'icon', label: 'Icon (emoji)', placeholder: '🏢', value: '🏢' },
      { name: 'color', label: 'Color', type: 'color', value: '#6366f1' },
    ],
    submitLabel: 'Create',
    onSubmit: async (data) => {
      if (!data.name?.trim()) return toast('Name is required', 'error');
      try {
        const ws = await wsApi.create(data);
        setState({ workspaces: [...getState().workspaces, ws] });
        renderSidebar();
        closeModal();
        toast('Workspace created', 'success');
        navigate(`workspace/${ws.id}`);
      } catch (e) { toast(e.message, 'error'); }
    },
  });
}

function showEditWorkspaceModal(ws, container) {
  formModal({
    title: 'Edit Workspace',
    fields: [
      { name: 'name', label: 'Name', value: ws.name },
      { name: 'icon', label: 'Icon (emoji)', value: ws.icon },
      { name: 'color', label: 'Color', type: 'color', value: ws.color },
    ],
    submitLabel: 'Save',
    onSubmit: async (data) => {
      try {
        await wsApi.update(ws.id, data);
        closeModal();
        toast('Workspace updated', 'success');
        await refreshGrid(container);
      } catch (e) { toast(e.message, 'error'); }
    },
  });
}

function esc(str) { return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// Sidebar is rendered from app.js; expose a hook to refresh it
function renderSidebar() {
  window.__refreshSidebar?.();
}
