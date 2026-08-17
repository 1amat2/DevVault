/**
 * DevVault — Notes Feature Module
 *
 * Markdown notes CRUD — API-first, localStorage fallback.
 */

import { Notes as LocalNotes, timeAgo, formatDate } from '../data.js';
import { apiFetch, getToken } from '../app.js';

// ─── Read ──────────────────────────────────────────────────────
export async function getNotes(filters = {}) {
  if (!getToken()) {
    let notes = LocalNotes.all();
    if (filters.category && filters.category !== 'All Notes')
      notes = notes.filter(n => n.category === filters.category);
    if (filters.q) notes = LocalNotes.search(filters.q);
    if (filters.project_id)
      notes = notes.filter(n => (n.projectId || n.project_id) === filters.project_id);
    return notes;
  }

  const params = new URLSearchParams();
  if (filters.category && filters.category !== 'All Notes') params.set('category', filters.category);
  if (filters.q)          params.set('q', filters.q);
  if (filters.project_id) params.set('project_id', filters.project_id);
  const qs = params.toString();
  return apiFetch(`/api/notes${qs ? '?' + qs : ''}`);
}

export async function getNote(id) {
  if (!getToken()) return LocalNotes.get(id);
  return apiFetch(`/api/notes/${id}`);
}

export async function getCategories() {
  if (!getToken()) return LocalNotes.categories();
  const data = await apiFetch('/api/notes/categories');
  return data; // { category: count }
}

// ─── Create ────────────────────────────────────────────────────
export async function createNote(data) {
  if (!getToken()) return LocalNotes.create(data);
  return apiFetch('/api/notes', { method: 'POST', body: JSON.stringify(data) });
}

// ─── Update / auto-save ────────────────────────────────────────
export async function updateNote(id, data) {
  if (!getToken()) { LocalNotes.update(id, data); return LocalNotes.get(id); }
  return apiFetch(`/api/notes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function pinNote(id, pinned) {
  return updateNote(id, { is_pinned: pinned });
}

// ─── Delete ────────────────────────────────────────────────────
export async function deleteNote(id) {
  if (!getToken()) return LocalNotes.delete(id);
  return apiFetch(`/api/notes/${id}`, { method: 'DELETE' });
}

// ─── Note list item HTML ───────────────────────────────────────
export function noteItemHTML(note, isActive = false) {
  const pinned  = note.is_pinned || note.pinned;
  const updated = note.updated_at || note.updatedAt;
  const raw     = note.content || '';
  // Strip Markdown for preview
  const preview = raw.replace(/[#*`\-_>~\[\]]/g, '').split('\n').filter(l => l.trim()).slice(0, 2).join(' ');

  return `
    <div class="note-item${isActive ? ' active' : ''}" data-id="${note.id}">
      <div class="ni-title">${pinned ? '📌 ' : ''}${note.title}</div>
      <div class="ni-preview">${preview.substring(0, 72)}${preview.length > 72 ? '…' : ''}</div>
      <div class="ni-meta">
        <span class="tag" style="font-size:.62rem">${note.category}</span>
        <span class="ni-time">${timeAgo(updated)}</span>
      </div>
    </div>`;
}

// ─── Category sidebar item HTML ────────────────────────────────
export function categoryItemHTML(label, count, isActive = false) {
  return `
    <div class="cat-item${isActive ? ' active' : ''}" data-cat="${label}">
      <span>${label}</span>
      <span class="cat-count">${count}</span>
    </div>`;
}

// ─── Word count helper ─────────────────────────────────────────
export function wordCount(text) {
  return (text || '').split(/\s+/).filter(Boolean).length;
}

// ─── Known categories for the dropdown ────────────────────────
export const NOTE_CATEGORIES = [
  'General','JavaScript','TypeScript','Python','C#','SQL','Git',
  'Linux','Supabase','Node.js','APIs','DevOps','Algorithms',
  'Architecture','Career','Ideas',
];
