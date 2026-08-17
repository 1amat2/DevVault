/**
 * DevVault — Portfolio Feature Module
 *
 * Builds the public portfolio from local data or the API.
 * The portfolio page is public — no login required to view it.
 */

import { Projects as LocalProjects, Profile as LocalProfile } from '../data.js';
import { apiFetch, getToken } from '../app.js';

// ─── Load portfolio data ──────────────────────────────────────
export async function loadPortfolio(userId = null) {
  if (userId && getToken()) {
    // Fetch another user's public portfolio
    const [projects, profile] = await Promise.all([
      apiFetch(`/api/projects/public/${userId}`).catch(() => []),
      apiFetch(`/api/auth/me`).then(d => d.profile).catch(() => null),
    ]);
    return { projects, profile };
  }

  // Own portfolio from localStorage
  const allProjects = LocalProjects.all();
  const profile     = LocalProfile.get();
  return {
    projects: allProjects.filter(p => p.is_public !== false),
    profile,
  };
}

// ─── Project card HTML (portfolio variant) ────────────────────
export function portfolioCardHTML(project, index = 0) {
  const color = project.color || '#7C5CFF';
  const tech  = (project.tech || []).slice(0, 4);

  return `
    <div class="project-card anim-fade-up" style="animation-delay:${index * 0.07}s">
      <div class="project-card-header" style="background:${color}18;border-color:${color}33">
        <div style="font-size:2rem">${project.icon || '📁'}</div>
        <div class="flex items-center gap-sm">
          ${project.repository_url || project.repo ? `
            <a href="${project.repository_url || project.repo}" target="_blank" rel="noopener"
               class="btn btn-ghost btn-sm btn-icon" title="Repository">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
            </a>` : ''}
          ${project.live_url ? `
            <a href="${project.live_url}" target="_blank" rel="noopener"
               class="btn btn-ghost btn-sm btn-icon" title="Live Demo">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>` : ''}
        </div>
      </div>

      <div class="project-card-body">
        <h3 style="font-size:.95rem;font-weight:700;margin-bottom:4px">${project.name}</h3>
        <p style="font-size:.78rem;color:var(--text-muted);margin-bottom:var(--gap-sm);line-height:1.5">
          ${(project.description || '').substring(0, 100)}${(project.description || '').length > 100 ? '…' : ''}
        </p>
        <div class="proj-tags" style="margin-bottom:var(--gap-sm)">
          ${tech.map(t => `<span class="tag" style="font-size:.62rem">${t}</span>`).join('')}
        </div>
        <div>
          <div class="flex items-center justify-between" style="margin-bottom:4px">
            <span style="font-size:.68rem;color:var(--text-faint)">Progress</span>
            <span style="font-size:.72rem;font-weight:700;color:${color}">${project.progress || 0}%</span>
          </div>
          <div class="progress-bar"><div class="fill" style="width:${project.progress||0}%;background:${color}"></div></div>
        </div>
      </div>
    </div>`;
}

// ─── Skill bar HTML ────────────────────────────────────────────
export function skillBarHTML(skill, index = 0) {
  return `
    <div class="anim-fade-up" style="animation-delay:${index * 0.05}s">
      <div class="flex items-center gap-md" style="margin-bottom:5px">
        <span style="font-size:.85rem;font-weight:500;width:130px">${skill.name}</span>
        <span style="font-size:.75rem;color:var(--text-faint);margin-left:auto">${skill.pct}%</span>
      </div>
      <div class="progress-bar progress-bar-lg">
        <div class="fill" style="width:0%;background:${skill.color};transition:width 1s cubic-bezier(.22,.68,0,1.2) ${index * 0.07}s"
             data-target="${skill.pct}"></div>
      </div>
    </div>`;
}

/** Animate all skill bars — call after inserting into DOM */
export function animateSkillBars() {
  requestAnimationFrame(() => {
    document.querySelectorAll('.progress-bar .fill[data-target]').forEach(el => {
      el.style.width = el.dataset.target + '%';
    });
  });
}

// ─── Default skills list ───────────────────────────────────────
export const DEFAULT_SKILLS = [
  { name: 'JavaScript', pct: 85, color: '#F7DF1E' },
  { name: 'HTML & CSS',  pct: 90, color: '#E34F26' },
  { name: 'Node.js',    pct: 75, color: '#68A063' },
  { name: 'Python',     pct: 70, color: '#3776AB' },
  { name: 'Supabase',   pct: 65, color: '#3ECF8E' },
  { name: 'SQL',        pct: 80, color: '#336791' },
  { name: 'TypeScript', pct: 55, color: '#3B82F6' },
  { name: 'Git',        pct: 85, color: '#F05032' },
  { name: 'Docker',     pct: 45, color: '#2496ED' },
];

// ─── Achievements ──────────────────────────────────────────────
export const ACHIEVEMENTS = [
  { icon: '🔥', name: 'On Fire',      desc: '12-day coding streak'          },
  { icon: '🚀', name: 'Launched',     desc: 'Published first live project'  },
  { icon: '✅', name: 'Century',      desc: 'Completed 100+ tasks'          },
  { icon: '📝', name: 'Note Taker',   desc: 'Written 5+ developer notes'    },
  { icon: '🤝', name: 'Open Source',  desc: 'Made first public repository'  },
  { icon: '⚡', name: 'Speed Coder',  desc: 'Closed 10 tasks in one day'    },
];

export function achievementCardHTML(ach, index = 0) {
  return `
    <div class="card anim-fade-up" style="text-align:center;padding:var(--gap-md);animation-delay:${index * 0.06}s">
      <div style="font-size:1.8rem;margin-bottom:6px">${ach.icon}</div>
      <div style="font-weight:700;font-size:.85rem">${ach.name}</div>
      <div style="font-size:.72rem;color:var(--text-muted)">${ach.desc}</div>
    </div>`;
}
