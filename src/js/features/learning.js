/**
 * DevVault — Learning Feature Module
 *
 * Learning tracker CRUD.
 * The learning_items table in Supabase maps to the
 * localStorage key "dv_learning" used by the existing HTML page.
 */

import { apiFetch, getToken } from '../app.js';

const LS_KEY = 'dv_learning';

// ─── localStorage helpers ─────────────────────────────────────
function lsLoad() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function lsSave(items) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch {}
}

// ─── Read ──────────────────────────────────────────────────────
export async function getLearningItems(status = null) {
  if (!getToken()) {
    let items = lsLoad();
    if (status) items = items.filter(i => i.status === status);
    return items;
  }
  const qs = status ? `?status=${status}` : '';
  return apiFetch(`/api/learning${qs}`);
}

// ─── Create ────────────────────────────────────────────────────
export async function createLearningItem(data) {
  if (!getToken()) {
    const item = {
      id:         'l' + Date.now(),
      tech:       data.technology || data.tech,
      technology: data.technology || data.tech,
      desc:       data.description || data.desc || '',
      description:data.description || data.desc || '',
      status:     data.status || 'in-progress',
      progress:   data.progress || 0,
      icon:       data.icon || '📚',
      color:      data.color || '#7C5CFF',
      start_date: data.start_date || null,
      target_date:data.target_date || null,
    };
    const items = lsLoad();
    items.unshift(item);
    lsSave(items);
    return item;
  }
  return apiFetch('/api/learning', { method: 'POST', body: JSON.stringify(data) });
}

// ─── Update ────────────────────────────────────────────────────
export async function updateLearningItem(id, data) {
  if (!getToken()) {
    const items = lsLoad().map(i => i.id === id ? { ...i, ...data } : i);
    lsSave(items);
    return items.find(i => i.id === id);
  }
  return apiFetch(`/api/learning/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

// ─── Delete ────────────────────────────────────────────────────
export async function deleteLearningItem(id) {
  if (!getToken()) {
    lsSave(lsLoad().filter(i => i.id !== id));
    return;
  }
  return apiFetch(`/api/learning/${id}`, { method: 'DELETE' });
}

// ─── Learning card HTML ────────────────────────────────────────
export function learningCardHTML(item) {
  const tech    = item.technology || item.tech || 'Unknown';
  const desc    = item.description || item.desc || '';
  const progress= item.progress || 0;
  const color   = item.color || '#7C5CFF';
  const icon    = item.icon || '📚';
  const statusLabels = {
    'in-progress': { label: 'In Progress', cls: 'badge-info' },
    'completed':   { label: 'Completed',   cls: 'badge-success' },
    'not-started': { label: 'Not Started', cls: 'badge-muted' },
    'paused':      { label: 'Paused',      cls: 'badge-warning' },
  };
  const s = statusLabels[item.status] || { label: item.status, cls: 'badge-muted' };

  return `
    <div class="learning-card">
      <div class="flex items-center gap-md">
        <div class="tech-icon-lg" style="background:${color}22;color:${color}">${icon}</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:.95rem">${tech}</div>
          <div style="font-size:.78rem;color:var(--text-muted)">${desc}</div>
        </div>
        <span class="badge ${s.cls}">${s.label}</span>
      </div>

      <div>
        <div class="progress-label">
          <span style="font-size:.78rem;color:var(--text-muted)">Progress</span>
          <span style="font-size:.78rem;font-weight:700;color:${color}">${progress}%</span>
        </div>
        <div class="progress-bar progress-bar-lg">
          <div class="fill" style="width:${progress}%;background:${color}"></div>
        </div>
      </div>

      <div class="flex items-center gap-sm" style="margin-top:4px">
        <input type="range" min="0" max="100" value="${progress}" data-progress="${item.id}"
          style="flex:1;accent-color:${color}" />
        <button class="btn btn-ghost btn-sm btn-icon" data-del="${item.id}" title="Remove">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>`;
}

// ─── Status options ────────────────────────────────────────────
export const LEARNING_STATUSES = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'paused',      label: 'Paused' },
  { value: 'completed',   label: 'Completed' },
];
