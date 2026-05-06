import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAGE_SIZE = 1000;
const SEGMENT_ORDER = ["Total", "Employee", "Client"];

type MonthlyRow = {
  month: string;
  segment: string;
  collectionVersion: string;
  promoters: number;
  passives: number;
  detractors: number;
  totalResponses: number;
  promoterPct: number | null;
  passivePct: number | null;
  detractorPct: number | null;
  npsScore: number;
  calculatedAt: string;
  updatedAt: string;
};

type ResponseRow = {
  responseId: string;
  responseMonth: string;
  responseDate: string;
  respondentName: string;
  respondentType: string;
  npsScore: number;
  npsGroup: string;
  sheetNpsGrouping: string;
  groupingMismatch: boolean;
  initialReasonProvided: string;
  classification: string;
  subClassification: string;
  relevantDepartment: string;
  clientName: string;
  countryOfEmployment: string;
  collectionVersion: string;
  isValidForNps: boolean;
  submittedAt: string;
};

const pickText = (...values: unknown[]) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: unknown) => Boolean(value);

const normalizeCollectionVersion = (value: string | null) => {
  const text = pickText(value).toLowerCase();
  return text || "all";
};

const normalizeSegment = (value: string | null) => {
  const text = pickText(value);
  return SEGMENT_ORDER.includes(text) ? text : "Total";
};

const normalizeRespondentType = (value: string | null) => {
  const text = pickText(value);
  if (/^employee$/i.test(text)) return "Employee";
  if (/^(client|employer)$/i.test(text)) return "Client";
  return text || "Unknown";
};

const matchesCollectionVersion = (rowCollectionVersion: string, selectedCollectionVersion: string) =>
  selectedCollectionVersion === "all" ? true : normalizeCollectionVersion(rowCollectionVersion) === selectedCollectionVersion;

const matchesSegment = (respondentType: string, selectedSegment: string) => {
  if (selectedSegment === "Total") return true;
  if (selectedSegment === "Employee") return respondentType === "Employee";
  if (selectedSegment === "Client") return respondentType === "Client";
  return true;
};

const compareMonthsDesc = (left: string, right: string) => right.localeCompare(left);

async function fetchAllMonthlyRows(supabase: ReturnType<typeof createClient>) {
  const allRows: Record<string, unknown>[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("nps_monthly_results")
      .select([
        "month",
        "segment",
        "collection_version",
        "promoters",
        "passives",
        "detractors",
        "total_responses",
        "promoter_pct",
        "passive_pct",
        "detractor_pct",
        "nps_score",
        "calculated_at",
        "updated_at",
      ].join(","))
      .order("month", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    const page = data ?? [];
    allRows.push(...page);
    hasMore = page.length === PAGE_SIZE;
    from += PAGE_SIZE;
  }

  return allRows.map((row): MonthlyRow => ({
    month: pickText(row.month),
    segment: normalizeSegment(row.segment as string | null),
    collectionVersion: normalizeCollectionVersion(row.collection_version as string | null),
    promoters: toNumber(row.promoters),
    passives: toNumber(row.passives),
    detractors: toNumber(row.detractors),
    totalResponses: toNumber(row.total_responses),
    promoterPct: row.promoter_pct == null ? null : toNumber(row.promoter_pct),
    passivePct: row.passive_pct == null ? null : toNumber(row.passive_pct),
    detractorPct: row.detractor_pct == null ? null : toNumber(row.detractor_pct),
    npsScore: toNumber(row.nps_score),
    calculatedAt: pickText(row.calculated_at),
    updatedAt: pickText(row.updated_at),
  }));
}

async function fetchAllResponseRows(supabase: ReturnType<typeof createClient>) {
  const allRows: Record<string, unknown>[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("nps_responses")
      .select([
        "response_id",
        "response_month",
        "response_date",
        "respondent_name",
        "respondent_type",
        "nps_score",
        "nps_group",
        "sheet_nps_grouping",
        "grouping_mismatch",
        "initial_reason_provided",
        "classification",
        "sub_classification",
        "relevant_department",
        "client_name",
        "country_of_employment",
        "collection_version",
        "is_valid_for_nps",
        "submitted_at",
      ].join(","))
      .order("response_date", { ascending: false, nullsFirst: false })
      .order("submitted_at", { ascending: false, nullsFirst: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    const page = data ?? [];
    allRows.push(...page);
    hasMore = page.length === PAGE_SIZE;
    from += PAGE_SIZE;
  }

  return allRows.map((row): ResponseRow => ({
    responseId: pickText(row.response_id),
    responseMonth: pickText(row.response_month),
    responseDate: pickText(row.response_date),
    respondentName: pickText(row.respondent_name),
    respondentType: normalizeRespondentType(row.respondent_type as string | null),
    npsScore: toNumber(row.nps_score),
    npsGroup: pickText(row.nps_group, "Unknown"),
    sheetNpsGrouping: pickText(row.sheet_nps_grouping),
    groupingMismatch: toBoolean(row.grouping_mismatch),
    initialReasonProvided: pickText(row.initial_reason_provided),
    classification: pickText(row.classification),
    subClassification: pickText(row.sub_classification),
    relevantDepartment: pickText(row.relevant_department),
    clientName: pickText(row.client_name),
    countryOfEmployment: pickText(row.country_of_employment),
    collectionVersion: normalizeCollectionVersion(row.collection_version as string | null),
    isValidForNps: toBoolean(row.is_valid_for_nps),
    submittedAt: pickText(row.submitted_at),
  }));
}

function getHeadlineRows(monthlyRows: MonthlyRow[], selectedCollectionVersion: string, selectedSegment: string) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const rows = monthlyRows
    .filter((row) =>
      row.segment === selectedSegment &&
      row.collectionVersion === selectedCollectionVersion,
    )
    .sort((left, right) => compareMonthsDesc(left.month, right.month));

  if (!rows.length) {
    return {
      headlineRow: null,
      comparisonRow: null,
      partialMonthObserved: false,
      latestObservedMonth: "",
    };
  }

  const latestRow = rows[0];
  const comparisonRow = rows[1] ?? null;
  const partialMonthObserved = Boolean(
    latestRow.month === currentMonth &&
    comparisonRow &&
    latestRow.totalResponses < Math.max(5, comparisonRow.totalResponses * 0.6),
  );
  const headlineRow = partialMonthObserved && comparisonRow ? comparisonRow : latestRow;
  const previousRow = partialMonthObserved ? rows[2] ?? null : comparisonRow;

  return {
    headlineRow,
    comparisonRow: previousRow,
    partialMonthObserved,
    latestObservedMonth: partialMonthObserved ? latestRow.month : "",
  };
}

function buildDistribution(responseRows: ResponseRow[]) {
  const respondentTypeMap = new Map<string, {
    respondentType: string;
    responses: number;
    scoreTotal: number;
    promoters: number;
    passives: number;
    detractors: number;
  }>();

  const departmentMap = new Map<string, {
    department: string;
    responses: number;
    scoreTotal: number;
  }>();

  responseRows
    .filter((row) => row.isValidForNps)
    .forEach((row) => {
      const respondentType = row.respondentType || "Unknown";
      const respondentBucket = respondentTypeMap.get(respondentType) ?? {
        respondentType,
        responses: 0,
        scoreTotal: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
      };

      respondentBucket.responses += 1;
      respondentBucket.scoreTotal += row.npsScore;
      if (row.npsGroup === "Promoter") respondentBucket.promoters += 1;
      if (row.npsGroup === "Passive") respondentBucket.passives += 1;
      if (row.npsGroup === "Detractor") respondentBucket.detractors += 1;
      respondentTypeMap.set(respondentType, respondentBucket);

      const department = row.relevantDepartment;
      if (!department) return;

      const departmentBucket = departmentMap.get(department) ?? {
        department,
        responses: 0,
        scoreTotal: 0,
      };

      departmentBucket.responses += 1;
      departmentBucket.scoreTotal += row.npsScore;
      departmentMap.set(department, departmentBucket);
    });

  const respondentTypes = [...respondentTypeMap.values()]
    .sort((left, right) => right.responses - left.responses)
    .map((item) => ({
      respondentType: item.respondentType,
      responses: item.responses,
      avgScore: item.responses ? Number((item.scoreTotal / item.responses).toFixed(2)) : 0,
      promoters: item.promoters,
      passives: item.passives,
      detractors: item.detractors,
    }));

  const departmentSignals = [...departmentMap.values()]
    .filter((item) => item.responses >= 3)
    .sort((left, right) => {
      const avgDiff = (left.scoreTotal / left.responses) - (right.scoreTotal / right.responses);
      if (avgDiff !== 0) return avgDiff;
      return right.responses - left.responses;
    })
    .slice(0, 6)
    .map((item) => ({
      department: item.department,
      responses: item.responses,
      avgScore: Number((item.scoreTotal / item.responses).toFixed(2)),
    }));

  return { respondentTypes, departmentSignals };
}

function buildDataQuality(responseRows: ResponseRow[]) {
  return responseRows.reduce((accumulator, row) => {
    accumulator.totalResponses += 1;
    if (row.initialReasonProvided) accumulator.rowsWithReason += 1;
    if (row.classification) accumulator.rowsWithClassification += 1;
    if (row.subClassification) accumulator.rowsWithSubClassification += 1;
    if (row.clientName) accumulator.rowsWithClientName += 1;
    if (row.countryOfEmployment) accumulator.rowsWithCountry += 1;
    return accumulator;
  }, {
    totalResponses: 0,
    rowsWithReason: 0,
    rowsWithClassification: 0,
    rowsWithSubClassification: 0,
    rowsWithClientName: 0,
    rowsWithCountry: 0,
  });
}

function buildResponseMonths(responseRows: ResponseRow[]) {
  return [...new Set(responseRows.map((row) => row.responseMonth).filter(Boolean))]
    .sort(compareMonthsDesc);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const selectedCollectionVersion = normalizeCollectionVersion(url.searchParams.get("collectionVersion"));
    const selectedSegment = normalizeSegment(url.searchParams.get("segment"));
    const responseLimit = Math.max(1, Math.min(250, toNumber(url.searchParams.get("limit"), 100)));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const [monthlyRows, responseRows] = await Promise.all([
      fetchAllMonthlyRows(supabase),
      fetchAllResponseRows(supabase),
    ]);

    const availableCollectionVersions = [...new Set(
      ["all", ...monthlyRows.map((row) => row.collectionVersion), ...responseRows.map((row) => row.collectionVersion)],
    )].filter(Boolean);

    const supportedCollectionVersion = availableCollectionVersions.includes(selectedCollectionVersion)
      ? selectedCollectionVersion
      : "all";

    const filteredMonthlyRows = monthlyRows.filter((row) => row.collectionVersion === supportedCollectionVersion);
    const filteredResponseRows = responseRows.filter((row) => matchesCollectionVersion(row.collectionVersion, supportedCollectionVersion));
    const validResponseRows = filteredResponseRows.filter((row) => row.isValidForNps);
    const segmentResponseRows = filteredResponseRows.filter((row) => matchesSegment(row.respondentType, selectedSegment));

    const { headlineRow, comparisonRow, partialMonthObserved, latestObservedMonth } = getHeadlineRows(
      monthlyRows,
      supportedCollectionVersion,
      selectedSegment,
    );

    const summary = headlineRow
      ? {
          headlineMonth: headlineRow.month,
          collectionVersion: supportedCollectionVersion,
          segment: selectedSegment,
          npsScore: headlineRow.npsScore,
          previousMonthNpsScore: comparisonRow ? comparisonRow.npsScore : null,
          monthOverMonthDelta: comparisonRow ? Number((headlineRow.npsScore - comparisonRow.npsScore).toFixed(2)) : null,
          totalResponses: headlineRow.totalResponses,
          promoters: headlineRow.promoters,
          passives: headlineRow.passives,
          detractors: headlineRow.detractors,
          promoterPct: headlineRow.promoterPct,
          passivePct: headlineRow.passivePct,
          detractorPct: headlineRow.detractorPct,
          calculatedAt: pickText(headlineRow.calculatedAt, headlineRow.updatedAt),
        }
      : {
          headlineMonth: "",
          collectionVersion: supportedCollectionVersion,
          segment: selectedSegment,
          npsScore: 0,
          previousMonthNpsScore: null,
          monthOverMonthDelta: null,
          totalResponses: 0,
          promoters: 0,
          passives: 0,
          detractors: 0,
          promoterPct: null,
          passivePct: null,
          detractorPct: null,
          calculatedAt: "",
        };

    const trend = filteredMonthlyRows
      .filter((row) => row.segment === selectedSegment)
      .sort((left, right) => left.month.localeCompare(right.month))
      .map((row) => ({
        month: row.month,
        segment: row.segment,
        collectionVersion: row.collectionVersion,
        npsScore: row.npsScore,
        totalResponses: row.totalResponses,
        promoters: row.promoters,
        passives: row.passives,
        detractors: row.detractors,
      }));

    const summaryMonth = summary.headlineMonth;
    const segments = filteredMonthlyRows
      .filter((row) => row.month === summaryMonth && SEGMENT_ORDER.includes(row.segment))
      .sort((left, right) => SEGMENT_ORDER.indexOf(left.segment) - SEGMENT_ORDER.indexOf(right.segment))
      .map((row) => ({
        segment: row.segment,
        month: row.month,
        npsScore: row.npsScore,
        totalResponses: row.totalResponses,
      }));

    const distribution = buildDistribution(validResponseRows);

    const responseExplorer = segmentResponseRows
      .slice()
      .sort((left, right) => pickText(right.responseDate, right.submittedAt).localeCompare(pickText(left.responseDate, left.submittedAt)))
      .slice(0, responseLimit)
      .map((row) => ({
        responseId: row.responseId,
        responseMonth: row.responseMonth,
        responseDate: row.responseDate,
        respondentType: row.respondentType,
        respondentName: row.respondentName,
        clientName: row.clientName,
        countryOfEmployment: row.countryOfEmployment,
        npsScore: row.npsScore,
        npsGroup: row.npsGroup,
        initialReasonProvided: row.initialReasonProvided,
        relevantDepartment: row.relevantDepartment,
        collectionVersion: row.collectionVersion,
        groupingMismatch: row.groupingMismatch,
        isValidForNps: row.isValidForNps,
      }));

    const dataQuality = buildDataQuality(filteredResponseRows);
    const notes = [
      "Response month is derived from the actual response date.",
      "Results may differ from the legacy Excel workbook because the automation uses stricter date-based reporting.",
    ];

    if (partialMonthObserved && latestObservedMonth) {
      notes.push(`Latest observed month ${latestObservedMonth} appears partial, so the headline view uses the most recent fuller month.`);
    }

    return new Response(JSON.stringify({
      summary,
      trend,
      segments,
      distribution,
      responseExplorer,
      dataQuality,
      metadata: {
        defaultCollectionVersion: "all",
        availableCollectionVersions,
        availableSegments: SEGMENT_ORDER,
        availableResponseMonths: buildResponseMonths(filteredResponseRows),
        notes,
        partialMonthObserved,
        latestObservedMonth,
        generatedAt: new Date().toISOString(),
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_error) {
    return new Response(JSON.stringify({ error: "Failed to load NPS dashboard" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
