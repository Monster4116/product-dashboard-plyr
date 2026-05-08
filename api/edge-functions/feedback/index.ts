import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type FeedbackType = "issue" | "idea";

type FeedbackInput = {
  type: FeedbackType;
  message: string;
  pageId?: string;
  pageTitle?: string;
  name?: string;
  email?: string;
  url?: string;
};

const issueWebhookUrl = Deno.env.get("ISSUE_WEBHOOK_URL") ?? "";
const ideaWebhookUrl = Deno.env.get("IDEA_WEBHOOK_URL") ?? "";
const feedbackWebhookBearerToken = Deno.env.get("FEEDBACK_WEBHOOK_BEARER_TOKEN") ?? "";
const webhookTimeoutMs = 15000;
const allowedOrigins = (Deno.env.get("FEEDBACK_ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map(value => value.trim())
  .filter(Boolean);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function isValidFeedbackType(value: unknown): value is FeedbackType {
  return value === "issue" || value === "idea";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateOrigin(req: Request) {
  if (!allowedOrigins.length) return null;

  const origin = req.headers.get("origin")?.trim() ?? "";
  if (origin && allowedOrigins.includes(origin)) return null;

  return jsonResponse({
    ok: false,
    message: "Origin not allowed.",
  }, 403);
}

function normalizeInput(body: unknown): FeedbackInput {
  const input = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const type = input.type;
  const message = typeof input.message === "string" ? input.message.trim() : "";
  const pageId = typeof input.pageId === "string" ? input.pageId.trim() : "";
  const pageTitle = typeof input.pageTitle === "string" ? input.pageTitle.trim() : "";
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const url = typeof input.url === "string" ? input.url.trim() : "";

  if (!isValidFeedbackType(type)) {
    throw new Error("Feedback type must be either issue or idea.");
  }

  if (!message || message.length < 8) {
    throw new Error("Message must be at least 8 characters long.");
  }

  if (message.length > 5000) {
    throw new Error("Message is too long.");
  }

  if (email && !isValidEmail(email)) {
    throw new Error("Email address is invalid.");
  }

  return {
    type,
    message,
    pageId: pageId || undefined,
    pageTitle: pageTitle || undefined,
    name: name || undefined,
    email: email || undefined,
    url: url || undefined,
  };
}

function getWebhookUrl(type: FeedbackType) {
  return type === "issue" ? issueWebhookUrl : ideaWebhookUrl;
}

function buildOutboundPayload(input: FeedbackInput, req: Request) {
  return {
    source: "product-one-dashboard",
    type: input.type,
    message: input.message,
    pageId: input.pageId ?? null,
    pageTitle: input.pageTitle ?? null,
    name: input.name ?? null,
    email: input.email ?? null,
    url: input.url ?? null,
    createdAt: new Date().toISOString(),
    requestContext: {
      origin: req.headers.get("origin"),
      referer: req.headers.get("referer"),
      userAgent: req.headers.get("user-agent"),
    },
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, message: "Method not allowed." }, 405);
  }

  const blockedOriginResponse = validateOrigin(req);
  if (blockedOriginResponse) {
    return blockedOriginResponse;
  }

  try {
    const input = normalizeInput(await req.json());
    const webhookUrl = getWebhookUrl(input.type);

    if (!webhookUrl) {
      return jsonResponse({
        ok: false,
        message: `No ${input.type} webhook is configured.`,
      }, 503);
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (feedbackWebhookBearerToken) {
      headers.Authorization = `Bearer ${feedbackWebhookBearerToken}`;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(buildOutboundPayload(input, req)),
      signal: AbortSignal.timeout(webhookTimeoutMs),
    });

    if (!response.ok) {
      const responseText = await response.text().catch(() => "");
      return jsonResponse({
        ok: false,
        message: "Feedback webhook returned a non-success response.",
        result: {
          type: input.type,
          responseStatus: response.status,
          responsePreview: responseText.slice(0, 280),
        },
      }, 502);
    }

    return jsonResponse({
      ok: true,
      message: input.type === "issue"
        ? "Issue submitted successfully."
        : "Idea submitted successfully.",
      result: {
        type: input.type,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return jsonResponse({
        ok: false,
        message: "Feedback webhook timed out before responding.",
      }, 504);
    }

    const message = error instanceof Error ? error.message : "Failed to submit feedback.";
    return jsonResponse({ ok: false, message }, 400);
  }
});
