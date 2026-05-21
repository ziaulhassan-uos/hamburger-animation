import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

function enrichTask(db, task) {
  return {
    ...task,
    assignees: db.prepare('SELECT ghl_user_id as id, user_name as name FROM task_assignees WHERE task_id = ?').all(task.id),
    tags: db.prepare('SELECT tag FROM task_tags WHERE task_id = ?').all(task.id).map(r => r.tag),
    comments: db.prepare('SELECT * FROM task_comments WHERE task_id = ? ORDER BY created_at').all(task.id),
  };
}

router.get('/', (req, res) => {
  const db = getDb();
  const { project_id, stage_id, list_id, assignee, ghl_location_id, priority } = req.query;

  let sql = 'SELECT DISTINCT t.* FROM tasks t';
  const where = [];
  const params = [];

  if (assignee) {
    sql += ' JOIN task_assignees ta ON ta.task_id = t.id';
    where.push('ta.ghl_user_id = ?');
    params.push(assignee);
  }

  // Access control: sub-account can only see their own location's tasks
  if (req.account.type !== 'agency') {
    where.push('t.ghl_location_id = ?');
    params.push(req.account.ghl_location_id);
  }

  if (project_id)      { where.push('t.project_id = ?');     params.push(project_id); }
  if (stage_id)        { where.push('t.stage_id = ?');        params.push(stage_id); }
  if (list_id)         { where.push('t.list_id = ?');         params.push(list_id); }
  if (ghl_location_id) { where.push('t.ghl_location_id = ?'); params.push(ghl_location_id); }
  if (priority)        { where.push('t.priority = ?');        params.push(priority); }

  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY t.order_index, t.created_at DESC';

  const tasks = db.prepare(sql).all(...params);
  res.json(tasks.map(t => enrichTask(db, t)));
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Not found' });
  res.json(enrichTask(db, task));
});

router.post('/', (req, res) => {
  const { title, description, project_id, stage_id, list_id, priority, due_date, assignees, tags } = req.body;
  if (!title?.trim() || !project_id || !stage_id) return res.status(400).json({ error: 'title, project_id, stage_id required' });

  const db = getDb();
  const max = db.prepare('SELECT MAX(order_index) as m FROM tasks WHERE stage_id = ?').get(stage_id);
  const task = {
    id: uuidv4(),
    title: title.trim(),
    description: description || '',
    list_id: list_id || null,
    project_id,
    stage_id,
    priority: priority || 'medium',
    due_date: due_date || null,
    order_index: (max.m ?? -1) + 1,
    created_by: req.account.id,
    ghl_location_id: req.account.ghl_location_id || null,
    ghl_user_id: req.account.ghl_user_id || null,
  };

  db.prepare(`
    INSERT INTO tasks (id, title, description, list_id, project_id, stage_id, priority, due_date, order_index, created_by, ghl_location_id, ghl_user_id)
    VALUES (@id, @title, @description, @list_id, @project_id, @stage_id, @priority, @due_date, @order_index, @created_by, @ghl_location_id, @ghl_user_id)
  `).run(task);

  if (assignees?.length) {
    const ins = db.prepare('INSERT OR IGNORE INTO task_assignees (task_id, ghl_user_id, user_name) VALUES (?, ?, ?)');
    for (const a of assignees) ins.run(task.id, a.id, a.name || '');
  }
  if (tags?.length) {
    const ins = db.prepare('INSERT OR IGNORE INTO task_tags (task_id, tag) VALUES (?, ?)');
    for (const tag of tags) ins.run(task.id, tag);
  }

  res.json(enrichTask(db, task));
});

router.put('/:id', (req, res) => {
  const { title, description, stage_id, list_id, priority, due_date, assignees, tags, order_index } = req.body;
  const db = getDb();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Not found' });

  db.prepare(`
    UPDATE tasks SET
      title = ?, description = ?, stage_id = ?, list_id = ?,
      priority = ?, due_date = ?, order_index = ?, updated_at = unixepoch()
    WHERE id = ?
  `).run(
    title ?? task.title,
    description ?? task.description,
    stage_id ?? task.stage_id,
    list_id ?? task.list_id,
    priority ?? task.priority,
    due_date !== undefined ? due_date : task.due_date,
    order_index ?? task.order_index,
    task.id,
  );

  if (assignees !== undefined) {
    db.prepare('DELETE FROM task_assignees WHERE task_id = ?').run(task.id);
    const ins = db.prepare('INSERT INTO task_assignees (task_id, ghl_user_id, user_name) VALUES (?, ?, ?)');
    for (const a of assignees) ins.run(task.id, a.id, a.name || '');
  }
  if (tags !== undefined) {
    db.prepare('DELETE FROM task_tags WHERE task_id = ?').run(task.id);
    const ins = db.prepare('INSERT INTO task_tags (task_id, tag) VALUES (?, ?)');
    for (const tag of tags) ins.run(task.id, tag);
  }

  res.json(enrichTask(db, db.prepare('SELECT * FROM tasks WHERE id = ?').get(task.id)));
});

// Quick stage/order update for drag-and-drop
router.patch('/:id/move', (req, res) => {
  const { stage_id, order_index } = req.body;
  getDb().prepare('UPDATE tasks SET stage_id = ?, order_index = ?, updated_at = unixepoch() WHERE id = ?')
    .run(stage_id, order_index, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM task_assignees WHERE task_id = ?').run(req.params.id);
  db.prepare('DELETE FROM task_tags WHERE task_id = ?').run(req.params.id);
  db.prepare('DELETE FROM task_comments WHERE task_id = ?').run(req.params.id);
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Comments
router.post('/:id/comments', (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Content required' });
  const db = getDb();
  const comment = {
    id: uuidv4(),
    task_id: req.params.id,
    content: content.trim(),
    author_id: req.account.id,
    author_name: req.account.name,
  };
  db.prepare('INSERT INTO task_comments (id, task_id, content, author_id, author_name) VALUES (@id, @task_id, @content, @author_id, @author_name)').run(comment);
  res.json(comment);
});

export default router;
