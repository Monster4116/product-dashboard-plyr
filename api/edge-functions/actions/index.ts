import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ActionMode = "dry_run" | "live";

type ActionDefinition = {
  id: string;
  name: string;
  description: string;
  category: string;
  impact: "safe" | "internal" | "integration";
  defaultMode: ActionMode;
  allowLiveRun: boolean;
  liveEnabled: boolean;
  buttonLabel: string;
};

const PAGE_SIZE = 1000;
const testWebhookUrl = Deno.env.get("ACTIONS_TEST_WEBHOOK_URL") ?? "";
const testWebhookBearerToken = Deno.env.get("ACTIONS_TEST_WEBHOOK_BEARER_TOKEN") ?? "";

function buildActionCatalog(): ActionDefinition[] {
  return [
    {
      id: "run_diagnostics",
      name: "Run diagnostics",
      description: "Check that the dashboard datasets and action runner can reach the current backend safely.",
      category: "Diagnostics",
      impact: "safe",
      defaultMode: "dry_run",
      allowLiveRun: false,
      liveEnabled: false,
      buttonLabel: "Run diagnostics",
    },
    {
      id: "recalculate_company_health",
      name: "Recalculate company health",
      description: "Run the current company health summary calculation without writing back to the database.",
      category: "Calculations",
      impact: "internal",
      defaultMode: "dry_run",
      allowLiveRun: false,
      liveEnabled: false,
      buttonLabel: "Preview calculation",
    },
    {
      id: "send_test_webhook",
      name: "Send test webhook",
      description: "Preview or send a test payload to the server-side allowlisted webhook target.",
      category: "Webhooks",
      impact: "integration",
      defaultMode: "dry_run",
      allowLiveRun: true,
      liveEnabled: Boolean(testWebhookUrl),
      buttonLabel: "Preview webhook",
    },
  ];
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeMode(value: unknown): ActionMode {
  return value === "live" ? "live" : "dry_run";
}

async function fetchRowCount(supabase: ReturnType<typeof createClient>, table: string) {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

async function fetchAllCompanyHealthRows(supabase: ReturnType<typeof createClient>) {
  const allRows: Record<string, unknown>[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("company_health_score")
      .select("CO_ID, SCORE, RAG, METRIC_COUNT_ENABLED, METRIC_COUNT_SUCCESS, LAST_UPDATED")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    const page = data ?? [];
    allRows.push(...page);
    hasMore = page.length === PAGE_SIZE;
    from += PAGE_SIZE;
  }

  return allRows;
}

async function runDiagnostics(supabase: ReturnType<typeof createClient>, mode: ActionMode) {
  const [financeCount, companyHealthCount] = await Promise.all([
    fetchRowCount(supabase, "finance_adjustments_data"),
    fetchRowCount(supabase, "company_health_score"),
  ]);

  return {
    ok: true,
    actionId: "run_diagnostics",
    status: "success",
    mode,
    ranAt: new Date().toISOString(),
    message: "Diagnostics completed successfully.",
    result: {
      financeAdjustmentsRows: financeCount,
      companyHealthRows: companyHealthCount,
      webhookConfigured: Boolean(testWebhookUrl),
      serviceRoleAvailable: Boolean(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")),
    },
  };
}

async function recalculateCompanyHealth(supabase: ReturnType<typeof createClient>, mode: ActionMode) {
  const rows = await fetchAllCompanyHealthRows(supabase);

  const summary = rows.reduce((accumulator, row) => {
    const score = Number(row.SCORE) || 0;
    const enabled = Number(row.METRIC_COUNT_ENABLED) || 0;
    const success = Number(row.METRIC_COUNT_SUCCESS) || 0;
    const rag = String(row.RAG ?? "Unknown");

    accumulator.total += 1;
    accumulator.scoreTotal += score;
    accumulator.metricEnabledTotal += enabled;
    accumulator.metricSuccessTotal += success;
    accumulator.ragCounts[rag] = (accumulator.ragCounts[rag] || 0) + 1;

    const lastUpdated = String(row.LAST_UPDATED ?? "");
    if (lastUpdated && (!accumulator.latestUpdated || lastUpdated > accumulator.latestUpdated)) {
      accumulator.latestUpdated = lastUpdated;
    }

    return accumulator;
  }, {
    total: 0,
    scoreTotal: 0,
    metricEnabledTotal: 0,
    metricSuccessTotal: 0,
    ragCounts: {} as Record<string, number>,
    latestUpdated: "",
  });

  return {
    ok: true,
    actionId: "recalculate_company_health",
    status: "success",
    mode,
    ranAt: new Date().toISOString(),
    message: mode === "live"
      ? "Company health calculation completed. This action is currently preview-only and does not write back to the database."
      : "Company health calculation preview completed.",
    result: {
      companiesScored: summary.total,
      averageScore: summary.total ? Number((summary.scoreTotal / summary.total).toFixed(1)) : 0,
      metricCoveragePct: summary.metricEnabledTotal > 0
        ? Number((summary.metricSuccessTotal / summary.metricEnabledTotal).toFixed(3))
        : null,
      ragCounts: summary.ragCounts,
      latestUpdated: summary.latestUpdated || null,
      writesPerformed: false,
    },
  };
}

async function sendTestWebhook(mode: ActionMode, input: Record<string, unknown>) {
  const payload = {
    source: "product-one-actions",
    actionId: "send_test_webhook",
    mode,
    triggeredAt: new Date().toISOString(),
    input,
  };

  if (mode !== "live") {
    return {
      ok: true,
      actionId: "send_test_webhook",
      status: "success",
      mode,
      ranAt: new Date().toISOString(),
      message: "Webhook preview generated. No outbound request was sent.",
      result: {
        webhookConfigured: Boolean(testWebhookUrl),
        payloadPreview: payload,
      },
    };
  }

  if (!testWebhookUrl) {
    return {
      ok: false,
      actionId: "send_test_webhook",
      status: "failed",
      mode,
      ranAt: new Date().toISOString(),
      message: "Live webhook sending is not configured yet.",
      result: {
        webhookConfigured: false,
      },
    };
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (testWebhookBearerToken) {
    headers.Authorization = `Bearer ${testWebhookBearerToken}`;
  }

  const response = await fetch(testWebhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();

  return {
    ok: response.ok,
    actionId: "send_test_webhook",
    status: response.ok ? "success" : "failed",
    mode,
    ranAt: new Date().toISOString(),
    message: response.ok ? "Test webhook sent successfully." : "Webhook target returned a non-success response.",
    result: {
      webhookConfigured: true,
      responseStatus: response.status,
      responsePreview: responseText.slice(0, 280),
    },
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // This function matches the current static dashboard pattern where
  // the browser calls a public Edge Function and secrets stay server-side.
  if (req.method === "GET") {
    return jsonResponse({ items: buildActionCatalog() });
  }

  if (req.method !== "POST") {
    return jsonResponse({ message: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json();
    const actionId = String(body?.actionId ?? "");
    const mode = normalizeMode(body?.mode);
    const input = body?.input && typeof body.input === "object" ? body.input as Record<string, unknown> : {};

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    switch (actionId) {
      case "run_diagnostics":
        return jsonResponse(await runDiagnostics(supabase, mode));
      case "recalculate_company_health":
        return jsonResponse(await recalculateCompanyHealth(supabase, mode));
      case "send_test_webhook":
        return jsonResponse(await sendTestWebhook(mode, input));
      default:
        return jsonResponse({
          ok: false,
          actionId,
          status: "failed",
          mode,
          ranAt: new Date().toISOString(),
          message: "Unsupported action requested.",
          result: {},
        }, 400);
    }
  } catch (_error) {
    return jsonResponse({ message: "Failed to run action" }, 500);
  }
});
