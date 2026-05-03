# Security Presentation Notes

## Current Security Posture

The repo is in a transitional but intentional state.

What is already good:

- No real credentials were found in tracked files.
- No Supabase `service_role` key was found.
- `.gitignore` blocks common local secret files and build output.
- `.env.example` uses placeholders only.
- The repo now has explicit docs for architecture, data contracts, workflow, and security.
- One dashboard page already routes data through a shared frontend service instead of putting all data-loading logic directly in the HTML page.

What is not yet production-ready:

- The Edge Function has no authentication yet (`verify_jwt: false`). Anyone who discovers the URL can call it.
- RLS policies on the Supabase tables currently allow public reads, so data is also reachable directly with the anon key.
- CORS on the Edge Function is currently `*` and should be locked to a specific deployed domain.
- The dashboard is still fundamentally a static frontend with no server-rendered auth boundary.
- Some runtime rendering still uses HTML injection patterns like `innerHTML` or `dangerouslySetInnerHTML`.
- The finance page contains a public config block in the page source. Reviewers must ensure it only ever contains public-safe values such as environment labels and API base paths.

## What Security Has Actually Been Implemented

- Public-safe config has its own module.
- Shared HTTP logic has its own helper.
- Shared dashboard service logic has its own file.
- Mapping logic exists so the UI does not have to depend directly on backend-shaped records.
- A Supabase Edge Function acts as the first real server-side API boundary for the finance adjustments dataset.
- The Edge Function implements the adapter layer: DB-specific column names stay inside the function and never reach the browser.
- The `service_role` key is injected by the Supabase runtime into the Edge Function only. It is not in this repo and never reaches the browser.
- Pull requests have a security checklist template.
- Contributor behavior is governed by `AGENTS.md`.

## What Is Only Documented Or Scaffolded

- Authentication and authorisation on the API boundary
- Tightened RLS policies that restrict direct anon-key table access
- Edge Functions for remaining datasets (support tickets, research, dashboard summary)
- A real core Postgres adapter
- Real migrations and database views reviewed through pull request
- Production-ready secret management platform (e.g. AWS Secrets Manager for future AWS migration)

## Why Secrets Must Never Be Committed

If a secret is committed to the repository:

- It can be copied, cached, forked, or exposed in pull requests.
- It may remain visible in Git history even after removal.
- It can give unintended access to databases, APIs, or infrastructure.

For this repo, that means:

- No database passwords in tracked files
- No `service_role` or secret keys in browser code
- No fake examples that look real enough to be accidentally reused

## Why `service_role` Keys Must Never Be Exposed In Browser Code

A `service_role` or equivalent secret key is highly privileged. If it is added to browser code:

- Every user can inspect it
- Every browser session can copy it
- It can bypass intended application-layer controls
- It can lead to broad read or write access

The browser must be treated as a public environment, not a trusted one.

## Frontend-Safe Config Vs Server-Side Secrets

### Frontend-safe config

These values can safely be visible in browser code if they are truly non-secret:

- Environment label like `local` or `production`
- Relative API base path like `/api`
- Other non-sensitive UI configuration

### Server-side secrets

These must stay outside browser code and outside committed frontend files:

- `service_role` keys
- Secret API tokens
- Database passwords
- Internal backend credentials
- Future core Postgres connection strings

## Why The Dashboard Should Use A Service And API Boundary

The dashboard should not talk directly to privileged databases because that spreads risk and coupling into every page.

The safer pattern is:

```text
Frontend page
→ frontend dashboard service
→ secure API boundary
→ validation and permissions
→ adapter
→ database
```

Benefits:

- Safer secret handling
- One place to review endpoint access
- Easier migration later
- Less backend-specific logic inside UI files

## Why Direct Browser-To-Database Privileged Access Is Risky

- Browser code is visible to every user.
- Privileged keys cannot stay secret in the browser.
- Frontend pages become tightly coupled to database shape and vendor details.
- Review becomes harder because database access is spread across multiple UI files.

## How RLS Fits Into Supabase Security

RLS, or Row Level Security, limits which rows a user or client can read or write.

Why it helps:

- It reduces blast radius if a public key is used.
- It can restrict dashboard reads to a least-privilege model.
- It supports safer use of anon/public access in tightly controlled cases.

Why it is not enough by itself:

- It does not replace API validation and application logic.
- It does not make a secret key safe to expose.
- It does not automatically prevent bad frontend design choices.

## How The Adapter Layer Supports Security

The adapter layer keeps source-specific logic in one place.

That helps security because:

- Database-specific query logic is easier to review.
- Sensitive query assumptions do not spread through the UI.
- Access boundaries stay closer to the backend.

## How The Adapter Layer Supports Future Core Postgres Migration

If the frontend speaks to stable service methods and data contracts, then:

- the backend implementation can change
- the adapter can switch from Supabase to core Postgres
- the UI does not need a full rewrite

This reduces both migration cost and security risk during transition.

## How GitHub Workflow Supports Security

The GitHub workflow matters because small reviewed changes are safer than large surprise changes.

Current controls include:

- branch-based work
- pull requests
- a PR checklist
- documentation-first architecture notes
- AGENTS.md guidance for safe repository behavior

## What Reviewers Should Check Before Merging

- No secrets were added
- No `service_role` or equivalent secret key appears in frontend code
- Public config remains public-safe only
- Database-specific logic did not spread into HTML pages
- Runtime behavior changes are intentional and scoped
- New files are in the correct folder
- The service/API/adapter boundary remains clear
- Documentation matches the actual code state

## Questions Stakeholders May Ask And How To Answer Them

### Why do we need a service layer?

We need a service layer so pages do not each invent their own backend access pattern. It gives us one frontend boundary for loading dashboard data, which improves consistency, reviewability, and security.

### Why can’t the frontend just call Supabase directly?

The frontend can only safely use public-safe access patterns. It must never hold privileged secrets. Direct frontend access also couples the UI tightly to Supabase shapes and makes migration harder.

### Where do secrets live?

Secrets should live only in a real server-side environment such as a secure backend, serverless function platform, Edge Function, or internal backend configuration. They do not belong in HTML, CSS, or browser JavaScript.

### What is safe to put in frontend config?

Only values that are genuinely safe for any browser user to inspect, such as a public environment label or a public API base path.

### What must stay server-side?

Service role keys, secret tokens, database passwords, internal connection strings, privileged queries, permission checks, and adapter logic that relies on secrets.

### How will this work if we later move to core Postgres?

The frontend should keep calling the same service methods and receiving the same dashboard contracts. The backend adapter changes, but the UI does not need to know which database is active.

### Does this architecture change the current dashboard?

Not by itself. Most of the work so far adds structure and safer boundaries. Only one page has been partially wired into the new frontend service pattern, and even that was done without a visual redesign.

### How do we know Codex did not add unsafe changes?

We rely on several checks together: AGENTS.md rules, local review, Git diffs, pull requests, the PR checklist, and documentation that states what should and should not exist. The repository should always be reviewed before merge.

### What is the role of RLS?

RLS helps restrict what data a public or low-privilege client can access, but it is only one layer. It does not replace secret handling, API validation, or careful architecture.

### What is the role of GitHub pull requests?

Pull requests slow the process down in a good way. They make the scope visible, allow reviewers to catch risky changes, and create a clear checkpoint before merge.

### What is the role of AGENTS.md?

AGENTS.md acts like a repo safety policy. It tells contributors and AI agents how to work safely in this project, especially around secrets, styling, and backend coupling.

### What has actually been implemented versus only planned?

Implemented:

- static dashboard runtime
- shared styling
- shared page registry
- public config module
- shared frontend service
- shared mapper layer
- shared HTTP helper
- finance page using the service layer
- architecture and security docs

Planned or scaffolded:

- real API layer
- real Supabase adapter
- real core Postgres adapter
- production-ready auth and permissions
- reviewed live SQL migrations and RLS policies

## Short Presentation Summary

The best concise summary for stakeholders is:

This repo is still a static dashboard today, but it has been structured so that secure backend integration can happen later without scattering secrets or database-specific logic across the UI.
