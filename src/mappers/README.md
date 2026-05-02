# `src/mappers`

This folder is for future frontend mapping and normalization helpers.

Purpose:

- convert API responses into UI-friendly shapes
- keep transformation logic out of components
- support stable data contracts

Example future use:

- map a finance adjustments response into the exact fields the charts and tables need

Important rule:

- components should not depend on raw backend row shapes directly

This folder helps keep the UI stable even if the backend changes later.
