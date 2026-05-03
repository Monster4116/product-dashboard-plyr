import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAGE_SIZE = 1000;

async function fetchAllRows(supabase: ReturnType<typeof createClient>) {
  const allRows: Record<string, unknown>[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("company_health_score")
      .select([
        "CO_ID",
        "SCORE_DATE",
        "SCORE",
        "RAG",
        "METRIC_COUNT_ENABLED",
        "METRIC_COUNT_SUCCESS",
        "GROWTH_RAG",
        "GROWTH_STATUS",
        "GROWTH_VALUE",
        "GROWTH_ACTION",
        "GROWTH_DETAIL",
        "GROWTH_PRIORITY",
        "CSM_RAG",
        "CSM_STATUS",
        "CSM_VALUE",
        "CSM_ACTION",
        "CSM_DETAIL",
        "CSM_PRIORITY",
        "NPS_RAG",
        "NPS_STATUS",
        "NPS_VALUE",
        "NPS_ACTION",
        "NPS_DETAIL",
        "NPS_PRIORITY",
        "SUPPORT_RAG",
        "SUPPORT_STATUS",
        "SUPPORT_VALUE",
        "SUPPORT_TICKET_COUNT",
        "SUPPORT_CRITICAL_COUNT",
        "SUPPORT_AVG_SCORE",
        "SUPPORT_AVG_HOURS",
        "SUPPORT_ACTION",
        "SUPPORT_DETAIL",
        "SUPPORT_PRIORITY",
        "LAST_UPDATED",
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
    // These secrets are injected by the Edge Function runtime and stay server-side.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const rows = await fetchAllRows(supabase);

    // Adapter layer: convert DB column names into the stable dashboard contract.
    const items = rows.map((row) => {
      const metricCountEnabled = Number(row.METRIC_COUNT_ENABLED) || 0;
      const metricCountSuccess = Number(row.METRIC_COUNT_SUCCESS) || 0;

      return {
        companyId: row.CO_ID ?? "",
        scoreDate: row.SCORE_DATE ?? "",
        score: Number(row.SCORE) || 0,
        rag: row.RAG ?? "Unknown",
        lastUpdated: row.LAST_UPDATED ?? "",
        metricCountEnabled,
        metricCountSuccess,
        growth: {
          rag: row.GROWTH_RAG ?? "Unknown",
          status: row.GROWTH_STATUS ?? "",
          value: row.GROWTH_VALUE ?? "",
          action: row.GROWTH_ACTION ?? "",
          detail: row.GROWTH_DETAIL ?? "",
          priority: row.GROWTH_PRIORITY ?? "",
        },
        csm: {
          rag: row.CSM_RAG ?? "Unknown",
          status: row.CSM_STATUS ?? "",
          value: row.CSM_VALUE ?? "",
          action: row.CSM_ACTION ?? "",
          detail: row.CSM_DETAIL ?? "",
          priority: row.CSM_PRIORITY ?? "",
        },
        nps: {
          rag: row.NPS_RAG ?? "Unknown",
          status: row.NPS_STATUS ?? "",
          value: row.NPS_VALUE ?? "",
          action: row.NPS_ACTION ?? "",
          detail: row.NPS_DETAIL ?? "",
          priority: row.NPS_PRIORITY ?? "",
        },
        support: {
          rag: row.SUPPORT_RAG ?? "Unknown",
          status: row.SUPPORT_STATUS ?? "",
          value: row.SUPPORT_VALUE ?? "",
          ticketCount: Number(row.SUPPORT_TICKET_COUNT) || 0,
          criticalCount: Number(row.SUPPORT_CRITICAL_COUNT) || 0,
          avgScore: Number(row.SUPPORT_AVG_SCORE) || 0,
          avgHours: Number(row.SUPPORT_AVG_HOURS) || 0,
          action: row.SUPPORT_ACTION ?? "",
          detail: row.SUPPORT_DETAIL ?? "",
          priority: row.SUPPORT_PRIORITY ?? "",
        },
      };
    });

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_err) {
    return new Response(JSON.stringify({ error: "Failed to load company health" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
