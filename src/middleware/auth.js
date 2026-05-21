import { getDb } from '../db.js';

export function requireAuth(req, res, next) {
  if (!req.session?.accountId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const account = getDb().prepare('SELECT * FROM accounts WHERE id = ?').get(req.session.accountId);
  if (!account) return res.status(401).json({ error: 'Account not found' });
  req.account = account;
  next();
}
