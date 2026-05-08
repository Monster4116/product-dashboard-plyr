const DASHBOARD_THEME_KEY = 'dashboard.theme';
const DASHBOARD_SIDEBAR_KEY = 'dashboard.sidebar.state';
const FEEDBACK_MODAL_ID = 'dashboard-feedback-modal';
const FEEDBACK_TYPES = {
  issue: {
    title: 'Report an Issue',
    subtitle: 'Flag something broken, confusing or missing in the current dashboard experience.',
    buttonLabel: 'Send issue',
    successMessage: 'Your issue report has been sent.',
  },
  idea: {
    title: 'Submit an Idea',
    subtitle: 'Share an improvement, workflow suggestion or new dashboard concept for the team to review.',
    buttonLabel: 'Send idea',
    successMessage: 'Your idea has been sent.',
  },
};

const DASHBOARD_ICON_SPRITES = {
  home: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5v7a1.5 1.5 0 0 1-1.5 1.5h-4.25V14h-4.5v6H5.5A1.5 1.5 0 0 1 4 18.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  news: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5.75h11.5A1.5 1.5 0 0 1 19 7.25v9.5A1.5 1.5 0 0 1 17.5 18H8a3 3 0 0 1-3-3V7.75A2 2 0 0 1 7 5.75v9.5a1.25 1.25 0 0 0 2.5 0V9.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.5 9h5M10.5 12h5M10.5 15h3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  nps: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16.5 9.25 12l3.25 2.75 5-6.25" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 6v12.25A1.75 1.75 0 0 0 6.75 20H19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  finance: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.75v14.5M8.75 8.25c0-1.38 1.45-2.5 3.25-2.5s3.25 1.12 3.25 2.5-1.45 2.5-3.25 2.5-3.25 1.12-3.25 2.5 1.45 2.5 3.25 2.5 3.25-1.12 3.25-2.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  health: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19.25s-6.75-4.3-6.75-9.1A3.9 3.9 0 0 1 9.2 6.25c1.23 0 2.27.55 2.8 1.42.53-.87 1.57-1.42 2.8-1.42a3.9 3.9 0 0 1 3.95 3.9c0 4.8-6.75 9.1-6.75 9.1Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  support: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.25 9.5a3.75 3.75 0 1 1 7.5 0c0 1.6-.94 2.43-2.07 3.1-.98.58-1.43 1.14-1.43 2.15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="17.25" r="1" fill="currentColor"/></svg>`,
  actions: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13.75 5.5 4.75 4.75-8.5 8.5H5.25v-4.75z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m11.75 7.5 4.75 4.75" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  knowledge: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.25 5.5h10.5A1.25 1.25 0 0 1 18 6.75v10.5a1.25 1.25 0 0 1-1.25 1.25H8.5A2.5 2.5 0 0 0 6 21V7.75A2.25 2.25 0 0 1 8.25 5.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.5 9.25h5M9.5 12.25h5M9.5 15.25h3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  issue: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.25v4.5M12 16.25h.01M6.1 18.75h11.8c1.1 0 1.8-1.18 1.27-2.15L13.27 6.2a1.45 1.45 0 0 0-2.54 0L4.83 16.6c-.53.97.17 2.15 1.27 2.15Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  idea: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.25 17.25h5.5M10 20h4M9.05 14.5c-1.38-.9-2.3-2.46-2.3-4.25a5.25 5.25 0 1 1 10.5 0c0 1.79-.92 3.35-2.3 4.25-.55.36-.95 1.02-.95 1.68v.07h-4v-.07c0-.66-.4-1.32-.95-1.68Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  theme: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.25 13.1A6.75 6.75 0 1 1 10.9 5.75a5.25 5.25 0 1 0 7.35 7.35Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  collapse: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6.75 9.25 12l5.25 5.25" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  expand: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6.75 14.75 12 9.5 17.25" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

function renderDashboardIcon(iconName) {
  return DASHBOARD_ICON_SPRITES[iconName] || DASHBOARD_ICON_SPRITES.actions;
}

function resolveSidebarState(state) {
  return state === 'closed' ? 'closed' : 'open';
}

function resolveDashboardTheme(theme) {
  return theme === 'dark' ? 'dark' : 'light';
}

window.getDashboardTheme = function getDashboardTheme() {
  const bodyTheme = document.body?.dataset?.theme;
  if (bodyTheme === 'dark' || bodyTheme === 'light') return bodyTheme;

  try {
    const saved = localStorage.getItem(DASHBOARD_THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (_) {
    // Ignore storage read failures and fall back to light mode.
  }

  return 'light';
};

window.getDashboardThemePalette = function getDashboardThemePalette() {
  const styles = getComputedStyle(document.body || document.documentElement);
  return {
    chartText: styles.getPropertyValue('--chart-text').trim() || styles.getPropertyValue('--text-secondary').trim() || '#49454F',
    chartGrid: styles.getPropertyValue('--chart-grid').trim() || styles.getPropertyValue('--surface-high').trim() || '#E9E9EA',
    chartBar: styles.getPropertyValue('--chart-bar').trim() || '#5110DDAA',
    chartBarBorder: styles.getPropertyValue('--chart-bar-border').trim() || '#5110DD',
    chartLine: styles.getPropertyValue('--chart-line').trim() || '#36B1FF',
    chartFill: styles.getPropertyValue('--chart-fill').trim() || '#36B1FF22',
  };
};

window.syncDashboardThemeButtons = function syncDashboardThemeButtons() {
  const theme = window.getDashboardTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Light mode' : 'Dark mode';
  const state = isDark ? 'On' : 'Off';

  document.querySelectorAll('[data-theme-toggle-icon]').forEach(node => {
    node.innerHTML = renderDashboardIcon('theme');
  });

  document.querySelectorAll('[data-theme-toggle-label]').forEach(node => {
    node.textContent = label;
  });

  document.querySelectorAll('[data-theme-toggle-state]').forEach(node => {
    node.textContent = state;
  });

  document.querySelectorAll('.theme-toggle').forEach(node => {
    node.setAttribute('title', label);
    node.setAttribute('data-nav-label', label);
  });
};

window.applyDashboardTheme = function applyDashboardTheme(theme, options = {}) {
  const resolvedTheme = resolveDashboardTheme(theme);

  if (document.body) {
    document.body.dataset.theme = resolvedTheme;
  }

  document.documentElement.dataset.theme = resolvedTheme;

  if (options.persist !== false) {
    try {
      localStorage.setItem(DASHBOARD_THEME_KEY, resolvedTheme);
    } catch (_) {
      // Ignore storage write failures and continue with the in-memory theme.
    }
  }

  window.syncDashboardThemeButtons();

  if (options.emit !== false) {
    window.dispatchEvent(new CustomEvent('dashboard-theme-change', {
      detail: { theme: resolvedTheme },
    }));
  }

  return resolvedTheme;
};

window.toggleDashboardTheme = function toggleDashboardTheme() {
  const nextTheme = window.getDashboardTheme() === 'dark' ? 'light' : 'dark';
  return window.applyDashboardTheme(nextTheme);
};

window.getDashboardSidebarState = function getDashboardSidebarState() {
  if (window.matchMedia && window.matchMedia('(max-width: 900px)').matches) {
    return 'open';
  }

  try {
    return resolveSidebarState(localStorage.getItem(DASHBOARD_SIDEBAR_KEY));
  } catch (_) {
    return 'open';
  }
};

window.setDashboardSidebarState = function setDashboardSidebarState(state, options = {}) {
  const resolved = resolveSidebarState(state);
  const sidebar = document.querySelector('.sidebar');
  const isOpen = resolved === 'open';

  if (sidebar) {
    sidebar.classList.toggle('open', isOpen);
    sidebar.classList.toggle('closed', !isOpen);
    sidebar.dataset.sidebarState = resolved;
  }

  document.querySelectorAll('[data-sidebar-toggle]').forEach(node => {
    node.setAttribute('aria-pressed', String(!isOpen));
    node.setAttribute('aria-label', isOpen ? 'Collapse navigation' : 'Expand navigation');
    node.innerHTML = `<span class="nav-icon">${renderDashboardIcon(isOpen ? 'collapse' : 'expand')}</span>`;
  });

  if (options.persist !== false && (!window.matchMedia || !window.matchMedia('(max-width: 900px)').matches)) {
    try {
      localStorage.setItem(DASHBOARD_SIDEBAR_KEY, resolved);
    } catch (_) {
      // Ignore storage write failures and continue with the in-memory state.
    }
  }

  return resolved;
};

window.toggleDashboardSidebar = function toggleDashboardSidebar() {
  const nextState = window.getDashboardSidebarState() === 'open' ? 'closed' : 'open';
  return window.setDashboardSidebarState(nextState);
};

window.addEventListener('storage', event => {
  if (event.key !== DASHBOARD_THEME_KEY) return;
  window.applyDashboardTheme(resolveDashboardTheme(event.newValue), { persist: false, emit: false });
});

window.applyDashboardTheme(window.getDashboardTheme(), { persist: false, emit: false });

window.DASHBOARD_PAGES = [
  {
    id: 'home',
    label: 'Home',
    title: 'Dashboard Home',
    href: 'index.html',
    navGroup: 'Pages',
    status: 'live',
    accentClass: 'accent-neutral',
    icon: 'home',
    cardTitle: 'Dashboard home',
    description: 'See the available dashboards, what data each page contains, and navigate into the live finance dashboard.'
  },
  {
    id: 'product-news',
    label: 'Product News',
    title: 'Product News',
    href: 'product-news.html',
    navGroup: 'Pages',
    status: 'live',
    accentClass: 'accent-secondary',
    icon: 'news',
    cardTitle: 'Product news',
    description: 'Read the latest product, competitor, regulatory and AI signals in one searchable research feed with quick links back to the source.'
  },
  {
    id: 'nps',
    label: 'NPS',
    title: 'NPS',
    href: 'nps.html',
    navGroup: 'Pages',
    status: 'live',
    accentClass: 'accent-secondary',
    icon: 'nps',
    cardTitle: 'NPS',
    description: 'Track NPS trends, compare employee and client sentiment, and drill down from monthly scores into auditable response-level detail.'
  },
  {
    id: 'finance-adjustments',
    label: 'Finance Adjustments',
    title: 'Finance Adjustments',
    href: 'finance-adjustments.html',
    navGroup: 'Pages',
    status: 'live',
    accentClass: 'accent-primary',
    icon: 'finance',
    cardTitle: 'Finance adjustments',
    description: 'Analyse payroll adjustment variances by primary aspect, territory, company and employee, with trend and exposure views.'
  },
  {
    id: 'company-health',
    label: 'Company Health',
    title: 'Company Health',
    href: 'company-health.html',
    navGroup: 'Pages',
    status: 'live',
    accentClass: 'accent-success',
    icon: 'health',
    cardTitle: 'Company health',
    description: 'Monitor company-level health scores, RAG coverage, support pressure and the drivers behind at-risk accounts.'
  },
  {
    id: 'support',
    label: 'Support',
    title: 'Support',
    href: 'support.html',
    navGroup: 'Pages',
    status: 'live',
    accentClass: 'accent-info',
    icon: 'support',
    cardTitle: 'Support',
    description: 'Read support volume, severity, categories, requester mix and AI-refined ticket context through a sanitized operations dashboard.'
  },
  {
    id: 'actions',
    label: 'Actions',
    title: 'Actions',
    href: 'actions.html',
    navGroup: 'Pages',
    status: 'live',
    accentClass: 'accent-info',
    icon: 'actions',
    cardTitle: 'Actions',
    description: 'Trigger controlled diagnostics, calculation previews and test integrations through the dashboard action runner.'
  },
  {
    id: 'knowledge-base',
    label: 'Knowledge Base',
    title: 'Knowledge Base',
    href: 'knowledge-base.html',
    navGroup: 'Pages',
    status: 'live',
    accentClass: 'accent-neutral',
    icon: 'knowledge',
    cardTitle: 'Knowledge base',
    description: 'Browse payroll calculator documentation imported from Obsidian through a searchable in-dashboard reading experience.'
  }
];

window.getDashboardStats = function getDashboardStats() {
  const pages = window.DASHBOARD_PAGES || [];
  const dashboardPages = pages.filter(page => page.id !== 'home');
  const liveCount = dashboardPages.filter(page => page.status === 'live').length;
  return {
    totalDashboards: dashboardPages.length,
    liveDashboards: liveCount
  };
};

window.getDashboardPageMeta = function getDashboardPageMeta(pageId) {
  const pages = window.DASHBOARD_PAGES || [];
  return pages.find(page => page.id === pageId) || null;
};

window.ensureFeedbackModal = function ensureFeedbackModal() {
  if (!document.body || document.getElementById(FEEDBACK_MODAL_ID)) return;

  document.body.insertAdjacentHTML('beforeend', `
    <div class="feedback-modal-shell" id="${FEEDBACK_MODAL_ID}" hidden style="display:none;">
      <div class="feedback-modal-backdrop" data-feedback-close="true"></div>
      <div class="feedback-modal-card" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title">
        <button class="feedback-modal-close" type="button" aria-label="Close feedback form" data-feedback-close="true">×</button>
        <div class="feedback-modal-eyebrow" id="feedback-modal-type">Feedback</div>
        <h2 class="feedback-modal-title" id="feedback-modal-title">Share feedback</h2>
        <p class="feedback-modal-copy" id="feedback-modal-copy">Tell us what happened and we will route it through the secure feedback workflow.</p>
        <form class="feedback-form" id="feedback-form">
          <input id="feedback-type-input" name="feedbackType" type="hidden" value="" />
          <div class="feedback-form-grid">
            <label class="feedback-field">
              <span>Name</span>
              <input class="feedback-input" id="feedback-name" name="name" type="text" maxlength="120" placeholder="Optional" />
            </label>
            <label class="feedback-field">
              <span>Email</span>
              <input class="feedback-input" id="feedback-email" name="email" type="email" maxlength="180" placeholder="Optional" />
            </label>
          </div>
          <label class="feedback-field">
            <span>Message</span>
            <textarea class="feedback-input feedback-textarea" id="feedback-message" name="message" rows="7" maxlength="5000" placeholder="Share the issue or idea with enough detail for the team to investigate." required></textarea>
          </label>
          <div class="feedback-form-note" id="feedback-context"></div>
          <div class="feedback-form-status" id="feedback-status" aria-live="polite"></div>
          <div class="feedback-form-actions">
            <button class="action-btn secondary" type="button" data-feedback-close="true">Cancel</button>
            <button class="action-btn" id="feedback-submit-btn" type="submit">Send feedback</button>
          </div>
        </form>
      </div>
    </div>
  `);

  const modal = document.getElementById(FEEDBACK_MODAL_ID);
  const form = document.getElementById('feedback-form');
  const close = () => window.closeFeedbackModal();

  modal.querySelectorAll('[data-feedback-close="true"]').forEach(node => {
    node.addEventListener('click', close);
  });

  form.addEventListener('submit', window.submitFeedbackForm);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.hidden) {
      close();
    }
  });
};

window.closeFeedbackModal = function closeFeedbackModal() {
  const modal = document.getElementById(FEEDBACK_MODAL_ID);
  if (!modal) return;

  modal.hidden = true;
  modal.style.display = 'none';
  document.body.classList.remove('feedback-modal-open');
};

window.openFeedbackModal = function openFeedbackModal(type) {
  const details = FEEDBACK_TYPES[type];
  if (!details) return;

  window.ensureFeedbackModal();

  const modal = document.getElementById(FEEDBACK_MODAL_ID);
  const form = document.getElementById('feedback-form');
  const title = document.getElementById('feedback-modal-title');
  const eyebrow = document.getElementById('feedback-modal-type');
  const copy = document.getElementById('feedback-modal-copy');
  const submitButton = document.getElementById('feedback-submit-btn');
  const status = document.getElementById('feedback-status');
  const message = document.getElementById('feedback-message');
  const context = document.getElementById('feedback-context');
  const typeInput = document.getElementById('feedback-type-input');
  const activePageId = window.__dashboardActivePageId || 'home';
  const pageMeta = window.getDashboardPageMeta(activePageId);

  form.reset();
  form.dataset.feedbackType = type;
  typeInput.value = type;
  title.textContent = details.title;
  eyebrow.textContent = type === 'issue' ? 'Issue report' : 'Idea submission';
  copy.textContent = details.subtitle;
  submitButton.textContent = details.buttonLabel;
  status.textContent = '';
  status.className = 'feedback-form-status';
  context.textContent = pageMeta
    ? `This will be linked to ${pageMeta.title}.`
    : 'This will be linked to the current dashboard page.';

  modal.hidden = false;
  modal.style.display = 'flex';
  document.body.classList.add('feedback-modal-open');
  window.requestAnimationFrame(() => message.focus());
};

window.submitFeedbackForm = async function submitFeedbackForm(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const typeInput = document.getElementById('feedback-type-input');
  const type = typeInput?.value || form.dataset.feedbackType;
  const details = FEEDBACK_TYPES[type];
  const status = document.getElementById('feedback-status');
  const submitButton = document.getElementById('feedback-submit-btn');
  const name = document.getElementById('feedback-name').value.trim();
  const email = document.getElementById('feedback-email').value.trim();
  const message = document.getElementById('feedback-message').value.trim();
  const activePageId = window.__dashboardActivePageId || 'home';
  const pageMeta = window.getDashboardPageMeta(activePageId);

  if (!details) {
    status.textContent = 'This page is using an outdated feedback script. Refresh with Cmd+Shift+R and try again.';
    status.className = 'feedback-form-status error';
    return;
  }

  if (message.length < 8) {
    status.textContent = 'Please add a little more detail before sending.';
    status.className = 'feedback-form-status error';
    return;
  }

  if (!window.dashboardApi || typeof window.dashboardApi.submitFeedback !== 'function') {
    status.textContent = 'The secure feedback service is not available yet on this page.';
    status.className = 'feedback-form-status error';
    return;
  }

  submitButton.disabled = true;
  status.textContent = 'Sending...';
  status.className = 'feedback-form-status';

  try {
    await window.dashboardApi.submitFeedback({
      type,
      message,
      name: name || undefined,
      email: email || undefined,
      pageId: activePageId,
      pageTitle: pageMeta?.title || document.title,
      url: window.location.href,
    });

    status.textContent = details.successMessage;
    status.className = 'feedback-form-status success';
    window.setTimeout(() => window.closeFeedbackModal(), 900);
  } catch (error) {
    status.textContent = error?.message || 'Failed to send feedback.';
    status.className = 'feedback-form-status error';
  } finally {
    submitButton.disabled = false;
  }
};

window.renderSidebar = function renderSidebar(activePageId) {
  const pages = window.DASHBOARD_PAGES || [];
  const groups = [...new Set(pages.map(page => page.navGroup))];
  const isDark = window.getDashboardTheme() === 'dark';
  const sidebarState = window.getDashboardSidebarState();
  const isCollapsed = sidebarState === 'closed';

  window.__dashboardActivePageId = activePageId;
  window.setTimeout(() => window.ensureFeedbackModal(), 0);

  const navSections = groups.map(group => {
    const items = pages
      .filter(page => page.navGroup === group)
      .map(page => {
        const isActive = page.id === activePageId;
        return `
          <a
            class="nav-item${isActive ? ' active' : ''}"
            href="${page.href}"
            title="${page.label} - ${page.description}"
            data-nav-label="${page.label}"
            data-nav-meta="${page.description}"
          >
            <span class="nav-icon">${renderDashboardIcon(page.icon)}</span>
            <span class="nav-label">${page.label}</span>
          </a>
        `;
      })
      .join('');

    return `
      <div class="sidebar-section-label">${group}</div>
      <nav class="sidebar-nav">${items}</nav>
    `;
  }).join('');

  return `
    <aside class="sidebar ${sidebarState}" data-sidebar-state="${sidebarState}">
      <div class="sidebar-logo-row">
        <button
          class="sidebar-toggle"
          type="button"
          aria-label="${isCollapsed ? 'Expand navigation' : 'Collapse navigation'}"
          aria-pressed="${String(isCollapsed)}"
          data-sidebar-toggle
          onclick="window.toggleDashboardSidebar()"
        >
          <span class="nav-icon">${renderDashboardIcon(isCollapsed ? 'expand' : 'collapse')}</span>
        </button>
        <div class="sidebar-wordmark">Product One</div>
      </div>
      <div class="sidebar-nav-stack">
        ${navSections}
      </div>
      <div class="sidebar-footer">
        <div class="feedback-launcher">
          <button
            class="nav-item nav-action-item"
            type="button"
            onclick="window.openFeedbackModal('issue')"
            title="Report an Issue - Flag a dashboard problem"
            data-nav-label="Report an Issue"
            data-nav-meta="Flag a dashboard problem"
          >
            <span class="nav-icon">${renderDashboardIcon('issue')}</span>
            <span class="nav-label">Report an Issue</span>
          </button>
          <button
            class="nav-item nav-action-item secondary"
            type="button"
            onclick="window.openFeedbackModal('idea')"
            title="Submit an Idea - Share an improvement"
            data-nav-label="Submit an Idea"
            data-nav-meta="Share an improvement"
          >
            <span class="nav-icon">${renderDashboardIcon('idea')}</span>
            <span class="nav-label">Submit an Idea</span>
          </button>
        </div>
        <button
          class="theme-toggle"
          type="button"
          onclick="window.toggleDashboardTheme()"
          title="${isDark ? 'Light mode' : 'Dark mode'}"
          data-nav-label="${isDark ? 'Light mode' : 'Dark mode'}"
          data-nav-meta="Switch dashboard theme"
        >
          <span class="theme-toggle-icon" data-theme-toggle-icon>${renderDashboardIcon('theme')}</span>
          <span class="theme-toggle-copy">
            <span class="theme-toggle-label" data-theme-toggle-label>${isDark ? 'Light mode' : 'Dark mode'}</span>
            <span class="theme-toggle-state" data-theme-toggle-state>${isDark ? 'On' : 'Off'}</span>
          </span>
        </button>
        <div class="sidebar-footnote">Shared dashboard suite</div>
      </div>
    </aside>
  `;
};
