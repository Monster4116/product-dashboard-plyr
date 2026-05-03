# Code Explanation Guide

## How To Read This Repo

This repository has two kinds of files:

- Files that affect the current running dashboard
- Files that explain or prepare future architecture

When explaining the repo to others, it helps to separate those two groups clearly.

## Runtime Dashboard Files

### `index.html`

- What it is for:
  - The current home page for the dashboard suite.
- Why it exists:
  - It gives users a landing page and navigation entry point.
- What problem it solves:
  - It provides a simple dashboard index instead of making users open internal pages manually.
- Is it currently used by runtime:
  - Yes.
- What should be updated here later:
  - Home page content, dashboard card content, and shell-level navigation usage.
- What should not be added here:
  - Secrets, service role keys, raw database query logic, or backend-specific credentials.
- Security considerations:
  - The page is public browser code, so everything in it is inspectable.
  - It uses `innerHTML` for some shell rendering, which is acceptable only while the content is trusted and controlled.

### `finance-adjustments.html`

- What it is for:
  - The dedicated Finance Adjustments dashboard page.
- Why it exists:
  - It separates the live finance dashboard from the home page.
- What problem it solves:
  - It gives one dataset its own page without rewriting the dashboard shell.
- Is it currently used by runtime:
  - Yes.
- What should be updated here later:
  - It should continue moving toward shared service/API usage and safer rendering boundaries.
- What should not be added here:
  - Privileged database credentials, service role keys, or raw database client logic with secrets.
- Security considerations:
  - This is browser-executed code.
  - It currently uses `sessionStorage`, which is fine for non-sensitive mock data but should be reviewed before sensitive internal data is stored client-side.
  - It currently injects a public config object into the page, so that config must remain public-safe only.
  - It uses `dangerouslySetInnerHTML` for shell markup, which should be treated cautiously.

### `styles.css`

- What it is for:
  - Shared styling for the dashboard family.
- Why it exists:
  - It preserves a single visual language across pages.
- What problem it solves:
  - It avoids page-by-page styling drift.
- Is it currently used by runtime:
  - Yes.
- What should be updated here later:
  - Only additive or minimal design adjustments when needed.
- What should not be added here:
  - Secrets, runtime data, or application logic.
- Security considerations:
  - No direct secret risk, but styling changes can create visual regressions if not reviewed carefully.

### `dashboard-pages.js`

- What it is for:
  - Shared page registry and sidebar rendering.
- Why it exists:
  - It keeps navigation labels and dashboard metadata in one place.
- What problem it solves:
  - It avoids duplicating shell content across pages.
- Is it currently used by runtime:
  - Yes.
- What should be updated here later:
  - New dashboard page metadata when new pages really exist.
- What should not be added here:
  - Backend logic, secrets, or direct data loading.
- Security considerations:
  - It affects runtime-rendered markup, so content inserted through it should remain trusted and controlled.

## Frontend Support Layers In `src/`

### `src/config/public-config.js`

- What it is for:
  - Public-safe frontend configuration.
- Why it exists:
  - It creates one obvious place for browser-safe config instead of sprinkling values across pages.
- What problem it solves:
  - It separates public configuration from future server-only secrets.
- Is it currently used by runtime:
  - Yes, by the finance page service layer.
- What should be updated here later:
  - Only safe public values like environment labels and API base paths.
- What should not be added here:
  - Database passwords, service role keys, or any server-side secret.
- Security considerations:
  - Everything here is visible to the browser and must be treated as public.

### `src/utils/http.js`

- What it is for:
  - Shared HTTP helper for frontend requests.
- Why it exists:
  - It centralizes fetch logic and readable error handling.
- What problem it solves:
  - It stops every page or service from inventing its own request pattern.
- Is it currently used by runtime:
  - Yes, through `dashboard-api.js`.
- What should be updated here later:
  - Standardized request handling and, later, carefully reviewed auth header logic if required.
- What should not be added here:
  - Hardcoded tokens, secrets, or hidden privileged access.
- Security considerations:
  - It currently avoids automatic credentials and auth headers, which is the safer starting point.

### `src/mappers/dashboard.mapper.js`

- What it is for:
  - Converts raw API-shaped data into stable dashboard contracts.
- Why it exists:
  - It keeps UI code independent from backend-specific field shapes.
- What problem it solves:
  - It reduces future breakage when the backend changes.
- Is it currently used by runtime:
  - Yes, by the shared service layer.
- What should be updated here later:
  - More mapper functions as more datasets are added.
- What should not be added here:
  - Query logic, credentials, or page rendering.
- Security considerations:
  - This layer helps prevent raw backend payloads from leaking directly into UI assumptions.

### `src/services/dashboard-api.js`

- What it is for:
  - Shared frontend dashboard service.
- Why it exists:
  - It should become the only frontend place that knows API endpoint paths.
- What problem it solves:
  - It reduces direct data access scattered across HTML pages.
- Is it currently used by runtime:
  - Yes, by the finance page.
- What should be updated here later:
  - Stable service methods for each dashboard dataset.
- What should not be added here:
  - Privileged Supabase client logic, service role usage, or server-only adapter code.
- Security considerations:
  - It is a key boundary file because it prevents pages from talking directly to privileged backend resources.

### `src/services/dashboard-api.browser.js`

- What it is for:
  - Browser bridge that attaches the shared service to `window.dashboardApi`.
- Why it exists:
  - Static HTML pages still need a practical way to use ES module-based shared logic.
- What problem it solves:
  - It lets current runtime pages use the service layer without a build system.
- Is it currently used by runtime:
  - Yes.
- What should be updated here later:
  - Only if the runtime integration model changes.
- What should not be added here:
  - Business logic, secrets, or duplicate service code.
- Security considerations:
  - This is a bridge only, so it should stay thin and predictable.

### `src/services/mock-data/dashboard.mock.js`

- What it is for:
  - Local mock dashboard data for safe development.
- Why it exists:
  - The service layer needed a safe data source before any real backend connection is implemented.
- What problem it solves:
  - It lets the runtime page use the service and mapper layers without live data.
- Is it currently used by runtime:
  - Yes, in local mock mode.
- What should be updated here later:
  - Replace or reduce mock usage as real API endpoints become available.
- What should not be added here:
  - Sensitive internal data dumps or copied production records.
- Security considerations:
  - Mock data should stay sanitized and non-sensitive.

## Repo Governance And Safety Files

### `AGENTS.md`

- What it is for:
  - Repository instructions for safe changes.
- Why it exists:
  - It gives Codex and other contributors a clear operating policy.
- What problem it solves:
  - It reduces accidental drift, overreach, and insecure shortcuts.
- Is it currently used by runtime:
  - No.
- What should be updated here later:
  - Only when project rules genuinely change.
- What should not be added here:
  - Runtime logic or secrets.
- Security considerations:
  - It is one of the strongest safety-control documents in the repo.

### `.gitignore`

- What it is for:
  - Prevents committing sensitive or generated files.
- Why it exists:
  - It helps keep the repository clean and safer.
- What problem it solves:
  - It reduces accidental secret commits and noise from generated output.
- Is it currently used by runtime:
  - No.
- What should be updated here later:
  - Add new generated folders or secret file patterns if the tooling changes.
- What should not be added here:
  - Broad ignore rules that hide meaningful source files accidentally.
- Security considerations:
  - It is an important first-line secret hygiene control, but not a full security solution by itself.

### `.env.example`

- What it is for:
  - Safe example of expected environment variables.
- Why it exists:
  - It documents configuration needs without storing real values.
- What problem it solves:
  - It helps contributors know which variables exist and which ones are public-safe versus server-only.
- Is it currently used by runtime:
  - No.
- What should be updated here later:
  - Add new variable names if the architecture expands.
- What should not be added here:
  - Real credentials or realistic-looking secret values.
- Security considerations:
  - This file is safe to commit because it uses placeholders only.

### `.github/pull_request_template.md`

- What it is for:
  - Pull request structure and review checklist.
- Why it exists:
  - It encourages smaller, safer, more reviewable changes.
- What problem it solves:
  - It reduces missed security and scope-review checks.
- Is it currently used by runtime:
  - No.
- What should be updated here later:
  - Add review checkpoints only when process needs change.
- What should not be added here:
  - Repo-specific secrets or environment data.
- Security considerations:
  - It adds a lightweight governance layer before code is merged.

## Documentation Files In `docs/`

### `docs/architecture.md`

- Explains the overall secure target architecture and current transitional state.
- Runtime use:
  - No.
- Future role:
  - Reference document for design decisions.
- Security note:
  - Explains why frontend and privileged backend access should be separated.

### `docs/security-model.md`

- Explains secret handling, public-safe config, server-side-only config, and review expectations.
- Runtime use:
  - No.
- Security note:
  - Core security reference for the repo.

### `docs/data-contracts.md`

- Explains why UI should depend on stable contracts instead of raw backend shapes.
- Runtime use:
  - No, but the pattern is partly reflected in runtime code now.
- Security note:
  - Helps reduce accidental overexposure of raw backend payloads.

### `docs/development-workflow.md`

- Explains branch, review, preview, PR, and merge workflow.
- Runtime use:
  - No.
- Security note:
  - Supports safe change review and smaller merge scope.

### `docs/supabase-connection-model.md`

- Explains how Supabase should be used safely behind an API boundary.
- Runtime use:
  - No.
- Security note:
  - Important for explaining anon keys, secret keys, RLS, and future migration.

### `docs/repo-inventory.md`

- Explains the current tracked file inventory and which parts are runtime versus scaffold.
- Runtime use:
  - No.
- Security note:
  - Useful for audits and presentation prep.

### `docs/repo-structure-guide.md`

- Explains the current folder structure and why it exists.
- Runtime use:
  - No.
- Security note:
  - Helps prevent people from putting the wrong logic in the wrong place.

### `docs/code-explanation-guide.md`

- Explains what the important files are and why they exist.
- Runtime use:
  - No.
- Security note:
  - Useful for onboarding and review discipline.

### `docs/security-presentation-notes.md`

- Presentation-ready explanation of the repo's current security posture.
- Runtime use:
  - No.
- Security note:
  - Good stakeholder-facing summary.

### `docs/presentation-outline.md`

- Slide-by-slide presentation outline.
- Runtime use:
  - No.
- Security note:
  - Helps keep stakeholder communication accurate and consistent.

### `docs/implementation-status.md`

- Explicit summary of what is implemented, scaffolded, and not done yet.
- Runtime use:
  - No.
- Security note:
  - Prevents overstating the maturity of the current implementation.

## Future Backend And SQL Scaffolding

### `api/README.md`

- What it is for:
  - Explains the future secure API boundary.
- Why it exists:
  - The first real API boundary is the deployed Supabase Edge Function. This folder is the future home for additional server-side logic as the project grows.
- Is it currently used by runtime:
  - No. The live Edge Function is deployed on Supabase, not tracked inside this folder.
- What should be updated here later:
  - Real API structure guidance as more Edge Functions or a server-side backend are added.
- What should not be added here:
  - Real secrets or fake "secure" code that only runs in the browser.
- Security considerations:
  - Server-side secrets should live behind this boundary, not in frontend files.

### `api/adapters/README.md`

- What it is for:
  - Explains how source-specific adapters should work.
- Why it exists:
  - To keep the frontend database-agnostic.
- Is it currently used by runtime:
  - No.
- What should be updated here later:
  - Real adapter guidance for Supabase and later core Postgres.
- What should not be added here:
  - Frontend logic or secrets in documentation examples.
- Security considerations:
  - Adapters help keep privileged query logic out of the browser.

### `sql/README.md`

- What it is for:
  - Explains how SQL planning files should be reviewed before use.
- Why it exists:
  - To make DB-level changes more reviewable and safer.
- Is it currently used by runtime:
  - No.
- What should be updated here later:
  - Add reviewed migration/view/RLS drafts when needed.
- What should not be added here:
  - Live credentials or auto-run production scripts.
- Security considerations:
  - RLS and read-model planning should be reviewable before execution.

### `sql/templates/dashboard_read_model_template.sql`

- What it is for:
  - Example-only placeholder SQL template.
- Why it exists:
  - To show what a reviewed read-model and RLS planning file may look like.
- Is it currently used by runtime:
  - No.
- What should be updated here later:
  - Replace with real reviewed drafts when actual backend work starts.
- What should not be added here:
  - Production table names if they are sensitive, or any credentials.
- Security considerations:
  - Template only. Not an active migration.

## Practical Takeaway

The most important thing to explain is this:

- The repo still runs as a static dashboard.
- Some secure architecture pieces are already wired into one page.
- The backend and database layers are still mostly scaffolded and documented, not implemented.
