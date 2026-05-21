import { Router } from 'express';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';

const router = Router();

const GHL_AUTH_URL = 'https://marketplace.gohighlevel.com/oauth/chooselocation';
const GHL_TOKEN_URL = 'https://services.leadconnectorhq.com/oauth/token';
const GHL_API = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

function clientId() { return process.env.GHL_CLIENT_ID; }
function clientSecret() { return process.env.GHL_CLIENT_SECRET; }
function redirectUri() { return process.env.GHL_REDIRECT_URI || 'http://localhost:3000/auth/callback'; }

async function ghlGet(token, path) {
  const res = await fetch(`${GHL_API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Version: GHL_API_VERSION },
  });
  return res.json();
}

// Step 1 — redirect to GHL OAuth
router.get('/login', (req, res) => {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: [
      'businesses.readonly',
      'locations.readonly',
      'users.readonly',
      'contacts.readonly',
    ].join(' '),
  });
  res.redirect(`${GHL_AUTH_URL}?${params}`);
});

// Step 2 — GHL redirects back here with ?code=
router.get('/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error || !code) return res.redirect('/?error=oauth_denied');

  try {
    const tokenRes = await fetch(GHL_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId(),
        client_secret: clientSecret(),
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri(),
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error(JSON.stringify(tokens));

    // Fetch the authenticated GHL user
    const user = await ghlGet(tokens.access_token, '/users/me');
    if (!user?.id) throw new Error('Could not fetch GHL user');

    const db = getDb();
    let account = db.prepare('SELECT * FROM accounts WHERE ghl_user_id = ?').get(user.id);

    const isAgency = !!tokens.companyId;
    const updates = {
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      email: user.email,
      type: isAgency ? 'agency' : 'sub-account',
      ghl_location_id: tokens.locationId || null,
      ghl_company_id: tokens.companyId || null,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      token_expires_at: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : null,
    };

    if (!account) {
      account = { id: uuidv4(), ghl_user_id: user.id, ...updates };
      db.prepare(`
        INSERT INTO accounts (id, ghl_user_id, name, email, type, ghl_location_id, ghl_company_id, access_token, refresh_token, token_expires_at)
        VALUES (@id, @ghl_user_id, @name, @email, @type, @ghl_location_id, @ghl_company_id, @access_token, @refresh_token, @token_expires_at)
      `).run(account);
    } else {
      db.prepare(`
        UPDATE accounts SET name=@name, email=@email, type=@type, ghl_location_id=@ghl_location_id,
        ghl_company_id=@ghl_company_id, access_token=@access_token, refresh_token=@refresh_token,
        token_expires_at=@token_expires_at WHERE id=@id
      `).run({ ...updates, id: account.id });
      account = { ...account, ...updates };
    }

    req.session.accountId = account.id;
    res.redirect('/');
  } catch (err) {
    console.error('GHL OAuth error:', err);
    res.redirect('/?error=oauth_failed');
  }
});

// Current session info
router.get('/me', (req, res) => {
  if (!req.session?.accountId) return res.json({ authenticated: false });
  const account = getDb()
    .prepare('SELECT id, name, email, type, ghl_location_id, ghl_company_id FROM accounts WHERE id = ?')
    .get(req.session.accountId);
  if (!account) return res.json({ authenticated: false });
  res.json({ authenticated: true, account });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

export default router;
