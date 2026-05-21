import { projects as projApi, tasks as tasksApi, ghl as ghlApi } from '../api.js';
import { getState } from '../state.js';
import { openModal, closeModal, confirmModal, formModal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { formatDate, isOverdue, initials, priorityLabel } from '../utils.js';
import { navigate } from '../app.js';

let currentProject = null;
let allTasks = [];
let dragTask = null;
let ghlUsers = [];

export async function renderBoard(container, projectId) {
  container.innerHTML = `<div class="text-muted">Loading project…</div>`;

  try {
    currentProject = await projApi.get(projectId);
    allTasks = await tasksApi.list({ project_id: projectId });

    // Try to load GHL users for assignees
    try { ghlUsers = await ghlApi.users(); } catch { ghlUsers = []; }

    renderBoardUI(container);
  } catch (e) {
    container.innerHTML = `<p class="text-muted">Failed to load project: ${e.message}</p>`;
  }
}

function renderBoardUI(container) {
  const p = currentProject;
  const { filterLocationId, filterAssigneeId } = getState();

  const ws = getState().workspaces.find(w => {
    // find workspace that contains this project (we don't store it on the project)
    return true; // best effort
  });

  container.innerHTML = `
    <div class="page-header">
      <div>
        <div class="breadcrumb">
          <a href="#dashboard">Home</a><span>›</span>
          <a href="#workspace/${p.workspace_id}">${esc(getWorkspaceName(p.workspace_id))}</a>
          <span>›</span><span>${esc(p.name)}</span>
        </div>
        <h2 style="margin-top:4px">${esc(p.name)}</h2>
      </div>
    </div>

    <div class="board-toolbar">
      <div class="board-toolbar-left">
        <div class="view-tabs">
          <button class="view-tab active" data-view="board">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="18" rx="1"/><rect x="17" y="3" width="5" height="18" rx="1"/></svg>
            Board
          </button>
          <button class="view-tab" data-view="list">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            List
          </button>
        </div>
        <button class="btn btn-secondary btn-sm" id="manage-stages-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          Stages
        </button>
      </div>
      <div class="board-toolbar-left">
        <select id="board-priority-filter" style="padding:5px 10px;border:1px solid var(--border);border-radius:5px;font-size:13px;background:var(--surface)">
          <option value="">All priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button class="btn btn-primary btn-sm" id="new-task-quick-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Task
        </button>
      </div>
    </div>

    <div id="board-or-list"></div>`;

  const viewTabs = container.querySelectorAll('.view-tab');
  viewTabs.forEach(tab => tab.onclick = () => {
    viewTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderCurrentView(container, tab.dataset.view);
  });

  container.querySelector('#manage-stages-btn').onclick = () => openStagesManager(container);
  container.querySelector('#new-task-quick-btn').onclick = () => openTaskModal(null, currentProject.stages[0]);
  container.querySelector('#board-priority-filter').onchange = (e) => {
    applyFilters(container, e.target.value);
  };

  renderCurrentView(container, 'board');
}

function renderCurrentView(container, view) {
  const slot = container.querySelector('#board-or-list');
  const priorityFilter = container.querySelector('#board-priority-filter')?.value || '';
  const { filterLocationId, filterAssigneeId } = getState();

  let filtered = allTasks.filter(t => {
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (filterLocationId && t.ghl_location_id !== filterLocationId) return false;
    if (filterAssigneeId && !t.assignees?.some(a => a.id === filterAssigneeId)) return false;
    return true;
  });

  if (view === 'board') renderKanban(slot, filtered);
  else renderListView(slot, filtered);
}

function applyFilters(container, priorityFilter) {
  const activeTab = container.querySelector('.view-tab.active');
  renderCurrentView(container, activeTab?.dataset.view || 'board');
}

// ── Kanban Board ──────────────────────────────────────────────────────────────

function renderKanban(slot, tasks) {
  const stages = currentProject.stages;
  const tasksByStage = {};
  stages.forEach(s => { tasksByStage[s.id] = []; });
  tasks.forEach(t => { if (tasksByStage[t.stage_id]) tasksByStage[t.stage_id].push(t); });

  slot.innerHTML = '';
  const board = document.createElement('div');
  board.className = 'board-container';

  stages.forEach(stage => {
    const col = buildColumn(stage, tasksByStage[stage.id] || []);
    board.appendChild(col);
  });

  const addColBtn = document.createElement('button');
  addColBtn.className = 'add-column-btn';
  addColBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add stage`;
  addColBtn.onclick = () => openAddStageModal();
  board.appendChild(addColBtn);

  slot.appendChild(board);
}

function buildColumn(stage, stageTasks) {
  const col = document.createElement('div');
  col.className = 'board-column';
  col.dataset.stageId = stage.id;

  col.innerHTML = `
    <div class="column-header">
      <div class="column-title">
        <span class="stage-dot" style="background:${stage.color}"></span>
        ${esc(stage.name)}
      </div>
      <span class="column-count">${stageTasks.length}</span>
      <div class="column-actions">
        <button class="icon-btn" title="Add task">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
    </div>
    <div class="column-body" data-stage-id="${stage.id}"></div>
    <button class="add-task-btn" data-stage-id="${stage.id}">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Add task
    </button>`;

  const body = col.querySelector('.column-body');
  stageTasks.forEach(task => body.appendChild(buildTaskCard(task)));

  col.querySelector('.column-header .icon-btn').onclick = () => openTaskModal(null, stage);
  col.querySelector('.add-task-btn').onclick = () => openTaskModal(null, stage);

  setupDropZone(body, stage.id);

  return col;
}

function buildTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.draggable = true;
  card.dataset.taskId = task.id;

  const overdue = isOverdue(task.due_date);
  const locationInfo = task.ghl_location_id
    ? `<div class="task-card-location"><span class="location-dot"></span>Sub-account</div>`
    : '';

  card.innerHTML = `
    <div class="task-card-title">${esc(task.title)}</div>
    <div class="task-card-meta">
      <span class="priority-badge priority-${task.priority}">${priorityLabel(task.priority)}</span>
      ${task.due_date ? `<span class="due-date-badge ${overdue ? 'overdue' : ''}">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        ${formatDate(task.due_date)}</span>` : ''}
      ${(task.tags || []).slice(0, 2).map(t => `<span class="tag-badge">${esc(t)}</span>`).join('')}
      <div class="assignee-avatars">
        ${(task.assignees || []).slice(0,3).map(a => `<div class="assignee-avatar" title="${esc(a.name || '')}">${initials(a.name || '?')}</div>`).join('')}
      </div>
    </div>
    ${locationInfo}`;

  card.addEventListener('click', () => openTaskModal(task));

  card.addEventListener('dragstart', e => {
    dragTask = task;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  });
  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    dragTask = null;
  });

  return card;
}

function setupDropZone(body, stageId) {
  body.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    body.closest('.board-column').classList.add('drag-over');
  });
  body.addEventListener('dragleave', e => {
    if (!body.contains(e.relatedTarget))
      body.closest('.board-column').classList.remove('drag-over');
  });
  body.addEventListener('drop', async e => {
    e.preventDefault();
    body.closest('.board-column').classList.remove('drag-over');
    if (!dragTask || dragTask.stage_id === stageId) return;

    try {
      await tasksApi.move(dragTask.id, { stage_id: stageId, order_index: 9999 });
      dragTask.stage_id = stageId;
      const idx = allTasks.findIndex(t => t.id === dragTask.id);
      if (idx !== -1) allTasks[idx].stage_id = stageId;
      // Re-render the kanban in-place
      const container = document.getElementById('view');
      renderCurrentView(container, 'board');
    } catch (e) { toast(e.message, 'error'); }
  });
}

// ── List View ─────────────────────────────────────────────────────────────────

function renderListView(slot, tasks) {
  const stageMap = Object.fromEntries(currentProject.stages.map(s => [s.id, s]));

  slot.innerHTML = `
    <div class="card" style="overflow:auto">
      <table class="task-table">
        <thead>
          <tr>
            <th style="width:40%">Task</th>
            <th>Stage</th>
            <th>Priority</th>
            <th>Assignees</th>
            <th>Due Date</th>
            <th>Sub-account</th>
          </tr>
        </thead>
        <tbody id="list-body"></tbody>
      </table>
    </div>`;

  const tbody = slot.querySelector('#list-body');
  if (!tasks.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:32px">No tasks match the current filter</td></tr>`;
    return;
  }

  tasks.forEach(task => {
    const stage = stageMap[task.stage_id] || {};
    const overdue = isOverdue(task.due_date);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="task-title-cell">${esc(task.title)}</span></td>
      <td><span class="stage-pill" style="background:${stage.color}22;color:${stage.color}">
        <span style="width:7px;height:7px;border-radius:50%;background:${stage.color};display:inline-block"></span>
        ${esc(stage.name || '—')}
      </span></td>
      <td><span class="priority-badge priority-${task.priority}">${priorityLabel(task.priority)}</span></td>
      <td>
        <div class="assignee-avatars">
          ${(task.assignees||[]).slice(0,3).map(a => `<div class="assignee-avatar" title="${esc(a.name||'')}">${initials(a.name||'?')}</div>`).join('')}
        </div>
      </td>
      <td><span class="${overdue ? 'due-date-badge overdue' : 'due-date-badge'}">${formatDate(task.due_date) || '—'}</span></td>
      <td><span class="text-muted">${task.ghl_location_id ? '📍 Sub-account' : '—'}</span></td>`;
    tr.querySelector('.task-title-cell').onclick = () => openTaskModal(task);
    tbody.appendChild(tr);
  });
}

// ── Task Detail Modal ─────────────────────────────────────────────────────────

function openTaskModal(task, defaultStage = null) {
  const isNew = !task;
  const stage = defaultStage || currentProject.stages.find(s => s.id === task?.stage_id) || currentProject.stages[0];

  const el = document.createElement('div');
  el.className = 'modal task-detail modal-lg';

  const userOptions = ghlUsers.map(u => `<option value="${u.id}" ${task?.assignees?.some(a => a.id === u.id) ? 'selected' : ''}>${esc(u.name || u.email || u.id)}</option>`).join('');

  el.innerHTML = `
    <div class="modal-header">
      <h3>${isNew ? 'New Task' : 'Edit Task'}</h3>
      <button class="modal-close" data-close>×</button>
    </div>

    <input class="task-detail-title form-control" placeholder="Task title…" value="${esc(task?.title || '')}" style="font-size:18px;font-weight:600;margin-bottom:16px">

    <div class="task-detail-row">
      <div class="task-detail-field">
        <label>Stage</label>
        <select class="field-select" name="stage_id">
          ${currentProject.stages.map(s => `<option value="${s.id}" ${(task?.stage_id || stage.id) === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
        </select>
      </div>
      <div class="task-detail-field">
        <label>Priority</label>
        <select class="field-select" name="priority">
          ${['urgent','high','medium','low'].map(p => `<option value="${p}" ${task?.priority === p ? 'selected' : ''}>${priorityLabel(p)}</option>`).join('')}
        </select>
      </div>
      <div class="task-detail-field">
        <label>Due Date</label>
        <input class="field-input" type="date" name="due_date" value="${task?.due_date || ''}">
      </div>
      ${currentProject.lists?.length > 1 ? `
      <div class="task-detail-field">
        <label>List</label>
        <select class="field-select" name="list_id">
          ${currentProject.lists.map(l => `<option value="${l.id}" ${task?.list_id === l.id ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}
        </select>
      </div>` : ''}
      ${ghlUsers.length ? `
      <div class="task-detail-field">
        <label>Assign to</label>
        <select class="field-select" name="assignee_id">
          <option value="">Unassigned</option>
          ${userOptions}
        </select>
      </div>` : ''}
    </div>

    <div class="form-group">
      <label style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;display:block">Description</label>
      <textarea class="task-description form-control" name="description" placeholder="Add a description…" rows="4">${esc(task?.description || '')}</textarea>
    </div>

    <div class="form-group">
      <label style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;display:block">Tags (comma-separated)</label>
      <input class="form-control" name="tags" placeholder="design, frontend, urgent" value="${(task?.tags || []).join(', ')}">
    </div>

    ${!isNew ? renderCommentsHTML(task) : ''}

    <div class="modal-footer">
      ${!isNew ? `<button class="btn btn-danger btn-sm" data-delete>Delete task</button>` : ''}
      <button class="btn btn-secondary" data-close>Cancel</button>
      <button class="btn btn-primary" data-save>${isNew ? 'Create Task' : 'Save Changes'}</button>
    </div>`;

  el.querySelector('[data-close]')?.addEventListener('click', closeModal);

  el.querySelector('[data-save]').addEventListener('click', async () => {
    const title = el.querySelector('.task-detail-title').value.trim();
    if (!title) return toast('Title is required', 'error');

    const stage_id = el.querySelector('[name=stage_id]').value;
    const priority = el.querySelector('[name=priority]').value;
    const due_date = el.querySelector('[name=due_date]').value || null;
    const description = el.querySelector('[name=description]').value;
    const list_id = el.querySelector('[name=list_id]')?.value || currentProject.lists?.[0]?.id || null;
    const assignee_id = el.querySelector('[name=assignee_id]')?.value;
    const tagsRaw = el.querySelector('[name=tags]').value;
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    const assignees = assignee_id
      ? [{ id: assignee_id, name: ghlUsers.find(u => u.id === assignee_id)?.name || '' }]
      : [];

    const payload = { title, stage_id, priority, due_date, description, list_id, assignees, tags };

    try {
      if (isNew) {
        const created = await tasksApi.create({ ...payload, project_id: currentProject.id });
        allTasks.push(created);
      } else {
        await tasksApi.update(task.id, payload);
        Object.assign(task, { title, stage_id, priority, due_date, description, tags, assignees });
        const idx = allTasks.findIndex(t => t.id === task.id);
        if (idx !== -1) allTasks[idx] = { ...allTasks[idx], ...payload };
      }
      closeModal();
      toast(isNew ? 'Task created' : 'Task updated', 'success');
      renderBoardUI(document.getElementById('view'));
    } catch (e) { toast(e.message, 'error'); }
  });

  el.querySelector('[data-delete]')?.addEventListener('click', () => {
    closeModal();
    confirmModal(`Delete task "<strong>${esc(task.title)}</strong>"?`, async () => {
      try {
        await tasksApi.remove(task.id);
        allTasks = allTasks.filter(t => t.id !== task.id);
        toast('Task deleted', 'success');
        renderBoardUI(document.getElementById('view'));
      } catch (e) { toast(e.message, 'error'); }
    });
  });

  // Comment submit
  el.querySelector('[data-comment-submit]')?.addEventListener('click', async () => {
    const input = el.querySelector('[data-comment-input]');
    const content = input.value.trim();
    if (!content) return;
    try {
      const comment = await tasksApi.comment(task.id, content);
      input.value = '';
      const list = el.querySelector('.comment-list');
      list.appendChild(buildCommentEl(comment));
    } catch (e) { toast(e.message, 'error'); }
  });

  openModal(el);
}

function renderCommentsHTML(task) {
  const comments = task?.comments || [];
  return `
    <div class="comments-section">
      <h4>Comments (${comments.length})</h4>
      <div class="comment-list">
        ${comments.map(c => buildCommentEl(c).outerHTML).join('')}
      </div>
      <div class="comment-input-row">
        <input class="comment-input" data-comment-input placeholder="Write a comment…">
        <button class="btn btn-primary btn-sm" data-comment-submit>Post</button>
      </div>
    </div>`;
}

function buildCommentEl(c) {
  const div = document.createElement('div');
  div.className = 'comment-item';
  const date = new Date(c.created_at * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  div.innerHTML = `
    <div class="comment-avatar">${initials(c.author_name || '?')}</div>
    <div class="comment-bubble">
      <div class="comment-author">${esc(c.author_name || 'Unknown')}</div>
      <div class="comment-text">${esc(c.content)}</div>
      <div class="comment-time">${date}</div>
    </div>`;
  return div;
}

// ── Stages Manager ────────────────────────────────────────────────────────────

function openStagesManager(container) {
  const el = document.createElement('div');
  el.className = 'modal modal-md';

  function buildContent() {
    return `
      <div class="modal-header">
        <h3>Manage Stages</h3>
        <button class="modal-close" data-close>×</button>
      </div>
      <p class="text-muted" style="margin-bottom:16px">Drag to reorder · Tasks are moved to the first remaining stage when a stage is deleted.</p>
      <div class="stage-list" id="stage-list-items">
        ${currentProject.stages.map(s => `
          <div class="stage-list-item" data-stage-id="${s.id}">
            <span class="stage-color-dot" style="background:${s.color}"></span>
            <span class="stage-list-name">${esc(s.name)}</span>
            ${s.is_default ? '<span class="stage-badge">default</span>' : ''}
            <div class="stage-list-actions">
              <button class="icon-btn" data-edit-stage="${s.id}" title="Edit">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              ${currentProject.stages.length > 1 ? `
              <button class="icon-btn" data-del-stage="${s.id}" title="Delete">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
              </button>` : ''}
            </div>
          </div>`).join('')}
      </div>
      <div class="modal-footer" style="justify-content:space-between">
        <button class="btn btn-secondary" id="add-stage-inline-btn">+ Add stage</button>
        <button class="btn btn-primary" data-close>Done</button>
      </div>`;
  }

  el.innerHTML = buildContent();
  el.querySelector('[data-close]').onclick = () => {
    closeModal();
    renderBoardUI(container);
  };

  el.addEventListener('click', async e => {
    const editId = e.target.closest('[data-edit-stage]')?.dataset.editStage;
    const delId  = e.target.closest('[data-del-stage]')?.dataset.delStage;

    if (editId) {
      const s = currentProject.stages.find(x => x.id === editId);
      formModal({
        title: 'Edit Stage',
        fields: [
          { name: 'name', label: 'Name', value: s.name },
          { name: 'color', label: 'Color', type: 'color', value: s.color },
        ],
        submitLabel: 'Save',
        onSubmit: async data => {
          try {
            await projApi.updateStage(currentProject.id, editId, data);
            Object.assign(s, data);
            closeModal();
            openStagesManager(container);
          } catch (ex) { toast(ex.message, 'error'); }
        },
      });
    }

    if (delId) {
      confirmModal('Delete this stage? Tasks will move to the next available stage.', async () => {
        try {
          await projApi.deleteStage(currentProject.id, delId);
          currentProject.stages = currentProject.stages.filter(s => s.id !== delId);
          openStagesManager(container);
        } catch (ex) { toast(ex.message, 'error'); }
      });
    }

    if (e.target.id === 'add-stage-inline-btn') {
      openAddStageModal(() => openStagesManager(container));
    }
  });

  openModal(el);
}

function openAddStageModal(onDone) {
  formModal({
    title: 'Add Stage',
    fields: [
      { name: 'name', label: 'Stage name', placeholder: 'e.g. QA Review' },
      { name: 'color', label: 'Color', type: 'color', value: '#6b7280' },
    ],
    submitLabel: 'Add',
    onSubmit: async data => {
      if (!data.name?.trim()) return toast('Name required', 'error');
      try {
        const stage = await projApi.addStage(currentProject.id, data);
        currentProject.stages.push(stage);
        closeModal();
        toast('Stage added', 'success');
        onDone?.();
      } catch (e) { toast(e.message, 'error'); }
    },
  });
}

function getWorkspaceName(wsId) {
  return getState().workspaces.find(w => w.id === wsId)?.name || 'Workspace';
}

function esc(str) { return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
