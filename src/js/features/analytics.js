/**
 * DevVault — Analytics Feature Module
 *
 * Computes developer analytics from local data and (eventually) the API.
 * Chart rendering helpers are also here so analytics.html stays clean.
 */

import { Projects as LocalProjects, Tasks as LocalTasks, Activity as LocalActivity } from '../data.js';
import { apiFetch, getToken } from '../app.js';

// ─── Fetch analytics summary ──────────────────────────────────
export async function getAnalytics() {
  const tasks    = getToken() ? await apiFetch('/api/tasks').catch(() => LocalTasks.all()) : LocalTasks.all();
  const projects = getToken() ? await apiFetch('/api/projects').catch(() => LocalProjects.all()) : LocalProjects.all();
  const activity = getToken() ? await apiFetch('/api/activity').catch(() => LocalActivity.all()) : LocalActivity.all();

  return compute(projects, tasks, activity);
}

// ─── Compute stats from raw data ─────────────────────────────
export function compute(projects, tasks, activity = []) {
  const done    = tasks.filter(t => t.status === 'done');
  const pending = tasks.filter(t => t.status !== 'done');
  const active  = projects.filter(p => p.status === 'active');

  // Task velocity: done tasks per week for the last 8 weeks
  const now         = Date.now();
  const weekMs      = 7 * 86400000;
  const taskVelocity = Array.from({ length: 8 }, (_, i) => {
    const start = now - (i + 1) * weekMs;
    const end   = now - i * weekMs;
    return done.filter(t => {
      const ts = new Date(t.updated_at || t.updatedAt || t.createdAt).getTime();
      return ts >= start && ts < end;
    }).length;
  }).reverse();

  // Language breakdown from project tech stacks
  const langCount = {};
  projects.forEach(p => {
    (p.tech || []).forEach(t => { langCount[t] = (langCount[t] || 0) + 1; });
  });
  const totalLangMentions = Object.values(langCount).reduce((s, v) => s + v, 0) || 1;
  const languages = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, pct: Math.round((count / totalLangMentions) * 100) }));

  // Simulated daily commits (7 days)
  const dailyCommits = generateSimulatedCommits(activity, 7);

  // Monthly commits (last 12 months, simulated)
  const monthlyCommits = generateMonthlyCommits(12);

  // Velocity stats
  const thisWeekTasks = taskVelocity[taskVelocity.length - 1];
  const lastWeekTasks = taskVelocity[taskVelocity.length - 2] || 0;
  const velocityDelta = lastWeekTasks > 0
    ? Math.round(((thisWeekTasks - lastWeekTasks) / lastWeekTasks) * 100)
    : 100;

  return {
    summary: {
      totalCommits:     247,
      commitsThisWeek:  dailyCommits.reduce((s, v) => s + v, 0),
      codingHours:      '18h 45m',
      codingHoursNum:   18.75,
      activeProjects:   active.length,
      doneTasks:        done.length,
      pendingTasks:     pending.length,
      velocityDelta,
    },
    taskVelocity,
    dailyCommits,
    monthlyCommits,
    languages,
    projectProgress: active.slice(0, 5).map(p => ({
      name:     p.name,
      progress: p.progress || 0,
      color:    p.color || '#7C5CFF',
    })),
  };
}

// ─── Simulated daily commits from activity ────────────────────
function generateSimulatedCommits(activity, days) {
  return Array.from({ length: days }, (_, i) => {
    const base = 3 + Math.floor(Math.random() * 12);
    return i === days - 1 ? Math.max(base, 5) : base;
  });
}

function generateMonthlyCommits(months) {
  return Array.from({ length: months }, (_, i) => {
    const seasonal = Math.sin((i / months) * Math.PI) * 20;
    return Math.max(5, Math.round(15 + seasonal + Math.random() * 15));
  });
}

// ─── Chart helpers (Canvas 2D, no library) ───────────────────

function getCtx(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0) return null;
  canvas.width  = rect.width  * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, w: rect.width, h: rect.height };
}

/** Animated smooth line chart with gradient fill */
export function drawLineChart(canvasId, data, color = '#7C5CFF') {
  const r = getCtx(canvasId);
  if (!r) return;
  const { ctx, w, h } = r;
  const pad = { top: 16, right: 12, bottom: 8, left: 12 };
  const maxVal  = Math.max(...data, 1) * 1.25;
  const stepX   = (w - pad.left - pad.right) / (data.length - 1);

  const pts = data.map((v, i) => ({
    x: pad.left + i * stepX,
    y: pad.top + (h - pad.top - pad.bottom) * (1 - v / maxVal),
  }));

  let progress = 0;
  const dur   = 900;
  const start = performance.now();

  function animate(now) {
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(39,39,51,.6)';
    ctx.lineWidth   = 1;
    for (let i = 0; i <= 3; i++) {
      const y = pad.top + ((h - pad.top - pad.bottom) / 3) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
    }

    progress = Math.min((now - start) / dur, 1);
    const ease    = 1 - Math.pow(1 - progress, 3);
    const visible = Math.ceil(ease * (pts.length - 1));
    const vPts    = pts.slice(0, visible + 1);
    if (vPts.length < 2) { requestAnimationFrame(animate); return; }

    // Fill gradient
    ctx.beginPath();
    ctx.moveTo(vPts[0].x, h - pad.bottom);
    vPts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(vPts[vPts.length - 1].x, h - pad.bottom);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
    grad.addColorStop(0, color + '55');
    grad.addColorStop(1, color + '05');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(vPts[0].x, vPts[0].y);
    for (let i = 1; i < vPts.length; i++) {
      const cpx1 = vPts[i - 1].x + stepX * 0.4;
      const cpx2 = vPts[i].x     - stepX * 0.4;
      ctx.bezierCurveTo(cpx1, vPts[i - 1].y, cpx2, vPts[i].y, vPts[i].x, vPts[i].y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2.5;
    ctx.stroke();

    // Dots
    vPts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle   = color; ctx.fill();
      ctx.strokeStyle = '#0A0A0F'; ctx.lineWidth = 2; ctx.stroke();
    });

    if (progress < 1) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

/** Animated bar chart */
export function drawBarChart(canvasId, data, colors = ['#7C5CFF']) {
  const r = getCtx(canvasId);
  if (!r) return;
  const { ctx, w, h } = r;
  const pad    = { top: 16, right: 8, bottom: 4, left: 12 };
  const maxVal = Math.max(...data, 1) * 1.25;
  const spacing = (w - pad.left - pad.right) / data.length;
  const barW    = spacing * 0.6;

  let p = 0;
  const dur   = 900;
  const start = performance.now();

  function animate(now) {
    ctx.clearRect(0, 0, w, h);
    p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);

    data.forEach((v, i) => {
      const fullH = (v / maxVal) * (h - pad.top - pad.bottom);
      const barH  = fullH * ease;
      const x     = pad.left + i * spacing + spacing * 0.2;
      const y     = h - pad.bottom - barH;
      const col   = colors[i % colors.length];
      const grd   = ctx.createLinearGradient(0, y, 0, h - pad.bottom);
      grd.addColorStop(0, col);
      grd.addColorStop(1, col + '44');
      ctx.fillStyle = grd;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
      else ctx.rect(x, y, barW, barH);
      ctx.fill();
      if (p >= 0.95) {
        ctx.fillStyle  = '#8B8B98';
        ctx.font       = '9px Inter';
        ctx.textAlign  = 'center';
        ctx.fillText(v, x + barW / 2, y - 4);
      }
    });
    if (p < 1) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

/** Animated donut chart */
export function drawDonutChart(canvasId, segments) {
  // segments: [{ label, value, color }]
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx   = canvas.getContext('2d');
  const cx    = canvas.width  / 2;
  const cy    = canvas.height / 2;
  const r     = Math.min(cx, cy) * 0.72;
  const lineW = r * 0.35;
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;

  let startAngle = -Math.PI / 2;
  let p = 0;
  const dur   = 800;
  const start = performance.now();

  function animate(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);

    segments.forEach(seg => {
      const slice = (seg.value / total) * Math.PI * 2 * ease;
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, startAngle + slice);
      ctx.strokeStyle = seg.color;
      ctx.lineWidth   = lineW;
      ctx.stroke();
      startAngle += (seg.value / total) * Math.PI * 2;
    });
    // Reset for next frame
    if (p < 1) { startAngle = -Math.PI / 2; requestAnimationFrame(animate); }
  }
  requestAnimationFrame(animate);
}

// ─── GitHub-style contribution heatmap ────────────────────────
export function renderHeatmap(containerId, weeks = 52) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const grid = document.createElement('div');
  grid.style.cssText = `display:grid;grid-template-rows:repeat(7,12px);grid-auto-flow:column;gap:3px;`;
  let total = 0;

  for (let i = 0; i < weeks * 7; i++) {
    const r   = Math.random();
    const lvl = r < 0.42 ? 0 : r < 0.58 ? 1 : r < 0.73 ? 2 : r < 0.88 ? 3 : 4;
    total    += lvl;
    const cell = document.createElement('div');
    cell.className = 'heatmap-cell' + (lvl > 0 ? ` l${lvl}` : '');
    cell.style.cssText = 'width:12px;height:12px;border-radius:2px;';
    cell.title = `${lvl} contribution${lvl !== 1 ? 's' : ''}`;
    grid.appendChild(cell);
  }

  container.innerHTML = '';
  container.appendChild(grid);
  return total;
}
