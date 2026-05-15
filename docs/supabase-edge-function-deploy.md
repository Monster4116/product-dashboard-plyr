# Supabase Edge Function Deployment

This repo keeps dashboard Edge Function implementation code under `api/edge-functions`.
The `supabase/functions` folder contains thin deployment entrypoints for the Supabase CLI.

## Support Tickets

The Support dashboard function is deployed as:

```text
support-tickets
```

Its deployment entrypoint is:

```text
supabase/functions/support-tickets/index.ts
```

The shared implementation lives at:

```text
api/edge-functions/support-tickets/index.ts
```

## Install Or Run The CLI

Supabase supports running the CLI through `npx` without installing it globally:

```bash
npx supabase@latest --help
```

For repeated local use, install it as a dev dependency once this repo has a package manifest:

```bash
npm install supabase --save-dev
```

Do not install it globally with `npm install -g supabase`; Supabase does not support that install path.

## Deploy The Support Function

From the repository root:

```bash
npx supabase@latest login
npx supabase@latest functions deploy support-tickets --project-ref toajcgsenjhtkmhisqkz --use-api
```

The `--use-api` flag lets the CLI bundle code that imports files outside the `supabase/functions` folder.

## Verify

After deployment, open:

```text
https://toajcgsenjhtkmhisqkz.supabase.co/functions/v1/support-tickets
```

The function should return JSON from the support dashboard aggregate read models, including
`summary`, `trend`, `queues`, `heatmaps`, `departments`, `segments`, `tags`, and `dataQuality`.

If the function returns a 500 after deployment, first refresh the materialized views in dependency order:

```sql
refresh materialized view concurrently public.dashboard_support_ticket_rows;
refresh materialized view concurrently public.dashboard_support_monthly_rollups;
refresh materialized view concurrently public.dashboard_support_company_monthly_rollups;
refresh materialized view concurrently public.dashboard_support_tag_monthly_rollups;
refresh materialized view concurrently public.dashboard_support_segment_monthly_rollups;
refresh materialized view concurrently public.dashboard_support_queue_rollups;
refresh materialized view concurrently public.dashboard_support_data_quality_monthly_rollups;
```

Then check the Edge Function logs in the Supabase Dashboard.
