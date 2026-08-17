/**
 * DevVault — Tasks Feature Module
 *
 * Kanban CRUD — API-first, localStorage fallback.
 */

import { Tasks as LocalTasks, formatDate } from '../data.js';
import { apiFetch, getToken } from '../app.js';

// ─── Read ──────────────────────────────────────────────────────
export async function getTasks(filters = {}) {
  if (!getToken()) {
    let tasks = LocalTasks.all();
    if (filters.project_id) tasks = tasks.filter(t => (t.projectId || t.project_id) === filters.project_id);
    if (filters.status)     tasks = tasks.filter(t => t.status === filters.status);
    return tasks;
  }
  const params = new URLSearchParams();
  if (filters.project_id) params.set('project_id', filters.project_id);
  if (filters.status)     params.set('status', filters.status);
  if (filters.priority)   params.set('priority', filters.priority);
  const qs = params.toString();
  return apiFetch(`/api/tasks${qs ? '?' + qs : ''}`);
}

// ─── Create ────────────────────────────────────────────────────
export async function createTask(data) {
  if (!getToken()) return LocalTasks.create(data);
  return apiFetch('/api/tasks', { method: 'POST', body: JSON.stringify(data) });
}

// ─── Update ────────────────────────────────────────────────────
export async function updateTask(id, data) {
  if (!getToken()) { LocalTasks.update(id, data); return LocalTasks.get(id); }
  return apiFetch(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function moveTask(id, newStatus) {
  if (!getToken()) { LocalTasks.move(id, newStatus); return LocalTasks.get(id); }
  return apiFetch(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
}

// ─── Delete ────────────────────────────────────────────────────
export async function deleteTask(id) {
  if (!getToken()) return LocalTasks.delete(id);
  return apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
}

// ─── Bulk reorder ──────────────────────────────────────────────
export async function reorderTasks(updates) {
  if (!getToken()) {
    updates.forEach(u => LocalTasks.update(u.id, { position: u.position, status: u.status }));
    return;
  }
  return apiFetch('/api/tasks/reorder', { method: 'PATCH', body: JSON.stringify({ updates }) });
}

// ─── Kanban column definitions ────────────────────────────────
export const COLUMNS = [
  { id: 'backlog',     label: 'Backlog',     color: '#8B8B98' },
  { id: 'todo',        label: 'Todo',        color: '#3B82F6' },
  { id: 'in-progress', label: 'In Progress', color: '#7C5CFF' },
  { id: 'review',      label: 'Review',      color: '#F59E0B' },
  { id: 'done',        label: 'Done',        color: '#22C55E' },
];

export const PRIORITY_BADGE = {
  critical: 'badge-danger',
  high:     'badge-warning',
  medium:   'badge-info',
  low:      'badge-success',
};

// ─── Task card HTML ────────────────────────────────────────────
export function taskCardHTML(task, projectName = '') {
  const pBadge = PRIORITY_BADGE[task.priority] || 'badge-muted';
  const due    = task.due_date || task.dueDate;
  const isDone = task.status === 'done';
  return `
    <div class="task-card${isDone ? ' done-card' : ''}" data-id="${task.id}" draggable="true">
      <div class="card-title">${task.title}</div>
      <div class="card-meta">
        <span class="badge ${pBadge}" style="font-size:.62rem">${task.priority}</span>
        ${due ? `<span style="font-size:.68rem;color:var(--text-faint)">📅 ${formatDate(due)}</span>` : ''}
        ${projectName ? `<span class="card-project">${projectName}</span>` : ''}
      </div>
    </div>`;
}

// ─── Task row HTML (list / upcoming view) ─────────────────────
export function taskRowHTML(task, projectName = '') {
  const pBadge    = PRIORITY_BADGE[task.priority] || 'badge-muted';
  const due       = task.due_date || task.dueDate;
  const isOverdue = due && new Date(due) < new Date() && task.status !== 'done';
  return `
    <div class="flex items-center gap-md" style="padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer" data-id="${task.id}">
      <div style="flex:1">
        <div style="font-size:.85rem;font-weight:500">${task.title}</div>
        ${projectName ? `<div style="font-size:.72rem;color:var(--text-muted)">${projectName}</div>` : ''}
      </div>
      <span class="badge ${pBadge}" style="font-size:.65rem">${task.priority}</span>
      ${due ? `<span style="font-size:.72rem;color:${isOverdue ? 'var(--danger)' : 'var(--text-faint)'}">${formatDate(due)}</span>` : ''}
      <span class="badge badge-muted" style="font-size:.65rem">${task.status}</span>
    </div>`;
}
