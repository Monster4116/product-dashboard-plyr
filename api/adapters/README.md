# `api/adapters`

This folder is for future backend-specific adapters.

Examples:

- a Supabase adapter
- a core Postgres adapter

Purpose:

- hide backend-specific query details
- let the rest of the application use stable interfaces
- make future backend replacement easier

Important idea:

- the frontend should not need to care which adapter is active
- today the adapter may target Supabase
- later the adapter may target company core Postgres
- the API and UI should stay as stable as possible while the adapter changes
- all database-specific field names should stay inside adapters or closely related backend mapping code
- all database-specific query logic should stay inside adapters, not inside frontend services

This folder should eventually hold implementation-specific backend access code, but not yet.
