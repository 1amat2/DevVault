'use strict';

const express   = require('express');
const router    = express.Router();
const supabase  = require('../services/supabase');
const auth      = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Stricter rate limit for AI calls (expensive)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many AI requests — slow down a bit.' },
});

router.use(auth);
router.use(aiLimiter);

// ─── Lazy-init OpenAI client ──────────────────────────────────
let openai;
function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw Object.assign(new Error('OpenAI API key not configured.'), { status: 503 });
    }
    const { default: OpenAI } = require('openai'); // dynamic require
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

// ─── Helper: gather user context from DB ─────────────────────
async function buildContext(userId) {
  const [{ data: projects }, { data: tasks }, { data: profile }] = await Promise.all([
    supabase
      .from('projects')
      .select('name,status,progress,description,tech,category')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false })
      .limit(10),
    supabase
      .from('tasks')
      .select('title,status,priority')
      .eq('user_id', userId)
      .neq('status', 'done')
      .limit(20),
    supabase
      .from('profiles')
      .select('display_name,bio,github_username')
      .eq('id', userId)
      .single(),
  ]);

  return { projects: projects || [], tasks: tasks || [], profile: profile || {} };
}

// ─── POST /api/ai/chat ────────────────────────────────────────
router.post('/chat', async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const ctx   = await buildContext(req.user.id);
    const ai    = getOpenAI();
    const name  = ctx.profile.display_name || 'Developer';
    const active = ctx.projects.filter(p => p.status === 'active');

    const systemPrompt = `You are DevVault AI, a personal developer productivity assistant for ${name}.

User context:
- Active projects (${active.length}): ${JSON.stringify(active.slice(0, 5))}
- Pending tasks (${ctx.tasks.length}): ${JSON.stringify(ctx.tasks.slice(0, 10))}
- GitHub: ${ctx.profile.github_username || 'not connected'}

You help with:
- Project planning and task breakdowns
- Code questions and debugging
- README and documentation generation
- Developer productivity tips
- Understanding project status

Be concise, helpful, and developer-focused. Use Markdown for code blocks.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      // Include recent history for conversational context (max 10 turns)
      ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message.trim() },
    ];

    const completion = await ai.chat.completions.create({
      model:      'gpt-4o-mini',
      messages,
      max_tokens: 600,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: req.user.id,
      type:    'ai',
      text:    `AI chat: "${message.trim().slice(0, 60)}${message.length > 60 ? '…' : ''}"`,
    });

    res.json({ reply, usage: completion.usage });
  } catch (err) { next(err); }
});

// ─── POST /api/ai/generate-readme ────────────────────────────
router.post('/generate-readme', async (req, res, next) => {
  try {
    const { project_id } = req.body;
    if (!project_id) return res.status(400).json({ error: 'project_id is required.' });

    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', project_id)
      .eq('owner_id', req.user.id)
      .single();

    if (error || !project) return res.status(404).json({ error: 'Project not found.' });

    const ai = getOpenAI();
    const completion = await ai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a technical writer. Generate professional GitHub README files in Markdown.',
        },
        {
          role: 'user',
          content: `Generate a README.md for this project:
Name: ${project.name}
Description: ${project.description || 'A developer project'}
Tech Stack: ${(project.tech || []).join(', ')}
Status: ${project.status}
Category: ${project.category}
${project.live_url ? `Live URL: ${project.live_url}` : ''}
${project.repository_url ? `Repository: ${project.repository_url}` : ''}

Include: title, description, features, tech stack, getting started, and license sections.`,
        },
      ],
      max_tokens: 1200,
    });

    res.json({ readme: completion.choices[0].message.content });
  } catch (err) { next(err); }
});

// ─── POST /api/ai/suggest-tasks ───────────────────────────────
router.post('/suggest-tasks', async (req, res, next) => {
  try {
    const { project_id } = req.body;
    if (!project_id) return res.status(400).json({ error: 'project_id is required.' });

    const [{ data: project }, { data: existingTasks }] = await Promise.all([
      supabase.from('projects').select('*').eq('id', project_id).eq('owner_id', req.user.id).single(),
      supabase.from('tasks').select('title,status').eq('project_id', project_id).eq('user_id', req.user.id),
    ]);

    if (!project) return res.status(404).json({ error: 'Project not found.' });

    const ai = getOpenAI();
    const completion = await ai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a developer productivity assistant. Suggest actionable development tasks in JSON format.',
        },
        {
          role: 'user',
          content: `Suggest 5 concrete development tasks for this project.
Project: ${project.name}
Description: ${project.description || ''}
Tech stack: ${(project.tech || []).join(', ')}
Status: ${project.status} (${project.progress}% complete)
Existing tasks: ${(existingTasks || []).map(t => t.title).join(', ')}

Return JSON array: [{ "title": "...", "description": "...", "priority": "high|medium|low" }]`,
        },
      ],
      max_tokens: 600,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    const tasks  = parsed.tasks || parsed;
    res.json({ tasks: Array.isArray(tasks) ? tasks : [] });
  } catch (err) { next(err); }
});

module.exports = router;
