/**
 * DevVault Sidebar
 *
 * The sidebar HTML is embedded directly in each page's <aside> tag
 * so it renders instantly with no flash. This module just sets the
 * correct active nav item and wires up interactions.
 */

import { Profile, Tasks } from '../js/data.js';

export function renderSidebar(activeId) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  // Update active nav item
  sidebar.querySelectorAll('.nav-item').forEach(a => {
    a.classList.toggle('active', a.dataset.id === activeId);
  });

  // Update user info from profile store
  const profile  = Profile.get();
  const initials = profile.name.split(' ').map(w => w[0]).join('').toUpperCase();
  const pending  = Tasks.pending().length;

  const nameEl   = sidebar.querySelector('.user-name');
  const handleEl = sidebar.querySelector('.user-handle');
  const avatarEl = sidebar.querySelector('.avatar');
  if (nameEl)   nameEl.textContent   = profile.name;
  if (handleEl) handleEl.textContent = profile.handle;
  if (avatarEl) avatarEl.textContent = initials;

  // Show pending task badge
  const taskLink = sidebar.querySelector('[data-id="tasks"]');
  if (taskLink) {
    let badge = taskLink.querySelector('.nav-badge');
    if (pending > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'nav-badge';
        taskLink.appendChild(badge);
      }
      badge.textContent = pending;
    } else if (badge) {
      badge.remove();
    }
  }

  // Click user avatar → settings
  sidebar.querySelector('.sidebar-user')?.addEventListener('click', () => {
    window.location.href = 'settings.html';
  });

  // Mobile nav toggle
  const toggle  = document.getElementById('menuToggle');
  const overlay = document.getElementById('sidebarOverlay');
  toggle?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay?.classList.toggle('open');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay?.classList.remove('open');
  });

  // Scroll shadow
  const header   = document.querySelector('.page-header');
  const scroller = document.querySelector('.main-content');
  if (header && scroller) {
    scroller.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', scroller.scrollTop > 4);
    }, { passive: true });
  }
}
