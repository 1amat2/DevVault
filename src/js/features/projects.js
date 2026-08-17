/**
 * DevVault — Projects Feature Module
 *
 * CRUD layer for projects — calls the API when a session exists,
 * otherwise falls back to localStorage via data.js.
 */

import { Projects as LocalProjects, timeAgo, statusBadge, priorityColor } from '../data.js';
import { apiFetch, getToken, isApiAvailable } from '../app.js';

// ─── Read ──────────────────────────────────────────────────────
export async function getProjects(filters = {}) {
  if (!getToken()) return LocalProjects.all().filter(p => matchFilters(p, filters));

  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.q)       params.set('q', filters.q);
  const qs = params.toString();

  return apiFetch(`/api/projects${qs ? '?' + qs : ''}`);
}

export async function getProject(id) {
  if (!getToken()) return LocalProjects.get(id);
  return apiFetch(`/api/projects/${id}`);
}

// ─── Create ────────────────────────────────────────────────────
export async function createProject(data) {
  if (!getToken()) return LocalProjects.create(data);
  return apiFetch('/api/projects', { method: 'POST', body: JSON.stringify(data) });
}

// ─── Update ────────────────────────────────────────────────────
export async function updateProject(id, data) {
  if (!getToken()) { LocalProjects.update(id, data); return LocalProjects.get(id); }
  return apiFetch(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

// ─── Delete ────────────────────────────────────────────────────
export async function deleteProject(id) {
  if (!getToken()) return LocalProjects.delete(id);
  return apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
}

// ─── Render a project row (list view) ─────────────────────────
export function projectRowHTML(p) {
  const techTags = (p.tech || []).slice(0, 3).map(t =>
    `<span class="tag" style="font-size:.62rem">${t}</span>`
  ).join('');

  return `
    <a class="project-row" href="project.html?id=${p.id}" data-id="${p.id}">
      <div class="proj-icon-big" style="background:${(p.color || '#7C5CFF')}22;color:${p.color || '#7C5CFF'}">${p.icon || '📁'}</div>
      <div class="proj-body">
        <div class="proj-name">${p.name}</div>
        <div class="proj-desc">${p.description || ''}</div>
        <div class="proj-tags">${techTags}</div>
      </div>
      <div class="proj-right">
        <span class="badge ${statusBadge(p.status)}">${p.status}</span>
        <div style="width:80px">
          <div style="font-size:.68rem;color:var(--text-faint);margin-bottom:3px;text-align:right">${p.progress || 0}%</div>
          <div class="progress-bar"><div class="fill" style="width:${p.progress||0}%;background:${p.color||'var(--primary)'}"></div></div>
        </div>
        <div style="font-size:.68rem;color:var(--text-faint)">${timeAgo(p.updated_at || p.updatedAt)}</div>
      </div>
      <button class="proj-more" data-menu="${p.id}" title="More options" onclick="event.preventDefault();event.stopPropagation()">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
        </svg>
      </button>
    </a>`;
}

// ─── Mini project card (dashboard, grid view) ─────────────────
export function projectMiniHTML(p) {
  return `
    <a class="proj-mini" href="project.html?id=${p.id}">
      <div class="flex items-center gap-sm">
        <div style="font-size:1.3rem">${p.icon || '📁'}</div>
        <div>
          <div style="font-size:.85rem;font-weight:600">${p.name}</div>
          <span class="badge ${statusBadge(p.status)}" style="font-size:.6rem">${p.status}</span>
        </div>
      </div>
      <div style="font-size:.75rem;color:var(--text-muted);margin-top:2px">${(p.description || '').substring(0, 55)}${(p.description || '').length > 55 ? '…' : ''}</div>
      <div>
        <div class="flex items-center justify-between" style="margin-bottom:4px">
          <span style="font-size:.68rem;color:var(--text-faint)">${(p.tech || []).slice(0,2).join(' · ')}</span>
          <span style="font-size:.72rem;font-weight:700;color:${p.color||'var(--primary)'}">${p.progress||0}%</span>
        </div>
        <div class="progress-bar"><div class="fill" style="width:${p.progress||0}%;background:${p.color||'var(--primary)'}"></div></div>
      </div>
    </a>`;
}

// ─── Status options ────────────────────────────────────────────
export const PROJECT_STATUSES = ['idea','planning','active','hold','completed','archived'];
export const PROJECT_CATEGORIES = ['Web','Mobile','Backend','AI','CLI','Game','Design','Other'];

// ─── Helpers ──────────────────────────────────────────────────
function matchFilters(p, filters) {
  if (filters.status && filters.status !== 'all' && p.status !== filters.status) return false;
  if (filters.q) {
    const q = filters.q.toLowerCase();
    if (!p.name.toLowerCase().includes(q) && !(p.description || '').toLowerCase().includes(q)) return false;
  }
  return true;
}
