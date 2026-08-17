/**
 * DevVault — Dashboard Feature Module
 *
 * Provides functions to fetch dashboard data from the API
 * (or fall back to localStorage via data.js if running without a server).
 *
 * Usage in index.html (type="module"):
 *   import { loadDashboard } from '../js/features/dashboard.js';
 *   await loadDashboard();
 */

import { Projects, Tasks, Activity, Stats, Profile, timeAgo, formatDate } from '../data.js';
import { getToken, apiFetch, isApiAvailable } from '../app.js';

// ─── Load all dashboard data ──────────────────────────────────
export async function loadDashboard() {
  if (await isApiAvailable()) {
    return loadFromApi();
  }
  return loadFromLocalStorage();
}

// ─── API version ──────────────────────────────────────────────
async function loadFromApi() {
  const [projects, tasks, activity, profileData] = await Promise.all([
    apiFetch('/api/projects'),
    apiFetch('/api/tasks'),
    apiFetch('/api/activity').catch(() => []),
    apiFetch('/api/auth/me').then(d => d.profile).catch(() => null),
  ]);

  return normalise({ projects, tasks, activity, profile: profileData });
}

// ─── localStorage fallback ────────────────────────────────────
function loadFromLocalStorage() {
  return normalise({
    projects: Projects.all(),
    tasks:    Tasks.all(),
    activity: Activity.all(),
    profile:  Profile.get(),
  });
}

// ─── Normalise to dashboard shape ────────────────────────────
function normalise({ projects, tasks, activity, profile }) {
  const activeProjects    = projects.filter(p => p.status === 'active');
  const pendingTasks      = tasks.filter(t => t.status !== 'done');
  const inProgressTasks   = tasks.filter(t => t.status === 'in-progress');
  const highPriorityFirst = [...inProgressTasks].sort((a, b) => {
    const order = { critical:0, high:1, medium:2, low:3 };
    return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
  });

  const focusTask = highPriorityFirst[0] || null;
  const focusProject = focusTask
    ? projects.find(p => p.id === (focusTask.project_id || focusTask.projectId))
    : null;

  // Donut groups
  const statusGroups = {};
  projects.forEach(p => {
    statusGroups[p.status] = (statusGroups[p.status] || 0) + 1;
  });

  // Upcoming tasks (not done, sorted by due_date)
  const upcoming = pendingTasks
    .filter(t => t.due_date || t.dueDate)
    .sort((a, b) => new Date(a.due_date || a.dueDate) - new Date(b.due_date || b.dueDate))
    .slice(0, 6);

  return {
    stats: {
      activeProjects:   activeProjects.length,
      pendingTasks:     pendingTasks.length,
      commitsThisWeek:  profile?.commits_this_week || 23,
      streak:           profile?.streak || (Profile.get?.()?.streak ?? 0),
    },
    focusTask,
    focusProject,
    activity:        (activity || []).slice(0, 8),
    recentProjects:  [...projects].sort((a, b) =>
      new Date(b.updated_at || b.updatedAt) - new Date(a.updated_at || a.updatedAt)
    ).slice(0, 6),
    upcomingTasks:   upcoming,
    statusGroups,
    totalProjects:   projects.length,
    profile:         profile || Profile.get?.() || {},
  };
}

// ─── Render helpers ───────────────────────────────────────────

export function renderActivityFeed(items, containerId = 'activity-feed') {
  const el = document.getElementById(containerId);
  if (!el) return;

  const dotClass = {
    commit: 'adot-commit', task: 'adot-task', note: 'adot-note',
    branch: 'adot-branch', issue: 'adot-issue', project: 'adot-project',
    ai: 'adot-note',
  };

  el.innerHTML = '';
  (items || []).forEach((a, i) => {
    const div = document.createElement('div');
    div.className = 'activity-item anim-fade-up';
    div.style.animationDelay = (0.04 + i * 0.05) + 's';
    const type = a.type || 'project';
    div.innerHTML = `
      <div class="activity-dot ${dotClass[type] || ''}"></div>
      <div class="activity-text" style="flex:1">
        <strong>${a.text || a.message || ''}</strong>
        <br><span style="font-size:.72rem">${a.project || a.repo || ''}</span>
      </div>
      <span class="activity-time">${timeAgo(a.time || a.created_at)}</span>`;
    el.appendChild(div);
  });

  if (!items?.length) {
    el.innerHTML = `<p style="color:var(--text-faint);font-size:.8rem;padding:8px 0">No recent activity yet.</p>`;
  }
}

export function renderFocusTask(task, project) {
  const titleEl   = document.getElementById('focus-title');
  const projectEl = document.getElementById('focus-project');
  const pctEl     = document.getElementById('focus-pct');
  const barEl     = document.getElementById('focus-bar');
  const dueEl     = document.getElementById('focus-due');
  const priorityEl= document.getElementById('focus-priority');

  if (!task) {
    if (titleEl) titleEl.textContent = 'All caught up! 🎉';
    if (projectEl) projectEl.textContent = 'No tasks in progress.';
    return;
  }

  const pct  = project?.progress ?? 0;
  const pMap = { critical:'badge-danger', high:'badge-warning', medium:'badge-info', low:'badge-success' };

  if (titleEl)    titleEl.textContent   = task.title;
  if (projectEl)  projectEl.textContent = project?.name || '';
  if (pctEl)      pctEl.textContent     = pct + '%';
  if (barEl)      barEl.style.width     = pct + '%';
  if (dueEl)      dueEl.textContent     = (task.due_date || task.dueDate)
    ? `Due ${formatDate(task.due_date || task.dueDate)}`
    : 'No deadline set';
  if (priorityEl) {
    const p = task.priority || 'medium';
    priorityEl.className = `badge ${pMap[p] || 'badge-muted'}`;
    priorityEl.textContent = p.charAt(0).toUpperCase() + p.slice(1);
  }
}

export function renderProjectDonut(statusGroups, total, svgId = 'projects-donut', legendId = 'donut-legend') {
  const svg    = document.getElementById(svgId);
  const legend = document.getElementById(legendId);
  const totalEl= document.getElementById('donut-total');
  if (!svg || !legend) return;

  if (totalEl) totalEl.textContent = total;

  const colors = { active:'#22C55E', hold:'#F59E0B', completed:'#7C5CFF', planning:'#3B82F6', idea:'#EC4899', archived:'#555' };
  const labels = { active:'Active', hold:'On Hold', completed:'Done', planning:'Planning', idea:'Idea', archived:'Archived' };
  const r      = 42;
  const circ   = 2 * Math.PI * r;
  let offset   = 0;

  // Remove old arcs (keep the background circle)
  svg.querySelectorAll('.donut-arc').forEach(a => a.remove());
  legend.innerHTML = '';

  Object.entries(statusGroups).forEach(([key, val]) => {
    if (!val) return;
    const dash = (val / (total || 1)) * circ;
    const arc  = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    arc.setAttribute('cx', '55'); arc.setAttribute('cy', '55'); arc.setAttribute('r', r);
    arc.setAttribute('fill', 'none');
    arc.setAttribute('stroke', colors[key] || '#555');
    arc.setAttribute('stroke-width', '14');
    arc.setAttribute('stroke-dasharray', `${dash} ${circ}`);
    arc.setAttribute('stroke-dashoffset', `-${offset}`);
    arc.setAttribute('transform', 'rotate(-90 55 55)');
    arc.classList.add('donut-arc');
    svg.appendChild(arc);
    offset += dash;

    legend.insertAdjacentHTML('beforeend', `
      <div class="legend-item anim-fade-up">
        <div class="legend-dot" style="background:${colors[key] || '#555'}"></div>
        <span style="flex:1;color:var(--text-muted)">${labels[key] || key}</span>
        <span style="font-weight:600">${val}</span>
      </div>`);
  });
}
