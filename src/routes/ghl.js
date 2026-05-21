import { Router } from 'express';
import fetch from 'node-fetch';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const GHL_API = 'https://services.leadconnectorhq.com';
const VERSION = '2021-07-28';

async function ghlGet(token, path) {
  const res = await fetch(`${GHL_API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Version: VERSION },
  });
  if (!res.ok) throw new Error(`GHL API ${res.status}: ${await res.text()}`);
  return res.json();
}

// List all sub-accounts (agency only)
router.get('/locations', async (req, res) => {
  if (req.account.type !== 'agency') return res.status(403).json({ error: 'Agency access required' });
  try {
    const data = await ghlGet(req.account.access_token, `/locations/?companyId=${req.account.ghl_company_id}&limit=100`);
    res.json(data.locations || data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// Users in a specific location (agency viewing a sub-account's users)
router.get('/locations/:locationId/users', async (req, res) => {
  try {
    const data = await ghlGet(req.account.access_token, `/users/?locationId=${req.params.locationId}`);
    res.json(data.users || data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// Users available to current session (own location or all if agency)
router.get('/users', async (req, res) => {
  const locationId = req.account.ghl_location_id;
  const companyId = req.account.ghl_company_id;
  const qs = locationId ? `locationId=${locationId}` : (companyId ? `companyId=${companyId}` : '');
  try {
    const data = await ghlGet(req.account.access_token, `/users/?${qs}`);
    res.json(data.users || data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

export default router;
