---
name: support-ticket-sync
description: Use when you need to understand, maintain, or extend the n8n workflow that syncs Zendesk support tickets from Metabase into the Supabase `support_tickets` table, company by company, with change detection to avoid re-processing unchanged tickets.
---

# Support Ticket Sync — Per-Company (Change Detection)

## Purpose

Pulls support ticket data from Zendesk (via Metabase card 961) and writes it to the `support_tickets` table in Supabase. Runs company by company so each fetch is scoped to one company's tickets. Compares `ticket_updated_at` timestamps against what is already stored before writing, so only new or changed tickets touch the database on repeat runs.

**n8n workflow ID:** `FHVHWUWC9qpPGc6v`
**Workflow name:** Per-Company Ticket Sync (Change Detection)
**Trigger:** Manual only

---

## Data Sources and Credentials

| System | What it provides | n8n credential |
|--------|-----------------|----------------|
| MainDB (Postgres) | List of active company IDs from the `Invoice` table | `KWIJ1DN1RFhXDz8f` — MainDB - n8n readonly |
| Metabase card 961 | Raw support ticket rows (one row per comment due to LEFT JOIN with comments) | `vu5WNxgFOF7nZfGz` — Metabase (svc_pl_n8n) |
| Supabase REST API | Reads existing `ticket_id` + `ticket_updated_at` per company; writes upserted rows | `KZQaWqCDN7H2z4fu` — Supabase account |

---

## Full Flow Diagram

```
Manual Trigger
  └─► Load Config
        └─► Fetch Company List  (Postgres → 666 companies)
              └─► Loop Over Companies  (SplitInBatches, 1 at a time)
                    │
                    ├─[done]─► (workflow ends)
                    │
                    └─[batch: 1 company]
                          │
                          ▼
                    Fetch Supabase Existing
                    GET /support_tickets?customer_platform_uuid=eq.{id}
                    → N items (ticket_id + ticket_updated_at already stored)
                          │
                          ▼
                    Fetch Metabase Tickets  (executeOnce)
                    POST card/961 filtered by customer_platform_uuid
                    → M raw rows (one per comment)
                          │
                          ▼
                    Group Comments by Ticket
                    → K unique ticket objects
                          │
                          ▼
                    Filter Changed Tickets
                    → changed tickets only  OR  { _skip: true }
                          │
                          ▼
                    Has Changes?  (IF node)
                    │                        │
                    ├─[true: real tickets]   └─[false: _skip]
                    │                              │
                    ▼                              │
              Map to Supabase Schema               │
                    │                              │
                    ▼                              │
              Aggregate Company Tickets            │
              (N items → { rows: [...] })          │
                    │                              │
                    ▼                              │
              Upsert Batch to Supabase             │
              POST /support_tickets                │
              Prefer: resolution=merge-duplicates  │
                    │                              │
                    └──────────────────────────────┘
                                   │
                                   ▼
                         Loop Over Companies  ◄── loopback → next company
```

---

## Node-by-Node Logic

### 1. Load Config
**Type:** Set node

Sets the `created_at` from-date used as the Metabase filter. All tickets created on or after this date are eligible to be fetched. Change this value to limit the sync to a more recent window.

```
created_at: "2020-01-01"
```

---

### 2. Fetch Company List
**Type:** Postgres (MainDB, read-only)

Queries the `Invoice` table for distinct company IDs that have had active invoices since 2025. `Invoice.companyId` maps 1:1 to `customer_platform_uuid` in Zendesk/Metabase.

```sql
SELECT DISTINCT "companyId"
FROM "Invoice"
WHERE "date" >= '2025-01-01'
  AND "baseSalary" != 0
  AND "companyId" IS NOT NULL
ORDER BY "companyId"
```

Output: one item per company `{ "companyId": "uuid" }`.

---

### 3. Loop Over Companies
**Type:** SplitInBatches (batchSize: 1)

Standard n8n loop. Processes one company at a time. The loopback input (step 9 and the skip path from Has Changes?) advances it to the next company. When the list is exhausted, output 0 fires and the workflow ends.

---

### 4. Fetch Supabase Existing
**Type:** HTTP GET — Supabase REST API

For the current company, retrieves only the two fields needed for change detection: `ticket_id` and `ticket_updated_at`. Limited to 10,000 rows (more than any single company will have).

```
GET /rest/v1/support_tickets
  ?select=ticket_id,ticket_updated_at
  &customer_platform_uuid=eq.{companyId}
  &limit=10000
```

`alwaysOutputData: true` ensures the flow continues even when the company has zero rows stored (new company). In that case, the node outputs one empty item `{}` and the Filter node treats all Metabase tickets as new.

Output: N items, each `{ ticket_id: "...", ticket_updated_at: "..." }`.

---

### 5. Fetch Metabase Tickets
**Type:** HTTP POST — Metabase card 961

`executeOnce: true` — runs once regardless of how many items arrived from step 4. This is necessary because step 4 may output multiple items (one per stored ticket), but we only want one Metabase call per company.

The body uses the current company UUID from the outer loop (not from `$json`, which would be a stored-ticket item):

```javascript
{
  parameters: [
    {
      type: "category",
      target: ["variable", ["template-tag", "customer_platform_uuid"]],
      value: $('Loop Over Companies').first().json.companyId
    },
    {
      type: "date/single",
      target: ["variable", ["template-tag", "created_at"]],
      value: $('Load Config').first().json.created_at   // "2020-01-01"
    }
  ]
}
```

Metabase card 961 runs a SQL query against Zendesk data with a LEFT JOIN on comments. This means it returns **one row per comment**, not one row per ticket. A ticket with 5 comments produces 5 identical ticket-level rows with different comment columns.

Output: M raw rows (flat, one per comment).
Timeout: 120 seconds.

---

### 6. Group Comments by Ticket
**Type:** Code node

Deduplicates the flat comment rows into one object per ticket. Counts unique `comment_id` values to produce `comment_count`. Strips HTML and boilerplate from text fields via `cleanText()`.

Fields preserved per ticket:

```
ticket_id, url, status, type, priority, subject, description,
ticket_created_at, ticket_updated_at, country, requestor_type,
requestor_name, company_name, customer_platform_uuid,
addendum_platform_uuid, eor_id, eor_name, customer_segmentation,
existing_playroll_client, priority_level, payroll_blocker, tags,
via_from_email, top_level_category, subcategory, severity,
churn_risk, relevant_department, via_channel, satisfaction_score,
comment_count
```

If Metabase returned zero rows (company has no tickets), the node returns a sentinel:
```javascript
{ _skip: true, reason: 'no_metabase_tickets', company_id: '...' }
```

Output: K unique ticket items (or 1 sentinel).

---

### 7. Filter Changed Tickets
**Type:** Code node

This is the change detection step. It compares each Metabase ticket against what is already stored in Supabase.

**Builds a lookup map from step 4 output:**
```javascript
const stored = {};
for (const item of $('Fetch Supabase Existing').all()) {
  if (item.json.ticket_id) {
    stored[item.json.ticket_id] = item.json.ticket_updated_at || null;
  }
}
```

**Filters each ticket — a ticket is included if ANY of these are true:**

| Condition | Meaning |
|-----------|---------|
| `ticket_id` not in `stored` | Brand new ticket, never synced |
| `stored[ticket_id]` is null | Ticket exists in Supabase but has no date stamp |
| `ticket_updated_at` missing in Metabase | Can't compare; include to be safe |
| `metabase.ticket_updated_at > stored.ticket_updated_at` | Ticket was updated in Zendesk since last sync |

**If nothing passes the filter:**
```javascript
{ _skip: true, reason: 'no_changed_tickets', company_id: '...', total_checked: N }
```

Output: changed ticket items (or 1 sentinel).

---

### 8. Has Changes? (IF node)

Routes on whether the output from step 7 is a real ticket or a skip sentinel.

```
condition: $json._skip !== true
```

- **True (real ticket):** proceeds to Map → Aggregate → Upsert
- **False (_skip sentinel):** feeds back directly into Loop Over Companies to advance to the next company

---

### 9. Map to Supabase Schema
**Type:** Code node

Maps each ticket object to the exact column layout of the `support_tickets` table. Key logic:

**UUID validation** — Metabase uses `"-"` as a placeholder for absent UUIDs. The `toUuid()` helper rejects anything that doesn't match the UUID regex, returning `null` instead:
```javascript
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function toUuid(val) {
  if (!val) return null;
  const s = String(val).trim();
  return UUID_RE.test(s) ? s : null;
}
```

**`qa_status` is always set to `'RAW_IMPORT'`** for tickets written by this workflow, distinguishing them from AI-classified rows.

**`classified_at`** is set to `new Date().toISOString()` — the time this sync ran, not the time the ticket was classified by AI.

Full column mapping:

| Supabase column | Source |
|-----------------|--------|
| `ticket_id` | `String(t.ticket_id)` |
| `classified_at` | Current timestamp |
| `ticket_updated_at` | `t.ticket_updated_at` |
| `ticket_created_at` | `t.ticket_created_at` |
| `subject` | `t.subject` |
| `description` | `t.description` |
| `status` | `t.status` |
| `type` | `t.type` |
| `priority` | `t.priority` |
| `priority_level` | `t.priority_level` |
| `ticket_url` | `t.url` |
| `country` | `t.country` |
| `via_channel` | `t.via_channel` |
| `satisfaction_score` | `t.satisfaction_score` |
| `payroll_blocker` | `t.payroll_blocker` |
| `comment_count` | `t.comment_count` |
| `tags` | `t.tags` |
| `customer_platform_uuid` | `toUuid(t.customer_platform_uuid)` |
| `addendum_platform_uuid` | `toUuid(t.addendum_platform_uuid)` |
| `company_name` | `t.company_name` |
| `eor_id` | `t.eor_id` |
| `eor_name` | `t.eor_name` |
| `customer_segmentation` | `t.customer_segmentation` |
| `existing_playroll_client` | `t.existing_playroll_client` |
| `requestor_type` | `t.requestor_type` |
| `requestor_name` | `t.requestor_name` |
| `via_from_email` | `t.via_from_email` |
| `existing_top_level_category` | `t.top_level_category` |
| `existing_subcategory` | `t.subcategory` |
| `existing_severity` | `t.severity` |
| `existing_churn_risk` | `t.churn_risk` |
| `existing_relevant_department` | `t.relevant_department` |
| `qa_status` | `'RAW_IMPORT'` (hardcoded) |

AI classification fields (`primary_category`, `severity_final`, etc.) are left NULL by this workflow. They are populated by the separate AI classification workflow.

---

### 10. Aggregate Company Tickets
**Type:** Code node

Collapses all mapped ticket items for this company into a single item whose `rows` property is the array. This is required because the Supabase REST API expects a JSON array as the POST body, not individual n8n items.

```javascript
return [{ json: { rows: $input.all().map(i => i.json) } }];
```

Output: 1 item `{ rows: [{...ticket...}, {...ticket...}, ...] }`.

---

### 11. Upsert Batch to Supabase
**Type:** HTTP POST — Supabase REST API

Posts all of this company's changed tickets in one call.

```
POST /rest/v1/support_tickets
Content-Type: application/json
Prefer: resolution=merge-duplicates

Body: JSON.stringify($json.rows)
```

`Prefer: resolution=merge-duplicates` tells Supabase's PostgREST layer to use `ON CONFLICT (ticket_id) DO UPDATE SET ...` semantics. Existing rows are updated; new rows are inserted. A successful upsert returns HTTP 201 with an empty body — this is expected and normal.

The output (1 empty item) feeds back into **Loop Over Companies** as the loopback signal to advance to the next company.

---

## Change Detection Summary

A ticket is re-synced only when one of these is true:

1. The ticket has never been stored (no row for this `ticket_id` in Supabase)
2. The row exists but has no `ticket_updated_at` stored
3. Metabase has no `ticket_updated_at` for the ticket (defensive include)
4. Metabase's `ticket_updated_at` is newer than the stored value

Companies where all tickets are unchanged produce zero upsert calls. Only the two read operations (Supabase GET + Metabase POST) run.

---

## Supabase Table: `support_tickets`

Primary key: `ticket_id TEXT`

The table has two groups of classification columns:

- **`existing_*` columns** (e.g. `existing_top_level_category`) — the Zendesk tags as-at the time of sync, written by this workflow
- **AI classification columns** (e.g. `primary_category`, `severity_final`, `churn_risk`) — populated by the separate AI classification workflow; left NULL by this workflow
- **`qa_status`** — `'RAW_IMPORT'` when written here; updated to `'CONFIRMED'` / `'NEEDS_REVIEW'` by the AI workflow

---

## Known Limitations

**Scope of company filter**
Metabase card 961 filters by `customer_platform_uuid`. This only returns tickets explicitly tagged with a company UUID in Zendesk. Tickets associated only via `addendum_platform_uuid` (employee-level contracts) are returned here because the addendum UUID is also included as a separate optional filter on card 961 — but tickets with neither UUID set will not appear in any company's fetch.

**No end-date filter on Metabase**
Card 961 has a `created_at` from-date filter but no to-date filter. This means each company fetch returns all tickets from `2020-01-01` onwards (not just a rolling window). For companies with a large ticket history, this could become slow. Adding a `created_at_end` optional template tag to card 961 would allow quarterly batching in future.

**Single POST per company**
All of a company's changed tickets are sent in one Supabase POST. For companies with hundreds of changed tickets this is fine, but if a company ever exceeds ~5MB of ticket data in one sync, this would hit Supabase's request size limit. A future improvement would re-introduce inner batching only for companies above a threshold.

**`qa_status` is always overwritten to `RAW_IMPORT`**
If a ticket has been AI-classified (has `qa_status = 'CONFIRMED'`) and is then re-synced here because it was updated in Zendesk, its `qa_status` is reset to `RAW_IMPORT`. This is intentional — an update in Zendesk means the ticket should be re-classified. The AI workflow should be re-run after this sync to restore classification on updated tickets.

---

## How to Run

1. Open n8n at `https://n8n.operations.playroll.com`
2. Find workflow **Per-Company Ticket Sync (Change Detection)** (ID: `FHVHWUWC9qpPGc6v`)
3. Click **Execute workflow**
4. Monitor progress — each company takes ~5–10 seconds (Metabase fetch dominates)
5. Check `support_tickets` row count in Supabase when complete

## How to Adjust the Date Window

To only sync tickets created after a specific date, update the `Load Config` node:

- Open the workflow in n8n
- Click **Load Config**
- Change `created_at` from `2020-01-01` to the desired from-date (e.g. `2024-01-01`)
- Save and re-run

Setting a more recent date reduces Metabase response size and speeds up each company iteration.
