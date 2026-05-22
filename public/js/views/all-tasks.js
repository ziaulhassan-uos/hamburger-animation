import { tasks as tasksApi, ghl as ghlApi } from '../api.js';
import { getState } from '../state.js';
import { openTaskDetailFromAll } from './board.js';
import { formatDate, isOverdue, initials, priorityLabel } from '../utils.js';
import { toast } from '../components/toast.js';

export async function renderAllTasks(container) {
  const { account, filterLocationId, filterAssigneeId } = getState();

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2>All Tasks</h2>
        <p class="text-muted" style="margin-top:4px">${account?.type === 'agency' ? 'Across all sub-accounts' : 'Your tasks'}</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <select id="at-priority" style="padding:6px 10px;border:1px solid var(--border);border-radius:5px;font-size:13px">
          <option value="">All priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
    <div id="at-body"><div class="text-muted">Loading…</div></div>`;

  await load(container);

  container.querySelector('#at-priority').onchange = e => load(container, { priority: e.target.value });
}

async function load(container, extra = {}) {
  const { filterLocationId, filterAssigneeId } = getState();
  const params = {};
  if (filterLocationId) params.ghl_location_id = filterLocationId;
  if (filterAssigneeId) params.assignee = filterAssigneeId;
  if (extra.priority) params.priority = extra.priority;

  try {
    const allTasks = await tasksApi.list(params);
    renderTable(container.querySelector('#at-body'), allTasks);
  } catch (e) {
    container.querySelector('#at-body').innerHTML = `<p class="text-muted">Failed to load tasks: ${e.message}</p>`;
  }
}

function renderTable(body, tasks) {
  if (!tasks.length) {
    body.innerHTML = `<div class="empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
      <h3>No tasks found</h3>
      <p>Create tasks inside a project board</p>
    </div>`;
    return;
  }

  body.innerHTML = `
    <div class="card" style="overflow:auto">
      <table class="task-table">
        <thead>
          <tr>
            <th style="width:35%">Task</th>
            <th>Priority</th>
            <th>Assignees</th>
            <th>Due Date</th>
            <th>Sub-account</th>
            <th>Created by</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>`;

  const tbody = body.querySelector('tbody');
  tasks.forEach(task => {
    const overdue = isOverdue(task.due_date);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="task-title-cell">${esc(task.title)}</span></td>
      <td><span class="priority-badge priority-${task.priority}">${priorityLabel(task.priority)}</span></td>
      <td>
        <div class="assignee-avatars">
          ${(task.assignees||[]).slice(0,3).map(a=>`<div class="assignee-avatar" title="${esc(a.name||'')}">${initials(a.name||'?')}</div>`).join('')}
          ${!task.assignees?.length ? '<span class="text-muted">—</span>' : ''}
        </div>
      </td>
      <td><span class="${overdue ? 'due-date-badge overdue' : 'due-date-badge'}">${formatDate(task.due_date)||'—'}</span></td>
      <td><span class="text-muted">${task.ghl_location_id ? '📍 ' + task.ghl_location_id.slice(0,8)+'…' : '—'}</span></td>
      <td><span class="text-muted">${task.ghl_user_id ? task.ghl_user_id.slice(0,8)+'…' : '—'}</span></td>`;
    tbody.appendChild(tr);
  });
}

function esc(str) { return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
