import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAGE_SIZE = 1000;
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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type RawTicketRow = {
  ticket_id: string;
  ticket_created_at: string | null;
  ticket_updated_at: string | null;
  status: string | null;
  priority: string | null;
  country: string | null;
  via_channel: string | null;
  satisfaction_score: string | null;
  customer_platform_uuid: string | null;
  existing_top_level_category: string | null;
  existing_subcategory: string | null;
  existing_severity: string | null;
  existing_relevant_department: string | null;
  requestor_type: string | null;
};

type AiContextRow = {
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
  support_tickets_v2?: RawTicketRow | RawTicketRow[] | null;
};

type SupportRow = AiContextRow & {
  raw?: RawTicketRow;
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

const getMonthKey = (value: string | null) => {
  if (!value) return "Unknown";
  return value.slice(0, 7);
};

const getFlag = (row: SupportRow, flag: string) => row.process_flags?.[flag] === true;

const countBy = (rows: SupportRow[], getter: (row: SupportRow) => string, limit = 12) => {
  const map = new Map<string, { label: string; value: string; count: number }>();

  rows.forEach((row) => {
    const rawValue = getter(row);
    const value = normalizeDisplayValue(rawValue);
    const item = map.get(value) ?? { label: labelize(value), value, count: 0 };
    item.count += 1;
    map.set(value, item);
  });

  return [...map.values()]
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, limit)
    .map((item) => ({
      ...item,
      pct: rows.length ? Number((item.count / rows.length).toFixed(4)) : 0,
    }));
};

async function fetchAllRows<T>(
  supabase: ReturnType<typeof createClient>,
  table: string,
  select: string,
  orderColumn: string,
) {
  const allRows: T[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .order(orderColumn, { ascending: false, nullsFirst: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    const page = (data ?? []) as T[];
    allRows.push(...page);
    hasMore = page.length === PAGE_SIZE;
    from += PAGE_SIZE;
  }

  return allRows;
}

const buildTrend = (rows: SupportRow[]) => {
  const monthMap = new Map<string, {
    month: string;
    ticketCount: number;
    openOrPendingTickets: number;
    l4Tickets: number;
    badSatisfactionTickets: number;
  }>();

  rows.forEach((row) => {
    const month = getMonthKey(row.ticket_created_at);
    const status = normalizeDisplayValue(row.raw?.status).toLowerCase();
    const severity = normalizeDisplayValue(row.raw?.existing_severity, row.existing_severity).toLowerCase();
    const satisfaction = normalizeDisplayValue(row.raw?.satisfaction_score).toLowerCase();
    const item = monthMap.get(month) ?? {
      month,
      ticketCount: 0,
      openOrPendingTickets: 0,
      l4Tickets: 0,
      badSatisfactionTickets: 0,
    };

    item.ticketCount += 1;
    if (status === "open" || status === "pending") item.openOrPendingTickets += 1;
    if (severity === "l4") item.l4Tickets += 1;
    if (satisfaction === "bad") item.badSatisfactionTickets += 1;
    monthMap.set(month, item);
  });

  return [...monthMap.values()]
    .filter((item) => item.month !== "Unknown")
    .sort((left, right) => left.month.localeCompare(right.month));
};

const buildProcessFlags = (rows: SupportRow[]) => PROCESS_FLAGS
  .map((flag) => ({
    flag,
    label: labelize(flag),
    count: rows.filter((row) => getFlag(row, flag)).length,
    pct: rows.length ? Number((rows.filter((row) => getFlag(row, flag)).length / rows.length).toFixed(4)) : 0,
  }))
  .sort((left, right) => right.count - left.count);

const buildCompanyHotspots = (rows: SupportRow[]) => {
  const map = new Map<string, {
    companyId: string;
    ticketCount: number;
    l4Tickets: number;
    openOrPendingTickets: number;
    requiresInternalHandoff: number;
  }>();

  rows.forEach((row) => {
    const companyId = normalizeDisplayValue(row.raw?.customer_platform_uuid);
    const item = map.get(companyId) ?? {
      companyId,
      ticketCount: 0,
      l4Tickets: 0,
      openOrPendingTickets: 0,
      requiresInternalHandoff: 0,
    };
    const status = normalizeDisplayValue(row.raw?.status).toLowerCase();
    const severity = normalizeDisplayValue(row.raw?.existing_severity, row.existing_severity).toLowerCase();

    item.ticketCount += 1;
    if (severity === "l4") item.l4Tickets += 1;
    if (status === "open" || status === "pending") item.openOrPendingTickets += 1;
    if (getFlag(row, "requires_internal_handoff")) item.requiresInternalHandoff += 1;
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

const buildInsights = (rows: SupportRow[], limit: number) => rows
  .filter((row) => pickText(row.clean_summary, row.requester_intent))
  .sort((left, right) => {
    const leftScore =
      (normalizeDisplayValue(left.raw?.existing_severity, left.existing_severity).toLowerCase() === "l4" ? 100 : 0) +
      (getFlag(left, "requires_internal_handoff") ? 30 : 0) +
      (getFlag(left, "requires_client_instruction") ? 20 : 0) +
      (getFlag(left, "is_platform_bug") ? 15 : 0) +
      (normalizeDisplayValue(left.raw?.status).toLowerCase() === "open" ? 10 : 0);
    const rightScore =
      (normalizeDisplayValue(right.raw?.existing_severity, right.existing_severity).toLowerCase() === "l4" ? 100 : 0) +
      (getFlag(right, "requires_internal_handoff") ? 30 : 0) +
      (getFlag(right, "requires_client_instruction") ? 20 : 0) +
      (getFlag(right, "is_platform_bug") ? 15 : 0) +
      (normalizeDisplayValue(right.raw?.status).toLowerCase() === "open" ? 10 : 0);

    if (rightScore !== leftScore) return rightScore - leftScore;
    return getDateTime(right.ticket_created_at) - getDateTime(left.ticket_created_at);
  })
  .slice(0, limit)
  .map((row) => ({
    ticketId: pickText(row.source_ticket_id),
    ticketCreatedAt: pickText(row.ticket_created_at),
    companyId: normalizeDisplayValue(row.raw?.customer_platform_uuid),
    country: normalizeDisplayValue(row.raw?.country, row.country),
    category: normalizeDisplayValue(row.raw?.existing_top_level_category, row.existing_top_level_category),
    categoryLabel: labelize(normalizeDisplayValue(row.raw?.existing_top_level_category, row.existing_top_level_category)),
    subcategory: normalizeDisplayValue(row.raw?.existing_subcategory, row.existing_subcategory),
    severity: normalizeDisplayValue(row.raw?.existing_severity, row.existing_severity),
    status: normalizeDisplayValue(row.raw?.status),
    cleanSummary: pickText(row.clean_summary),
    requesterIntent: pickText(row.requester_intent),
    flags: PROCESS_FLAGS.filter((flag) => getFlag(row, flag)),
  }));

const buildAvailableFilters = (rows: SupportRow[]) => ({
  severities: countBy(rows, (row) => pickText(row.raw?.existing_severity, row.existing_severity), 20),
  categories: countBy(rows, (row) => pickText(row.raw?.existing_top_level_category, row.existing_top_level_category), 20),
  requesterTypes: countBy(rows, (row) => pickText(row.raw?.requestor_type, row.requestor_type), 20),
  countries: countBy(rows, (row) => pickText(row.raw?.country, row.country), 30),
});

const filterRows = (
  rows: SupportRow[],
  filters: { severity: string; category: string; requesterType: string; country: string },
) => rows.filter((row) => {
  if (filters.severity && normalizeDisplayValue(row.raw?.existing_severity, row.existing_severity) !== filters.severity) return false;
  if (filters.category && normalizeDisplayValue(row.raw?.existing_top_level_category, row.existing_top_level_category) !== filters.category) return false;
  if (filters.requesterType && normalizeDisplayValue(row.raw?.requestor_type, row.requestor_type) !== filters.requesterType) return false;
  if (filters.country && normalizeDisplayValue(row.raw?.country, row.country) !== filters.country) return false;
  return true;
});

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
    };
    const insightLimit = Math.max(1, Math.min(20, toNumber(url.searchParams.get("insightLimit"), 8)));

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Supabase environment is not configured." }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const [aiRows, rawRows] = await Promise.all([
      fetchAllRows<AiContextRow>(
        supabase,
        "ai_support_ticket_context",
        [
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
        ].join(","),
        "ticket_created_at",
      ),
      fetchAllRows<RawTicketRow>(
        supabase,
        "support_tickets_v2",
        [
          "ticket_id",
          "ticket_created_at",
          "ticket_updated_at",
          "status",
          "priority",
          "country",
          "via_channel",
          "satisfaction_score",
          "customer_platform_uuid",
          "existing_top_level_category",
          "existing_subcategory",
          "existing_severity",
          "existing_relevant_department",
          "requestor_type",
        ].join(","),
        "ticket_created_at",
      ),
    ]);

    const rawRowsByTicketId = new Map(
      rawRows.map((row) => [row.ticket_id, row]),
    );
    const baseRows = aiRows.map((row): SupportRow => ({
      ...row,
      raw: rawRowsByTicketId.get(row.source_ticket_id),
    }));
    const rows = filterRows(baseRows, filters);
    const dates = rows.map((row) => getDateTime(row.ticket_created_at)).filter(Boolean);
    const windowStart = dates.length ? new Date(Math.min(...dates)).toISOString().slice(0, 10) : "";
    const windowEnd = dates.length ? new Date(Math.max(...dates)).toISOString().slice(0, 10) : "";

    const openOrPendingTickets = rows.filter((row) => {
      const status = normalizeDisplayValue(row.raw?.status).toLowerCase();
      return status === "open" || status === "pending";
    }).length;
    const l4Tickets = rows.filter((row) =>
      normalizeDisplayValue(row.raw?.existing_severity, row.existing_severity).toLowerCase() === "l4"
    ).length;
    const badSatisfactionTickets = rows.filter((row) =>
      normalizeDisplayValue(row.raw?.satisfaction_score).toLowerCase() === "bad"
    ).length;
    const requiresInternalHandoff = rows.filter((row) => getFlag(row, "requires_internal_handoff")).length;
    const requiresClientInstruction = rows.filter((row) => getFlag(row, "requires_client_instruction")).length;

    return jsonResponse({
      summary: {
        windowStart,
        windowEnd,
        totalTickets: rows.length,
        openOrPendingTickets,
        l4Tickets,
        badSatisfactionTickets,
        badSatisfactionPct: rows.length ? Number((badSatisfactionTickets / rows.length).toFixed(4)) : 0,
        requiresInternalHandoff,
        requiresClientInstruction,
      },
      trend: buildTrend(rows),
      distributions: {
        statuses: countBy(rows, (row) => pickText(row.raw?.status), 10),
        severities: countBy(rows, (row) => pickText(row.raw?.existing_severity, row.existing_severity), 10),
        categories: countBy(rows, (row) => pickText(row.raw?.existing_top_level_category, row.existing_top_level_category), 12),
        subcategories: countBy(rows, (row) => pickText(row.raw?.existing_subcategory, row.existing_subcategory), 12),
        departments: countBy(rows, (row) => pickText(row.raw?.existing_relevant_department, row.existing_relevant_department), 12),
        requesterTypes: countBy(rows, (row) => pickText(row.raw?.requestor_type, row.requestor_type), 10),
        channels: countBy(rows, (row) => pickText(row.raw?.via_channel), 8),
        countries: countBy(rows, (row) => pickText(row.raw?.country, row.country), 15),
        processFlags: buildProcessFlags(rows),
      },
      hotspots: {
        companies: buildCompanyHotspots(rows),
      },
      insights: buildInsights(rows, insightLimit),
      dataQuality: {
        rawTicketRows: rawRows.length,
        aiContextRows: aiRows.length,
        filteredAiContextRows: rows.length,
        aiCoveragePct: rawRows.length ? Number((aiRows.length / rawRows.length).toFixed(4)) : 0,
        notes: [
          "The support dashboard defaults to the AI-enriched support context window.",
          "Company names are not exposed in v1 because the current support table does not populate them.",
          "Raw ticket descriptions, comments, requester names and requester emails are excluded from this response.",
        ],
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        defaultWindow: "last_6_months",
        sourceTables: ["support_tickets_v2", "ai_support_ticket_context"],
        activeFilters: filters,
        availableFilters: buildAvailableFilters(baseRows),
      },
    });
  } catch (error) {
    console.error("Failed to load support tickets", error);
    return jsonResponse({ error: "Failed to load support tickets" }, 500);
  }
});
