'use strict';

const express  = require('express');
const router   = express.Router();
const supabase = require('../services/supabase');
const auth     = require('../middleware/auth');

router.use(auth);

// ─── GET /api/notes ───────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { category, q, project_id } = req.query;
    let query = supabase
      .from('notes')
      .select('*')
      .eq('user_id', req.user.id)
      .order('is_pinned', { ascending: false })
      .order('updated_at',  { ascending: false });

    if (category && category !== 'All Notes') query = query.eq('category', category);
    if (project_id) query = query.eq('project_id', project_id);
    if (q) {
      // ilike on title; full-text on content is a future enhancement
      query = query.ilike('title', `%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// ─── GET /api/notes/categories ────────────────────────────────
// Returns category name → count map
router.get('/categories', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('category')
      .eq('user_id', req.user.id);

    if (error) throw error;
    const counts = {};
    data.forEach(n => { counts[n.category] = (counts[n.category] || 0) + 1; });
    res.json(counts);
  } catch (err) { next(err); }
});

// ─── GET /api/notes/:id ───────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Note not found.' });
    res.json(data);
  } catch (err) { next(err); }
});

// ─── POST /api/notes ──────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { title, content, category, project_id, is_pinned } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Note title is required.' });
    }

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id:    req.user.id,
        project_id: project_id || null,
        title:      title.trim(),
        content:    content || '',
        category:   category || 'General',
        is_pinned:  is_pinned ?? false,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activity_log').insert({
      user_id:    req.user.id,
      type:       'note',
      text:       `Created note "${title.trim()}"`,
      project_id: project_id || null,
    });

    res.status(201).json(data);
  } catch (err) { next(err); }
});

// ─── PATCH /api/notes/:id ─────────────────────────────────────
router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['title','content','category','project_id','is_pinned'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Note not found.' });
    res.json(data);
  } catch (err) { next(err); }
});

// ─── DELETE /api/notes/:id ────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
