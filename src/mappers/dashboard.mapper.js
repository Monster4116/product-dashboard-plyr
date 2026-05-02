// Raw database row -> mapper -> dashboard contract -> UI
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

export const mapSupportTicketItem = (rawItem = {}) => ({
  ticketId: toStringValue(rawItem.ticketId || rawItem.id, ''),
  category: toStringValue(rawItem.category, 'Unknown'),
  priority: toStringValue(rawItem.priority, 'Unknown'),
  status: toStringValue(rawItem.status, 'Unknown'),
  requesterName: toStringValue(rawItem.requesterName, 'Unknown'),
});

export const mapFinanceAdjustmentItem = (rawItem = {}) => ({
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

export const mapResearchDataItem = (rawItem = {}) => ({
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
