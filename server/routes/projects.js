'use strict';

const express  = require('express');
const router   = express.Router();
const supabase = require('../services/supabase');
const auth     = require('../middleware/auth');

// All project routes require authentication
router.use(auth);

// ─── GET /api/projects ────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { status, q } = req.query;
    let query = supabase
      .from('projects')
      .select('*')
      .eq('owner_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status);
    if (q) query = query.ilike('name', `%${q}%`);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// ─── GET /api/projects/public ─────────────────────────────────
// Returns public projects for portfolio — no auth required
router.get('/public/:userId', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id,name,slug,description,status,category,progress,tech,icon,color,live_url,repository_url,cover_image,updated_at')
      .eq('owner_id', req.params.userId)
      .eq('is_public', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// ─── GET /api/projects/:id ────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', req.params.id)
      .eq('owner_id', req.user.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Project not found.' });
    res.json(data);
  } catch (err) { next(err); }
});

// ─── POST /api/projects ───────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { name, description, status, category, tech, icon, color,
            repository_url, live_url, is_public, start_date, target_date } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required.' });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { data, error } = await supabase
      .from('projects')
      .insert({
        owner_id: req.user.id,
        name:     name.trim(),
        slug,
        description,
        status:   status || 'planning',
        category: category || 'Web',
        tech:     tech || [],
        icon,
        color,
        repository_url,
        live_url,
        is_public: is_public ?? false,
        start_date,
        target_date,
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_log').insert({
      user_id:    req.user.id,
      type:       'project',
      text:       `Created project "${name.trim()}"`,
      project_id: data.id,
    });

    res.status(201).json(data);
  } catch (err) { next(err); }
});

// ─── PATCH /api/projects/:id ──────────────────────────────────
router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['name','description','status','category','tech','icon','color',
                     'repository_url','live_url','documentation_url','cover_image',
                     'is_public','progress','start_date','target_date'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', req.params.id)
      .eq('owner_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Project not found.' });
    res.json(data);
  } catch (err) { next(err); }
});

// ─── DELETE /api/projects/:id ─────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id)
      .eq('owner_id', req.user.id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
