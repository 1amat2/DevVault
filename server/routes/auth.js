'use strict';

const express  = require('express');
const router   = express.Router();
const supabase = require('../services/supabase');
const auth     = require('../middleware/auth');

// ─── POST /api/auth/signup ────────────────────────────────────
// Creates a new Supabase Auth user and inserts a profile row.
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, display_name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Create auth user via admin API (no email confirmation needed server-side)
    const { data, error: signupErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: display_name || email.split('@')[0] },
    });

    if (signupErr) {
      return res.status(400).json({ error: signupErr.message });
    }

    const user = data.user;

    // Create profile row (schema.sql creates this table)
    await supabase.from('profiles').insert({
      id:           user.id,
      display_name: display_name || user.email.split('@')[0],
    });

    res.status(201).json({ message: 'Account created. Please sign in.', userId: user.id });
  } catch (err) { next(err); }
});

// ─── POST /api/auth/login ─────────────────────────────────────
// Returns Supabase session — frontend stores it in localStorage.
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(401).json({ error: error.message });

    res.json({
      session:      data.session,
      user:         data.user,
      access_token: data.session.access_token,
    });
  } catch (err) { next(err); }
});

// ─── POST /api/auth/logout ────────────────────────────────────
// Signs out the user from Supabase.
router.post('/logout', auth, async (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').slice(7);
    await supabase.auth.admin.signOut(token);
    res.json({ message: 'Signed out.' });
  } catch (err) { next(err); }
});

// ─── POST /api/auth/reset-password ───────────────────────────
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.ALLOWED_ORIGIN || 'http://localhost:3001'}/src/pages/settings.html?tab=account`,
    });
    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Password reset email sent.' });
  } catch (err) { next(err); }
});

// ─── GET /api/auth/me ─────────────────────────────────────────
// Returns the authenticated user + their profile.
router.get('/me', auth, async (req, res, next) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json({ user: req.user, profile });
  } catch (err) { next(err); }
});

// ─── PATCH /api/auth/profile ──────────────────────────────────
// Updates the user's profile row.
router.patch('/profile', auth, async (req, res, next) => {
  try {
    const allowed = ['display_name', 'username', 'bio', 'avatar_url', 'location', 'website_url', 'github_username'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
