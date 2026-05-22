import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const db = getDb();
  // Agency sees all workspaces; sub-account sees only their own
  const rows = req.account.type === 'agency'
    ? db.prepare('SELECT * FROM workspaces ORDER BY created_at DESC').all()
    : db.prepare('SELECT * FROM workspaces WHERE account_id = ? ORDER BY created_at DESC').all(req.account.id);

  // Attach project counts
  const result = rows.map(ws => ({
    ...ws,
    project_count: db.prepare('SELECT COUNT(*) as c FROM projects WHERE workspace_id = ?').get(ws.id).c,
  }));
  res.json(result);
});

router.post('/', (req, res) => {
  const { name, color, icon } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  const db = getDb();
  const ws = {
    id: uuidv4(),
    name: name.trim(),
    color: color || '#6366f1',
    icon: icon || '🏢',
    account_id: req.account.id,
    ghl_location_id: req.account.ghl_location_id || null,
  };
  db.prepare(`
    INSERT INTO workspaces (id, name, color, icon, account_id, ghl_location_id)
    VALUES (@id, @name, @color, @icon, @account_id, @ghl_location_id)
  `).run(ws);
  res.json({ ...ws, project_count: 0 });
});

router.put('/:id', (req, res) => {
  const { name, color, icon } = req.body;
  const db = getDb();
  const ws = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(req.params.id);
  if (!ws) return res.status(404).json({ error: 'Not found' });
  if (req.account.type !== 'agency' && ws.account_id !== req.account.id)
    return res.status(403).json({ error: 'Forbidden' });
  db.prepare('UPDATE workspaces SET name=?, color=?, icon=? WHERE id=?')
    .run(name ?? ws.name, color ?? ws.color, icon ?? ws.icon, ws.id);
  res.json({ ...ws, name: name ?? ws.name, color: color ?? ws.color, icon: icon ?? ws.icon });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const ws = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(req.params.id);
  if (!ws) return res.status(404).json({ error: 'Not found' });
  if (req.account.type !== 'agency' && ws.account_id !== req.account.id)
    return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM workspaces WHERE id = ?').run(ws.id);
  res.json({ success: true });
});

export default router;
