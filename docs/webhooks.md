# Webhooks

This repo's `Actions` page does **not** send webhooks directly from the browser.

Instead, it uses the server-side Supabase Edge Function:

- `actions`

That function reads the webhook target from server-side secrets so the URL and any auth token never need to be committed to the repo.

## Current Webhook Action

The current action is:

- `send_test_webhook`

It supports:

- `dry_run`
  - returns the payload preview only
  - sends nothing externally
- `live`
  - only works if the webhook URL is configured server-side

## How To Update The Webhook Target

Set these values in the Supabase project, **not** in frontend files:

- `ACTIONS_TEST_WEBHOOK_URL`
  - the webhook destination URL
- `ACTIONS_TEST_WEBHOOK_BEARER_TOKEN`
  - optional bearer token sent as `Authorization: Bearer ...`

Recommended place to update them:

1. Open the Supabase project dashboard
2. Go to Edge Function secrets / environment settings
3. Add or update:
   - `ACTIONS_TEST_WEBHOOK_URL`
   - `ACTIONS_TEST_WEBHOOK_BEARER_TOKEN` if needed

If only the secret values change, you usually do **not** need to change repo files.

## What The Actions Page Shows

- If the webhook URL is **not** configured:
  - the page still allows `dry_run`
  - the `Run live` button stays disabled
- If the webhook URL **is** configured:
  - `Run live` becomes available

## Example Payload Shape

The current webhook sends a JSON body like:

```json
{
  "source": "product-one-actions",
  "actionId": "send_test_webhook",
  "mode": "live",
  "triggeredAt": "2026-05-03T12:00:00.000Z",
  "input": {
    "pageId": "actions",
    "actionName": "Send test webhook"
  }
}
```

## Important Safety Rule

Do not hardcode webhook URLs or tokens in:

- `index.html`
- `actions.html`
- `src/services/*.js`
- any other browser-executed file

Keep webhook targets and auth server-side only.
