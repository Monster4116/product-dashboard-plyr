window.DASHBOARD_PAGES = [
  {
    id: 'home',
    label: 'Home',
    title: 'Dashboard Home',
    href: 'index.html',
    navGroup: 'Overview',
    status: 'live',
    accentClass: 'accent-neutral',
    icon: 'HM',
    cardTitle: 'Dashboard home',
    description: 'See the available dashboards, what data each page will contain, and which sections are already live.'
  },
  {
    id: 'finance-adjustments',
    label: 'Finance Adjustments',
    title: 'Finance Adjustments',
    href: 'finance-adjustments.html',
    navGroup: 'Dashboards',
    status: 'live',
    accentClass: 'accent-primary',
    icon: 'FA',
    cardTitle: 'Finance adjustments',
    description: 'Analyse payroll adjustment variances by primary aspect, territory, company and employee, with trend and exposure views.'
  },
  {
    id: 'arr',
    label: 'ARR',
    title: 'ARR',
    href: '#',
    navGroup: 'Dashboards',
    status: 'coming-soon',
    accentClass: 'accent-success',
    icon: 'AR',
    cardTitle: 'ARR',
    description: 'Track monthly ARR by sub-category, monitor churn and pipeline conversion, and review expansion across the portfolio.'
  },
  {
    id: 'payroll-validation',
    label: 'Payroll Validation',
    title: 'Payroll Validation',
    href: '#',
    navGroup: 'Dashboards',
    status: 'coming-soon',
    accentClass: 'accent-info',
    icon: 'PV',
    cardTitle: 'Payroll validation',
    description: 'Review month-on-month payroll movements, employee deltas and stale simulation alerts across territories.'
  },
  {
    id: 'customer-health',
    label: 'Customer Health',
    title: 'Customer Health',
    href: '#',
    navGroup: 'Dashboards',
    status: 'coming-soon',
    accentClass: 'accent-danger',
    icon: 'CH',
    cardTitle: 'Customer health',
    description: 'Monitor customer health scores, RAG changes, support activity and at-risk account signals.'
  },
  {
    id: 'product-research',
    label: 'Product Research',
    title: 'Product Research',
    href: '#',
    navGroup: 'Dashboards',
    status: 'coming-soon',
    accentClass: 'accent-secondary',
    icon: 'PR',
    cardTitle: 'Product research',
    description: 'A dedicated place for product and competitor research outputs, source libraries and research artefacts.'
  }
];

window.getDashboardStats = function getDashboardStats() {
  const pages = window.DASHBOARD_PAGES || [];
  const dashboardPages = pages.filter(page => page.navGroup === 'Dashboards');
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
        const isDisabled = page.status !== 'live';
        const statusMarkup = isDisabled
          ? '<span class="nav-status">Soon</span>'
          : '';

        if (isDisabled) {
          return `
            <div class="nav-item nav-item-disabled">
              <span class="nav-icon">${page.icon}</span>
              <span class="nav-label">${page.label}</span>
              ${statusMarkup}
            </div>
          `;
        }

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
        <div class="sidebar-wordmark">Playroll</div>
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
