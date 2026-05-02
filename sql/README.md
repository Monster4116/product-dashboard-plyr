# `sql`

This folder is for reviewed SQL-related artifacts and planning notes.

Examples of future content:

- migration templates
- view definitions
- RLS planning notes
- migration design documents
- query review notes

This folder should not contain:

- secrets
- live production credentials
- undocumented ad hoc SQL copied in without review

Recommended workflow:

- store migrations, views, and RLS policy drafts here first
- review them in pull requests
- run them manually only when the project is ready
- prefer views for dashboard read models where that improves safety or stability
- do not run live SQL automatically from this repo yet

For now, it exists as a clear place for future database design artifacts when the project is ready.
