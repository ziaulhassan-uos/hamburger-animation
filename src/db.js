import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let db;

export function getDb() {
  return db;
}

export function initDb() {
  db = new Database(path.join(__dirname, '..', 'taskflow.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      ghl_user_id TEXT UNIQUE,
      name TEXT,
      email TEXT,
      type TEXT DEFAULT 'sub-account',
      ghl_location_id TEXT,
      ghl_company_id TEXT,
      access_token TEXT,
      refresh_token TEXT,
      token_expires_at INTEGER,
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#6366f1',
      icon TEXT DEFAULT '🏢',
      account_id TEXT NOT NULL,
      ghl_location_id TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      color TEXT DEFAULT '#6366f1',
      workspace_id TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      project_id TEXT NOT NULL,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS stages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#6b7280',
      project_id TEXT NOT NULL,
      order_index INTEGER DEFAULT 0,
      is_default INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      list_id TEXT,
      project_id TEXT NOT NULL,
      stage_id TEXT NOT NULL,
      priority TEXT DEFAULT 'medium',
      due_date TEXT,
      order_index INTEGER DEFAULT 0,
      created_by TEXT,
      ghl_location_id TEXT,
      ghl_user_id TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS task_assignees (
      task_id TEXT NOT NULL,
      ghl_user_id TEXT NOT NULL,
      user_name TEXT,
      PRIMARY KEY (task_id, ghl_user_id)
    );

    CREATE TABLE IF NOT EXISTS task_tags (
      task_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      PRIMARY KEY (task_id, tag)
    );

    CREATE TABLE IF NOT EXISTS task_comments (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      content TEXT NOT NULL,
      author_id TEXT,
      author_name TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    );
  `);

  return db;
}
