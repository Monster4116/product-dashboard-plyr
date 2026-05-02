-- TEMPLATE ONLY
-- This file is an example scaffold for future reviewed SQL work.
-- Do not run this as-is.
-- Do not place real credentials in this repo.
-- Do not assume these names match production schemas or tables.

-- Example placeholder read-only view pattern
create or replace view dashboard_read_model_template as
select
  id,
  created_at,
  display_name,
  status
from dashboard_source_table_placeholder;

-- Example reminder for Row Level Security review
-- alter table dashboard_source_table_placeholder enable row level security;

-- Example reminder for least-privilege policy review
-- create policy dashboard_read_only_template
-- on dashboard_source_table_placeholder
-- for select
-- to authenticated
-- using (true);
