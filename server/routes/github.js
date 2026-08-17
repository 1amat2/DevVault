'use strict';

const express  = require('express');
const router   = express.Router();
const fetch    = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const supabase = require('../services/supabase');
const auth     = require('../middleware/auth');

// ─── GET /api/github/connect ──────────────────────────────────
// Initiates the GitHub OAuth flow. No auth needed yet.
router.get('/connect', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID || '',
    scope:     'repo read:user read:org',
    state:     Math.random().toString(36).slice(2), // basic CSRF token
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

// ─── GET /api/github/callback ─────────────────────────────────
// GitHub redirects here after the user grants access.
// We exchange the code, save the token, then redirect to github.html.
router.get('/callback', async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send('Missing code from GitHub.');

    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept:         'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id:     process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error('[github/callback] token error:', tokenData.error_description);
      return res.redirect('/src/pages/github.html?error=oauth_failed');
    }

    const accessToken = tokenData.access_token;

    // Fetch GitHub profile
    const ghRes  = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const ghUser = await ghRes.json();

    // We need the DevVault user — this callback has no Authorization header.
    // We use the Supabase cookie/session if present, otherwise require the
    // frontend to re-attach the token. For simplicity we store anonymously
    // keyed by github_user_id and let /me associate it by github_username.
    await supabase.from('github_accounts').upsert(
      {
        github_user_id: String(ghUser.id),
        username:       ghUser.login,
        access_token:   accessToken, // NOTE: encrypt in production
        updated_at:     new Date().toISOString(),
      },
      { onConflict: 'github_user_id' }
    );

    res.redirect(`/src/pages/github.html?connected=true&login=${ghUser.login}`);
  } catch (err) { next(err); }
});

// ─── All routes below require a logged-in DevVault user ───────
router.use(auth);

// ─── Helper: get stored GitHub token for user ─────────────────
async function getGithubToken(userId) {
  const { data, error } = await supabase
    .from('github_accounts')
    .select('access_token, username')
    .eq('user_id', userId)
    .single();

  if (error || !data) throw Object.assign(new Error('GitHub account not connected.'), { status: 404 });
  return data;
}

// ─── POST /api/github/link ────────────────────────────────────
// Links a previously stored GitHub account to the current DevVault user.
router.post('/link', async (req, res, next) => {
  try {
    const { github_username } = req.body;
    if (!github_username) return res.status(400).json({ error: 'github_username is required.' });

    const { data, error } = await supabase
      .from('github_accounts')
      .update({ user_id: req.user.id, updated_at: new Date().toISOString() })
      .eq('username', github_username)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: 'GitHub account not found. Connect GitHub first.' });

    // Also update the profile's github_username
    await supabase.from('profiles').update({ github_username }).eq('id', req.user.id);

    res.json({ message: 'GitHub account linked.', username: data.username });
  } catch (err) { next(err); }
});

// ─── GET /api/github/status ───────────────────────────────────
router.get('/status', async (req, res, next) => {
  try {
    const { data } = await supabase
      .from('github_accounts')
      .select('username, updated_at')
      .eq('user_id', req.user.id)
      .single();

    res.json({ connected: !!data, username: data?.username || null });
  } catch (err) { next(err); }
});

// ─── GET /api/github/repos ────────────────────────────────────
router.get('/repos', async (req, res, next) => {
  try {
    const { access_token } = await getGithubToken(req.user.id);

    const ghRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=30&type=all', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!ghRes.ok) throw Object.assign(new Error('GitHub API error.'), { status: 502 });
    const repos = await ghRes.json();

    res.json(repos.map(r => ({
      id:          r.id,
      name:        r.name,
      full_name:   r.full_name,
      description: r.description,
      language:    r.language,
      stars:       r.stargazers_count,
      forks:       r.forks_count,
      url:         r.html_url,
      private:     r.private,
      updated_at:  r.updated_at,
      topics:      r.topics || [],
    })));
  } catch (err) { next(err); }
});

// ─── GET /api/github/profile ──────────────────────────────────
router.get('/profile', async (req, res, next) => {
  try {
    const { access_token } = await getGithubToken(req.user.id);

    const ghRes  = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const user = await ghRes.json();

    res.json({
      login:      user.login,
      name:       user.name,
      bio:        user.bio,
      avatar_url: user.avatar_url,
      html_url:   user.html_url,
      followers:  user.followers,
      following:  user.following,
      public_repos: user.public_repos,
    });
  } catch (err) { next(err); }
});

// ─── GET /api/github/events ───────────────────────────────────
// Returns recent public events (commits, PRs, etc.) for the activity feed.
router.get('/events', async (req, res, next) => {
  try {
    const { access_token, username } = await getGithubToken(req.user.id);

    const ghRes = await fetch(`https://api.github.com/users/${username}/events?per_page=30`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!ghRes.ok) throw Object.assign(new Error('GitHub API error.'), { status: 502 });
    const events = await ghRes.json();

    res.json(events.slice(0, 30).map(e => ({
      id:         e.id,
      type:       e.type,
      repo:       e.repo?.name,
      created_at: e.created_at,
      payload:    e.type === 'PushEvent'
        ? { commits: e.payload.commits?.length || 0, ref: e.payload.ref }
        : {},
    })));
  } catch (err) { next(err); }
});

// ─── DELETE /api/github/disconnect ────────────────────────────
router.delete('/disconnect', async (req, res, next) => {
  try {
    await supabase.from('github_accounts').delete().eq('user_id', req.user.id);
    await supabase.from('profiles').update({ github_username: null }).eq('id', req.user.id);
    res.json({ message: 'GitHub account disconnected.' });
  } catch (err) { next(err); }
});

module.exports = router;
