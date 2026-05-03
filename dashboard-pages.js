const DASHBOARD_THEME_KEY = 'dashboard.theme';

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
  const icon = isDark ? '☀' : '☾';
  const label = isDark ? 'Light mode' : 'Dark mode';
  const state = isDark ? 'On' : 'Off';

  document.querySelectorAll('[data-theme-toggle-icon]').forEach(node => {
    node.textContent = icon;
  });

  document.querySelectorAll('[data-theme-toggle-label]').forEach(node => {
    node.textContent = label;
  });

  document.querySelectorAll('[data-theme-toggle-state]').forEach(node => {
    node.textContent = state;
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
    icon: 'HM',
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
    icon: 'PN',
    cardTitle: 'Product news',
    description: 'Read the latest product, competitor, regulatory and AI signals in one searchable research feed with quick links back to the source.'
  },
  {
    id: 'finance-adjustments',
    label: 'Finance Adjustments',
    title: 'Finance Adjustments',
    href: 'finance-adjustments.html',
    navGroup: 'Pages',
    status: 'live',
    accentClass: 'accent-primary',
    icon: 'FA',
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
    icon: 'CH',
    cardTitle: 'Company health',
    description: 'Monitor company-level health scores, RAG coverage, support pressure and the drivers behind at-risk accounts.'
  },
  {
    id: 'actions',
    label: 'Actions',
    title: 'Actions',
    href: 'actions.html',
    navGroup: 'Pages',
    status: 'live',
    accentClass: 'accent-info',
    icon: 'AX',
    cardTitle: 'Actions',
    description: 'Trigger controlled diagnostics, calculation previews and test integrations through the dashboard action runner.'
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

window.renderSidebar = function renderSidebar(activePageId) {
  const pages = window.DASHBOARD_PAGES || [];
  const groups = [...new Set(pages.map(page => page.navGroup))];
  const isDark = window.getDashboardTheme() === 'dark';

  const navSections = groups.map(group => {
    const items = pages
      .filter(page => page.navGroup === group)
      .map(page => {
        const isActive = page.id === activePageId;
        return `
          <a class="nav-item${isActive ? ' active' : ''}" href="${page.href}">
            <span class="nav-icon">${page.icon}</span>
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
    <aside class="sidebar open">
      <div class="sidebar-logo-row">
        <div class="sidebar-wordmark">Product One</div>
      </div>
      <div class="sidebar-nav-stack">
        ${navSections}
      </div>
      <div class="sidebar-footer">
        <button class="theme-toggle" type="button" onclick="window.toggleDashboardTheme()">
          <span class="theme-toggle-icon" data-theme-toggle-icon>${isDark ? '☀' : '☾'}</span>
          <span class="theme-toggle-copy">
            <span class="theme-toggle-label" data-theme-toggle-label>${isDark ? 'Light mode' : 'Dark mode'}</span>
            <span class="theme-toggle-state" data-theme-toggle-state>${isDark ? 'On' : 'Off'}</span>
          </span>
        </button>
        <div class="sidebar-footnote">Supabase-backed dashboards</div>
      </div>
    </aside>
  `;
};
