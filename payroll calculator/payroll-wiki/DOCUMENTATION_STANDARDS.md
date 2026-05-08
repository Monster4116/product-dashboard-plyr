# Payroll Wiki — Documentation Standards

> **Who this file is for:** Anyone writing or generating documentation in this wiki — including Claude Code agents, internal developers, and the product/ops team. All documentation in `payroll-wiki/` must follow these standards. This file is the single source of truth for documentation rules.

---

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [Audience Architecture](#2-audience-architecture)
3. [File and Naming Conventions](#3-file-and-naming-conventions)
4. [Page Types and Required Templates](#4-page-types-and-required-templates)
   - 4.1 [Data Structure Page](#41-data-structure-page)
   - 4.2 [Concept / Logic Page](#42-concept--logic-page)
   - 4.3 [Lookup / Enum Page](#43-lookup--enum-page)
   - 4.4 [Stub Page](#44-stub-page)
5. [Business Question Flags](#5-business-question-flags)
6. [Section Rules](#6-section-rules)
7. [Cross-Reference Rules](#7-cross-reference-rules)
8. [Table Formatting Rules](#8-table-formatting-rules)
9. [Tone and Writing Style](#9-tone-and-writing-style)
10. [Code and Field References](#10-code-and-field-references)
11. [Diagrams](#11-diagrams)
12. [Index Maintenance](#12-index-maintenance)
13. [Completeness and Status](#13-completeness-and-status)
14. [Source Mapping (Claude Code)](#14-source-mapping-claude-code)
15. [Checklist Before Committing a Page](#15-checklist-before-committing-a-page)

---

## 1. Purpose and Scope

This wiki documents the Playroll payroll calculator — its data structures, business logic, currency handling, and calculation rules. It must serve three audiences at the same time, without making any of them scroll past content that is not relevant to them.

This standards file applies to all `.md` files in the `payroll-wiki/` directory except `00-index.md` (which has its own rules in Section 12).

---

## 2. Audience Architecture

Every page in this wiki is read by three audiences with different goals. The templates in Section 4 are designed so that:

- **Non-technical content always comes before technical content.** A product manager should be able to read the first two sections of any page and understand what the concept is and why it exists, without encountering field tables or code references.
- **Technical content is clearly labelled.** Sections that contain field definitions, source file references, or code are explicitly marked in the template.
- **AI agents get the most structured content.** Table-based definitions and the one-line rule blockquote at the end of logic pages are the highest-signal retrievable content for AI agents.

### Audience-to-Section Mapping

| Section | Primary Audience | Notes |
|---|---|---|
| `## Overview` | All | Plain English. No field names. No backtick references. |
| `## Product Context` | Product / Ops | Why the rule or structure exists. Business impact. Operational implications. |
| `## Where This Appears` | Developers / AI | Which parent records contain this object and under which field name. |
| `## [Object] Structure` | Developers / AI | Field-by-field definitions, nullability, types. |
| `## [Thematic Field Group]` | Developers / AI | Grouped sub-sections of the structure for readability. |
| `## Core Rule` | All | The fundamental governing rule in plain English and table form. |
| `## [Process Steps]` | All | Step-by-step process, written to be followable without developer knowledge. |
| `## [Scenario Sections]` | All | One section per scenario. Starts with plain English, then a table. |
| `## Diagram` | All | Mermaid flowchart. Required when logic has two or more branching decisions. |
| `## Examples` | All | Worked examples. Non-technical readers read the narrative; developers read the field values. |
| `## Exceptions and Edge Cases` | All | Notable departures from the core rule. |
| `## Rollup Behaviour` | Developers / AI | How this object's values feed into parent objects or totals. |
| `## Data Notes` | Developers / AI | Nullable fields, zero-value fields, known data edge cases. |
| `## TypeScript Reference` | Developers | Minimal type definitions and derived value expressions. |
| `## Source Reference` | Developers | File path(s) where this logic or structure is implemented. |
| `## Open Questions` | Product / Ops / Developers | Unresolved business logic gaps awaiting clarification. Present only when gaps exist. |
| `## Related Pages` | All | Navigation table. Always the last section. |

### Section Ordering Principle

Within every page, sections follow this order:

1. Non-technical first (Overview, Product Context)
2. Neutral middle (Core Rule, Process Steps, Scenarios, Diagram, Examples, Edge Cases)
3. Technical last (Structure tables, Rollup Behaviour, Data Notes, TypeScript Reference, Source Reference)
4. Gaps last of all, before navigation (Open Questions)
5. Navigation final (Related Pages)

---

## 3. File and Naming Conventions

### File Names

- Use `kebab-case.md` for all files.
- Use plural nouns for collections and lists: `hourly-employees.md`, not `hourly-employee.md`.
- Use descriptive noun phrases: `employer-contribution-breakdown.md`, not `employer-contribs.md`.
- The file name is the canonical identifier used in all `[[wiki-links]]`. Do not rely on Obsidian frontmatter aliases — the file name must match the link target exactly.

### Page Titles

- The `# H1` heading must be the first line of the file (no content before it, except frontmatter on stub and draft pages).
- Title Case for all `# H1` headings.
- The title should be a noun phrase: `# Employer Contribution Breakdown`, not `# About Employer Contributions`.

### Section Headings

- `## H2` — Title Case. Used for the major sections defined by each page template.
- `### H3` — Sentence case. Used for sub-sections within a major section.
- `#### H4` — Sentence case. Avoid unless unavoidable. Never nest deeper than H4.

### Field and Value References

- JSON and database field names: always in backticks — `fieldName`.
- Enum and type values: always in backticks — `HOURLY`, `STANDARD_CYCLE`.
- Currency codes: always in backticks — `ZAR`, `USD`.

---

## 4. Page Types and Required Templates

Every page belongs to exactly one of four page types. The sections listed for each type are **required** and must appear **in the order shown**.

---

### 4.1 Data Structure Page

**When to use:** The primary content is documenting the fields of a JSON object, database record, or nested data structure.

**Examples:** `calculator-results.md`, `totals-breakdown.md`, `exchange-rates.md`

**Required section order:**

```
# [Object Name]

## Overview
## Product Context
## Where This Appears
## [Object Name] Structure
## [Nested Object Name]         ← one per nested object, if applicable
## [Thematic Field Group]       ← repeat for each logical grouping, if applicable
## Rollup Behaviour             ← only if this object feeds into a parent
## Data Notes
## Source Reference
## Open Questions               ← present only when business question flags exist
## Related Pages
```

**Rules for each section:**

**`## Overview`**
- 2–4 sentences. No field names, no backtick references, no wiki-links to sub-pages.
- Sentence 1: what this object is and what it contains, in plain English.
- Sentence 2: where it appears (name the parent record in plain text, not a wiki-link).
- Sentence 3–4 (optional): what this page covers and what is deferred to other pages.

**`## Product Context`**
- 2–5 sentences. Plain English only — no field names or backtick references.
- Explain why this data structure exists from a business perspective. What does it enable for a client, employer, or operator? What would be unclear without it?
- If not yet known: write "Product context for this record has not yet been documented." Do not omit the section.

**`## Where This Appears`**
- Table: Field | Parent Record | Notes
- List every field name on every parent record that contains this object.
- Use a `[[wiki-link]]` in the Parent Record column.

**`## [Object Name] Structure`**
- Table: Field | Description | Nullable?
- Optional additional columns: Type, Example Value — include when they add clarity.
- Every field with its own wiki page must include a `[[wiki-link]]` in the Description cell.
- Descriptions must be complete sentences.
- Nullable? values: `No`, `Yes`, or `Sometimes — [condition]`.
- If a field's business purpose is unclear, append `**[❓ BQ-N]**` to its Description cell and add the question to `## Open Questions`. See Section 5.

**`## [Nested Object Name]`**
- One `## H2` per nested object.
- One-sentence intro describing what the nested object represents.
- Field table in the same column format.
- If a dedicated page exists: "Detailed logic is documented in `[[page-name]]`."

**`## [Thematic Field Group]`**
- Use when grouping related fields improves readability.
- 1–2 sentence intro explaining what unifies the group.
- Table of fields in that group only — do not redefine fields already in the main structure table.

**`## Rollup Behaviour`**
- Required only when values in this object roll up into a parent object or totals field.
- Table: Source Field | Rolls Up To
- Use a `[[wiki-link]]` in the "Rolls Up To" column.

**`## Data Notes`**
- Table: Observation | Note
- Required entries: every nullable field, every field that can be zero unexpectedly, and every field with non-obvious format or behaviour.
- Note column: complete sentences.

**`## Source Reference`**
- Table: File Path | Purpose
- File paths relative to the repository root.
- Purpose: what the file contributes to this wiki page.
- If unknown: single row — `Unknown` | `Source file has not yet been identified.`
- File paths only — no function names, class names, or line numbers.

**`## Open Questions`**
- Present only when at least one business question flag (`**[❓ BQ-N]**`) exists on this page.
- Table: ID | Question | Context | Status
- See Section 5 for full rules.

**`## Related Pages`**
- Table: Page | Purpose
- Include every page linked from this page, plus pages a reader would logically visit next.
- Do not include `00-index.md`.
- Purpose column: complete the sentence "This page…" in 3–10 words.

---

### 4.2 Concept / Logic Page

**When to use:** The primary content is a business rule, calculation process, or decision logic.

**Examples:** `currency-conversion-fees.md`, `leave-adjustment.md`, `salary-payment-options.md`

**Required section order:**

```
# [Concept Name]

## Overview
## Product Context
## Core Rule
## [Process Steps]              ← named after the process
## [Scenario Sections]          ← one per major scenario or case
## Diagram                      ← required when branching logic exists
## Examples
## Exceptions and Edge Cases
## Data Notes
## TypeScript Reference         ← only if a direct code implementation exists
## Source Reference
## Open Questions               ← present only when business question flags exist

> [One-line rule blockquote]

## Related Pages
```

**Rules for each section:**

**`## Overview`**
- 3–5 sentences. No field names, no backtick references.
- Sentence 1: what this concept is in plain English.
- Sentence 2: the one-line governing rule — use a blockquote `> Rule text` if concise.
- Sentence 3–5: scope of this page and links to related pages for out-of-scope detail.

**`## Product Context`**
- Required. Cannot be omitted on Concept / Logic pages.
- Explain the business reason this rule exists. Why does Playroll do it this way? What problem does it solve for the client or operator? What would go wrong without this rule?
- Include operational implications: how this affects invoice amounts, what a client might notice, what an ops reviewer needs to know.
- 2–6 sentences. Plain English only.
- If not yet known: "Product context for this logic has not yet been documented. Review with the product team." Do not omit the section.
- If a specific business reason is unclear from source code, add a `**[❓ BQ-N]**` marker and add the question to `## Open Questions`. See Section 5.

**`## Core Rule`**
- Table: Rule | Explanation
- Every rule must be independently understandable without reading the rest of the page.
- No forward references without a `[[wiki-link]]`.

**`## [Process Steps]`**
- Named after the process (e.g. "Calculation Steps", "High-Level Process").
- Numbered table: Step | Description
- Each step is a single, atomic action in plain English.

**`## [Scenario Sections]`**
- One `## H2` per scenario (e.g. "Local Currency Employees", "Foreign Salary Employees").
- 1–2 plain-English sentences on when this scenario applies.
- Table of components and their treatment.
- If the scenario has a distinct flow: sub-table — Step | Description.

**`## Diagram`**
- Required when the logic has two or more branching decisions.
- Mermaid `flowchart TD`.
- Every decision node uses diamond syntax: `{Decision text?}`.
- Every branch labelled: `-->|Yes|` / `-->|No|` or named outcomes.
- Must be consistent with the prose. If they conflict, the prose is authoritative.

**`## Examples`**
- At least one per page.
- Begin with a 1–2 sentence plain-English business scenario.
- Input/output table: Field | Value (include currency codes and units).
- Show the full calculation chain, not just the result.

**`## Exceptions and Edge Cases`**
- Table: Scenario | Behaviour | Notes
- If no exceptions exist: "No exceptions to the core rule have been identified." Do not omit.

**`## Data Notes`**
- Table: Observation | Note
- Nullable fields, zero-value fields, fields that behave differently from what the rule implies.

**`## TypeScript Reference`**
- Optional. Include only when a code reference would help a developer verify the logic.
- Minimal type definition + function signature or expression only.

**`## Source Reference`**
- Same rules as Section 4.1.

**`## Open Questions`**
- Present only when business question flags exist on this page.
- See Section 5 for full rules.

**One-line rule blockquote**
- Placed immediately after `## Open Questions` (or after `## Source Reference` if no open questions) and before `## Related Pages`.
- Format: `> [One-sentence plain-English summary of the governing rule for this page.]`
- This is the highest-signal statement for AI agents and the executive summary for product readers.

**`## Related Pages`**
- Same rules as Section 4.1.

---

### 4.3 Lookup / Enum Page

**When to use:** The primary content is a fixed set of values — enum types, status codes, record types, or classification codes.

**Examples:** `employee-status.md`, `invoice-record-type.md`

**Required section order:**

```
# [Enum / Lookup Name]

## Overview
## Product Context
## Values
## Behaviour Notes
## Source Reference
## Open Questions               ← present only when business question flags exist
## Related Pages
```

**Rules for each section:**

**`## Overview`**
- 2–3 sentences.
- Sentence 1: what this enum represents and where it is used, in plain English.
- Sentence 2: the field name (in backticks) that stores this value, with a `[[wiki-link]]` to the parent record.
- Sentence 3 (optional): notable constraints on how the value is set.

**`## Product Context`**
- 2–4 sentences.
- What does each category of value mean operationally? Why does this classification exist? What decision does it support?
- If trivial (e.g. simple active/inactive), one sentence is sufficient.

**`## Values`**
- Table: Value | Label | Description | When Used
- Value: enum code in backticks.
- Label: human-readable name in Title Case.
- Description: complete sentence explaining what the value means.
- When Used: complete sentence explaining when this value is assigned.
- No blank cells. Use `—` if genuinely not applicable.
- If a value's purpose is unclear, append `**[❓ BQ-N]**` to the Description cell and add to `## Open Questions`.

**`## Behaviour Notes`**
- Table: Scenario | Behaviour
- How does the system behave differently depending on the value?
- If identical for all values: "System behaviour does not differ based on this value." Do not omit.

**`## Source Reference`**
- Same rules as Section 4.1.

**`## Open Questions`**
- Present only when business question flags exist.
- See Section 5.

**`## Related Pages`**
- Same rules as Section 4.1.

---

### 4.4 Stub Page

**When to use:** A page has been referenced but its content has not been written. Stubs prevent broken wiki-links.

**Required structure:**

```markdown
---
status: stub
---

# [Page Title]

> 🚧 This page is a stub. Content has not yet been written.

## Overview

[1–2 specific sentences describing what this page will cover.]

## Related Pages

| Page | Purpose |
|---|---|
| [[page-that-references-this]] | [Why it links here, 3–10 words.] |
```

**Rules:**
- `status: stub` frontmatter is required.
- `## Overview` must be specific, not generic.
- List every page that already links to this stub.
- A stub must be promoted to a full page type before it can be cited in another page's `## Core Rule` or `## Overview`.

---

## 5. Business Question Flags

Business question flags are structured markers for gaps where the documentation cannot determine the business reason or intent from source code or existing documentation alone. They ensure gaps are visible, tracked, and reviewable rather than silently omitted.

There are two components on every page: an **inline marker** at the point of the gap, and an aggregated **`## Open Questions` section** at the bottom of the page. A third component, the **central tracker** (`open-questions.md`), aggregates all open questions across the entire wiki.

---

### 5.1 Inline Marker

Place an inline marker immediately after the sentence, field description, or table cell where the gap exists.

**Format:** `**[❓ BQ-N]**`

Where `N` is a sequential integer starting at 1 for each page (e.g. `BQ-1`, `BQ-2`). The numbering is per-page, not global. The central tracker provides the global context.

**Placement by content type:**

| Content Type | Placement |
|---|---|
| Prose sentence | After the period of the relevant sentence: `...does not apply to peg amounts. **[❓ BQ-1]**` |
| Table cell — Description column | At the end of the cell content: `Pegged salary type. **[❓ BQ-1]**` |
| Table cell — When Used column (Enum page) | At the end of the cell content. |
| `## Product Context` section | At the end of the sentence or paragraph where the unknown lies. |

---

### 5.2 The `## Open Questions` Section

The `## Open Questions` section aggregates all inline markers on a page into a single reviewable table. It is present only when at least one `**[❓ BQ-N]**` marker exists on the page.

**Placement:** Immediately before the one-line rule blockquote (on Concept / Logic pages) or immediately before `## Related Pages` (on all other page types).

**Table format:**

```markdown
## Open Questions

| ID | Question | Context | Status |
|---|---|---|---|
| BQ-1 | [The specific question that needs answering.] | [Which section or field this relates to, and what is already known.] | Unanswered |
```

**Column rules:**

| Column | Rule |
|---|---|
| ID | Match the inline marker exactly: `BQ-1`, `BQ-2`, etc. |
| Question | A single, specific, answerable question. Not "what does this mean?" but "Why does the conversion fee not apply to salary peg reference amounts — is it because Playroll never holds funds in the peg currency?" |
| Context | State the section or field where the marker appears, and briefly describe what the code or existing documentation says. This gives reviewers enough context to answer without re-reading the whole page. |
| Status | `Unanswered`, `Answered — Pending Update`, or `Closed`. |

**Status definitions:**

| Status | Meaning |
|---|---|
| `Unanswered` | The question has been raised. No answer has been received. |
| `Answered — Pending Update` | An answer has been received and recorded in the central tracker. The page content has not yet been updated to incorporate it. |
| `Closed` | The answer has been incorporated into the page. The inline marker and this row have been removed. |

---

### 5.3 The Central Tracker (`open-questions.md`)

`open-questions.md` is a special file in `payroll-wiki/` that aggregates every open business question from across the wiki. It is the single place a product reviewer or team lead can go to see all unresolved gaps without opening every page.

**Location:** `payroll-wiki/open-questions.md`

**Structure:**

```markdown
# Open Business Questions

This file tracks all unresolved business logic gaps across the payroll wiki.
Update this file whenever a business question flag is added, answered, or closed on any wiki page.

| Page | ID | Question | Auto-Generated? | Status | Answer Summary |
|---|---|---|---|---|---|
| [[page-name]] | BQ-1 | [Question text] | Yes / No | Unanswered | — |
```

**Column rules:**

| Column | Rule |
|---|---|
| Page | `[[wiki-link]]` to the page where the question lives. |
| ID | The local ID from that page: `BQ-1`, `BQ-2`, etc. |
| Question | Verbatim copy of the question from the page's `## Open Questions` table. |
| Auto-Generated? | `Yes` if generated by Claude Code from source code. `No` if raised by a human writer or reviewer. |
| Status | Matches the status on the page: `Unanswered`, `Answered — Pending Update`, or `Closed`. |
| Answer Summary | `—` when unanswered. A 1–2 sentence summary of the answer when resolved. |

**Rules:**
- `open-questions.md` is listed in `00-index.md` as a meta-document with the description: "Tracks all unresolved business logic gaps across the wiki."
- When a question is added to a page, a matching row must be added to `open-questions.md`.
- When a question is answered, the Answer Summary is added and the Status is updated in both places.
- Closed questions remain in `open-questions.md` as a historical record. They are never deleted.
- The central tracker is not the source of truth for page content — it is a navigation aid. The page itself always takes precedence.

---

### 5.4 Closing a Business Question

When an answer is received (from a product owner, engineer, or other source), follow this process:

1. Record the answer in `open-questions.md`: add the Answer Summary, change Status to `Answered — Pending Update`.
2. Update the relevant wiki page: incorporate the answer into the correct section (`## Product Context`, `## Core Rule`, `## Data Notes`, etc.).
3. Remove the inline `**[❓ BQ-N]**` marker from the page.
4. Remove the row from the page's `## Open Questions` table.
5. If `## Open Questions` is now empty, remove the section entirely.
6. Update `open-questions.md`: change Status to `Closed`.

---

### 5.5 Auto-Generated Flags (Claude Code)

When Claude Code reads source code to generate or update a wiki page, it must automatically generate a business question flag for each of the following trigger patterns. For each trigger, raise a `**[❓ BQ-N]**` marker in the relevant section and add the corresponding question to `## Open Questions` and `open-questions.md`.

**Trigger 1: Hardcoded number or threshold**

A numeric literal that appears to represent a business rule — not the result of a calculation — and has no comment explaining its business origin.

| Trigger pattern | Example |
|---|---|
| Named constant with a business-looking value | `const CUT_OFF_DAY = 10` |
| Inline numeric literal in a conditional | `if (day > 15)` |
| Fee percentage or rate with no JSDoc | `TRANSACTION_FEE_RATE = 0.015` |
| Day count, period count, or entitlement limit | `MAX_LEAVE_DAYS = 5` |

Question template: *"The value `[value]` appears as a fixed threshold in `[file path]`. What is the business rule that determines this value? Is it configurable, territory-specific, or a fixed product decision?"*

---

**Trigger 2: Uncommented conditional logic**

An `if`/`else`, ternary, guard clause, or early return that:
- Takes a distinct path with business consequences
- Has no JSDoc, no inline comment on the same or preceding line
- Is not self-explanatory from variable names alone

| Trigger pattern | Example |
|---|---|
| Early return based on employee type | `if (isHourlyEmployee) return zeroAdjustment` |
| Branch based on a flag | `if (apportionOtherCosts) { ... }` |
| Condition on a date or threshold | `if (startDate > cutOffDate) { ... }` |

Question template: *"The source code in `[file path]` contains a condition that [plain-English description of what the condition checks and what outcome it produces]. What is the business reason for this behaviour? Is this a product rule, a statutory requirement, or a configuration-driven decision?"*

---

**Trigger 3: Undescribed enum value**

An enum value that has no JSDoc comment in the source file and no corresponding entry (or only a stub entry) in the wiki.

| Trigger pattern | Example |
|---|---|
| Enum value with no comment | `SIGNED_ARR` with no JSDoc |
| Enum value whose name is ambiguous | `ACTIVE_ARR` — "active" and "ARR" could mean several things |

Question template: *"The enum value `[VALUE]` in `[file path]` has no description in the source code or existing wiki documentation. What does this value represent? Under what conditions is it assigned, and what behaviour does it trigger?"*

---

**Trigger 4: Developer TODO, FIXME, HACK, or XXX comment**

Any source comment beginning with `TODO:`, `FIXME:`, `HACK:`, or `XXX:`.

| Trigger pattern | Example |
|---|---|
| Incomplete logic | `// TODO: handle the case where peggedSalaryType is null` |
| Known issue | `// FIXME: this double-counts leave days when isAggregated is true` |
| Workaround | `// HACK: force billing currency to match local when no exchange rate is set` |

Question template: *"The source code in `[file path]` contains a `[TODO/FIXME/HACK]` comment: '[verbatim comment text]'. What is the current behaviour at this point in the code? Is this a known gap, a temporary workaround, or an accepted limitation? Should this be reflected in the product documentation?"*

---

**When NOT to generate a flag:**

| Situation | Rule |
|---|---|
| Logic is self-explanatory from variable/function names | Do not flag. |
| A JSDoc or inline comment explains the business reason | Do not flag. |
| The wiki already documents the answer | Do not flag. |
| The numeric value is clearly a calculation result, not a threshold | Do not flag (e.g. `const daysInYear = 365`). |

---

## 6. Section Rules

### Sections That Are Always Required

| Section | Rule |
|---|---|
| `# H1 Title` | First line of the file (after frontmatter on stub/draft pages). |
| `## Overview` | Always the first section after the title. |
| `## Related Pages` | Always the last section. |

### Sections That Are Always Forbidden

| Forbidden Element | Reason |
|---|---|
| Author notes or editorial comments | Remove before committing. E.g. "For this page, I would only add..." |
| Time-relative statements | E.g. "as of today", "currently", "we are on the 7th". These become wrong immediately. |
| First-person pronouns | No "we", "our", "I", "my". Use "Playroll" or passive voice. |
| Aspirational descriptions | Document what exists now. Use a stub for planned content. |
| Inline TODO comments | Use a stub page or `status: draft` frontmatter instead. |
| Raw editorial notes at page end | E.g. "Note to self: cross-reference this with the parent page." |

### The `---` Horizontal Rule

Use `---` between sections only on long pages where the visual break aids readability. Do not insert `---` between every section.

---

## 7. Cross-Reference Rules

### When to Link

| Situation | Rule |
|---|---|
| First mention of a concept with its own page | Link using `[[page-name]]`. |
| Subsequent mentions of the same concept | Do not repeat the link. |
| A field name belonging to a documented object | Reference the page: "`fieldName`. See [[object-page]]." |
| A page that does not exist yet | Link to it and create a stub (Section 4.4). |

### Link Format

- Use `[[kebab-case-file-name]]` without a display text alias unless grammar requires one.
- When an alias is necessary: `[[page-name|display text]]`. Use sparingly.
- Never use bare URLs for internal wiki pages.
- Source file references use plain file paths in the `## Source Reference` table — not wiki-links.

### The `## Related Pages` Table

Every page must end with:

```markdown
## Related Pages

| Page | Purpose |
|---|---|
| [[page-name]] | [3–10 words completing "This page..."] |
```

- Include all pages linked from this page.
- Include pages that link to this page if a reader would logically navigate there.
- Do not include `00-index.md` or `open-questions.md`.

### Avoiding Circular Definitions

If two pages reference each other, each must be independently readable. Do not substitute "see [[other-page]]" for a brief inline explanation — the inline explanation must always exist.

---

## 8. Table Formatting Rules

### When to Use Tables

Use a table when:
- Documenting fields with consistent attributes.
- Documenting rules with a consistent structure.
- Showing mappings between two sets of values.
- Presenting step-by-step processes.

Do not use tables for:
- Prose that flows naturally as sentences.
- Lists of two items or fewer.

### Standard Column Sets

| Table Type | Columns |
|---|---|
| Field definition | `Field \| Description \| Nullable?` |
| Rule | `Rule \| Explanation` |
| Step | `Step \| Description` |
| Related pages | `Page \| Purpose` |
| Data notes | `Observation \| Note` |
| Enum values | `Value \| Label \| Description \| When Used` |
| Source reference | `File Path \| Purpose` |
| Rollup | `Source Field \| Rolls Up To` |
| Open questions | `ID \| Question \| Context \| Status` |
| Central tracker | `Page \| ID \| Question \| Auto-Generated? \| Status \| Answer Summary` |

### Column Alignment

- Text columns: left-aligned (default).
- Numeric and boolean columns: right-aligned — `| ---: |`.
- "Nullable?" column values: `Yes`, `No`, or `Sometimes — [condition]`.

### Cell Content Rules

- Description and note cells must be complete sentences.
- Field names in cells must be in backticks.
- Wiki-links: `[[page-name]]` with no additional formatting.
- Empty or not-applicable cells: `—` (em dash). Never leave a cell blank.
- Boolean cells: `Yes` / `No`.

---

## 9. Tone and Writing Style

### Voice and Tense

| Rule | Correct | Incorrect |
|---|---|---|
| Present tense | "The field contains..." | "The field will contain..." |
| Third person | "Playroll applies a fee..." | "We apply a fee..." |
| Active voice (preferred) | "The calculator multiplies..." | "The rate is multiplied..." |
| Passive voice (acceptable) | "The rate is stored as..." | — |

### Precision Rules

| Rule | Guidance |
|---|---|
| Specific over general | Name the exact field — `grossSalary` — not "the salary field". |
| Explicit over implicit | State rules directly. Do not hint. |
| Concrete over abstract | Use a worked example when a rule is hard to follow in the abstract. |
| No unqualified hedging | Do not write "usually" or "typically" unless the exception is documented in the same section. |

### Plain English for Non-Technical Sections

`## Overview`, `## Product Context`, and the narrative in `## Examples` must be written so a non-technical reader can follow them without knowing what a DTO or Prisma schema is.

### One-Line Rule (Concept / Logic Pages Only)

Immediately before `## Related Pages` on every Concept / Logic page:

```markdown
> [One-sentence plain-English summary of the governing rule for this page.]
```

---

## 10. Code and Field References

### Field Names

Always use backtick inline code for JSON field names, enum values, currency codes, and calculation period values.

### TypeScript Reference Section

When included:
- Minimal type definition showing only the relevant fields.
- Function signature or expression showing how the value is derived.
- Do not include full implementations.

### Source Reference Section

- Table: File Path | Purpose
- File paths relative to the repository root.
- One row per relevant file.
- No function names, class names, or line numbers — file paths only.
- If unknown: `Unknown` | `Source file has not yet been identified.`

### Formulas

Single-row table:

```markdown
| Calculation |
|---|
| `result = fieldA * fieldB - fieldC` |
```

Use field names from the documented structure, not generic variables.

---

## 11. Diagrams

### When to Include

A Mermaid diagram is **required** on any Concept / Logic page where:
- The logic has two or more branching decision points.
- The process involves conditional paths based on a field value.

### Diagram Rules

- Use `flowchart TD` for process flows with decisions.
- Use `flowchart LR` for simple two-column mappings only.
- Every decision node: diamond syntax `{Decision text?}`.
- Every branch labelled: `-->|Yes|` / `-->|No|` or named outcomes.
- Diagram must match the prose. If they conflict, the prose is authoritative.
- Diagrams supplement prose; they do not replace it.

### Placement

After scenario sections and before `## Examples`.

---

## 12. Index Maintenance

`00-index.md` is the entry point for the wiki.

### Rules for `00-index.md`

- Every page in `payroll-wiki/` (except `DOCUMENTATION_STANDARDS.md`) must have an entry, including `open-questions.md`.
- Stub pages: `- [[page-name]] — 🚧 Stub. [One-sentence description of planned content.]`
- Complete pages: `- [[page-name]] — [One-sentence description ending with a period.]`
- `open-questions.md` entry: `- [[open-questions]] — Tracks all unresolved business logic gaps across the wiki.`
- Groups pages into thematic sections. New pages go into the most relevant section.
- No emoji or metadata beyond the `🚧` stub marker.

### When to Update

Update `00-index.md` when:
- A new page is created.
- A page is renamed.
- A stub is promoted to a complete page (remove `🚧`).
- A page's scope changes significantly.

---

## 13. Completeness and Status

### Page Status

| Status | Definition | How to Mark |
|---|---|---|
| Stub | Placeholder exists, no content written. | `status: stub` frontmatter |
| Draft | Content written but not yet reviewed. | `status: draft` frontmatter |
| Complete | Content written and reviewed. | No frontmatter (absence = complete). |

A page with open business question flags may still be marked complete — the flags themselves signal the gaps. However, if `## Product Context` contains only the "not yet documented" placeholder sentence, the page must remain `status: draft`.

Only complete pages may be cited as definitive sources in another page's `## Core Rule` or `## Overview` sections.

### Minimum Content for a Complete Page

- [ ] Page type identified; all required sections present in order.
- [ ] `## Overview` is the first section; `## Related Pages` is the last.
- [ ] `## Product Context` is present and substantive (not a placeholder sentence).
- [ ] `## Source Reference` is present (unknown entry acceptable).
- [ ] Every field in a Data Structure page is documented.
- [ ] Every `[[wiki-link]]` resolves to an existing file.
- [ ] `## Data Notes` addresses all known nullable and zero-value fields.
- [ ] No author notes, TODOs, time-relative statements, or first-person pronouns remain.
- [ ] The page is listed in `00-index.md`.
- [ ] Every `**[❓ BQ-N]**` marker has a matching row in `## Open Questions` and in `open-questions.md`.

---

## 14. Source Mapping (Claude Code)

### Repository File Type Mapping

| Source File Pattern | Maps To |
|---|---|
| `*.service.ts` | Concept / Logic page (calculation rules and process steps) |
| `*.types.ts` / `*.dto.ts` | Data Structure page (field definitions) |
| `schema.prisma` | Data Structure page field definitions |
| `*enum*.ts` / `*.enum.ts` | Lookup / Enum page |
| `*.spec.ts` / `*.test.ts` | `## Examples` and `## Exceptions and Edge Cases` |
| `*.fixture.ts` | Worked examples in `## Examples` |
| JSDoc comments | `## Overview` prose and `## Product Context` where present |

### Discovery Instructions for Claude Code

1. **Read `DOCUMENTATION_STANDARDS.md` first.** Do not begin writing a wiki page before reading this file.
2. **Identify the page type** before writing.
3. **Check for an existing page.** Read it before writing. Preserve accurate content; replace only what source material directly contradicts.
4. **Map source material to page sections:**

| Source Content | Target Section |
|---|---|
| Interface / type fields | `## [Object Name] Structure` |
| Function logic, conditionals, business rules | `## Core Rule` and `## [Process Steps]` |
| Enum values | `## Values` |
| Test cases and fixtures | `## Examples` |
| JSDoc / inline comments | `## Overview` prose |
| Edge case guards, try/catch | `## Exceptions and Edge Cases` |
| Source file path | `## Source Reference` |

5. **Apply business question auto-triggers** (see Section 5.5). Generate a `**[❓ BQ-N]**` marker, add to `## Open Questions`, and add to `open-questions.md` for each trigger found.
6. **Preserve existing wiki-links.** Do not remove a `[[wiki-link]]` unless the relationship is genuinely no longer relevant.
7. **Create stubs for new references.** If source material references a concept with no wiki page, create a stub and add it to `00-index.md`.
8. **Update `00-index.md`** after creating or updating any page.
9. **Do not document implementation internals.** Private variable names and non-observable implementation details must not appear in wiki pages.

### Handling Ambiguity in Source Code

| Situation | Rule |
|---|---|
| Field purpose unclear | Document observed values only. Add to Data Notes: "Purpose requires clarification from the engineering team." Generate `**[❓ BQ-N]**`. |
| Source contradicts existing wiki | Note the discrepancy in `## Data Notes`. Do not silently overwrite. Generate `**[❓ BQ-N]**`. |
| Field present but never populated | Mark nullable. Add to Data Notes: "Field exists structurally but has not been observed with a non-null value." |
| Enum value undescribed | List all observed values. Note "Additional values may exist." Generate `**[❓ BQ-N]**` per Trigger 3. |
| `## Product Context` cannot be determined | Write the placeholder sentence. Generate `**[❓ BQ-N]**` in `## Product Context`. |

---

## 15. Checklist Before Committing a Page

### Structure

- [ ] Page type identified: Data Structure / Concept Logic / Lookup Enum / Stub.
- [ ] All required sections for the page type are present and in the correct order.
- [ ] `## Overview` is the first section after the title.
- [ ] `## Product Context` is present and substantive.
- [ ] `## Source Reference` is present.
- [ ] `## Open Questions` is present if and only if inline markers exist on the page.
- [ ] `## Related Pages` is the last section.

### Content

- [ ] No author notes, editorial comments, or inline TODOs remain.
- [ ] No time-relative statements.
- [ ] No first-person pronouns.
- [ ] All field names are in backticks.
- [ ] All enum and type values are in backticks.
- [ ] `## Overview` and `## Product Context` contain no field names or backtick references.
- [ ] Concept / Logic pages end with a one-line rule blockquote before `## Related Pages`.

### Business Question Flags

- [ ] Every `**[❓ BQ-N]**` inline marker has a matching row in `## Open Questions`.
- [ ] Every row in `## Open Questions` has a matching row in `open-questions.md`.
- [ ] IDs are sequential and match between the inline marker, the page table, and the central tracker.
- [ ] If `## Open Questions` is empty (all closed), the section has been removed.

### Cross-References

- [ ] Every `[[wiki-link]]` resolves to an existing file.
- [ ] Any link to a missing page has a corresponding stub.
- [ ] `## Related Pages` table is populated.

### Tables

- [ ] All tables have header rows.
- [ ] All Description, Note, and Purpose cells contain complete sentences.
- [ ] No blank cells (`—` used where not applicable).

### Index

- [ ] The page appears in `00-index.md` with a one-sentence description.
- [ ] If the page was a stub, the `🚧` prefix has been removed.
- [ ] If new business question flags were added, `open-questions.md` has been updated.
