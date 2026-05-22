import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import { fileURLToPath } from 'url';
import path from 'path';
import { initDb } from './src/db.js';
import authRouter from './src/routes/auth.js';
import workspacesRouter from './src/routes/workspaces.js';
import projectsRouter from './src/routes/projects.js';
import tasksRouter from './src/routes/tasks.js';
import ghlRouter from './src/routes/ghl.js';
import demoRouter from './src/routes/demo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

initDb();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'taskflow-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

app.use('/auth', authRouter);
app.use('/api/workspaces', workspacesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/ghl', ghlRouter);
app.use('/demo', demoRouter);

// SPA fallback
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TaskFlow running → http://localhost:${PORT}`));
