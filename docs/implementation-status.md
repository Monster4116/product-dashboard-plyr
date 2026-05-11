# Implementation Status

## Implemented Now

- Static runtime dashboard pages:
  - `index.html`
  - `finance-adjustments.html`
- Shared runtime styling:
  - `styles.css`
- Shared runtime page metadata and sidebar:
  - `dashboard-pages.js`
- Public-safe frontend config module:
  - `src/config/public-config.js`
- Shared frontend HTTP helper:
  - `src/utils/http.js`
- Shared frontend dashboard service:
  - `src/services/dashboard-api.js`
- Browser bridge for the shared dashboard service:
  - `src/services/dashboard-api.browser.js`
- Shared mapper layer for stable dashboard contracts:
  - `src/mappers/dashboard.mapper.js`
- Edge Function source now tracked in repo for live datasets:
  - `api/edge-functions/finance-adjustments/index.ts`
- Local mock data for safe runtime testing:
  - `src/services/mock-data/dashboard.mock.js`
- Repo governance and review support:
  - `AGENTS.md`
  - `.gitignore`
  - `.env.example`
  - `.github/pull_request_template.md`
- Architecture and security documentation under `docs/`

## Scaffolded But Not Connected Yet

- `api/README.md`
  - Describes the future secure API boundary. The first real implementation is the deployed Edge Function, not code in this folder.
- `api/adapters/README.md`
  - Describes the future adapter pattern. The first real adapter logic lives inside the deployed Edge Function.
- `sql/README.md`
  - Describes SQL review practice, but does not run SQL.
- `sql/templates/dashboard_read_model_template.sql`
  - Template only. Not a live migration or live read model.

## Implemented Outside This Repo

- Supabase Edge Function: `finance-adjustments` (currently deployed from the repo-tracked source)
  - Deployed to the Supabase project.
  - Acts as the first real server-side API boundary for the finance adjustments dataset.
  - Implements the adapter layer: queries `finance_adjustments_data`, maps raw DB column names to the stable dashboard contract, and returns the fields the UI needs for taxonomy-aware drilldown.
  - The `service_role` key is injected automatically by the Supabase Edge Function runtime and never touches this repo or browser code.
  - The frontend calls this function in production mode via `window.__PUBLIC_CONFIG__.apiBaseUrl`.

## Not Implemented Yet

- Authentication and authorisation on the Edge Function (currently `verify_jwt: false`)
- RLS policies tightened to prevent direct anon-key access to raw tables
- CORS origin locked to a specific deployed domain (currently `*`)
- Additional Edge Functions for other datasets (`support-tickets`, `research`, `dashboard-summary`)
- Real core Postgres adapter
- Production-ready secret management outside of Supabase Edge Function runtime injection
- Live SQL migrations or automated database deployment workflow

## Runtime Dashboard Impact

- The finance adjustments page now loads all 6,775 rows from Supabase via the Edge Function in production mode.
- Local mock mode remains available for development by removing or not setting `window.__PUBLIC_CONFIG__`.
- The home page, `index.html`, remains a more traditional static shell page.

## Security Assumptions

- Browser code is public and inspectable.
- Public frontend config must stay non-secret. The Supabase project URL in `window.__PUBLIC_CONFIG__` is a public domain and is acceptable.
- Real secrets must never be committed. The `service_role` key lives only in the Edge Function runtime environment.
- If a public anon key is ever used directly from the browser, it must only be used with strict RLS and least-privilege design.
- Future privileged backend access must happen server-side only.

## Known Limitations

- The Edge Function has no authentication yet. Anyone who discovers the URL can call it.
- RLS policies on both tables currently allow public reads (`qual: true`), meaning data is reachable directly with the anon key, not only through the Edge Function.
- The frontend service layer is only partially adopted across runtime pages.
- The runtime finance page currently injects a public config object directly into HTML.
- Some runtime rendering still relies on `innerHTML` or `dangerouslySetInnerHTML`.
- The finance page uses `sessionStorage` for caching, which should be reviewed before sensitive internal data is stored client-side.

## Risks

- Future contributors may assume scaffold folders are fully implemented when they are not.
- Public config could become unsafe if someone starts placing secrets there.
- The finance page's current environment-specific public config approach could create coupling if left in place too long.
- HTML injection-style rendering patterns could become a security concern if later fed with untrusted content.
- The current service endpoint naming is not fully normalized across all methods, which could weaken boundary clarity if not cleaned up.

## Recommended Next Steps

- Normalize all shared dashboard service endpoint paths to one consistent API namespace.
- Remove runtime page-level hardcoded environment-specific backend URL assumptions where possible.
- Implement one small real API boundary for one dataset only.
- Keep using mappers and stable data contracts so the UI does not depend on backend table shapes.
- Review client-side storage and HTML injection patterns before any sensitive internal data is introduced.
- Continue using small PRs with explicit security review.

## Repository Audit Summary

### Files reviewed

- `.env.example`
- `.github/pull_request_template.md`
- `.gitignore`
- `AGENTS.md`
- `api/README.md`
- `api/adapters/README.md`
- `dashboard-pages.js`
- `docs/architecture.md`
- `docs/data-contracts.md`
- `docs/development-workflow.md`
- `docs/security-model.md`
- `docs/supabase-connection-model.md`
- `finance-adjustments.html`
- `index.html`
- `sql/README.md`
- `sql/templates/dashboard_read_model_template.sql`
- `src/config/README.md`
- `src/config/public-config.js`
- `src/mappers/README.md`
- `src/mappers/dashboard.mapper.js`
- `src/services/README.md`
- `src/services/dashboard-api.browser.js`
- `src/services/dashboard-api.js`
- `src/services/mock-data/dashboard.mock.js`
- `src/utils/http.js`
- `styles.css`

### Files created or updated by this task

- `docs/repo-inventory.md`
- `docs/repo-structure-guide.md`
- `docs/code-explanation-guide.md`
- `docs/security-presentation-notes.md`
- `docs/presentation-outline.md`
- `docs/implementation-status.md`

### Files intentionally not modified

- `index.html`
- `finance-adjustments.html`
- `styles.css`
- `dashboard-pages.js`
- `src/config/public-config.js`
- `src/services/dashboard-api.js`
- `src/services/dashboard-api.browser.js`
- `src/services/mock-data/dashboard.mock.js`
- `src/mappers/dashboard.mapper.js`
- `src/utils/http.js`
- `.env.example`
- `.gitignore`
- `AGENTS.md`
- `.github/pull_request_template.md`
- `api/README.md`
- `api/adapters/README.md`
- `sql/README.md`
- `sql/templates/dashboard_read_model_template.sql`
- Existing docs in `docs/`

### Whether runtime dashboard behavior changed

No. This task added documentation only.

### Whether any secrets were found or added

- No real secrets were found in the tracked repository files reviewed.
- No secrets were added by this task.

### Whether any existing files appear risky

Yes. These are review-worthy but were not changed in this task:

- `finance-adjustments.html`
  - runtime public config is injected directly into the page
  - uses `sessionStorage`
  - uses `dangerouslySetInnerHTML`
- `index.html`
  - uses `innerHTML` for shell rendering
- `src/services/dashboard-api.js`
  - finance endpoint naming is not fully aligned with the other dashboard service paths

### Follow-up recommendations

- Review and normalize the runtime public config approach.
- Tighten endpoint consistency in the service layer.
- Continue moving runtime data access behind the shared service boundary.
- Add a real API implementation only in small, reviewable steps.
