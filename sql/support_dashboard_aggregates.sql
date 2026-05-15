-- Support dashboard aggregate read models
--
-- Purpose:
-- - Keep historical dashboard summaries in Postgres.
-- - Let the Edge Function read compact monthly rollups instead of raw ticket rows.
-- - Keep the row-level read model available only for small insight samples.
--
-- Deployment:
-- 1. Run this SQL after sql/support_dashboard_read_model.sql exists.
-- 2. Refresh after support sync jobs complete:
--    refresh materialized view concurrently public.dashboard_support_monthly_rollups;
--    refresh materialized view concurrently public.dashboard_support_company_monthly_rollups;
--    refresh materialized view concurrently public.dashboard_support_tag_monthly_rollups;
--    refresh materialized view concurrently public.dashboard_support_segment_monthly_rollups;
--    refresh materialized view concurrently public.dashboard_support_queue_rollups;
--    refresh materialized view concurrently public.dashboard_support_data_quality_monthly_rollups;

drop materialized view if exists public.dashboard_support_data_quality_monthly_rollups;
drop materialized view if exists public.dashboard_support_queue_rollups;
drop materialized view if exists public.dashboard_support_segment_monthly_rollups;
drop materialized view if exists public.dashboard_support_tag_monthly_rollups;
drop materialized view if exists public.dashboard_support_company_monthly_rollups;
drop materialized view if exists public.dashboard_support_monthly_rollups;

create materialized view public.dashboard_support_monthly_rollups as
select
  date_trunc('month', ticket_created_at)::date as month_start,
  coalesce(nullif(existing_severity, ''), 'Unknown') as severity,
  coalesce(nullif(existing_top_level_category, ''), 'Unknown') as category,
  coalesce(nullif(existing_subcategory, ''), 'Unknown') as subcategory,
  coalesce(nullif(existing_relevant_department, ''), 'Unknown') as department,
  coalesce(nullif(requestor_type, ''), 'Unknown') as requester_type,
  coalesce(nullif(country, ''), 'Unknown') as country,
  coalesce(nullif(status, ''), 'Unknown') as status,
  coalesce(nullif(via_channel, ''), 'Unknown') as channel,
  min(ticket_created_at) as first_ticket_created_at,
  max(ticket_created_at) as last_ticket_created_at,
  count(*)::integer as ticket_count,
  count(*) filter (where lower(coalesce(status, '')) in ('open', 'pending'))::integer as open_or_pending_count,
  count(*) filter (where lower(coalesce(existing_severity, '')) = 'l4')::integer as l4_count,
  count(*) filter (where lower(coalesce(satisfaction_score, '')) = 'bad')::integer as bad_satisfaction_count,
  count(*) filter (where process_flags ->> 'requires_internal_handoff' = 'true')::integer as requires_internal_handoff_count,
  count(*) filter (where process_flags ->> 'requires_client_instruction' = 'true')::integer as requires_client_instruction_count,
  count(*) filter (where process_flags ->> 'is_payroll_related' = 'true')::integer as is_payroll_related_count,
  count(*) filter (where process_flags ->> 'is_payment_related' = 'true')::integer as is_payment_related_count,
  count(*) filter (where process_flags ->> 'is_invoice_related' = 'true')::integer as is_invoice_related_count,
  count(*) filter (where process_flags ->> 'is_platform_bug' = 'true')::integer as is_platform_bug_count,
  count(*) filter (where process_flags ->> 'is_contract_related' = 'true')::integer as is_contract_related_count,
  count(*) filter (where process_flags ->> 'is_termination_or_end_date_related' = 'true')::integer as is_termination_or_end_date_related_count,
  count(*) filter (where process_flags ->> 'is_leave_related' = 'true')::integer as is_leave_related_count,
  count(*) filter (where process_flags ->> 'is_visa_or_immigration_related' = 'true')::integer as is_visa_or_immigration_related_count,
  count(*) filter (where process_flags ->> 'has_attachment' = 'true')::integer as has_attachment_count,
  count(*) filter (where process_flags ->> 'has_conflicting_dates' = 'true')::integer as has_conflicting_dates_count
from public.dashboard_support_ticket_rows
where ticket_created_at is not null
group by
  date_trunc('month', ticket_created_at)::date,
  coalesce(nullif(existing_severity, ''), 'Unknown'),
  coalesce(nullif(existing_top_level_category, ''), 'Unknown'),
  coalesce(nullif(existing_subcategory, ''), 'Unknown'),
  coalesce(nullif(existing_relevant_department, ''), 'Unknown'),
  coalesce(nullif(requestor_type, ''), 'Unknown'),
  coalesce(nullif(country, ''), 'Unknown'),
  coalesce(nullif(status, ''), 'Unknown'),
  coalesce(nullif(via_channel, ''), 'Unknown')
with data;

create unique index dashboard_support_monthly_rollups_unique_idx
  on public.dashboard_support_monthly_rollups (
    month_start,
    severity,
    category,
    subcategory,
    department,
    requester_type,
    country,
    status,
    channel
  );

create index dashboard_support_monthly_rollups_month_idx
  on public.dashboard_support_monthly_rollups (month_start desc);

create index dashboard_support_monthly_rollups_filter_idx
  on public.dashboard_support_monthly_rollups (severity, category, requester_type, country);

create materialized view public.dashboard_support_company_monthly_rollups as
select
  date_trunc('month', ticket_created_at)::date as month_start,
  coalesce(nullif(customer_platform_uuid::text, ''), 'Unknown') as company_id,
  coalesce(nullif(existing_severity, ''), 'Unknown') as severity,
  coalesce(nullif(existing_top_level_category, ''), 'Unknown') as category,
  coalesce(nullif(requestor_type, ''), 'Unknown') as requester_type,
  coalesce(nullif(country, ''), 'Unknown') as country,
  count(*)::integer as ticket_count,
  count(*) filter (where lower(coalesce(status, '')) in ('open', 'pending'))::integer as open_or_pending_count,
  count(*) filter (where lower(coalesce(existing_severity, '')) = 'l4')::integer as l4_count,
  count(*) filter (where process_flags ->> 'requires_internal_handoff' = 'true')::integer as requires_internal_handoff_count
from public.dashboard_support_ticket_rows
where ticket_created_at is not null
group by
  date_trunc('month', ticket_created_at)::date,
  coalesce(nullif(customer_platform_uuid::text, ''), 'Unknown'),
  coalesce(nullif(existing_severity, ''), 'Unknown'),
  coalesce(nullif(existing_top_level_category, ''), 'Unknown'),
  coalesce(nullif(requestor_type, ''), 'Unknown'),
  coalesce(nullif(country, ''), 'Unknown')
with data;

create unique index dashboard_support_company_monthly_rollups_unique_idx
  on public.dashboard_support_company_monthly_rollups (
    month_start,
    company_id,
    severity,
    category,
    requester_type,
    country
  );

create index dashboard_support_company_monthly_rollups_month_idx
  on public.dashboard_support_company_monthly_rollups (month_start desc);

create index dashboard_support_company_monthly_rollups_filter_idx
  on public.dashboard_support_company_monthly_rollups (severity, category, requester_type, country);

create materialized view public.dashboard_support_tag_monthly_rollups as
select
  date_trunc('month', ticket_created_at)::date as month_start,
  lower(trim(both '"' from tag.value::text)) as tag,
  coalesce(nullif(existing_severity, ''), 'Unknown') as severity,
  coalesce(nullif(existing_top_level_category, ''), 'Unknown') as category,
  coalesce(nullif(requestor_type, ''), 'Unknown') as requester_type,
  coalesce(nullif(country, ''), 'Unknown') as country,
  count(*)::integer as ticket_count,
  count(*) filter (where lower(coalesce(status, '')) in ('open', 'pending'))::integer as open_or_pending_count,
  count(*) filter (where lower(coalesce(existing_severity, '')) = 'l4')::integer as l4_count,
  count(*) filter (where process_flags ->> 'requires_internal_handoff' = 'true')::integer as requires_internal_handoff_count
from public.dashboard_support_ticket_rows
cross join lateral jsonb_array_elements(coalesce(tags, '[]'::jsonb)) as tag(value)
where ticket_created_at is not null
  and jsonb_typeof(coalesce(tags, '[]'::jsonb)) = 'array'
  and lower(trim(both '"' from tag.value::text)) not in ('', 'auto_assign', 'qaflag')
group by
  date_trunc('month', ticket_created_at)::date,
  lower(trim(both '"' from tag.value::text)),
  coalesce(nullif(existing_severity, ''), 'Unknown'),
  coalesce(nullif(existing_top_level_category, ''), 'Unknown'),
  coalesce(nullif(requestor_type, ''), 'Unknown'),
  coalesce(nullif(country, ''), 'Unknown')
with data;

create unique index dashboard_support_tag_monthly_rollups_unique_idx
  on public.dashboard_support_tag_monthly_rollups (
    month_start,
    tag,
    severity,
    category,
    requester_type,
    country
  );

create index dashboard_support_tag_monthly_rollups_month_idx
  on public.dashboard_support_tag_monthly_rollups (month_start desc);

create index dashboard_support_tag_monthly_rollups_filter_idx
  on public.dashboard_support_tag_monthly_rollups (severity, category, requester_type, country);

create materialized view public.dashboard_support_segment_monthly_rollups as
select
  date_trunc('month', ticket_created_at)::date as month_start,
  coalesce(nullif(customer_segmentation, ''), 'Unknown') as customer_segment,
  case
    when lower(coalesce(existing_churn_risk, '')) in ('true', 'churn risk') then 'Churn Risk'
    when lower(coalesce(existing_churn_risk, '')) in ('false', 'no churn risk') then 'No Churn Risk'
    else 'Unknown'
  end as churn_risk,
  coalesce(nullif(existing_severity, ''), 'Unknown') as severity,
  coalesce(nullif(existing_top_level_category, ''), 'Unknown') as category,
  coalesce(nullif(requestor_type, ''), 'Unknown') as requester_type,
  coalesce(nullif(country, ''), 'Unknown') as country,
  count(*)::integer as ticket_count,
  count(*) filter (where lower(coalesce(status, '')) in ('open', 'pending'))::integer as open_or_pending_count,
  count(*) filter (where lower(coalesce(existing_severity, '')) = 'l4')::integer as l4_count,
  count(*) filter (where process_flags ->> 'requires_internal_handoff' = 'true')::integer as requires_internal_handoff_count,
  count(*) filter (where lower(coalesce(satisfaction_score, '')) = 'bad')::integer as bad_satisfaction_count
from public.dashboard_support_ticket_rows
where ticket_created_at is not null
group by
  date_trunc('month', ticket_created_at)::date,
  coalesce(nullif(customer_segmentation, ''), 'Unknown'),
  case
    when lower(coalesce(existing_churn_risk, '')) in ('true', 'churn risk') then 'Churn Risk'
    when lower(coalesce(existing_churn_risk, '')) in ('false', 'no churn risk') then 'No Churn Risk'
    else 'Unknown'
  end,
  coalesce(nullif(existing_severity, ''), 'Unknown'),
  coalesce(nullif(existing_top_level_category, ''), 'Unknown'),
  coalesce(nullif(requestor_type, ''), 'Unknown'),
  coalesce(nullif(country, ''), 'Unknown')
with data;

create unique index dashboard_support_segment_monthly_rollups_unique_idx
  on public.dashboard_support_segment_monthly_rollups (
    month_start,
    customer_segment,
    churn_risk,
    severity,
    category,
    requester_type,
    country
  );

create index dashboard_support_segment_monthly_rollups_month_idx
  on public.dashboard_support_segment_monthly_rollups (month_start desc);

create index dashboard_support_segment_monthly_rollups_filter_idx
  on public.dashboard_support_segment_monthly_rollups (severity, category, requester_type, country);

create materialized view public.dashboard_support_queue_rollups as
select
  case
    when ticket_created_at >= now() - interval '3 days' then '0-3 days'
    when ticket_created_at >= now() - interval '7 days' then '4-7 days'
    when ticket_created_at >= now() - interval '14 days' then '8-14 days'
    when ticket_created_at >= now() - interval '30 days' then '15-30 days'
    else '31+ days'
  end as age_bucket,
  coalesce(nullif(status, ''), 'Unknown') as status,
  coalesce(nullif(existing_severity, ''), 'Unknown') as severity,
  coalesce(nullif(existing_top_level_category, ''), 'Unknown') as category,
  coalesce(nullif(existing_relevant_department, ''), 'Unknown') as department,
  coalesce(nullif(requestor_type, ''), 'Unknown') as requester_type,
  coalesce(nullif(country, ''), 'Unknown') as country,
  count(*)::integer as ticket_count,
  count(*) filter (where lower(coalesce(existing_severity, '')) = 'l4')::integer as l4_count,
  count(*) filter (where process_flags ->> 'requires_internal_handoff' = 'true')::integer as requires_internal_handoff_count,
  count(*) filter (where process_flags ->> 'requires_client_instruction' = 'true')::integer as requires_client_instruction_count,
  count(*) filter (where lower(coalesce(satisfaction_score, '')) = 'bad')::integer as bad_satisfaction_count
from public.dashboard_support_ticket_rows
where ticket_created_at is not null
  and lower(coalesce(status, '')) in ('open', 'pending')
group by
  case
    when ticket_created_at >= now() - interval '3 days' then '0-3 days'
    when ticket_created_at >= now() - interval '7 days' then '4-7 days'
    when ticket_created_at >= now() - interval '14 days' then '8-14 days'
    when ticket_created_at >= now() - interval '30 days' then '15-30 days'
    else '31+ days'
  end,
  coalesce(nullif(status, ''), 'Unknown'),
  coalesce(nullif(existing_severity, ''), 'Unknown'),
  coalesce(nullif(existing_top_level_category, ''), 'Unknown'),
  coalesce(nullif(existing_relevant_department, ''), 'Unknown'),
  coalesce(nullif(requestor_type, ''), 'Unknown'),
  coalesce(nullif(country, ''), 'Unknown')
with data;

create unique index dashboard_support_queue_rollups_unique_idx
  on public.dashboard_support_queue_rollups (
    age_bucket,
    status,
    severity,
    category,
    department,
    requester_type,
    country
  );

create index dashboard_support_queue_rollups_filter_idx
  on public.dashboard_support_queue_rollups (severity, category, requester_type, country);

create materialized view public.dashboard_support_data_quality_monthly_rollups as
select
  date_trunc('month', raw.ticket_created_at)::date as month_start,
  count(*)::integer as raw_ticket_count,
  count(ai.source_ticket_id)::integer as enriched_ticket_count,
  count(*) filter (where ai.source_ticket_id is null)::integer as missing_ai_context_count,
  count(*) filter (where nullif(raw.country, '') is null or raw.country = '-')::integer as missing_country_count,
  count(*) filter (where nullif(raw.existing_top_level_category, '') is null)::integer as missing_category_count,
  count(*) filter (where nullif(raw.requestor_type, '') is null)::integer as missing_requester_type_count,
  count(*) filter (where nullif(raw.existing_severity, '') is null)::integer as missing_severity_count,
  count(*) filter (where nullif(raw.customer_segmentation, '') is null)::integer as missing_customer_segment_count,
  count(*) filter (where nullif(raw.existing_churn_risk, '') is null)::integer as missing_churn_risk_count
from public.support_tickets_v2 raw
left join public.dashboard_support_ticket_rows ai
  on ai.source_ticket_id = raw.ticket_id
where raw.ticket_created_at is not null
group by date_trunc('month', raw.ticket_created_at)::date
with data;

create unique index dashboard_support_data_quality_monthly_rollups_unique_idx
  on public.dashboard_support_data_quality_monthly_rollups (month_start);

create index dashboard_support_data_quality_monthly_rollups_month_idx
  on public.dashboard_support_data_quality_monthly_rollups (month_start desc);

revoke all on table public.dashboard_support_monthly_rollups from anon, authenticated;
revoke all on table public.dashboard_support_company_monthly_rollups from anon, authenticated;
revoke all on table public.dashboard_support_tag_monthly_rollups from anon, authenticated;
revoke all on table public.dashboard_support_segment_monthly_rollups from anon, authenticated;
revoke all on table public.dashboard_support_queue_rollups from anon, authenticated;
revoke all on table public.dashboard_support_data_quality_monthly_rollups from anon, authenticated;
grant select on table public.dashboard_support_monthly_rollups to service_role;
grant select on table public.dashboard_support_company_monthly_rollups to service_role;
grant select on table public.dashboard_support_tag_monthly_rollups to service_role;
grant select on table public.dashboard_support_segment_monthly_rollups to service_role;
grant select on table public.dashboard_support_queue_rollups to service_role;
grant select on table public.dashboard_support_data_quality_monthly_rollups to service_role;
