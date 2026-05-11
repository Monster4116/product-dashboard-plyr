import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAGE_SIZE = 1000;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toStringValue(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function toTagList(value: unknown) {
  return toStringValue(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function fetchAllFinanceAdjustmentRows(supabase: ReturnType<typeof createClient>) {
  const allRows: Record<string, unknown>[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("finance_adjustments_data")
      .select([
        "MONTH",
        "CO_ID",
        "EE_ID",
        "TERRITORY",
        "PRIMARY_ASPECT",
        "SUB_CAT_CODE",
        "DETAILED_DESCRIPTION",
        "TAGS",
        "ADJUSTMENT_USD",
        "ABS_ADJUSTMENT_USD",
        "CONFIDENCE",
      ].join(","))
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    const page = data ?? [];
    allRows.push(...page);
    hasMore = page.length === PAGE_SIZE;
    from += PAGE_SIZE;
  }

  return allRows;
}

function mapFinanceAdjustmentRow(row: Record<string, unknown>) {
  const adjustmentUsd = toNumber(row.ADJUSTMENT_USD, 0);

  return {
    month: toStringValue(row.MONTH, ""),
    companyId: toStringValue(row.CO_ID, ""),
    employeeId: toStringValue(row.EE_ID, ""),
    territory: toStringValue(row.TERRITORY, "Unknown"),
    primaryAspect: toStringValue(row.PRIMARY_ASPECT, "Unknown"),
    subCategoryCode: toStringValue(row.SUB_CAT_CODE, ""),
    detailedDescription: toStringValue(row.DETAILED_DESCRIPTION, ""),
    tags: toTagList(row.TAGS),
    adjustmentUsd,
    absoluteAdjustmentUsd: toNumber(row.ABS_ADJUSTMENT_USD, Math.abs(adjustmentUsd)),
    confidence: toNumber(row.CONFIDENCE, 0),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return jsonResponse({ message: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ message: "Supabase environment is not configured." }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const rows = await fetchAllFinanceAdjustmentRows(supabase);
    return jsonResponse({ items: rows.map(mapFinanceAdjustmentRow) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load finance adjustments.";
    return jsonResponse({ message }, 500);
  }
});
