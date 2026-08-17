/**
 * DevVault — App Shell Utilities
 * Import and call initApp() on every page.
 */

// ─── Mobile sidebar ──────────────────────────────────────────
export function initMobileNav() {
  const toggle  = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!toggle || !sidebar) return;
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay?.classList.toggle('open');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });
}

// ─── Sticky header scroll shadow ────────────────────────────
export function initScrollHeader() {
  const header = document.querySelector('.page-header');
  if (!header) return;
  const scroller = document.querySelector('.main-content') || window;
  const onScroll = () => {
    const top = scroller === window ? window.scrollY : scroller.scrollTop;
    header.classList.toggle('scrolled', top > 4);
  };
  scroller.addEventListener('scroll', onScroll, { passive: true });
}

// ─── Animated counter ────────────────────────────────────────
export function animateCount(el, target, duration = 900) {
  if (!el) return;
  const start = performance.now();
  function step(now) {
    const t    = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(ease * target);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ─── Stagger-reveal on IntersectionObserver ─────────────────
export function initReveal(selector = '[data-reveal]') {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('anim-fade-up');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(selector).forEach(el => io.observe(el));
}

// ─── Modal helpers ───────────────────────────────────────────
export function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
export function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
export function initModal(openBtnId, modalId, closeBtnIds = []) {
  document.getElementById(openBtnId)?.addEventListener('click', () => openModal(modalId));
  closeBtnIds.forEach(id => document.getElementById(id)?.addEventListener('click', () => closeModal(modalId)));
  document.getElementById(modalId)?.addEventListener('click', e => {
    if (e.target.id === modalId) closeModal(modalId);
  });
}

// ─── Tab switching ───────────────────────────────────────────
export function initTabs(tabSelector, contentPrefix) {
  document.querySelectorAll(tabSelector).forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll(tabSelector).forEach(t => t.classList.remove('active'));
      document.querySelectorAll(`[id^="${contentPrefix}"]`).forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(contentPrefix + tab.dataset.tab)?.classList.add('active');
    });
  });
}

// ─── Toast ───────────────────────────────────────────────────
export function toast(message, type = 'info', duration = 2800) {
  const colors = { info: 'var(--primary)', success: 'var(--success)', error: 'var(--danger)', warning: 'var(--warning)' };
  const el = document.createElement('div');
  el.className = 'toast';
  el.style.cssText = [
    'position:fixed', 'bottom:24px', 'right:24px', 'z-index:9999',
    'background:var(--elevated2)', 'border:1px solid var(--border)',
    `border-left:3px solid ${colors[type] || colors.info}`,
    'border-radius:var(--r-md)', 'padding:12px 18px',
    'font-size:.85rem', 'color:var(--text)', 'box-shadow:var(--shadow-lg)',
    'max-width:320px', 'line-height:1.5',
  ].join(';');
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add('hide');
    setTimeout(() => el.remove(), 350);
  }, duration);
}

// ─── Time helpers ─────────────────────────────────────────────
export function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)    return 'just now';
  if (m < 60)   return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  if (m < 10080) return `${Math.floor(m / 1440)}d ago`;
  return new Date(iso).toLocaleDateString();
}

// ─── Init all ─────────────────────────────────────────────────
export function initApp() {
  initMobileNav();
  initScrollHeader();
}

// ═══════════════════════════════════════════════════════════════
//  API Layer — used by all features/  modules
// ═══════════════════════════════════════════════════════════════

/**
 * Returns the Supabase JWT access token stored in localStorage,
 * or null if the user is not logged in.
 */
export function getToken() {
  try {
    const session = JSON.parse(localStorage.getItem('dv_session') || 'null');
    return session?.access_token || null;
  } catch { return null; }
}

/**
 * Returns the current Supabase session object, or null.
 */
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem('dv_session') || 'null');
  } catch { return null; }
}

/**
 * Redirect to login if there is no active session.
 * Call at the top of every protected page.
 */
export function requireAuth(loginPage = '../pages/login.html') {
  if (!getToken() && !location.pathname.includes('login')) {
    window.location.replace(loginPage);
  }
}

/** Cached availability flag so we don't spam /api/health */
let _apiAvailable = null;

/**
 * Returns true if the Node.js backend is running and reachable.
 * Result is cached for 30 seconds.
 */
export async function isApiAvailable() {
  if (_apiAvailable !== null) return _apiAvailable;
  try {
    const res = await fetch('/api/health', { signal: AbortSignal.timeout(2000) });
    _apiAvailable = res.ok;
  } catch {
    _apiAvailable = false;
  }
  setTimeout(() => { _apiAvailable = null; }, 30000);
  return _apiAvailable;
}

/**
 * Authenticated fetch wrapper.
 * Automatically attaches the Bearer token and JSON headers.
 * Throws on non-2xx responses with the server's error message.
 */
export async function apiFetch(path, options = {}) {
  const token   = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(path, { ...options, headers });

  if (res.status === 204) return null; // No Content

  const data = await res.json().catch(() => ({ error: res.statusText }));

  if (!res.ok) {
    const msg = data?.error || `Request failed: ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data   = data;
    throw err;
  }

  return data;
}

/**
 * Sign out: clear the stored session and redirect to login.
 */
export function signOut(loginPage = '../pages/login.html') {
  // Best-effort server-side sign-out
  const token = getToken();
  if (token) {
    fetch('/api/auth/logout', {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  localStorage.removeItem('dv_session');
  window.location.replace(loginPage);
}
