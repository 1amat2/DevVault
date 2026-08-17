/**
 * DevVault — GitHub Feature Module
 *
 * Wraps the /api/github/* endpoints. Falls back to
 * simulated data when not connected.
 */

import { apiFetch, getToken } from '../app.js';

// ─── Connection status ────────────────────────────────────────
export async function getGithubStatus() {
  if (!getToken()) return { connected: false, username: null };
  return apiFetch('/api/github/status').catch(() => ({ connected: false, username: null }));
}

// ─── Start OAuth flow ─────────────────────────────────────────
export function connectGithub() {
  window.location.href = '/api/github/connect';
}

// ─── Disconnect ───────────────────────────────────────────────
export async function disconnectGithub() {
  if (!getToken()) return;
  return apiFetch('/api/github/disconnect', { method: 'DELETE' });
}

// ─── Repos ────────────────────────────────────────────────────
export async function getRepos() {
  if (!getToken()) return MOCK_REPOS;
  const data = await apiFetch('/api/github/repos').catch(() => MOCK_REPOS);
  return Array.isArray(data) ? data : MOCK_REPOS;
}

// ─── Profile ──────────────────────────────────────────────────
export async function getGithubProfile() {
  if (!getToken()) return null;
  return apiFetch('/api/github/profile').catch(() => null);
}

// ─── Events (activity) ───────────────────────────────────────
export async function getEvents() {
  if (!getToken()) return [];
  return apiFetch('/api/github/events').catch(() => []);
}

// ─── Language colors ──────────────────────────────────────────
export const LANG_COLORS = {
  JavaScript:  '#F7DF1E',
  TypeScript:  '#3B82F6',
  Python:      '#3776AB',
  CSS:         '#264de4',
  HTML:        '#E34F26',
  'C#':        '#9B4993',
  Java:        '#B07219',
  Go:          '#00ADD8',
  Rust:        '#DEA584',
  Ruby:        '#CC342D',
  PHP:         '#4F5D95',
  Shell:       '#89E051',
  Kotlin:      '#A97BFF',
  Swift:       '#FA7343',
  Dart:        '#00B4AB',
};

export function langColor(lang) {
  return LANG_COLORS[lang] || '#8B8B98';
}

// ─── Repo card HTML ────────────────────────────────────────────
export function repoCardHTML(repo, index = 0) {
  const lang  = repo.language || 'Unknown';
  const color = langColor(lang);
  return `
    <div class="repo-card anim-fade-up" style="animation-delay:${index * 0.06}s">
      <div class="flex items-center gap-sm" style="margin-bottom:var(--gap-sm)">
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style="color:var(--text-faint)">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
        </svg>
        <a href="${repo.url || repo.html_url || '#'}" target="_blank" rel="noopener"
           style="font-size:.875rem;font-weight:600;color:var(--primary);text-decoration:none">${repo.name}</a>
        ${repo.private ? '<span class="badge badge-muted" style="font-size:.55rem">Private</span>' : ''}
      </div>
      <div style="font-size:.78rem;color:var(--text-muted);flex:1">${(repo.description || '').substring(0, 80)}</div>
      <div class="flex items-center gap-md" style="margin-top:var(--gap-sm);font-size:.72rem;color:var(--text-faint)">
        ${lang !== 'Unknown' ? `
          <span class="flex items-center gap-xs">
            <span style="width:10px;height:10px;border-radius:50%;background:${color};display:inline-block"></span>
            ${lang}
          </span>` : ''}
        <span>⭐ ${repo.stars ?? repo.stargazers_count ?? 0}</span>
        <span>🍴 ${repo.forks ?? repo.forks_count ?? 0}</span>
      </div>
    </div>`;
}

// ─── Mock data for disconnected state ─────────────────────────
export const MOCK_REPOS = [
  { id: 1, name: 'homehive',  description: 'Property marketplace connecting tenants and landlords.', language: 'JavaScript', stars: 12, forks: 3, url: '#', private: false },
  { id: 2, name: 'devvault',  description: 'Developer dashboard to manage projects and life.',        language: 'JavaScript', stars: 8,  forks: 1, url: '#', private: false },
  { id: 3, name: 'minepanel', description: 'Minecraft server manager and dashboard.',                 language: 'JavaScript', stars: 5,  forks: 0, url: '#', private: false },
  { id: 4, name: 'tradelab',  description: 'Trading analysis and backtesting platform.',              language: 'Python',     stars: 3,  forks: 1, url: '#', private: false },
  { id: 5, name: 'clipforge',  description: 'AI tool to turn long videos into short clips.',           language: 'Python',     stars: 19, forks: 4, url: '#', private: false },
];

export const MOCK_LANGUAGES = [
  { name: 'JavaScript', pct: 55, color: '#F7DF1E' },
  { name: 'Python',     pct: 20, color: '#3776AB' },
  { name: 'CSS',        pct: 15, color: '#264de4' },
  { name: 'TypeScript', pct: 10, color: '#3B82F6' },
];
