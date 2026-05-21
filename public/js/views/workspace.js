import { projects as projApi, workspaces as wsApi } from '../api.js';
import { getState } from '../state.js';
import { formModal, confirmModal, closeModal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { navigate } from '../app.js';

export async function renderWorkspace(container, workspaceId) {
  const ws = getState().workspaces.find(w => w.id === workspaceId);
  const wsName = ws?.name || 'Workspace';

  container.innerHTML = `
    <div class="page-header">
      <div>
        <div class="breadcrumb"><a href="#dashboard">Home</a><span>›</span><span>${esc(wsName)}</span></div>
        <h2 style="margin-top:4px">${esc(wsName)}</h2>
      </div>
      <button class="btn btn-primary" id="ws-new-proj">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Project
      </button>
    </div>
    <div id="proj-grid" class="project-grid"><div class="text-muted">Loading…</div></div>`;

  container.querySelector('#ws-new-proj').onclick = () => showNewProjectModal(workspaceId, container);
  await refreshProjects(container, workspaceId);
}

async function refreshProjects(container, workspaceId) {
  try {
    const projs = await projApi.list(workspaceId);
    renderProjects(container, projs, workspaceId);
  } catch {
    container.querySelector('#proj-grid').innerHTML = `<p class="text-muted">Failed to load projects.</p>`;
  }
}

function renderProjects(container, projs, workspaceId) {
  const grid = container.querySelector('#proj-grid');
  if (!projs.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
        <h3>No projects yet</h3>
        <p>Create a project to start adding tasks</p>
      </div>`;
    return;
  }

  grid.innerHTML = projs.map(p => `
    <div class="project-card" data-proj-id="${p.id}" style="--proj-color:${p.color}">
      <div class="project-card-stripe" style="height:3px;background:${p.color};margin:-16px -16px 16px;border-radius:var(--radius) var(--radius) 0 0"></div>
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
        <div class="project-card-name">${esc(p.name)}</div>
        <div style="display:flex;gap:2px;flex-shrink:0">
          <button class="icon-btn" onclick="event.stopPropagation();editProj('${p.id}')" title="Edit">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn" onclick="event.stopPropagation();deleteProj('${p.id}','${esc(p.name)}')" title="Delete">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
          </button>
        </div>
      </div>
      <div class="project-card-desc">${esc(p.description || '')}</div>
      <div class="project-card-footer">
        <span class="task-count-badge">${p.task_count} task${p.task_count !== 1 ? 's' : ''}</span>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          ${(p.stages || []).slice(0,3).map(s => `<span style="width:8px;height:8px;border-radius:50%;background:${s.color};display:inline-block" title="${esc(s.name)}"></span>`).join('')}
        </div>
      </div>
    </div>`).join('');

  grid.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => navigate(`project/${card.dataset.projId}`));
  });

  window.editProj = (id) => {
    const p = projs.find(x => x.id === id);
    if (!p) return;
    formModal({
      title: 'Edit Project',
      fields: [
        { name: 'name', label: 'Name', value: p.name },
        { name: 'description', label: 'Description', type: 'textarea', value: p.description },
        { name: 'color', label: 'Color', type: 'color', value: p.color },
      ],
      submitLabel: 'Save',
      onSubmit: async (data) => {
        try { await projApi.update(id, data); closeModal(); toast('Project updated', 'success'); await refreshProjects(container, workspaceId); }
        catch (e) { toast(e.message, 'error'); }
      },
    });
  };

  window.deleteProj = (id, name) => {
    confirmModal(`Delete project "<strong>${name}</strong>" and all its tasks?`, async () => {
      try { await projApi.remove(id); toast('Project deleted', 'success'); await refreshProjects(container, workspaceId); }
      catch (e) { toast(e.message, 'error'); }
    });
  };
}

function showNewProjectModal(workspaceId, container) {
  formModal({
    title: 'New Project',
    fields: [
      { name: 'name', label: 'Name', placeholder: 'e.g. Website Redesign' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What is this project about?' },
      { name: 'color', label: 'Color', type: 'color', value: '#6366f1' },
    ],
    submitLabel: 'Create',
    onSubmit: async (data) => {
      if (!data.name?.trim()) return toast('Name is required', 'error');
      try {
        const p = await projApi.create({ ...data, workspace_id: workspaceId });
        closeModal();
        toast('Project created', 'success');
        navigate(`project/${p.id}`);
      } catch (e) { toast(e.message, 'error'); }
    },
  });
}

function esc(str) { return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
