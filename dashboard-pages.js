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
        <div class="sidebar-footnote">Supabase-backed dashboards</div>
      </div>
    </aside>
  `;
};
