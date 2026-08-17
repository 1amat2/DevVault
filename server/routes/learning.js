'use strict';

const express  = require('express');
const router   = express.Router();
const supabase = require('../services/supabase');
const auth     = require('../middleware/auth');

router.use(auth);

// ─── GET /api/learning ────────────────────────────────────────
// Returns all learning items, optionally filtered by status
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = supabase
      .from('learning_items')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) { next(err); }
});

// ─── GET /api/learning/:id ────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('learning_items')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Learning item not found.' });
    res.json(data);
  } catch (err) { next(err); }
});

// ─── POST /api/learning ───────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { technology, description, progress, status, icon, color, start_date, target_date } = req.body;
    if (!technology || !technology.trim()) {
      return res.status(400).json({ error: 'technology is required.' });
    }

    const { data, error } = await supabase
      .from('learning_items')
      .insert({
        user_id:     req.user.id,
        technology:  technology.trim(),
        description: description || null,
        progress:    progress ?? 0,
        status:      status || 'in-progress',
        icon:        icon || '📚',
        color:       color || '#7C5CFF',
        start_date:  start_date || null,
        target_date: target_date || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
});

// ─── PATCH /api/learning/:id ──────────────────────────────────
router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['technology','description','progress','status','icon','color','start_date','target_date','completed_date'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('learning_items')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Learning item not found.' });
    res.json(data);
  } catch (err) { next(err); }
});

// ─── DELETE /api/learning/:id ─────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('learning_items')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
