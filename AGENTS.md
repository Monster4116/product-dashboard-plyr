# AGENTS.md

## Purpose

This repository contains static dashboard entry points with shared styling and inline application logic. When making changes, optimize for safety, continuity, and easy review.

## Scope Of Changes

- Keep changes small, focused, and easy to review.
- Prefer the minimum viable change that solves the task without broad refactors.
- Do not edit unrelated files while working on a scoped request.
- Preserve existing behavior unless the change explicitly requires behavior updates.

## Dashboard Styling

- Preserve the current dashboard visual language and layout patterns.
- Reuse the existing tokens, classes, spacing, typography, and component styles in `styles.css`.
- Do not introduce a new design system, visual theme, or inconsistent component styling unless explicitly requested.
- Treat `product-research.html`, `index.html`, and `supabase-dashboard.html` as part of the same dashboard family and avoid visual drift between them.
- Prefer additive, minimal CSS changes over broad rewrites.

## Security And Secrets

- Never expose secrets in client-side code, committed files, screenshots, logs, or comments.
- Never hardcode Supabase `service_role` keys anywhere in this repository.
- Never place privileged database credentials in HTML, CSS, or browser-executed JavaScript.
- Assume all client-side code is public and inspectable.
- If a key must be used by frontend code, it must be explicitly intended for public client use and limited in scope.

## Environment Variable Handling

- Use environment variables or deployment-time configuration for non-public configuration values where applicable.
- Keep secrets in secure server-side or platform-managed configuration, not in repo-tracked frontend files.
- If a value is required at build or deploy time, document the expected variable name and usage clearly rather than hardcoding the value.
- Do not create fake placeholder secrets that look real.
- Prefer patterns that cleanly separate public config from private config.

## Data Access And Frontend Independence

- Keep the frontend independent of the final database source.
- Avoid coupling UI components directly to one vendor-specific backend when an adapter, view, or API boundary can be used instead.
- Prefer stable response shapes and data contracts over direct reliance on raw table structures.
- Avoid spreading backend-specific assumptions across many components.
- Where practical, isolate source-specific logic so the UI can work with Apps Script, Supabase, or another backend with minimal surface-area changes.

## Supabase Rules

- Do not hardcode Supabase `service_role` credentials under any circumstance.
- If Supabase is used from the frontend, only use safe public configuration intended for browser access.
- Prefer read-only, least-privilege access patterns.
- Prefer views, RPCs, or narrow APIs over exposing broad raw-table reads to the client.
- Design changes so a Supabase-backed implementation can later be swapped without rewriting the dashboard UI.

## Future Core Postgres Migration

- Make decisions that support a future migration from Supabase to the company core Postgres database.
- Do not bake Supabase-specific concepts deeply into the UI if they are not essential.
- Prefer neutral naming such as "data source", "backend", "dataset", or "API" over vendor-locked terminology in shared frontend logic.
- Keep transformation logic close to the boundary where data enters the app.
- When introducing new data dependencies, think in terms of portable schemas and stable interfaces that can be backed by Postgres later.

## Preferred Delivery Style

- Favor reversible changes.
- Leave clear, concise notes in code only where they reduce migration risk or clarify an important boundary.
- If a larger migration is needed later, prepare the codebase through small boundary-improving steps rather than a single large rewrite.
