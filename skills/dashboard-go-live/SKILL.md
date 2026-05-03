---
name: dashboard-go-live
description: Use when you need to move a dashboard page in this repository from local mock data to live Supabase-backed data through the current safe service and Edge Function pattern. Covers schema review, mapper alignment, mock-first setup, Edge Function deployment, frontend config switching, and verification.
---

# Dashboard Go Live

Use this skill when a dashboard page in this repo needs to move from mock data to live Supabase data without exposing privileged credentials in browser code.

## Goal

Follow the current repository pattern:

`page -> src/services/dashboard-api.js -> Supabase Edge Function -> service-role query -> stable contract -> UI`

Do not put `service_role` keys or database passwords in HTML or browser JavaScript.

## Current Repo Pattern

- Runtime pages live at the repo root as static HTML files.
- Browser-safe config comes from `window.__PUBLIC_CONFIG__` and `src/config/public-config.js`.
- Frontend data access belongs in `src/services/dashboard-api.js`.
- Stable contracts belong in `src/mappers/dashboard.mapper.js`.
- Local mock data belongs in `src/services/mock-data/dashboard.mock.js`.
- Edge Function source should live in `api/edge-functions/<function-name>/index.ts`.

## When To Use Mock Vs Live

- Use `appEnv: 'local'` for mock data.
- Use a non-local environment label plus a real `apiBaseUrl` for live data.
- Current hosted-function pattern uses:
  - `apiBaseUrl: 'https://<project-ref>.supabase.co/functions/v1'`
  - service path like `'/finance-adjustments'` or `'/company-health'`

## Go-Live Workflow

1. Inspect the live Supabase table schema first.
2. Define or confirm the stable frontend contract.
3. Add or update the mapper.
4. Add or update local mock data first.
5. Add or update the shared service method in `src/services/dashboard-api.js`.
6. Add or update the runtime page to load through `window.dashboardApi`.
7. Create an Edge Function that:
   - handles `GET`
   - returns CORS headers
   - queries Supabase server-side
   - maps DB column names into the stable dashboard contract
   - returns generic errors only
8. Deploy the Edge Function to the correct Supabase project.
9. Switch the page config from local mock mode to live mode.
10. Verify the page in browser.

## Edge Function Rules

- Use `Deno.env.get('SUPABASE_URL')` and `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` only inside the Edge Function.
- Never copy those secrets into repo-tracked frontend files.
- Prefer narrow `select(...)` column lists over broad `select('*')`.
- Keep DB-specific field names inside the function or adapter boundary.
- Return contract-shaped JSON such as `{ items: [...] }`.
- Return generic errors like `"Failed to load company health"` instead of raw database errors.

## Deployment Pattern

For this repo, one dataset can use one function slug if that is already how the page is structured.

Examples:

- `finance-adjustments` -> `/functions/v1/finance-adjustments`
- `company-health` -> `/functions/v1/company-health`

If you later consolidate multiple datasets behind one function, update the service layer and document the routing clearly before changing page configs.

## Frontend Switch

For a page that should use live data:

```js
window.__PUBLIC_CONFIG__ = {
  appEnv: 'production',
  apiBaseUrl: 'https://<project-ref>.supabase.co/functions/v1',
};
```

For mock mode:

```js
window.__PUBLIC_CONFIG__ = {
  appEnv: 'local',
  apiBaseUrl: '/api',
};
```

## Verification Checklist

- Page loads without browser-side Supabase secrets.
- Page calls the shared frontend service, not raw fetches scattered in the page.
- Edge Function returns only the fields the UI needs.
- Mapper output matches the runtime page expectations.
- Session cache still behaves correctly if the page uses it.
- Existing dashboard styling stays consistent.
- No real secret values were added to repo files.

## Current Security Tradeoff

The existing hosted `finance-adjustments` function is public and does not require JWT verification. If matching that pattern for another live dataset, call out explicitly that this is a temporary tradeoff of the current static dashboard architecture and should be revisited when a fuller auth model is introduced.
