import dashboardApi from './dashboard-api.js';

// Small browser bridge for static HTML pages.
// This lets existing pages keep their current inline rendering approach
// while moving data access into the shared frontend service layer.
window.dashboardApi = dashboardApi;
