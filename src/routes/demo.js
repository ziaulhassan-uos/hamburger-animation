import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';

const router = Router();

const DEMO_ACCOUNT_ID = 'demo-agency-account';

export function seedDemo(db) {
  const existing = db.prepare('SELECT id FROM accounts WHERE id = ?').get(DEMO_ACCOUNT_ID);
  if (existing) return; // already seeded

  db.prepare(`
    INSERT INTO accounts (id, ghl_user_id, name, email, type, ghl_location_id, ghl_company_id, access_token, refresh_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(DEMO_ACCOUNT_ID, 'demo-ghl-user', 'Demo Agency', 'demo@agency.com', 'agency', null, 'demo-company-123', 'demo-token', null);

  // ── Workspace 1 ────────────────────────────────────────────────────────────
  const ws1 = uuidv4();
  db.prepare(`INSERT INTO workspaces (id, name, color, icon, account_id, ghl_location_id) VALUES (?,?,?,?,?,?)`)
    .run(ws1, 'Client Projects', '#6366f1', '🏢', DEMO_ACCOUNT_ID, null);

  // Project A
  const pA = uuidv4();
  db.prepare(`INSERT INTO projects (id, name, description, color, workspace_id) VALUES (?,?,?,?,?)`)
    .run(pA, 'Website Redesign', 'Full redesign of the corporate website', '#6366f1', ws1);

  const stagesA = [
    { id: uuidv4(), name: 'To Do',         color: '#6b7280', order_index: 0 },
    { id: uuidv4(), name: 'In Progress',   color: '#3b82f6', order_index: 1 },
    { id: uuidv4(), name: 'Client Review', color: '#f59e0b', order_index: 2 },
    { id: uuidv4(), name: 'Completed',     color: '#10b981', order_index: 3 },
    { id: uuidv4(), name: 'Closed',        color: '#374151', order_index: 4 },
  ];
  for (const s of stagesA)
    db.prepare(`INSERT INTO stages (id, name, color, project_id, order_index, is_default) VALUES (?,?,?,?,?,1)`)
      .run(s.id, s.name, s.color, pA, s.order_index);

  const listA = uuidv4();
  db.prepare(`INSERT INTO lists (id, name, project_id, order_index) VALUES (?,?,?,0)`).run(listA, 'Sprint 1', pA);

  const tasksA = [
    { title: 'Design homepage mockup',       stage: 0, priority: 'high',   due: '2025-06-01', tags: 'design,ui', loc: 'loc-001' },
    { title: 'Set up CMS',                   stage: 1, priority: 'medium', due: '2025-05-28', tags: 'backend',   loc: 'loc-001' },
    { title: 'SEO audit & keyword research', stage: 0, priority: 'low',    due: '2025-06-10', tags: 'seo',       loc: 'loc-002' },
    { title: 'Review colour palette',        stage: 2, priority: 'medium', due: '2025-05-25', tags: 'design',    loc: 'loc-001' },
    { title: 'Deploy staging environment',   stage: 3, priority: 'high',   due: '2025-05-22', tags: 'devops',    loc: 'loc-002' },
    { title: 'Write copy for About page',    stage: 0, priority: 'low',    due: null,         tags: 'content',   loc: 'loc-001' },
    { title: 'Accessibility review',         stage: 1, priority: 'urgent', due: '2025-05-23', tags: 'qa',        loc: 'loc-003' },
  ];
  tasksA.forEach((t, i) => {
    const id = uuidv4();
    db.prepare(`INSERT INTO tasks (id, title, list_id, project_id, stage_id, priority, due_date, order_index, ghl_location_id) VALUES (?,?,?,?,?,?,?,?,?)`)
      .run(id, t.title, listA, pA, stagesA[t.stage].id, t.priority, t.due, i, t.loc);
    for (const tag of t.tags.split(','))
      db.prepare(`INSERT INTO task_tags (task_id, tag) VALUES (?,?)`).run(id, tag.trim());
  });

  // Project B
  const pB = uuidv4();
  db.prepare(`INSERT INTO projects (id, name, description, color, workspace_id) VALUES (?,?,?,?,?)`)
    .run(pB, 'Social Media Campaign', 'Q3 Instagram & Facebook push', '#8b5cf6', ws1);

  const stagesB = [
    { id: uuidv4(), name: 'Backlog',    color: '#94a3b8', order_index: 0 },
    { id: uuidv4(), name: 'In Progress',color: '#3b82f6', order_index: 1 },
    { id: uuidv4(), name: 'Scheduled',  color: '#f59e0b', order_index: 2 },
    { id: uuidv4(), name: 'Published',  color: '#10b981', order_index: 3 },
  ];
  for (const s of stagesB)
    db.prepare(`INSERT INTO stages (id, name, color, project_id, order_index, is_default) VALUES (?,?,?,?,?,1)`)
      .run(s.id, s.name, s.color, pB, s.order_index);

  const listB = uuidv4();
  db.prepare(`INSERT INTO lists (id, name, project_id, order_index) VALUES (?,?,?,0)`).run(listB, 'June Posts', pB);

  const tasksB = [
    { title: 'Create 10 Instagram post graphics', stage: 1, priority: 'high',   loc: 'loc-002' },
    { title: 'Write captions for carousel posts',  stage: 0, priority: 'medium', loc: 'loc-002' },
    { title: 'Schedule posts for week 1',          stage: 2, priority: 'medium', loc: 'loc-002' },
    { title: 'Run Facebook ad for product launch', stage: 3, priority: 'urgent', loc: 'loc-003' },
    { title: 'Influencer outreach email',          stage: 0, priority: 'low',    loc: 'loc-001' },
  ];
  tasksB.forEach((t, i) => {
    const id = uuidv4();
    db.prepare(`INSERT INTO tasks (id, title, list_id, project_id, stage_id, priority, order_index, ghl_location_id) VALUES (?,?,?,?,?,?,?,?)`)
      .run(id, t.title, listB, pB, stagesB[t.stage].id, t.priority, i, t.loc);
  });

  // ── Workspace 2 ────────────────────────────────────────────────────────────
  const ws2 = uuidv4();
  db.prepare(`INSERT INTO workspaces (id, name, color, icon, account_id, ghl_location_id) VALUES (?,?,?,?,?,?)`)
    .run(ws2, 'Internal Operations', '#10b981', '⚙️', DEMO_ACCOUNT_ID, null);

  const pC = uuidv4();
  db.prepare(`INSERT INTO projects (id, name, description, color, workspace_id) VALUES (?,?,?,?,?)`)
    .run(pC, 'Onboarding Flow', 'New client onboarding process', '#10b981', ws2);

  const stagesC = [
    { id: uuidv4(), name: 'To Do',       color: '#6b7280', order_index: 0 },
    { id: uuidv4(), name: 'In Progress', color: '#3b82f6', order_index: 1 },
    { id: uuidv4(), name: 'Done',        color: '#10b981', order_index: 2 },
  ];
  for (const s of stagesC)
    db.prepare(`INSERT INTO stages (id, name, color, project_id, order_index, is_default) VALUES (?,?,?,?,?,1)`)
      .run(s.id, s.name, s.color, pC, s.order_index);

  const listC = uuidv4();
  db.prepare(`INSERT INTO lists (id, name, project_id, order_index) VALUES (?,?,?,0)`).run(listC, 'Default', pC);

  const tasksC = [
    { title: 'Send welcome email',            stage: 2, priority: 'medium', loc: null },
    { title: 'Schedule kick-off call',        stage: 1, priority: 'high',   loc: null },
    { title: 'Set up client portal access',   stage: 0, priority: 'medium', loc: null },
    { title: 'Collect brand assets',          stage: 1, priority: 'low',    loc: null },
  ];
  tasksC.forEach((t, i) => {
    db.prepare(`INSERT INTO tasks (id, title, list_id, project_id, stage_id, priority, order_index) VALUES (?,?,?,?,?,?,?)`)
      .run(uuidv4(), t.title, listC, pC, stagesC[t.stage].id, t.priority, i);
  });
}

// Demo login — no password, just creates a session as the demo agency account
router.get('/login', (req, res) => {
  seedDemo(getDb());
  req.session.accountId = DEMO_ACCOUNT_ID;
  res.redirect('/');
});

router.get('/reset', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM accounts WHERE id = ?').run(DEMO_ACCOUNT_ID);
  req.session.destroy(() => res.redirect('/demo/login'));
});

export default router;
