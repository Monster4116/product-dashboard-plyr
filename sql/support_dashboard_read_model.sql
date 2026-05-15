-- Support dashboard read model
--
-- Purpose:
-- - Move the expensive support ticket + AI context join into Postgres.
-- - Keep the Edge Function thin and predictable.
-- - Expose only dashboard-safe columns; no raw comments, requester names, or requester emails.
--
-- Deployment:
-- 1. Run this SQL in the Supabase SQL editor or via your migration workflow.
-- 2. Deploy api/edge-functions/support-tickets/index.ts.
-- 3. Refresh the materialized view after support sync jobs complete:
--    refresh materialized view concurrently public.dashboard_support_ticket_rows;
--
-- If the initial create is run for the first time and there are no indexes yet,
-- use the non-concurrent refresh automatically performed by this CREATE statement.

drop materialized view if exists public.dashboard_support_data_quality_monthly_rollups;
drop materialized view if exists public.dashboard_support_queue_rollups;
drop materialized view if exists public.dashboard_support_segment_monthly_rollups;
drop materialized view if exists public.dashboard_support_tag_monthly_rollups;
drop materialized view if exists public.dashboard_support_company_monthly_rollups;
drop materialized view if exists public.dashboard_support_monthly_rollups;
drop materialized view if exists public.dashboard_support_ticket_rows;

create materialized view public.dashboard_support_ticket_rows as
select
  source_ticket_id,
  ticket_created_at,
  ticket_updated_at,
  country,
  requestor_type,
  existing_top_level_category,
  existing_subcategory,
  existing_severity,
  existing_relevant_department,
  status,
  priority,
  via_channel,
  satisfaction_score,
  customer_platform_uuid,
  customer_segmentation,
  existing_churn_risk,
  comment_count,
  qa_status,
  tags,
  clean_summary,
  requester_intent,
  issue_timeline,
  process_flags,
  context_quality,
  ai_context_version,
  model_name
from (
  select distinct on (ai.source_ticket_id)
    ai.source_ticket_id,
    ai.ticket_created_at,
    ai.ticket_updated_at,
    coalesce(raw.country, ai.country) as country,
    coalesce(raw.requestor_type, ai.requestor_type) as requestor_type,
    coalesce(raw.existing_top_level_category, ai.existing_top_level_category) as existing_top_level_category,
    coalesce(raw.existing_subcategory, ai.existing_subcategory) as existing_subcategory,
    coalesce(raw.existing_severity, ai.existing_severity) as existing_severity,
    coalesce(raw.existing_relevant_department, ai.existing_relevant_department) as existing_relevant_department,
    raw.status,
    raw.priority,
    raw.via_channel,
    raw.satisfaction_score,
    raw.customer_platform_uuid,
    raw.customer_segmentation,
    raw.existing_churn_risk,
    raw.comment_count,
    raw.qa_status,
    raw.tags,
    ai.clean_summary,
    ai.requester_intent,
    ai.issue_timeline,
    ai.process_flags,
    ai.context_quality,
    ai.ai_context_version,
    ai.model_name
  from public.ai_support_ticket_context ai
  left join public.support_tickets_v2 raw
    on raw.ticket_id = ai.source_ticket_id
  where ai.source_ticket_id is not null
  order by ai.source_ticket_id, ai.ticket_updated_at desc nulls last
) deduped
with data;

create unique index dashboard_support_ticket_rows_ticket_id_idx
  on public.dashboard_support_ticket_rows (source_ticket_id);

create index dashboard_support_ticket_rows_created_at_idx
  on public.dashboard_support_ticket_rows (ticket_created_at desc);

create index dashboard_support_ticket_rows_severity_idx
  on public.dashboard_support_ticket_rows (existing_severity);

create index dashboard_support_ticket_rows_category_idx
  on public.dashboard_support_ticket_rows (existing_top_level_category);

create index dashboard_support_ticket_rows_requestor_type_idx
  on public.dashboard_support_ticket_rows (requestor_type);

create index dashboard_support_ticket_rows_country_idx
  on public.dashboard_support_ticket_rows (country);

revoke all on table public.dashboard_support_ticket_rows from anon, authenticated;
grant select on table public.dashboard_support_ticket_rows to service_role;
