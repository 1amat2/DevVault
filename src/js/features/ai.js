/**
 * DevVault — AI Feature Module
 *
 * Chat interface helpers and API wrapper for /api/ai/*.
 * Falls back to a local simulation when no API key is configured.
 */

import { Projects as LocalProjects, Tasks as LocalTasks, Notes as LocalNotes, Profile } from '../data.js';
import { apiFetch, getToken } from '../app.js';

// ─── Chat history (in-memory for the session) ─────────────────
let chatHistory = [];

export function clearHistory() { chatHistory = []; }
export function getHistory()   { return [...chatHistory]; }

// ─── Send a message ────────────────────────────────────────────
export async function sendMessage(message) {
  if (!message?.trim()) throw new Error('Message is required.');

  chatHistory.push({ role: 'user', content: message.trim() });

  let reply;
  if (getToken()) {
    const data = await apiFetch('/api/ai/chat', {
      method: 'POST',
      body:   JSON.stringify({ message: message.trim(), history: chatHistory.slice(-10) }),
    });
    reply = data.reply;
  } else {
    reply = simulateReply(message);
  }

  chatHistory.push({ role: 'assistant', content: reply });
  return reply;
}

// ─── Generate README ──────────────────────────────────────────
export async function generateReadme(projectId) {
  if (!getToken()) {
    const p = LocalProjects.get(projectId);
    return simulateReadme(p);
  }
  const data = await apiFetch('/api/ai/generate-readme', {
    method: 'POST',
    body:   JSON.stringify({ project_id: projectId }),
  });
  return data.readme;
}

// ─── Suggest tasks ────────────────────────────────────────────
export async function suggestTasks(projectId) {
  if (!getToken()) return simulateTasks(projectId);
  const data = await apiFetch('/api/ai/suggest-tasks', {
    method: 'POST',
    body:   JSON.stringify({ project_id: projectId }),
  });
  return data.tasks || [];
}

// ─── Chat bubble HTML ─────────────────────────────────────────
export function bubbleHTML(content, isUser = false) {
  return `
    <div class="msg-row${isUser ? ' user' : ''}">
      ${!isUser ? `
        <div class="msg-meta">
          <div class="ai-avatar-sm">AI</div>
          <span style="font-size:.78rem;font-weight:600">DevVault AI</span>
        </div>` : ''}
      <div class="bubble ${isUser ? 'user' : 'ai'}">${isUser ? escapeHtml(content) : content}</div>
      <div class="msg-time">just now</div>
    </div>`;
}

export function typingIndicatorHTML() {
  return `
    <div class="msg-row" id="typing-indicator">
      <div class="msg-meta">
        <div class="ai-avatar-sm">AI</div>
      </div>
      <div class="bubble ai" style="padding:12px 16px">
        <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
      </div>
    </div>`;
}

// ─── Suggested prompts ────────────────────────────────────────
export const SUGGESTED_PROMPTS = [
  "What should I work on next?",
  "Summarise my active projects",
  "How many tasks do I have pending?",
  "Generate a README for my top project",
  "Give me a project idea based on my stack",
  "What's my most overdue task?",
];

// ─── Local simulation (no API key) ────────────────────────────
function simulateReply(msg) {
  const lmsg    = msg.toLowerCase();
  const projects= LocalProjects.all();
  const pending = LocalTasks.all().filter(t => t.status !== 'done');
  const profile = Profile.get();

  if (/next|focus|work on|priority/.test(lmsg)) {
    const top = pending
      .filter(t => t.status === 'in-progress' || t.status === 'todo')
      .sort((a, b) => { const o = {critical:0,high:1,medium:2,low:3}; return (o[a.priority]||2)-(o[b.priority]||2); });
    const t   = top[0];
    const proj= t ? projects.find(p => p.id === (t.projectId || t.project_id)) : null;
    if (t) return `Your top priority right now is:<br><br>🎯 <strong>${t.title}</strong>${proj ? ` — <em>${proj.name}</em>` : ''}<br>Priority: <strong>${t.priority}</strong><br><br>Want me to break this task down into smaller steps?`;
    return "You have no pending tasks. Time to add some goals! 🚀";
  }

  if (/summarise|summary|overview|active project/.test(lmsg)) {
    const active = projects.filter(p => p.status === 'active');
    if (!active.length) return "You don't have any active projects right now. Create one from the Projects page!";
    const list = active.map(p => `• <strong>${p.name}</strong> — ${p.progress || 0}% complete`).join('<br>');
    return `You have <strong>${active.length} active project${active.length > 1 ? 's' : ''}</strong>:<br><br>${list}<br><br>Which one do you want to focus on?`;
  }

  if (/how many task|pending task/.test(lmsg)) {
    return `You have <strong>${pending.length} pending tasks</strong> across all projects.<br><br>
${pending.filter(t=>t.priority==='critical').length} critical · 
${pending.filter(t=>t.priority==='high').length} high · 
${pending.filter(t=>t.priority==='medium').length} medium · 
${pending.filter(t=>t.priority==='low').length} low`;
  }

  if (/readme|documentation/.test(lmsg)) {
    const p = projects.find(pr => pr.status === 'active') || projects[0];
    return p
      ? `I can generate a README for <strong>${p.name}</strong>.<br><br>Connect an OpenAI API key in Settings → Integrations to enable AI generation. I'd include: title, description, tech stack, getting started, folder structure, and a license.`
      : "Add a project first, then ask me to generate its README.";
  }

  if (/idea|what should i build/.test(lmsg)) {
    return `Based on your stack, here are some ideas:<br><br>
1. 🔐 <strong>Auth Starter</strong> — Supabase + vanilla JS boilerplate<br>
2. 📊 <strong>CLI Time Tracker</strong> — log coding sessions from the terminal<br>
3. 🤖 <strong>README Generator</strong> — AI-powered docs from your package.json<br>
4. 🗂 <strong>API Mock Server</strong> — local mock API for frontend dev<br>
5. 📝 <strong>Personal Finance Tracker</strong> — Node.js + PostgreSQL<br><br>
Want me to create a task list for any of these?`;
  }

  if (/streak/.test(lmsg)) {
    return `Your current streak is <strong>${profile.streak || 12} days</strong> 🔥<br><br>Keep it up — consistency compounds!`;
  }

  // Default
  return `I understand you're asking about "<strong>${escapeHtml(msg)}</strong>".<br><br>
You have <strong>${projects.filter(p=>p.status==='active').length} active projects</strong> and <strong>${pending.length} pending tasks</strong>.<br><br>
Connect an OpenAI API key in Settings to unlock the full AI assistant. For now I can answer questions about your projects and tasks!`;
}

function simulateReadme(project) {
  if (!project) return '# Project\n\nAdd project details to generate a README.';
  return `# ${project.name}\n\n> ${project.description || 'A developer project.'}\n\n## Tech Stack\n\n${(project.tech || []).map(t => `- ${t}`).join('\n') || '- JavaScript'}\n\n## Getting Started\n\n\`\`\`bash\ngit clone ${project.repo || 'https://github.com/username/' + project.name.toLowerCase()}\ncd ${project.name.toLowerCase()}\nnpm install\nnpm run dev\n\`\`\`\n\n## License\n\nMIT`;
}

function simulateTasks(projectId) {
  const project = LocalProjects.get(projectId);
  if (!project) return [];
  return [
    { title: `Write unit tests for ${project.name}`,   description: 'Cover core functions with Jest or similar.', priority: 'high'   },
    { title: 'Add error boundary handling',             description: 'Handle edge cases and API failures gracefully.', priority: 'high'   },
    { title: 'Set up CI/CD pipeline',                  description: 'Automate testing and deployment with GitHub Actions.', priority: 'medium' },
    { title: 'Update README documentation',             description: 'Document setup, usage, and API endpoints.', priority: 'medium' },
    { title: 'Optimise database queries',               description: 'Add indexes and review slow queries.', priority: 'low'    },
  ];
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
