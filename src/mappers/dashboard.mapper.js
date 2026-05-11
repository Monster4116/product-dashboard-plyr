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

const toBoolean = (value) => Boolean(value);

const toStringList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => toStringValue(item, "").trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
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

const mapSupportDistributionItem = (item = {}) => ({
  label: toStringValue(item.label, 'Unknown'),
  value: toStringValue(item.value || item.flag, 'Unknown'),
  count: toNumber(item.count, 0),
  pct: item.pct == null ? null : toNumber(item.pct, 0),
});

export const mapSupportDashboard = (rawItem = {}) => ({
  summary: {
    windowStart: toStringValue(rawItem.summary?.windowStart, ''),
    windowEnd: toStringValue(rawItem.summary?.windowEnd, ''),
    totalTickets: toNumber(rawItem.summary?.totalTickets, 0),
    openOrPendingTickets: toNumber(rawItem.summary?.openOrPendingTickets, 0),
    l4Tickets: toNumber(rawItem.summary?.l4Tickets, 0),
    badSatisfactionTickets: toNumber(rawItem.summary?.badSatisfactionTickets, 0),
    badSatisfactionPct: rawItem.summary?.badSatisfactionPct == null ? null : toNumber(rawItem.summary?.badSatisfactionPct, 0),
    requiresInternalHandoff: toNumber(rawItem.summary?.requiresInternalHandoff, 0),
    requiresClientInstruction: toNumber(rawItem.summary?.requiresClientInstruction, 0),
  },
  trend: mapList(rawItem.trend, (item) => ({
    month: toStringValue(item.month, ''),
    ticketCount: toNumber(item.ticketCount, 0),
    openOrPendingTickets: toNumber(item.openOrPendingTickets, 0),
    l4Tickets: toNumber(item.l4Tickets, 0),
    badSatisfactionTickets: toNumber(item.badSatisfactionTickets, 0),
  })),
  distributions: {
    statuses: mapList(rawItem.distributions?.statuses, mapSupportDistributionItem),
    severities: mapList(rawItem.distributions?.severities, mapSupportDistributionItem),
    categories: mapList(rawItem.distributions?.categories, mapSupportDistributionItem),
    subcategories: mapList(rawItem.distributions?.subcategories, mapSupportDistributionItem),
    departments: mapList(rawItem.distributions?.departments, mapSupportDistributionItem),
    requesterTypes: mapList(rawItem.distributions?.requesterTypes, mapSupportDistributionItem),
    channels: mapList(rawItem.distributions?.channels, mapSupportDistributionItem),
    countries: mapList(rawItem.distributions?.countries, mapSupportDistributionItem),
    processFlags: mapList(rawItem.distributions?.processFlags, (item) => ({
      flag: toStringValue(item.flag || item.value, ''),
      label: toStringValue(item.label, 'Unknown'),
      count: toNumber(item.count, 0),
      pct: item.pct == null ? null : toNumber(item.pct, 0),
    })),
  },
  hotspots: {
    companies: mapList(rawItem.hotspots?.companies, (item) => ({
      companyId: toStringValue(item.companyId, 'Unknown'),
      ticketCount: toNumber(item.ticketCount, 0),
      l4Tickets: toNumber(item.l4Tickets, 0),
      openOrPendingTickets: toNumber(item.openOrPendingTickets, 0),
      requiresInternalHandoff: toNumber(item.requiresInternalHandoff, 0),
    })),
  },
  insights: mapList(rawItem.insights, (item) => ({
    ticketId: toStringValue(item.ticketId, ''),
    ticketCreatedAt: toStringValue(item.ticketCreatedAt, ''),
    companyId: toStringValue(item.companyId, 'Unknown'),
    country: toStringValue(item.country, 'Unknown'),
    category: toStringValue(item.category, 'Unknown'),
    categoryLabel: toStringValue(item.categoryLabel, 'Unknown'),
    subcategory: toStringValue(item.subcategory, 'Unknown'),
    severity: toStringValue(item.severity, 'Unknown'),
    status: toStringValue(item.status, 'Unknown'),
    cleanSummary: toStringValue(item.cleanSummary, ''),
    requesterIntent: toStringValue(item.requesterIntent, ''),
    flags: mapList(item.flags, (flag) => toStringValue(flag, '')),
  })),
  dataQuality: {
    rawTicketRows: toNumber(rawItem.dataQuality?.rawTicketRows, 0),
    aiContextRows: toNumber(rawItem.dataQuality?.aiContextRows, 0),
    filteredAiContextRows: toNumber(rawItem.dataQuality?.filteredAiContextRows, 0),
    aiCoveragePct: rawItem.dataQuality?.aiCoveragePct == null ? null : toNumber(rawItem.dataQuality?.aiCoveragePct, 0),
    notes: mapList(rawItem.dataQuality?.notes, (item) => toStringValue(item, '')),
  },
  metadata: {
    generatedAt: toStringValue(rawItem.metadata?.generatedAt, ''),
    defaultWindow: toStringValue(rawItem.metadata?.defaultWindow, 'last_6_months'),
    sourceTables: mapList(rawItem.metadata?.sourceTables, (item) => toStringValue(item, '')),
    activeFilters: rawItem.metadata?.activeFilters && typeof rawItem.metadata.activeFilters === 'object'
      ? rawItem.metadata.activeFilters
      : {},
    availableFilters: {
      severities: mapList(rawItem.metadata?.availableFilters?.severities, mapSupportDistributionItem),
      categories: mapList(rawItem.metadata?.availableFilters?.categories, mapSupportDistributionItem),
      requesterTypes: mapList(rawItem.metadata?.availableFilters?.requesterTypes, mapSupportDistributionItem),
      countries: mapList(rawItem.metadata?.availableFilters?.countries, mapSupportDistributionItem),
    },
  },
});

export const mapFinanceAdjustment = (rawItem = {}) => ({
  month: toStringValue(rawItem.month, ''),
  companyId: toStringValue(rawItem.companyId, ''),
  employeeId: toStringValue(rawItem.employeeId, ''),
  territory: toStringValue(rawItem.territory, 'Unknown'),
  primaryAspect: toStringValue(rawItem.primaryAspect, 'Unknown'),
  subCategoryCode: toStringValue(rawItem.subCategoryCode, ''),
  detailedDescription: toStringValue(rawItem.detailedDescription, ''),
  tags: toStringList(rawItem.tags),
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

export const mapProductNewsItem = (rawItem = {}) => ({
  id: toStringValue(rawItem.id, ''),
  category: toStringValue(rawItem.category, ''),
  categoryLabel: toStringValue(rawItem.categoryLabel, 'General'),
  headline: toStringValue(rawItem.headline, 'Untitled'),
  actor: toStringValue(rawItem.actor, ''),
  actorType: toStringValue(rawItem.actorType, ''),
  summary: toStringValue(rawItem.summary, ''),
  insight: toStringValue(rawItem.insight, ''),
  sourceUrl: toStringValue(rawItem.sourceUrl, ''),
  sourceDomain: toStringValue(rawItem.sourceDomain, ''),
  dateText: toStringValue(rawItem.dateText, ''),
  itemDate: toStringValue(rawItem.itemDate, ''),
  researchedAt: toStringValue(rawItem.researchedAt, ''),
  runType: toStringValue(rawItem.runType, 'daily'),
  tag: toStringValue(rawItem.tag, ''),
  region: toStringValue(rawItem.region, ''),
  eventType: toStringValue(rawItem.eventType, ''),
  amount: toStringValue(rawItem.amount, ''),
  stage: toStringValue(rawItem.stage, ''),
  investors: toStringValue(rawItem.investors, ''),
  sentiment: toStringValue(rawItem.sentiment, ''),
  theme: toStringValue(rawItem.theme, ''),
  descriptor: toStringValue(rawItem.descriptor, ''),
});

export const mapNpsDashboard = (rawItem = {}) => ({
  summary: {
    headlineMonth: toStringValue(rawItem.summary?.headlineMonth, ''),
    collectionVersion: toStringValue(rawItem.summary?.collectionVersion, 'all'),
    segment: toStringValue(rawItem.summary?.segment, 'Total'),
    npsScore: toNumber(rawItem.summary?.npsScore, 0),
    previousMonthNpsScore: rawItem.summary?.previousMonthNpsScore == null ? null : toNumber(rawItem.summary?.previousMonthNpsScore, 0),
    monthOverMonthDelta: rawItem.summary?.monthOverMonthDelta == null ? null : toNumber(rawItem.summary?.monthOverMonthDelta, 0),
    totalResponses: toNumber(rawItem.summary?.totalResponses, 0),
    promoters: toNumber(rawItem.summary?.promoters, 0),
    passives: toNumber(rawItem.summary?.passives, 0),
    detractors: toNumber(rawItem.summary?.detractors, 0),
    promoterPct: rawItem.summary?.promoterPct == null ? null : toNumber(rawItem.summary?.promoterPct, 0),
    passivePct: rawItem.summary?.passivePct == null ? null : toNumber(rawItem.summary?.passivePct, 0),
    detractorPct: rawItem.summary?.detractorPct == null ? null : toNumber(rawItem.summary?.detractorPct, 0),
    calculatedAt: toStringValue(rawItem.summary?.calculatedAt, ''),
  },
  trend: mapList(rawItem.trend, (item) => ({
    month: toStringValue(item.month, ''),
    segment: toStringValue(item.segment, 'Total'),
    collectionVersion: toStringValue(item.collectionVersion, 'all'),
    npsScore: toNumber(item.npsScore, 0),
    totalResponses: toNumber(item.totalResponses, 0),
    promoters: toNumber(item.promoters, 0),
    passives: toNumber(item.passives, 0),
    detractors: toNumber(item.detractors, 0),
  })),
  segments: mapList(rawItem.segments, (item) => ({
    segment: toStringValue(item.segment, 'Total'),
    month: toStringValue(item.month, ''),
    npsScore: toNumber(item.npsScore, 0),
    totalResponses: toNumber(item.totalResponses, 0),
  })),
  distribution: {
    respondentTypes: mapList(rawItem.distribution?.respondentTypes, (item) => ({
      respondentType: toStringValue(item.respondentType, 'Unknown'),
      responses: toNumber(item.responses, 0),
      avgScore: toNumber(item.avgScore, 0),
      promoters: toNumber(item.promoters, 0),
      passives: toNumber(item.passives, 0),
      detractors: toNumber(item.detractors, 0),
    })),
    departmentSignals: mapList(rawItem.distribution?.departmentSignals, (item) => ({
      department: toStringValue(item.department, 'Unknown'),
      responses: toNumber(item.responses, 0),
      avgScore: toNumber(item.avgScore, 0),
    })),
  },
  responseExplorer: mapList(rawItem.responseExplorer, (item) => ({
    responseId: toStringValue(item.responseId, ''),
    responseMonth: toStringValue(item.responseMonth, ''),
    responseDate: toStringValue(item.responseDate, ''),
    respondentType: toStringValue(item.respondentType, 'Unknown'),
    respondentName: toStringValue(item.respondentName, ''),
    clientName: toStringValue(item.clientName, ''),
    countryOfEmployment: toStringValue(item.countryOfEmployment, ''),
    npsScore: toNumber(item.npsScore, 0),
    npsGroup: toStringValue(item.npsGroup, 'Unknown'),
    initialReasonProvided: toStringValue(item.initialReasonProvided, ''),
    relevantDepartment: toStringValue(item.relevantDepartment, ''),
    collectionVersion: toStringValue(item.collectionVersion, 'all'),
    groupingMismatch: toBoolean(item.groupingMismatch),
    isValidForNps: toBoolean(item.isValidForNps),
  })),
  dataQuality: {
    totalResponses: toNumber(rawItem.dataQuality?.totalResponses, 0),
    rowsWithReason: toNumber(rawItem.dataQuality?.rowsWithReason, 0),
    rowsWithClassification: toNumber(rawItem.dataQuality?.rowsWithClassification, 0),
    rowsWithSubClassification: toNumber(rawItem.dataQuality?.rowsWithSubClassification, 0),
    rowsWithClientName: toNumber(rawItem.dataQuality?.rowsWithClientName, 0),
    rowsWithCountry: toNumber(rawItem.dataQuality?.rowsWithCountry, 0),
  },
  metadata: {
    defaultCollectionVersion: toStringValue(rawItem.metadata?.defaultCollectionVersion, 'all'),
    availableCollectionVersions: mapList(rawItem.metadata?.availableCollectionVersions, (item) => toStringValue(item, '')),
    availableSegments: mapList(rawItem.metadata?.availableSegments, (item) => toStringValue(item, '')),
    availableResponseMonths: mapList(rawItem.metadata?.availableResponseMonths, (item) => toStringValue(item, '')),
    notes: mapList(rawItem.metadata?.notes, (item) => toStringValue(item, '')),
    partialMonthObserved: toBoolean(rawItem.metadata?.partialMonthObserved),
    latestObservedMonth: toStringValue(rawItem.metadata?.latestObservedMonth, ''),
    generatedAt: toStringValue(rawItem.metadata?.generatedAt, ''),
  },
});

export const mapActionDefinition = (rawItem = {}) => ({
  id: toStringValue(rawItem.id, ''),
  name: toStringValue(rawItem.name, 'Untitled action'),
  description: toStringValue(rawItem.description, ''),
  category: toStringValue(rawItem.category, 'Internal'),
  impact: toStringValue(rawItem.impact, 'safe'),
  defaultMode: toStringValue(rawItem.defaultMode, 'dry_run'),
  allowLiveRun: Boolean(rawItem.allowLiveRun),
  liveEnabled: Boolean(rawItem.liveEnabled),
  buttonLabel: toStringValue(rawItem.buttonLabel, 'Run action'),
});

export const mapActionRunResult = (rawItem = {}) => ({
  ok: Boolean(rawItem.ok),
  actionId: toStringValue(rawItem.actionId, ''),
  status: toStringValue(rawItem.status, 'unknown'),
  message: toStringValue(rawItem.message, ''),
  mode: toStringValue(rawItem.mode, 'dry_run'),
  ranAt: toStringValue(rawItem.ranAt, ''),
  result: rawItem.result && typeof rawItem.result === 'object' ? rawItem.result : {},
});

export const mapList = (items, mapper) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => mapper(item));
};

// Backward-compatible aliases for earlier scaffolding names.
export const mapSupportTicketItem = mapSupportTicket;
export const mapFinanceAdjustmentItem = mapFinanceAdjustment;
export const mapCompanyHealthItem = mapCompanyHealth;
export const mapActionDefinitionItem = mapActionDefinition;
export const mapActionRunResultItem = mapActionRunResult;
export const mapProductNewsListItem = mapProductNewsItem;
export const mapResearchDataItem = mapResearchItem;
export const mapNpsDashboardData = mapNpsDashboard;
export const mapSupportDashboardData = mapSupportDashboard;
