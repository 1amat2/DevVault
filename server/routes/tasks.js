'use strict';

const express  = require('express');
const router   = express.Router();
const supabase = require('../services/supabase');
const auth     = require('../middleware/auth');

router.use(auth);

// ─── GET /api/tasks ───────────────────────────────────────────
// Optional query params: ?project_id=&status=&priority=
router.get('/', async (req, res, next) => {
  try {
    const { project_id, status, priority } = req.query;
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', req.user.id)
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });

    if (project_id) query = query.eq('project_id', project_id);
    if (status)     query = query.eq('status', status);
    if (priority)   query = query.eq('priority', priority);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// ─── GET /api/tasks/:id ───────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Task not found.' });
    res.json(data);
  } catch (err) { next(err); }
});

// ─── POST /api/tasks ──────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { title, description, project_id, status, priority, due_date, position } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id:     req.user.id,
        project_id:  project_id || null,
        title:       title.trim(),
        description,
        status:      status   || 'todo',
        priority:    priority || 'medium',
        due_date:    due_date || null,
        position:    position || 0,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activity_log').insert({
      user_id:    req.user.id,
      type:       'task',
      text:       `Created task "${title.trim()}"`,
      project_id: project_id || null,
    });

    res.status(201).json(data);
  } catch (err) { next(err); }
});

// ─── PATCH /api/tasks/:id ─────────────────────────────────────
router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['title','description','status','priority','due_date','project_id','position'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Task not found.' });

    // If status changed, log activity and recalculate project progress
    if (updates.status) {
      await supabase.from('activity_log').insert({
        user_id:    req.user.id,
        type:       'task',
        text:       `Moved "${data.title}" to ${updates.status}`,
        project_id: data.project_id || null,
      });

      if (data.project_id) {
        await recalcProjectProgress(data.project_id, req.user.id);
      }
    }

    res.json(data);
  } catch (err) { next(err); }
});

// ─── DELETE /api/tasks/:id ────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    // Fetch first so we know the project_id
    const { data: task } = await supabase
      .from('tasks')
      .select('project_id')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    if (task?.project_id) {
      await recalcProjectProgress(task.project_id, req.user.id);
    }

    res.status(204).send();
  } catch (err) { next(err); }
});

// ─── PATCH /api/tasks/reorder — bulk position update ─────────
router.patch('/reorder', async (req, res, next) => {
  try {
    // body: { updates: [{ id, position, status }] }
    const { updates } = req.body;
    if (!Array.isArray(updates) || !updates.length) {
      return res.status(400).json({ error: 'updates array is required.' });
    }

    const promises = updates.map(u =>
      supabase.from('tasks')
        .update({ position: u.position, status: u.status, updated_at: new Date().toISOString() })
        .eq('id', u.id)
        .eq('user_id', req.user.id)
    );
    await Promise.all(promises);
    res.json({ message: 'Reordered.' });
  } catch (err) { next(err); }
});

// ─── Helper: recalculate project progress ────────────────────
async function recalcProjectProgress(projectId, userId) {
  const { data: tasks } = await supabase
    .from('tasks')
    .select('status')
    .eq('project_id', projectId)
    .eq('user_id', userId);

  if (!tasks || !tasks.length) return;
  const done     = tasks.filter(t => t.status === 'done').length;
  const progress = Math.round((done / tasks.length) * 100);

  await supabase
    .from('projects')
    .update({ progress, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .eq('owner_id', userId);
}

module.exports = router;
