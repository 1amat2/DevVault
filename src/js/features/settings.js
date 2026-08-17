/**
 * DevVault — Settings Feature Module
 *
 * Profile updates, preferences, data export/import, and
 * account management helpers.
 */

import { Profile as LocalProfile, Projects, Tasks, Notes } from '../data.js';
import { apiFetch, getToken, toast } from '../app.js';

// ─── Load current profile ─────────────────────────────────────
export async function getProfile() {
  if (!getToken()) return LocalProfile.get();
  return apiFetch('/api/auth/me').then(d => d.profile).catch(() => LocalProfile.get());
}

// ─── Save profile ─────────────────────────────────────────────
export async function saveProfile(data) {
  if (!getToken()) {
    LocalProfile.update(data);
    return LocalProfile.get();
  }
  return apiFetch('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(data) });
}

// ─── Change password ──────────────────────────────────────────
export async function changePassword(email) {
  if (!getToken()) {
    // Frontend-only: just show a message
    return { message: 'Connect Supabase to enable password reset emails.' };
  }
  return apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body:   JSON.stringify({ email }),
  });
}

// ─── Theme preference ─────────────────────────────────────────
const THEME_KEY = 'dv_theme';

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  // Future: swap CSS custom properties for light/dim themes
}

// ─── Preferences ──────────────────────────────────────────────
const PREFS_KEY = 'dv_prefs';

export function getPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
  } catch { return {}; }
}

export function savePrefs(prefs) {
  const current = getPrefs();
  localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
}

// ─── Export all data as JSON ───────────────────────────────────
export function exportData() {
  const dump = {
    exported_at: new Date().toISOString(),
    version:     '1.0',
    profile:     LocalProfile.get(),
    projects:    Projects.all(),
    tasks:       Tasks.all(),
    notes:       Notes.all(),
    learning:    JSON.parse(localStorage.getItem('dv_learning') || '[]'),
    activity:    JSON.parse(localStorage.getItem('dv_activity') || '[]'),
  };

  const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `devvault-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Import data from JSON file ───────────────────────────────
export function importData(file, onDone) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.projects) localStorage.setItem('dv_projects', JSON.stringify(data.projects));
      if (data.tasks)    localStorage.setItem('dv_tasks',    JSON.stringify(data.tasks));
      if (data.notes)    localStorage.setItem('dv_notes',    JSON.stringify(data.notes));
      if (data.profile)  localStorage.setItem('dv_profile',  JSON.stringify(data.profile));
      if (data.learning) localStorage.setItem('dv_learning', JSON.stringify(data.learning));
      onDone?.(null, data);
    } catch (err) {
      onDone?.(err, null);
    }
  };
  reader.readAsText(file);
}

// ─── Clear all local data (dangerous) ────────────────────────
export function clearLocalData() {
  const keys = ['dv_projects','dv_tasks','dv_notes','dv_activity','dv_profile','dv_learning','dv_seeded'];
  keys.forEach(k => localStorage.removeItem(k));
}

// ─── Avatar upload (Supabase Storage) ────────────────────────
export async function uploadAvatar(file) {
  if (!getToken()) return null;

  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
  const supabase = createClient(
    window.__SUPABASE_URL__ || '',
    window.__SUPABASE_ANON_KEY__ || ''
  );

  const userId    = JSON.parse(localStorage.getItem('dv_session') || '{}')?.user?.id;
  if (!userId) return null;

  const ext  = file.name.split('.').pop();
  const path = `${userId}/avatar.${ext}`;

  const { data, error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
  await saveProfile({ avatar_url: publicUrl });
  return publicUrl;
}

// ─── Settings tab helper ──────────────────────────────────────
export function initSettingsTabs(defaultTab = 'profile') {
  const tabFromUrl = new URLSearchParams(location.search).get('tab') || defaultTab;
  activateTab(tabFromUrl);

  document.querySelectorAll('[data-settings-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      activateTab(btn.dataset.settingsTab);
      history.replaceState(null, '', `?tab=${btn.dataset.settingsTab}`);
    });
  });
}

function activateTab(id) {
  document.querySelectorAll('[data-settings-tab]').forEach(b => {
    b.classList.toggle('active', b.dataset.settingsTab === id);
  });
  document.querySelectorAll('[data-settings-panel]').forEach(p => {
    p.classList.toggle('active', p.dataset.settingsPanel === id);
    p.style.display = p.dataset.settingsPanel === id ? '' : 'none';
  });
}
