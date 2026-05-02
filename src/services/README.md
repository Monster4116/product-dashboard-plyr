# `src/services`

This folder is for future frontend-side service helpers.

Purpose:

- keep fetch logic out of UI components
- call safe API endpoints
- return stable, UI-friendly data

This folder should not contain:

- privileged database credentials
- direct privileged database logic
- server-side authorization rules

Example future responsibility:

- `getFinanceAdjustments()` calls a safe API endpoint and returns dashboard-ready data

The idea is simple:

- UI components should ask a service for data
- the service should not know secrets
- the service should not bypass the backend security boundary
