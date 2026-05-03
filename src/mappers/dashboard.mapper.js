// raw database row -> adapter -> mapper -> dashboard contract -> UI
//
// These helpers are examples of the normalization boundary we want
// in this repository. The UI should consume stable dashboard shapes
// instead of depending directly on backend-specific row formats.

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toStringValue = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

export const mapDashboardSummary = (rawItem = {}) => ({
  title: toStringValue(rawItem.title, 'Dashboard summary'),
  subtitle: toStringValue(rawItem.subtitle, ''),
  status: toStringValue(rawItem.status, 'unknown'),
  itemCount: toNumber(rawItem.itemCount, 0),
});

export const mapSupportTicket = (rawItem = {}) => ({
  ticketId: toStringValue(rawItem.ticketId || rawItem.id, ''),
  category: toStringValue(rawItem.category, 'Unknown'),
  priority: toStringValue(rawItem.priority, 'Unknown'),
  status: toStringValue(rawItem.status, 'Unknown'),
  requesterName: toStringValue(rawItem.requesterName, 'Unknown'),
});

export const mapFinanceAdjustment = (rawItem = {}) => ({
  month: toStringValue(rawItem.month, ''),
  companyId: toStringValue(rawItem.companyId, ''),
  employeeId: toStringValue(rawItem.employeeId, ''),
  territory: toStringValue(rawItem.territory, 'Unknown'),
  primaryAspect: toStringValue(rawItem.primaryAspect, 'Unknown'),
  adjustmentUsd: toNumber(rawItem.adjustmentUsd, 0),
  absoluteAdjustmentUsd: toNumber(
    rawItem.absoluteAdjustmentUsd,
    Math.abs(toNumber(rawItem.adjustmentUsd, 0))
  ),
  confidence: toNumber(rawItem.confidence, 0),
});

export const mapCompanyHealth = (rawItem = {}) => {
  const metricCountEnabled = toNumber(rawItem.metricCountEnabled, 0);
  const metricCountSuccess = toNumber(rawItem.metricCountSuccess, 0);

  return {
    companyId: toStringValue(rawItem.companyId, ''),
    scoreDate: toStringValue(rawItem.scoreDate, ''),
    score: toNumber(rawItem.score, 0),
    rag: toStringValue(rawItem.rag, 'Unknown'),
    lastUpdated: toStringValue(rawItem.lastUpdated, ''),
    metricCountEnabled,
    metricCountSuccess,
    metricCoveragePct: metricCountEnabled > 0 ? metricCountSuccess / metricCountEnabled : null,
    growth: {
      rag: toStringValue(rawItem.growth?.rag, 'Unknown'),
      status: toStringValue(rawItem.growth?.status, ''),
      value: toStringValue(rawItem.growth?.value, ''),
      action: toStringValue(rawItem.growth?.action, ''),
      detail: toStringValue(rawItem.growth?.detail, ''),
      priority: toStringValue(rawItem.growth?.priority, ''),
    },
    csm: {
      rag: toStringValue(rawItem.csm?.rag, 'Unknown'),
      status: toStringValue(rawItem.csm?.status, ''),
      value: toStringValue(rawItem.csm?.value, ''),
      action: toStringValue(rawItem.csm?.action, ''),
      detail: toStringValue(rawItem.csm?.detail, ''),
      priority: toStringValue(rawItem.csm?.priority, ''),
    },
    nps: {
      rag: toStringValue(rawItem.nps?.rag, 'Unknown'),
      status: toStringValue(rawItem.nps?.status, ''),
      value: toStringValue(rawItem.nps?.value, ''),
      action: toStringValue(rawItem.nps?.action, ''),
      detail: toStringValue(rawItem.nps?.detail, ''),
      priority: toStringValue(rawItem.nps?.priority, ''),
    },
    support: {
      rag: toStringValue(rawItem.support?.rag, 'Unknown'),
      status: toStringValue(rawItem.support?.status, ''),
      value: toStringValue(rawItem.support?.value, ''),
      ticketCount: toNumber(rawItem.support?.ticketCount, 0),
      criticalCount: toNumber(rawItem.support?.criticalCount, 0),
      avgScore: toNumber(rawItem.support?.avgScore, 0),
      avgHours: toNumber(rawItem.support?.avgHours, 0),
      action: toStringValue(rawItem.support?.action, ''),
      detail: toStringValue(rawItem.support?.detail, ''),
      priority: toStringValue(rawItem.support?.priority, ''),
    },
  };
};

export const mapResearchItem = (rawItem = {}) => ({
  id: toStringValue(rawItem.id, ''),
  title: toStringValue(rawItem.title, 'Untitled'),
  category: toStringValue(rawItem.category, 'General'),
  summary: toStringValue(rawItem.summary, ''),
  updatedAt: toStringValue(rawItem.updatedAt, ''),
});

export const mapList = (items, mapper) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => mapper(item));
};

// Backward-compatible aliases for earlier scaffolding names.
export const mapSupportTicketItem = mapSupportTicket;
export const mapFinanceAdjustmentItem = mapFinanceAdjustment;
export const mapCompanyHealthItem = mapCompanyHealth;
export const mapResearchDataItem = mapResearchItem;
