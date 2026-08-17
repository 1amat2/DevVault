'use strict';

const express  = require('express');
const router   = express.Router();
const supabase = require('../services/supabase');
const auth     = require('../middleware/auth');

router.use(auth);

// ─── GET /api/activity ────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json(data || []);
  } catch (err) { next(err); }
});

// ─── GET /api/activity/:projectId ─────────────────────────────
// Returns activity for a specific project
router.get('/:projectId', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('project_id', req.params.projectId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data || []);
  } catch (err) { next(err); }
});

// ─── POST /api/activity ───────────────────────────────────────
// Create an activity entry (typically done by other routes)
router.post('/', async (req, res, next) => {
  try {
    const { type, text, project_id } = req.body;
    if (!type) return res.status(400).json({ error: 'type is required.' });

    const { data, error } = await supabase
      .from('activity_log')
      .insert({
        user_id:    req.user.id,
        type,
        text:       text || '',
        project_id: project_id || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
});

module.exports = router;
