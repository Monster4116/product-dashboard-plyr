import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAGE_SIZE = 1000;

const CATEGORY_LABELS: Record<string, string> = {
  industry_regulatory: "Industry / Regulatory",
  competitor_moves: "Competitor Moves",
  competitor_funding: "Competitor Funding",
  competitor_reviews: "Competitor Reviews",
  ai_model_releases: "AI Model Releases",
  ai_tools_hr: "AI Tools for HR",
  pm_tooling: "PM Tooling",
  market_intelligence: "Market Intelligence",
};

const pickText = (...values: unknown[]) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
};

const getSourceDomain = (value: string) => {
  if (!value) return "";

  try {
    const url = new URL(value);
    return url.hostname.replace(/^www\./, "");
  } catch (_) {
    return "";
  }
};

async function fetchAllRows(supabase: ReturnType<typeof createClient>) {
  const allRows: Record<string, unknown>[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("product_news")
      .select([
        "id",
        "category",
        "title",
        "summary",
        "source_url",
        "date",
        "item_date",
        "researched_at",
        "run_type",
        "company",
        "region",
        "implication_for_playroll",
        "tag",
        "event_type",
        "amount",
        "stage",
        "investors",
        "market_signal",
        "sentiment",
        "theme",
        "opportunity_for_playroll",
        "model",
        "playroll_relevance",
        "tool",
        "maker",
        "playroll_angle",
        "publisher",
        "relevance",
        "description",
        "created_at",
      ].join(","))
      .order("item_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const rows = await fetchAllRows(supabase);

    const items = rows.map((row) => {
      const category = pickText(row.category);
      const sourceUrl = pickText(row.source_url);
      const actor = pickText(row.company, row.maker, row.publisher);
      const actorType = row.company ? "company" : row.maker ? "maker" : row.publisher ? "publisher" : "";

      return {
        id: pickText(row.id),
        category,
        categoryLabel: CATEGORY_LABELS[category] ?? "General",
        headline: pickText(row.title, row.tool, row.model, row.company, row.publisher, "Untitled"),
        actor,
        actorType,
        summary: pickText(row.summary, row.description),
        insight: pickText(
          row.implication_for_playroll,
          row.playroll_relevance,
          row.market_signal,
          row.opportunity_for_playroll,
          row.playroll_angle,
          row.relevance,
        ),
        sourceUrl,
        sourceDomain: getSourceDomain(sourceUrl),
        dateText: pickText(row.date, row.item_date),
        itemDate: pickText(row.item_date, row.researched_at),
        researchedAt: pickText(row.researched_at),
        runType: pickText(row.run_type, "daily"),
        tag: pickText(row.tag),
        region: pickText(row.region),
        eventType: pickText(row.event_type),
        amount: pickText(row.amount),
        stage: pickText(row.stage),
        investors: pickText(row.investors),
        sentiment: pickText(row.sentiment),
        theme: pickText(row.theme),
        descriptor: pickText(row.tool, row.model, row.event_type, row.tag, row.theme, row.region),
      };
    });

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_err) {
    return new Response(JSON.stringify({ error: "Failed to load product news" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
