import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const DEFAULT_STAGES = [
  { name: 'To Do',         color: '#6b7280', order_index: 0 },
  { name: 'In Progress',   color: '#3b82f6', order_index: 1 },
  { name: 'Client Review', color: '#f59e0b', order_index: 2 },
  { name: 'Completed',     color: '#10b981', order_index: 3 },
  { name: 'Closed',        color: '#374151', order_index: 4 },
];

router.get('/workspace/:workspaceId', (req, res) => {
  const db = getDb();
  const projects = db.prepare('SELECT * FROM projects WHERE workspace_id = ? ORDER BY created_at DESC').all(req.params.workspaceId);
  const result = projects.map(p => ({
    ...p,
    task_count: db.prepare('SELECT COUNT(*) as c FROM tasks WHERE project_id = ?').get(p.id).c,
    stages: db.prepare('SELECT * FROM stages WHERE project_id = ? ORDER BY order_index').all(p.id),
  }));
  res.json(result);
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json({
    ...project,
    stages: db.prepare('SELECT * FROM stages WHERE project_id = ? ORDER BY order_index').all(project.id),
    lists: db.prepare('SELECT * FROM lists WHERE project_id = ? ORDER BY order_index').all(project.id),
  });
});

router.post('/', (req, res) => {
  const { name, description, color, workspace_id } = req.body;
  if (!name?.trim() || !workspace_id) return res.status(400).json({ error: 'name and workspace_id required' });

  const db = getDb();
  const project = { id: uuidv4(), name: name.trim(), description: description || '', color: color || '#6366f1', workspace_id };
  db.prepare('INSERT INTO projects (id, name, description, color, workspace_id) VALUES (@id, @name, @description, @color, @workspace_id)').run(project);

  const insertStage = db.prepare('INSERT INTO stages (id, name, color, project_id, order_index, is_default) VALUES (@id, @name, @color, @project_id, @order_index, 1)');
  const stages = DEFAULT_STAGES.map(s => {
    const stage = { id: uuidv4(), ...s, project_id: project.id };
    insertStage.run(stage);
    return stage;
  });

  const list = { id: uuidv4(), name: 'Default', project_id: project.id, order_index: 0 };
  db.prepare('INSERT INTO lists (id, name, project_id, order_index) VALUES (@id, @name, @project_id, @order_index)').run(list);

  res.json({ ...project, stages, lists: [list], task_count: 0 });
});

router.put('/:id', (req, res) => {
  const { name, description, color } = req.body;
  const db = getDb();
  const p = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE projects SET name=?, description=?, color=? WHERE id=?')
    .run(name ?? p.name, description ?? p.description, color ?? p.color, p.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM tasks WHERE project_id = ?').run(req.params.id);
  db.prepare('DELETE FROM stages WHERE project_id = ?').run(req.params.id);
  db.prepare('DELETE FROM lists WHERE project_id = ?').run(req.params.id);
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ── Stages ──────────────────────────────────────────────────────────────────

router.get('/:id/stages', (req, res) => {
  const stages = getDb().prepare('SELECT * FROM stages WHERE project_id = ? ORDER BY order_index').all(req.params.id);
  res.json(stages);
});

router.post('/:id/stages', (req, res) => {
  const { name, color } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const db = getDb();
  const max = db.prepare('SELECT MAX(order_index) as m FROM stages WHERE project_id = ?').get(req.params.id);
  const stage = { id: uuidv4(), name: name.trim(), color: color || '#6b7280', project_id: req.params.id, order_index: (max.m ?? -1) + 1, is_default: 0 };
  db.prepare('INSERT INTO stages (id, name, color, project_id, order_index, is_default) VALUES (@id, @name, @color, @project_id, @order_index, @is_default)').run(stage);
  res.json(stage);
});

router.put('/:id/stages/:stageId', (req, res) => {
  const { name, color, order_index } = req.body;
  const db = getDb();
  const s = db.prepare('SELECT * FROM stages WHERE id = ?').get(req.params.stageId);
  if (!s) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE stages SET name=?, color=?, order_index=? WHERE id=?')
    .run(name ?? s.name, color ?? s.color, order_index ?? s.order_index, s.id);
  res.json({ success: true });
});

router.delete('/:id/stages/:stageId', (req, res) => {
  const db = getDb();
  const fallback = db.prepare('SELECT id FROM stages WHERE project_id = ? AND id != ? ORDER BY order_index LIMIT 1').get(req.params.id, req.params.stageId);
  if (fallback) db.prepare('UPDATE tasks SET stage_id = ? WHERE stage_id = ?').run(fallback.id, req.params.stageId);
  db.prepare('DELETE FROM stages WHERE id = ?').run(req.params.stageId);
  res.json({ success: true });
});

// ── Lists ────────────────────────────────────────────────────────────────────

router.post('/:id/lists', (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const db = getDb();
  const max = db.prepare('SELECT MAX(order_index) as m FROM lists WHERE project_id = ?').get(req.params.id);
  const list = { id: uuidv4(), name: name.trim(), project_id: req.params.id, order_index: (max.m ?? -1) + 1 };
  db.prepare('INSERT INTO lists (id, name, project_id, order_index) VALUES (@id, @name, @project_id, @order_index)').run(list);
  res.json(list);
});

router.put('/:id/lists/:listId', (req, res) => {
  const { name } = req.body;
  getDb().prepare('UPDATE lists SET name = ? WHERE id = ?').run(name, req.params.listId);
  res.json({ success: true });
});

router.delete('/:id/lists/:listId', (req, res) => {
  getDb().prepare('DELETE FROM lists WHERE id = ?').run(req.params.listId);
  res.json({ success: true });
});

export default router;
