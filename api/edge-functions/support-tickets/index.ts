import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAGE_SIZE = 1000;
const DEFAULT_MAX_ROWS = 50000;
const PROCESS_FLAGS = [
  "requires_internal_handoff",
  "requires_client_instruction",
  "is_payroll_related",
  "is_payment_related",
  "is_invoice_related",
  "is_platform_bug",
  "is_contract_related",
  "is_termination_or_end_date_related",
  "is_leave_related",
  "is_visa_or_immigration_related",
  "has_attachment",
  "has_conflicting_dates",
];

const SUPPORT_READ_MODEL_SELECT = [
  "source_ticket_id",
  "ticket_created_at",
  "ticket_updated_at",
  "country",
  "requestor_type",
  "existing_top_level_category",
  "existing_subcategory",
  "existing_severity",
  "existing_relevant_department",
  "clean_summary",
  "requester_intent",
  "issue_timeline",
  "process_flags",
  "context_quality",
  "ai_context_version",
  "model_name",
  "status",
  "priority",
  "via_channel",
  "satisfaction_score",
  "customer_platform_uuid",
  "customer_segmentation",
  "existing_churn_risk",
  "comment_count",
  "qa_status",
].join(",");

const SUPPORT_MONTHLY_ROLLUP_SELECT = [
  "month_start",
  "severity",
  "category",
  "subcategory",
  "department",
  "requester_type",
  "country",
  "status",
  "channel",
  "first_ticket_created_at",
  "last_ticket_created_at",
  "ticket_count",
  "open_or_pending_count",
  "l4_count",
  "bad_satisfaction_count",
  "requires_internal_handoff_count",
  "requires_client_instruction_count",
  "is_payroll_related_count",
  "is_payment_related_count",
  "is_invoice_related_count",
  "is_platform_bug_count",
  "is_contract_related_count",
  "is_termination_or_end_date_related_count",
  "is_leave_related_count",
  "is_visa_or_immigration_related_count",
  "has_attachment_count",
  "has_conflicting_dates_count",
].join(",");

const SUPPORT_COMPANY_ROLLUP_SELECT = [
  "month_start",
  "company_id",
  "severity",
  "category",
  "requester_type",
  "country",
  "ticket_count",
  "open_or_pending_count",
  "l4_count",
  "requires_internal_handoff_count",
].join(",");

const SUPPORT_TAG_ROLLUP_SELECT = [
  "month_start",
  "tag",
  "severity",
  "category",
  "requester_type",
  "country",
  "ticket_count",
  "open_or_pending_count",
  "l4_count",
  "requires_internal_handoff_count",
].join(",");

const SUPPORT_SEGMENT_ROLLUP_SELECT = [
  "month_start",
  "customer_segment",
  "churn_risk",
  "severity",
  "category",
  "requester_type",
  "country",
  "ticket_count",
  "open_or_pending_count",
  "l4_count",
  "requires_internal_handoff_count",
  "bad_satisfaction_count",
].join(",");

const SUPPORT_QUEUE_ROLLUP_SELECT = [
  "age_bucket",
  "status",
  "severity",
  "category",
  "department",
  "requester_type",
  "country",
  "ticket_count",
  "l4_count",
  "requires_internal_handoff_count",
  "requires_client_instruction_count",
  "bad_satisfaction_count",
].join(",");

const SUPPORT_DATA_QUALITY_SELECT = [
  "month_start",
  "raw_ticket_count",
  "enriched_ticket_count",
  "missing_ai_context_count",
  "missing_country_count",
  "missing_category_count",
  "missing_requester_type_count",
  "missing_severity_count",
  "missing_customer_segment_count",
  "missing_churn_risk_count",
].join(",");

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type SupportRow = {
  source_ticket_id: string;
  ticket_created_at: string | null;
  ticket_updated_at: string | null;
  country: string | null;
  requestor_type: string | null;
  existing_top_level_category: string | null;
  existing_subcategory: string | null;
  existing_severity: string | null;
  existing_relevant_department: string | null;
  clean_summary: string | null;
  requester_intent: string | null;
  issue_timeline: string | null;
  process_flags: Record<string, unknown> | null;
  context_quality: Record<string, unknown> | null;
  ai_context_version: string | null;
  model_name: string | null;
  status: string | null;
  priority: string | null;
  via_channel: string | null;
  satisfaction_score: string | null;
  customer_platform_uuid: string | null;
  customer_segmentation: string | null;
  existing_churn_risk: string | null;
  comment_count: number | string | null;
  qa_status: string | null;
};

type SupportMonthlyRollup = {
  month_start: string;
  severity: string;
  category: string;
  subcategory: string;
  department: string;
  requester_type: string;
  country: string;
  status: string;
  channel: string;
  first_ticket_created_at: string | null;
  last_ticket_created_at: string | null;
  ticket_count: number | string | null;
  open_or_pending_count: number | string | null;
  l4_count: number | string | null;
  bad_satisfaction_count: number | string | null;
  requires_internal_handoff_count: number | string | null;
  requires_client_instruction_count: number | string | null;
  is_payroll_related_count: number | string | null;
  is_payment_related_count: number | string | null;
  is_invoice_related_count: number | string | null;
  is_platform_bug_count: number | string | null;
  is_contract_related_count: number | string | null;
  is_termination_or_end_date_related_count: number | string | null;
  is_leave_related_count: number | string | null;
  is_visa_or_immigration_related_count: number | string | null;
  has_attachment_count: number | string | null;
  has_conflicting_dates_count: number | string | null;
};

type SupportCompanyRollup = {
  month_start: string;
  company_id: string;
  severity: string;
  category: string;
  requester_type: string;
  country: string;
  ticket_count: number | string | null;
  open_or_pending_count: number | string | null;
  l4_count: number | string | null;
  requires_internal_handoff_count: number | string | null;
};

type SupportTagRollup = {
  month_start: string;
  tag: string;
  severity: string;
  category: string;
  requester_type: string;
  country: string;
  ticket_count: number | string | null;
  open_or_pending_count: number | string | null;
  l4_count: number | string | null;
  requires_internal_handoff_count: number | string | null;
};

type SupportSegmentRollup = {
  month_start: string;
  customer_segment: string;
  churn_risk: string;
  severity: string;
  category: string;
  requester_type: string;
  country: string;
  ticket_count: number | string | null;
  open_or_pending_count: number | string | null;
  l4_count: number | string | null;
  requires_internal_handoff_count: number | string | null;
  bad_satisfaction_count: number | string | null;
};

type SupportQueueRollup = {
  age_bucket: string;
  status: string;
  severity: string;
  category: string;
  department: string;
  requester_type: string;
  country: string;
  ticket_count: number | string | null;
  l4_count: number | string | null;
  requires_internal_handoff_count: number | string | null;
  requires_client_instruction_count: number | string | null;
  bad_satisfaction_count: number | string | null;
};

type SupportDataQualityRollup = {
  month_start: string;
  raw_ticket_count: number | string | null;
  enriched_ticket_count: number | string | null;
  missing_ai_context_count: number | string | null;
  missing_country_count: number | string | null;
  missing_category_count: number | string | null;
  missing_requester_type_count: number | string | null;
  missing_severity_count: number | string | null;
  missing_customer_segment_count: number | string | null;
  missing_churn_risk_count: number | string | null;
};

type SupportFilters = {
  severity: string;
  category: string;
  requesterType: string;
  country: string;
  department: string;
};

const pickText = (...values: unknown[]) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
};

const normalizeDisplayValue = (value: unknown, fallback: unknown = "Unknown") => {
  const text = pickText(value);
  if (!text || text === "-") return pickText(fallback, "Unknown");
  return text;
};

const labelize = (value: string) => normalizeDisplayValue(value)
  .replace(/_/g, " ")
  .replace(/\//g, " / ")
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getDateTime = (value: string | null) => {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const toIsoDate = (value: string | null) => {
  const text = pickText(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
};

const addDays = (date: string, days: number) => {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return "";
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
};

const getCurrentMonthWindow = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
};

const getMonthStart = (date: string) => {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), 1)).toISOString().slice(0, 10);
};

const getNextMonthStart = (date: string) => {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, 1)).toISOString().slice(0, 10);
};

const getFlag = (row: SupportRow, flag: string) => row.process_flags?.[flag] === true;

const getCount = (row: Record<string, unknown>, field: string) => toNumber(row[field], 0);

const getRollupFilterColumns = (filters: SupportFilters) => ({
  severity: filters.severity,
  category: filters.category,
  requester_type: filters.requesterType,
  country: filters.country,
  department: filters.department,
});

const getSharedRollupFilterColumns = (filters: SupportFilters) => ({
  severity: filters.severity,
  category: filters.category,
  requester_type: filters.requesterType,
  country: filters.country,
});

const getRowFilterColumns = (filters: SupportFilters) => ({
  existing_severity: filters.severity,
  existing_top_level_category: filters.category,
  requestor_type: filters.requesterType,
  country: filters.country,
  existing_relevant_department: filters.department,
});

async function fetchAllRows<T>(
  supabase: ReturnType<typeof createClient>,
  table: string,
  select: string,
  orderColumn: string,
  options: {
    maxRows?: number;
    startDate?: string;
    endDate?: string;
    dateMode?: "date" | "timestamp";
    filters?: Record<string, string>;
  } = {},
) {
  const allRows: T[] = [];
  let from = 0;
  let hasMore = true;
  const maxRows = options.maxRows ?? DEFAULT_MAX_ROWS;

  while (hasMore && allRows.length < maxRows) {
    const to = Number.isFinite(maxRows)
      ? Math.min(from + PAGE_SIZE - 1, maxRows - 1)
      : from + PAGE_SIZE - 1;
    let query = supabase
      .from(table)
      .select(select)
      .order(orderColumn, { ascending: false, nullsFirst: false });

    if (options.startDate) {
      query = query.gte(
        orderColumn,
        options.dateMode === "date" ? options.startDate : `${options.startDate}T00:00:00.000Z`,
      );
    }

    if (options.endDate) {
      query = query.lt(
        orderColumn,
        options.dateMode === "date" ? options.endDate : `${options.endDate}T00:00:00.000Z`,
      );
    }

    Object.entries(options.filters ?? {}).forEach(([column, value]) => {
      if (value) query = query.eq(column, value);
    });

    if (table === "dashboard_support_ticket_rows") {
      query = query.limit(to - from + 1);
    }

    const { data, error } = await query.range(from, to);

    if (error) throw error;

    const page = (data ?? []) as T[];
    allRows.push(...page);
    hasMore = page.length === PAGE_SIZE && allRows.length < maxRows;
    from += PAGE_SIZE;
  }

  return allRows;
}

const buildInsights = (rows: SupportRow[], limit: number) => rows
  .filter((row) => pickText(row.clean_summary, row.requester_intent))
  .sort((left, right) => {
    const leftScore =
      (normalizeDisplayValue(left.existing_severity).toLowerCase() === "l4" ? 100 : 0) +
      (getFlag(left, "requires_internal_handoff") ? 30 : 0) +
      (getFlag(left, "requires_client_instruction") ? 20 : 0) +
      (getFlag(left, "is_platform_bug") ? 15 : 0) +
      (normalizeDisplayValue(left.status).toLowerCase() === "open" ? 10 : 0);
    const rightScore =
      (normalizeDisplayValue(right.existing_severity).toLowerCase() === "l4" ? 100 : 0) +
      (getFlag(right, "requires_internal_handoff") ? 30 : 0) +
      (getFlag(right, "requires_client_instruction") ? 20 : 0) +
      (getFlag(right, "is_platform_bug") ? 15 : 0) +
      (normalizeDisplayValue(right.status).toLowerCase() === "open" ? 10 : 0);

    if (rightScore !== leftScore) return rightScore - leftScore;
    return getDateTime(right.ticket_created_at) - getDateTime(left.ticket_created_at);
  })
  .slice(0, limit)
  .map((row) => ({
    ticketId: pickText(row.source_ticket_id),
    ticketCreatedAt: pickText(row.ticket_created_at),
    companyId: normalizeDisplayValue(row.customer_platform_uuid),
    country: normalizeDisplayValue(row.country),
    category: normalizeDisplayValue(row.existing_top_level_category),
    categoryLabel: labelize(normalizeDisplayValue(row.existing_top_level_category)),
    subcategory: normalizeDisplayValue(row.existing_subcategory),
    severity: normalizeDisplayValue(row.existing_severity),
    status: normalizeDisplayValue(row.status),
    cleanSummary: pickText(row.clean_summary),
    requesterIntent: pickText(row.requester_intent),
    flags: PROCESS_FLAGS.filter((flag) => getFlag(row, flag)),
  }));

const filterRows = (
  rows: SupportRow[],
  filters: SupportFilters,
) => rows.filter((row) => {
  if (filters.severity && normalizeDisplayValue(row.existing_severity) !== filters.severity) return false;
  if (filters.category && normalizeDisplayValue(row.existing_top_level_category) !== filters.category) return false;
  if (filters.requesterType && normalizeDisplayValue(row.requestor_type) !== filters.requesterType) return false;
  if (filters.country && normalizeDisplayValue(row.country) !== filters.country) return false;
  if (filters.department && normalizeDisplayValue(row.existing_relevant_department) !== filters.department) return false;
  return true;
});

const sumRollups = (rows: SupportMonthlyRollup[], field: keyof SupportMonthlyRollup) =>
  rows.reduce((total, row) => total + getCount(row as Record<string, unknown>, String(field)), 0);

const buildRollupTrend = (rows: SupportMonthlyRollup[]) => {
  const monthMap = new Map<string, {
    month: string;
    ticketCount: number;
    openOrPendingTickets: number;
    l4Tickets: number;
    badSatisfactionTickets: number;
  }>();

  rows.forEach((row) => {
    const month = pickText(row.month_start).slice(0, 7);
    if (!month) return;
    const item = monthMap.get(month) ?? {
      month,
      ticketCount: 0,
      openOrPendingTickets: 0,
      l4Tickets: 0,
      badSatisfactionTickets: 0,
    };

    item.ticketCount += getCount(row as Record<string, unknown>, "ticket_count");
    item.openOrPendingTickets += getCount(row as Record<string, unknown>, "open_or_pending_count");
    item.l4Tickets += getCount(row as Record<string, unknown>, "l4_count");
    item.badSatisfactionTickets += getCount(row as Record<string, unknown>, "bad_satisfaction_count");
    monthMap.set(month, item);
  });

  return [...monthMap.values()].sort((left, right) => left.month.localeCompare(right.month));
};

const countRollupsBy = (
  rows: SupportMonthlyRollup[],
  getter: (row: SupportMonthlyRollup) => string,
  limit = 12,
) => {
  const map = new Map<string, { label: string; value: string; count: number }>();
  const total = sumRollups(rows, "ticket_count");

  rows.forEach((row) => {
    const value = normalizeDisplayValue(getter(row));
    const item = map.get(value) ?? { label: labelize(value), value, count: 0 };
    item.count += getCount(row as Record<string, unknown>, "ticket_count");
    map.set(value, item);
  });

  return [...map.values()]
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, limit)
    .map((item) => ({
      ...item,
      pct: total ? Number((item.count / total).toFixed(4)) : 0,
    }));
};

const buildRollupProcessFlags = (rows: SupportMonthlyRollup[]) => {
  const total = sumRollups(rows, "ticket_count");

  return PROCESS_FLAGS
    .map((flag) => {
      const field = `${flag}_count`;
      const count = rows.reduce((sum, row) => sum + getCount(row as Record<string, unknown>, field), 0);

      return {
        flag,
        label: labelize(flag),
        count,
        pct: total ? Number((count / total).toFixed(4)) : 0,
      };
    })
    .sort((left, right) => right.count - left.count);
};

const buildRollupCompanyHotspots = (rows: SupportCompanyRollup[]) => {
  const map = new Map<string, {
    companyId: string;
    ticketCount: number;
    l4Tickets: number;
    openOrPendingTickets: number;
    requiresInternalHandoff: number;
  }>();

  rows.forEach((row) => {
    const companyId = normalizeDisplayValue(row.company_id);
    const item = map.get(companyId) ?? {
      companyId,
      ticketCount: 0,
      l4Tickets: 0,
      openOrPendingTickets: 0,
      requiresInternalHandoff: 0,
    };

    item.ticketCount += getCount(row as Record<string, unknown>, "ticket_count");
    item.l4Tickets += getCount(row as Record<string, unknown>, "l4_count");
    item.openOrPendingTickets += getCount(row as Record<string, unknown>, "open_or_pending_count");
    item.requiresInternalHandoff += getCount(row as Record<string, unknown>, "requires_internal_handoff_count");
    map.set(companyId, item);
  });

  return [...map.values()]
    .filter((item) => item.companyId !== "Unknown")
    .sort((left, right) =>
      right.ticketCount - left.ticketCount ||
      right.l4Tickets - left.l4Tickets ||
      right.openOrPendingTickets - left.openOrPendingTickets,
    )
    .slice(0, 15);
};

const getRollupWindow = (rows: SupportMonthlyRollup[]) => {
  const starts = rows.map((row) => getDateTime(row.first_ticket_created_at)).filter(Boolean);
  const ends = rows.map((row) => getDateTime(row.last_ticket_created_at)).filter(Boolean);

  return {
    windowStart: starts.length ? new Date(Math.min(...starts)).toISOString().slice(0, 10) : "",
    windowEnd: ends.length ? new Date(Math.max(...ends)).toISOString().slice(0, 10) : "",
  };
};

const getPct = (count: number, total: number) => total ? Number((count / total).toFixed(4)) : 0;

const takeTopValues = <T>(
  rows: T[],
  getter: (row: T) => string,
  countGetter: (row: T) => number,
  limit: number,
) => {
  const map = new Map<string, number>();

  rows.forEach((row) => {
    const value = normalizeDisplayValue(getter(row));
    map.set(value, (map.get(value) ?? 0) + countGetter(row));
  });

  return [...map.entries()]
    .filter(([value]) => value !== "Unknown")
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([value]) => value);
};

const buildCategorySeverityHeatmap = (rows: SupportMonthlyRollup[]) => {
  const categories = takeTopValues(rows, (row) => row.category, (row) => getCount(row as Record<string, unknown>, "ticket_count"), 12);
  const severities = ["l1", "l2", "l3", "l4", "Unknown"];
  const total = sumRollups(rows, "ticket_count");

  return categories.flatMap((category) =>
    severities.map((severity) => {
      const matching = rows.filter((row) =>
        normalizeDisplayValue(row.category) === category &&
        normalizeDisplayValue(row.severity).toLowerCase() === severity.toLowerCase()
      );
      const count = sumRollups(matching, "ticket_count");
      const openOrPending = sumRollups(matching, "open_or_pending_count");
      const internalHandoff = sumRollups(matching, "requires_internal_handoff_count");

      return {
        category,
        categoryLabel: labelize(category),
        severity: labelize(severity),
        ticketCount: count,
        openOrPendingTickets: openOrPending,
        requiresInternalHandoff: internalHandoff,
        pct: getPct(count, total),
      };
    })
  ).filter((item) => item.ticketCount > 0);
};

const buildCountryCategoryHeatmap = (rows: SupportMonthlyRollup[]) => {
  const countries = takeTopValues(rows, (row) => row.country, (row) => getCount(row as Record<string, unknown>, "ticket_count"), 12);
  const categories = takeTopValues(rows, (row) => row.category, (row) => getCount(row as Record<string, unknown>, "ticket_count"), 8);

  return countries.flatMap((country) =>
    categories.map((category) => {
      const matching = rows.filter((row) =>
        normalizeDisplayValue(row.country) === country &&
        normalizeDisplayValue(row.category) === category
      );

      return {
        country,
        category,
        categoryLabel: labelize(category),
        ticketCount: sumRollups(matching, "ticket_count"),
        l4Tickets: sumRollups(matching, "l4_count"),
        openOrPendingTickets: sumRollups(matching, "open_or_pending_count"),
        badSatisfactionTickets: sumRollups(matching, "bad_satisfaction_count"),
        requiresInternalHandoff: sumRollups(matching, "requires_internal_handoff_count"),
      };
    })
  ).filter((item) => item.ticketCount > 0);
};

const buildMonthCategoryMatrix = (rows: SupportMonthlyRollup[]) => {
  const months = [...new Set(rows.map((row) => pickText(row.month_start).slice(0, 7)).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right));
  const categories = takeTopValues(rows, (row) => row.category, (row) => getCount(row as Record<string, unknown>, "ticket_count"), 8);

  return categories.map((category) => ({
    category,
    categoryLabel: labelize(category),
    months: months.map((month) => {
      const matching = rows.filter((row) =>
        pickText(row.month_start).startsWith(month) &&
        normalizeDisplayValue(row.category) === category
      );

      return {
        month,
        ticketCount: sumRollups(matching, "ticket_count"),
        l4Tickets: sumRollups(matching, "l4_count"),
        openOrPendingTickets: sumRollups(matching, "open_or_pending_count"),
      };
    }),
  }));
};

const buildDepartmentBurden = (rows: SupportMonthlyRollup[]) => {
  const map = new Map<string, {
    department: string;
    label: string;
    ticketCount: number;
    openOrPendingTickets: number;
    l4Tickets: number;
    requiresInternalHandoff: number;
    requiresClientInstruction: number;
    platformBugTickets: number;
    payrollTickets: number;
  }>();

  rows.forEach((row) => {
    const department = normalizeDisplayValue(row.department);
    const item = map.get(department) ?? {
      department,
      label: labelize(department),
      ticketCount: 0,
      openOrPendingTickets: 0,
      l4Tickets: 0,
      requiresInternalHandoff: 0,
      requiresClientInstruction: 0,
      platformBugTickets: 0,
      payrollTickets: 0,
    };

    item.ticketCount += getCount(row as Record<string, unknown>, "ticket_count");
    item.openOrPendingTickets += getCount(row as Record<string, unknown>, "open_or_pending_count");
    item.l4Tickets += getCount(row as Record<string, unknown>, "l4_count");
    item.requiresInternalHandoff += getCount(row as Record<string, unknown>, "requires_internal_handoff_count");
    item.requiresClientInstruction += getCount(row as Record<string, unknown>, "requires_client_instruction_count");
    item.platformBugTickets += getCount(row as Record<string, unknown>, "is_platform_bug_count");
    item.payrollTickets += getCount(row as Record<string, unknown>, "is_payroll_related_count");
    map.set(department, item);
  });

  return [...map.values()]
    .sort((left, right) =>
      right.ticketCount - left.ticketCount ||
      right.requiresInternalHandoff - left.requiresInternalHandoff ||
      left.label.localeCompare(right.label),
    )
    .slice(0, 15);
};

const buildQueue = (rows: SupportQueueRollup[]) => {
  const total = rows.reduce((sum, row) => sum + getCount(row as Record<string, unknown>, "ticket_count"), 0);
  const bucketOrder = ["0-3 days", "4-7 days", "8-14 days", "15-30 days", "31+ days"];

  const byBucket = bucketOrder.map((bucket) => {
    const matching = rows.filter((row) => normalizeDisplayValue(row.age_bucket) === bucket);
    return {
      bucket,
      ticketCount: matching.reduce((sum, row) => sum + getCount(row as Record<string, unknown>, "ticket_count"), 0),
      l4Tickets: matching.reduce((sum, row) => sum + getCount(row as Record<string, unknown>, "l4_count"), 0),
      requiresInternalHandoff: matching.reduce((sum, row) => sum + getCount(row as Record<string, unknown>, "requires_internal_handoff_count"), 0),
      requiresClientInstruction: matching.reduce((sum, row) => sum + getCount(row as Record<string, unknown>, "requires_client_instruction_count"), 0),
      badSatisfactionTickets: matching.reduce((sum, row) => sum + getCount(row as Record<string, unknown>, "bad_satisfaction_count"), 0),
    };
  });

  const byCategory = countQueueBy(rows, (row) => row.category, 12);
  const byDepartment = countQueueBy(rows, (row) => row.department, 12);
  const bySeverity = countQueueBy(rows, (row) => row.severity, 8);

  return {
    totalOpenOrPending: total,
    byBucket,
    byCategory,
    byDepartment,
    bySeverity,
  };
};

const countQueueBy = (rows: SupportQueueRollup[], getter: (row: SupportQueueRollup) => string, limit = 12) => {
  const total = rows.reduce((sum, row) => sum + getCount(row as Record<string, unknown>, "ticket_count"), 0);
  const map = new Map<string, { label: string; value: string; count: number; l4Tickets: number; requiresInternalHandoff: number }>();

  rows.forEach((row) => {
    const value = normalizeDisplayValue(getter(row));
    const item = map.get(value) ?? { label: labelize(value), value, count: 0, l4Tickets: 0, requiresInternalHandoff: 0 };
    item.count += getCount(row as Record<string, unknown>, "ticket_count");
    item.l4Tickets += getCount(row as Record<string, unknown>, "l4_count");
    item.requiresInternalHandoff += getCount(row as Record<string, unknown>, "requires_internal_handoff_count");
    map.set(value, item);
  });

  return [...map.values()]
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, limit)
    .map((item) => ({ ...item, pct: getPct(item.count, total) }));
};

const buildSegments = (rows: SupportSegmentRollup[]) => {
  const total = rows.reduce((sum, row) => sum + getCount(row as Record<string, unknown>, "ticket_count"), 0);

  return {
    bySegment: countSegmentBy(rows, (row) => row.customer_segment, total),
    byChurnRisk: countSegmentBy(rows, (row) => row.churn_risk, total),
  };
};

const countSegmentBy = (rows: SupportSegmentRollup[], getter: (row: SupportSegmentRollup) => string, total: number) => {
  const map = new Map<string, {
    label: string;
    value: string;
    count: number;
    openOrPendingTickets: number;
    l4Tickets: number;
    requiresInternalHandoff: number;
    badSatisfactionTickets: number;
  }>();

  rows.forEach((row) => {
    const value = normalizeDisplayValue(getter(row));
    const item = map.get(value) ?? {
      label: labelize(value),
      value,
      count: 0,
      openOrPendingTickets: 0,
      l4Tickets: 0,
      requiresInternalHandoff: 0,
      badSatisfactionTickets: 0,
    };
    item.count += getCount(row as Record<string, unknown>, "ticket_count");
    item.openOrPendingTickets += getCount(row as Record<string, unknown>, "open_or_pending_count");
    item.l4Tickets += getCount(row as Record<string, unknown>, "l4_count");
    item.requiresInternalHandoff += getCount(row as Record<string, unknown>, "requires_internal_handoff_count");
    item.badSatisfactionTickets += getCount(row as Record<string, unknown>, "bad_satisfaction_count");
    map.set(value, item);
  });

  return [...map.values()]
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .map((item) => ({ ...item, pct: getPct(item.count, total) }));
};

const buildTags = (rows: SupportTagRollup[]) => {
  const total = rows.reduce((sum, row) => sum + getCount(row as Record<string, unknown>, "ticket_count"), 0);
  const map = new Map<string, {
    tag: string;
    label: string;
    ticketCount: number;
    openOrPendingTickets: number;
    l4Tickets: number;
    requiresInternalHandoff: number;
  }>();

  rows.forEach((row) => {
    const tag = normalizeDisplayValue(row.tag);
    const item = map.get(tag) ?? {
      tag,
      label: labelize(tag),
      ticketCount: 0,
      openOrPendingTickets: 0,
      l4Tickets: 0,
      requiresInternalHandoff: 0,
    };
    item.ticketCount += getCount(row as Record<string, unknown>, "ticket_count");
    item.openOrPendingTickets += getCount(row as Record<string, unknown>, "open_or_pending_count");
    item.l4Tickets += getCount(row as Record<string, unknown>, "l4_count");
    item.requiresInternalHandoff += getCount(row as Record<string, unknown>, "requires_internal_handoff_count");
    map.set(tag, item);
  });

  return [...map.values()]
    .sort((left, right) => right.ticketCount - left.ticketCount || left.label.localeCompare(right.label))
    .slice(0, 30)
    .map((item) => ({ ...item, pct: getPct(item.ticketCount, total) }));
};

const buildDataQuality = (rows: SupportDataQualityRollup[], totalTickets: number) => {
  const rawTicketRows = rows.reduce((sum, row) => sum + getCount(row as Record<string, unknown>, "raw_ticket_count"), 0);
  const enrichedRows = rows.reduce((sum, row) => sum + getCount(row as Record<string, unknown>, "enriched_ticket_count"), 0);
  const missingAiContext = rows.reduce((sum, row) => sum + getCount(row as Record<string, unknown>, "missing_ai_context_count"), 0);
  const missingCountry = rows.reduce((sum, row) => sum + getCount(row as Record<string, unknown>, "missing_country_count"), 0);
  const missingCategory = rows.reduce((sum, row) => sum + getCount(row as Record<string, unknown>, "missing_category_count"), 0);
  const missingRequesterType = rows.reduce((sum, row) => sum + getCount(row as Record<string, unknown>, "missing_requester_type_count"), 0);
  const missingSeverity = rows.reduce((sum, row) => sum + getCount(row as Record<string, unknown>, "missing_severity_count"), 0);
  const missingCustomerSegment = rows.reduce((sum, row) => sum + getCount(row as Record<string, unknown>, "missing_customer_segment_count"), 0);
  const missingChurnRisk = rows.reduce((sum, row) => sum + getCount(row as Record<string, unknown>, "missing_churn_risk_count"), 0);

  return {
    rawTicketRows,
    aiContextRows: enrichedRows || totalTickets,
    filteredAiContextRows: totalTickets,
    aiCoveragePct: rawTicketRows ? Number((enrichedRows / rawTicketRows).toFixed(4)) : null,
    missingAiContext,
    missingCountry,
    missingCategory,
    missingRequesterType,
    missingSeverity,
    missingCustomerSegment,
    missingChurnRisk,
    completeness: [
      { label: "AI context", value: "ai_context", count: rawTicketRows - missingAiContext, pct: rawTicketRows ? Number(((rawTicketRows - missingAiContext) / rawTicketRows).toFixed(4)) : null },
      { label: "Country", value: "country", count: rawTicketRows - missingCountry, pct: rawTicketRows ? Number(((rawTicketRows - missingCountry) / rawTicketRows).toFixed(4)) : null },
      { label: "Category", value: "category", count: rawTicketRows - missingCategory, pct: rawTicketRows ? Number(((rawTicketRows - missingCategory) / rawTicketRows).toFixed(4)) : null },
      { label: "Requester type", value: "requester_type", count: rawTicketRows - missingRequesterType, pct: rawTicketRows ? Number(((rawTicketRows - missingRequesterType) / rawTicketRows).toFixed(4)) : null },
      { label: "Severity", value: "severity", count: rawTicketRows - missingSeverity, pct: rawTicketRows ? Number(((rawTicketRows - missingSeverity) / rawTicketRows).toFixed(4)) : null },
      { label: "Customer segment", value: "customer_segment", count: rawTicketRows - missingCustomerSegment, pct: rawTicketRows ? Number(((rawTicketRows - missingCustomerSegment) / rawTicketRows).toFixed(4)) : null },
      { label: "Churn risk", value: "churn_risk", count: rawTicketRows - missingChurnRisk, pct: rawTicketRows ? Number(((rawTicketRows - missingChurnRisk) / rawTicketRows).toFixed(4)) : null },
    ],
    byMonth: rows
      .map((row) => ({
        month: pickText(row.month_start).slice(0, 7),
        rawTicketRows: getCount(row as Record<string, unknown>, "raw_ticket_count"),
        aiContextRows: getCount(row as Record<string, unknown>, "enriched_ticket_count"),
        missingCountry: getCount(row as Record<string, unknown>, "missing_country_count"),
        missingCategory: getCount(row as Record<string, unknown>, "missing_category_count"),
        missingSeverity: getCount(row as Record<string, unknown>, "missing_severity_count"),
      }))
      .filter((row) => row.month)
      .sort((left, right) => left.month.localeCompare(right.month)),
    notes: [
      "The support dashboard reads historical summary data from monthly Supabase aggregate read models.",
      "Only the insight cards use a small row-level sample from the sanitized support read model.",
      "Company names and requester details are not exposed in this response.",
      "Raw ticket descriptions and comments are excluded from this response.",
    ],
  };
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const url = new URL(req.url);
    const filters = {
      severity: pickText(url.searchParams.get("severity")),
      category: pickText(url.searchParams.get("category")),
      requesterType: pickText(url.searchParams.get("requesterType")),
      country: pickText(url.searchParams.get("country")),
      department: pickText(url.searchParams.get("department")),
    };
    const fallbackWindow = getCurrentMonthWindow();
    const startDate = toIsoDate(url.searchParams.get("startDate"));
    const endDateInput = toIsoDate(url.searchParams.get("endDate"));
    const endDate = endDateInput ? addDays(endDateInput, 1) : "";
    const monthStart = startDate ? getMonthStart(startDate) : "";
    const monthEnd = endDateInput ? getNextMonthStart(endDateInput) : "";
    const insightLimit = Math.max(1, Math.min(20, toNumber(url.searchParams.get("insightLimit"), 8)));
    const maxRowsParam = url.searchParams.get("maxRows");
    const maxRows = maxRowsParam
      ? Math.max(500, Math.min(DEFAULT_MAX_ROWS, toNumber(maxRowsParam, DEFAULT_MAX_ROWS)))
      : DEFAULT_MAX_ROWS;

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Supabase environment is not configured." }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const rollupRows = await fetchAllRows<SupportMonthlyRollup>(
      supabase,
      "dashboard_support_monthly_rollups",
      SUPPORT_MONTHLY_ROLLUP_SELECT,
      "month_start",
      {
        maxRows,
        startDate: monthStart,
        endDate: monthEnd,
        dateMode: "date",
        filters: getRollupFilterColumns(filters),
      },
    );
    const companyRows = await fetchAllRows<SupportCompanyRollup>(
      supabase,
      "dashboard_support_company_monthly_rollups",
      SUPPORT_COMPANY_ROLLUP_SELECT,
      "month_start",
      {
        maxRows,
        startDate: monthStart,
        endDate: monthEnd,
        dateMode: "date",
        filters: getSharedRollupFilterColumns(filters),
      },
    );
    const tagRows = await fetchAllRows<SupportTagRollup>(
      supabase,
      "dashboard_support_tag_monthly_rollups",
      SUPPORT_TAG_ROLLUP_SELECT,
      "month_start",
      {
        maxRows,
        startDate: monthStart,
        endDate: monthEnd,
        dateMode: "date",
        filters: getSharedRollupFilterColumns(filters),
      },
    );
    const segmentRows = await fetchAllRows<SupportSegmentRollup>(
      supabase,
      "dashboard_support_segment_monthly_rollups",
      SUPPORT_SEGMENT_ROLLUP_SELECT,
      "month_start",
      {
        maxRows,
        startDate: monthStart,
        endDate: monthEnd,
        dateMode: "date",
        filters: getSharedRollupFilterColumns(filters),
      },
    );
    const queueRows = await fetchAllRows<SupportQueueRollup>(
      supabase,
      "dashboard_support_queue_rollups",
      SUPPORT_QUEUE_ROLLUP_SELECT,
      "age_bucket",
      {
        maxRows,
        filters: getRollupFilterColumns(filters),
      },
    );
    const dataQualityRows = await fetchAllRows<SupportDataQualityRollup>(
      supabase,
      "dashboard_support_data_quality_monthly_rollups",
      SUPPORT_DATA_QUALITY_SELECT,
      "month_start",
      {
        maxRows,
        startDate: monthStart,
        endDate: monthEnd,
        dateMode: "date",
      },
    );
    const insightBaseRows = await fetchAllRows<SupportRow>(
      supabase,
      "dashboard_support_ticket_rows",
      SUPPORT_READ_MODEL_SELECT,
      "ticket_created_at",
      {
        maxRows: 1000,
        startDate: startDate || "",
        endDate: endDate || "",
        filters: getRowFilterColumns(filters),
      },
    );
    const insightRows = filterRows(insightBaseRows, filters);
    const { windowStart, windowEnd } = getRollupWindow(rollupRows);

    const totalTickets = sumRollups(rollupRows, "ticket_count");
    const openOrPendingTickets = sumRollups(rollupRows, "open_or_pending_count");
    const l4Tickets = sumRollups(rollupRows, "l4_count");
    const badSatisfactionTickets = sumRollups(rollupRows, "bad_satisfaction_count");
    const requiresInternalHandoff = sumRollups(rollupRows, "requires_internal_handoff_count");
    const requiresClientInstruction = sumRollups(rollupRows, "requires_client_instruction_count");
    const defaultWindowLabel = startDate || endDateInput
      ? `${startDate || fallbackWindow.startDate}_to_${endDateInput || addDays(fallbackWindow.endDate, -1)}`
      : "all_available_history";
    const dataQuality = buildDataQuality(dataQualityRows, totalTickets);

    return jsonResponse({
      summary: {
        windowStart,
        windowEnd,
        totalTickets,
        openOrPendingTickets,
        l4Tickets,
        badSatisfactionTickets,
        badSatisfactionPct: totalTickets ? Number((badSatisfactionTickets / totalTickets).toFixed(4)) : 0,
        requiresInternalHandoff,
        requiresClientInstruction,
      },
      trend: buildRollupTrend(rollupRows),
      distributions: {
        statuses: countRollupsBy(rollupRows, (row) => pickText(row.status), 10),
        severities: countRollupsBy(rollupRows, (row) => pickText(row.severity), 10),
        categories: countRollupsBy(rollupRows, (row) => pickText(row.category), 12),
        subcategories: countRollupsBy(rollupRows, (row) => pickText(row.subcategory), 12),
        departments: countRollupsBy(rollupRows, (row) => pickText(row.department), 12),
        requesterTypes: countRollupsBy(rollupRows, (row) => pickText(row.requester_type), 10),
        channels: countRollupsBy(rollupRows, (row) => pickText(row.channel), 8),
        countries: countRollupsBy(rollupRows, (row) => pickText(row.country), 15),
        processFlags: buildRollupProcessFlags(rollupRows),
      },
      queues: buildQueue(queueRows),
      heatmaps: {
        categorySeverity: buildCategorySeverityHeatmap(rollupRows),
        countryCategory: buildCountryCategoryHeatmap(rollupRows),
        monthCategory: buildMonthCategoryMatrix(rollupRows),
      },
      departments: buildDepartmentBurden(rollupRows),
      segments: buildSegments(segmentRows),
      tags: buildTags(tagRows),
      hotspots: {
        companies: buildRollupCompanyHotspots(companyRows),
      },
      insights: buildInsights(insightRows, insightLimit),
      dataQuality,
      metadata: {
        generatedAt: new Date().toISOString(),
        defaultWindow: defaultWindowLabel,
        sourceTables: [
          "dashboard_support_monthly_rollups",
          "dashboard_support_company_monthly_rollups",
          "dashboard_support_tag_monthly_rollups",
          "dashboard_support_segment_monthly_rollups",
          "dashboard_support_queue_rollups",
          "dashboard_support_data_quality_monthly_rollups",
          "dashboard_support_ticket_rows",
        ],
        rowLimit: maxRows,
        activeFilters: filters,
        availableFilters: {
          severities: countRollupsBy(rollupRows, (row) => pickText(row.severity), 20),
          categories: countRollupsBy(rollupRows, (row) => pickText(row.category), 20),
          departments: countRollupsBy(rollupRows, (row) => pickText(row.department), 20),
          requesterTypes: countRollupsBy(rollupRows, (row) => pickText(row.requester_type), 20),
          countries: countRollupsBy(rollupRows, (row) => pickText(row.country), 30),
        },
      },
    });
  } catch (error) {
    console.error("Failed to load support tickets", error);
    return jsonResponse({ error: "Failed to load support tickets" }, 500);
  }
});
