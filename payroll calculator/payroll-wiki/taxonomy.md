# Payroll Documentation Taxonomy

## Overview

This page defines the canonical vocabulary used across the payroll wiki. It exists to keep business wording, code-facing identifiers, and search terms aligned so documentation updates stay consistent and easy to find. It also provides the structure needed to build and maintain a glossary from the same source material.

**Search Tags:** `taxonomy`, `glossary`, `controlled vocabulary`, `search tags`, `aliases`, `canonical terms`

## Product Context

Payroll documentation becomes unreliable when the same concept is described with different names across pages, source files, and operational discussions. A shared taxonomy reduces that drift by defining the preferred business term, the known aliases, and the code anchors that represent the same concept in implementation. This makes it easier to document the correct issue, route open questions to the right owner, and retrieve all related material during product, engineering, and operations reviews.

## What This Taxonomy Is For

| Use Case | How the taxonomy helps |
|---|---|
| Wiki page creation | Gives the writer a canonical term, alias set, and code anchors before drafting. |
| Repo search | Expands a search from one phrase into the most useful business and code variants. |
| Open question triage | Helps identify which concept area is unclear and who should answer it. |
| Glossary building | Provides a reusable concept record that can be turned into glossary entries later. |
| Cross-page consistency | Keeps headings, examples, and link text aligned across related pages. |

## Taxonomy Record Schema

Every concept in the taxonomy should be documented using the following fields.

| Field | Required? | Purpose |
|---|---|---|
| Canonical Term | Yes | Preferred business phrase used in headings and primary prose. |
| Category | Yes | Concept family such as salary setup, currency, timing, or contributions. |
| Definition | Yes | Plain-English explanation of what the concept means. |
| Aliases | Yes | Searchable alternate wording, punctuation variants, and operational shorthand. |
| Code Anchors | Yes | Field names, enum values, or identifiers used in the codebase. |
| Business Impact | Yes | What this concept changes in payroll, billing, compliance, or operations. |
| Scope | Yes | Whether the rule is global, territory-specific, client-specific, or legacy. |
| Owner | Yes | Team or role most likely to answer unresolved business questions. |
| Related Pages | Yes | Wiki pages where the concept is materially explained or applied. |
| Status | Yes | `confirmed`, `needs review`, `legacy`, or `draft`. |
| Notes | No | Clarifications, common confusion points, or migration notes. |

## Core Category Definitions

| Category | What belongs here | Typical questions |
|---|---|---|
| Salary Setup | How salary is configured, valued, and paid. | Is the employee local, foreign-paid, or pegged? |
| Currency and FX | Currency roles, exchange rates, and conversion logic. | Which currency is local, paid, pegged, or billed? |
| Fees and Billing | Conversion fees, payroll fees, and invoice-only items. | Which amounts carry a fee and why? |
| Payroll Timing | Standard cycle, out-of-cycle, cut-off dates, and pay period rules. | When is a change included or deferred? |
| Contributions and Deductions | Employer contributions, employee contributions, taxes, and benefits. | Which amounts affect invoice totals and statutory deductions? |
| Termination | Final-pay concepts such as notice, severance, and leave payout. | What gets paid on termination and in which currency? |
| Employee Classification | Statuses, salary basis, and employee-specific calculation paths. | Which rule path applies to this employee? |
| Data Structures | Calculator records, nested objects, and context payloads. | Where is the value stored and how is it represented? |

## Seed Taxonomy

The following concepts provide the initial taxonomy baseline for this repo.

| Canonical Term | Category | Definition | Aliases | Code Anchors | Business Impact | Scope | Owner | Related Pages | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| salary peg | Salary Setup | A salary arrangement where a foreign reference currency is used to value or adjust a salary while payment remains local. | `salary-peg`; `pegged salary`; `salary peg direct`; `salary peg via allowance` | `peggedSalaryType`; `peggedSalaryCurrencyCode`; `peggedSalaryAmount`; `DIRECT`; `ALLOWANCE` | Changes how the local salary value is derived and when conversion fees do or do not apply. | Territory-specific for direct peg; broader for allowance-based peg. | Product; Payroll Ops; Tax Analytics | [[salary-payment-options]]; [[exchange-rates]]; [[currency-conversion-fees]]; [[employee-allowances]] | confirmed | Most common confusion point is treating peg currency as the paid currency. |
| foreign salary | Salary Setup | A salary arrangement where the employee is actually paid in a currency other than the local employment currency. | `foreign-currency salary`; `foreign currency`; `paid in foreign currency` | `foreignSalaryCurrencyCode`; `foreignSalaryAmount`; `foreignToLocalExchangeRate` | Changes the payment currency, payroll conversion path, and component-level fee treatment. | Global concept with territory-specific payroll consequences. | Product; Payroll Ops | [[salary-payment-options]]; [[exchange-rates]]; [[currency-conversion-fees]] | confirmed | Should be kept distinct from salary peg in all prose. |
| local currency | Currency and FX | The employee territory currency used for payroll, tax, and statutory calculations. | `payroll currency`; `territory currency`; `employment currency` | `localCurrencyCode` | Determines the base payroll calculation currency and many statutory payment paths. | Global | Payroll Ops; Product | [[exchange-rates]]; [[totals-breakdown]]; [[currency-conversion-fees]] | confirmed | Often confused with billing currency when no FX conversion occurs. |
| billing currency | Currency and FX | The currency used to invoice the client. | `invoice currency`; `client billing currency` | `billingCurrencyCode`; `localToBillingExchangeRate`; `billingToLocalExchangeRate` | Determines the final client-facing representation of invoice-bearing amounts. | Global | Finance; Product | [[exchange-rates]]; [[totals-breakdown]]; [[currency-conversion-fees]] | confirmed | Can differ from both local currency and salary payment currency. |
| conversion fee | Fees and Billing | A fee applied when Playroll pays or funds an amount in one currency and bills the client in a different currency. | `currency conversion fee`; `transaction fee` | `invoiceConversionFeePercentage`; `totalExcludingPlayrollFee` | Affects billing totals and client invoice amounts. | Global billing rule with possible arrangement-specific nuance. | Finance; Product | [[currency-conversion-fees]]; [[transaction-fee-calculation]]; [[exchange-rates]] | confirmed | The fee is embedded in billing totals rather than stored as a separate line item. |
| out-of-cycle | Payroll Timing | A change or calculation processed outside the standard payroll cycle. | `out of cycle`; `off-cycle` | `OUT_OF_CYCLE` | Changes timing, review expectations, and when adjustments appear on payroll or invoices. | Global concept with territory-specific operational rules. | Payroll Ops; Product | [[out-of-cycle]]; [[salary-payment-options]]; [[invoice-record-type]] | needs review | The full rule set is not yet fully documented in the wiki. |
| salary basis | Employee Classification | The classification that determines whether an employee follows a monthly or hourly payroll path. | `monthly vs hourly`; `pay basis` | `salaryBasis`; `MONTHLY`; `HOURLY` | Determines which calculation path and input set apply to the employee. | Global | Product; Payroll Ops | [[salary-basis]]; [[hourly-employee]]; [[employee-data]] | needs review | Still a stub page in the current wiki. |
| employee allowance | Contributions and Deductions | An additional employee-level amount that can contribute to totals and may also support peg-based salary adjustments. | `allowance`; `other allowance`; `salary allowance` | `otherAllowances` | Affects salary totals and may change how a peg arrangement is implemented. | Global with country-specific usage patterns. | Payroll Ops; Product | [[employee-allowances]]; [[employee-data]]; [[totals-breakdown]]; [[salary-payment-options]] | needs review | Allowance types and semantics still need fuller documentation. |
| calculator result | Data Structures | The root calculation output record generated for one employee for one invoice period or pay period. | `invoice result`; `invoice employee record`; `employee invoice record`; `calculation result` | `InvoiceEmployeeRecord`; `salaryTotalsFull`; `employeeData`; `exchangeRateContext`; `terminationResults` | Acts as the auditable source of truth for payroll outputs, invoice amounts, and downstream reporting. | Global | Product; Payroll Ops; Engineering | [[calculator-results]]; [[totals-breakdown]]; [[invoice-record-type]] | confirmed | Code and docs use several names for the same object; prefer `calculator result` in prose and retain `InvoiceEmployeeRecord` as the primary code anchor. |
| pay cycle | Payroll Timing | The monthly operational payroll window used to run payroll, apply cutoffs, and group standard processing. | `cycle`; `monthly cycle`; `payroll cycle` | `invoiceDate`; `MONTHLY` | Determines processing cadence, cut-off dates, and the grouping boundary for standard payroll work. | Global in current operations model | Payroll Ops; Product | [[usa-pay-periods]]; [[invoice-record-type]] | confirmed | Must stay distinct from `pay period`, especially in non-monthly territories. |
| pay period | Payroll Timing | The date range for which an employee is paid within a cycle, which may be monthly or non-monthly depending on territory configuration. | `biweekly period`; `per-period range`; `PP1`; `PP2` | `payPeriodStart`; `payPeriodEnd`; `calculationPeriod`; `BI_WEEKLY` | Changes how salary, contributions, reporting, and invoice rows are segmented within a cycle. | Territory-specific today; potentially broader later | Payroll Ops; Product; Engineering | [[usa-pay-periods]]; [[calculator-results]] | confirmed | Monorepo docs distinguish this clearly from `cycle`; the wiki should preserve that distinction everywhere. |
| eligible pay period | Payroll Timing | The pay period within a cycle in which an employee is included because a pay-period-specific payment applies to them. | `first eligible pay period`; `last eligible pay period`; `eligible period` | `isPrimary`; `payPeriodStart`; `payPeriodEnd` | Controls where new starters, terminations, annual contributions, and per-cycle items land in a non-monthly payroll flow. | Non-monthly pay period territories | Payroll Ops; Product; Engineering | [[usa-pay-periods]]; [[new-starters]]; [[termination-results]] | needs review | Strongly present in monorepo documentation but not yet promoted clearly in the wiki. |
| cost apportionment | Payroll Timing | The proration logic used to calculate payable amounts for partial employment periods, unpaid leave, or period-specific salary splits. | `proration`; `prorated pay`; `apportionment` | `apportionmentExpression`; `unworkedDaysPayMultiplier`; `workedWorkingDays`; `workedCalendarDays`; `apportionOtherCosts` | Changes salary, contribution, and other cost amounts for partial periods and affects invoice totals. | Territory-specific configuration with global conceptual use | Tax Analytics; Payroll Ops; Engineering | [[cost-apportionment]]; [[totals-breakdown]]; [[territory]]; [[employee-data]] | needs review | The concept is implemented in code and scripts, but the dedicated wiki page is still a stub. |
| territory configuration | Data Structures | The payroll rule configuration attached to a territory that defines working-day logic, apportionment, contribution behaviour, and other statutory calculation rules. | `territory rules`; `country config`; `territory payroll config` | `calculatorTerritoryConfig`; `jsonBlob`; `unworkedDaysPolicy`; `apportionmentExpression`; `apportionOtherCosts` | Determines which calculation rules apply for employees in a territory and how payroll outputs are derived. | Territory-specific | Tax Analytics; Engineering | [[territory]]; [[cost-apportionment]]; [[employer-contribution-breakdown]] | needs review | The wiki currently treats `territory` as a concept but the monorepo exposes a more concrete configuration object that should be documented explicitly. |
| invoice record type | Data Structures | The classification attached to a calculator result to indicate whether it is standard, out-of-cycle, upcoming, or ARR-related. | `record type`; `result type`; `invoice type` | `type`; `STANDARD_CYCLE`; `OUT_OF_CYCLE`; `UPCOMING_CYCLE`; `SIGNED_ARR`; `ACTIVE_ARR` | Determines whether a record is billable, simulated, or used for ARR-related workflows. | Global, with some legacy or under-documented values | Product; Payroll Ops; Engineering | [[invoice-record-type]]; [[calculator-results]] | needs review | `SIGNED_ARR` and `ACTIVE_ARR` remain under-defined and should keep a `needs review` status until clarified. |

## Observed Language Conflicts

These terms are already drifting across docs and code and should be normalized in future pages.

| Drift Area | Variants Seen | Recommended Canonical Term | Why It Matters |
|---|---|---|---|
| Root payroll output record | `calculator result`; `invoice result`; `invoice employee record`; `employee invoice record`; `calculation result` | `calculator result` | Readers need one business term for the record while code can continue using `InvoiceEmployeeRecord`. |
| Timing boundary | `cycle`; `monthly cycle`; `pay cycle`; `pay period`; `invoice period` | `pay cycle` and `pay period` as distinct concepts | The monorepo docs rely on this distinction heavily, especially for US bi-weekly logic. |
| Salary payment currency wording | `salary payment currency`; `foreign salary currency`; `paid currency` | `salary payment currency` as umbrella term | This keeps foreign salary and local salary descriptions aligned while still allowing `foreign salary currency` as a narrower case. |
| Proration wording | `apportionment`; `proration`; `prorated`; `partial-period` | `cost apportionment` | The implementation uses apportionment-oriented code anchors, while business readers often say proration. |
| Territory concept | `territory`; `country`; `employment country`; `territory config` | `territory` for business context and `territory configuration` for rule objects | Prevents conflating the place of employment with the configuration entity that drives calculator behaviour. |

## How To Add a New Taxonomy Entry

| Step | Description |
|---|---|
| 1 | Identify the canonical business term that should be preferred in documentation. |
| 2 | List the aliases, shorthand, punctuation variants, and legacy wording used by reviewers, product, ops, or code. |
| 3 | Capture the code anchors: field names, enum values, DTO properties, schema names, and common test fixtures. |
| 4 | Write the business impact in plain English, focusing on what changes in payroll, billing, timing, or compliance. |
| 5 | Mark the scope as global, territory-specific, client-specific, or legacy. |
| 6 | Assign the most likely owner for unresolved business questions. |
| 7 | Link the concept to the relevant wiki pages. |
| 8 | Set the status to `confirmed`, `needs review`, `legacy`, or `draft`. |

## How To Use This for Repo Search

When updating a page, use the taxonomy entry to build the search set before drafting.

| Search Layer | What to search for |
|---|---|
| Canonical phrase | The preferred business term from the taxonomy. |
| Alias layer | Hyphenated variants, shorthand, and alternate product or ops wording. |
| Code layer | Fields, enums, DTO keys, and schema identifiers. |
| Adjacent concepts | Closely related canonical terms that may explain the same workflow from another angle. |

Example search set for `salary peg`:

```text
salary peg
salary-peg
pegged salary
peggedSalaryType
peggedSalaryCurrencyCode
ALLOWANCE
DIRECT
foreign salary
conversion fee
```

## How This Becomes a Glossary

This taxonomy can serve as the source for a future glossary.

| Taxonomy Field | Glossary Use |
|---|---|
| Canonical Term | Glossary entry title. |
| Definition | Short glossary definition. |
| Aliases | Search synonyms and alternate entry points. |
| Notes | Clarifies common misunderstandings. |
| Related Pages | Links to full explanatory documentation. |

The glossary should stay shorter and reader-focused. The taxonomy should remain the fuller operational and documentation-maintenance source.

## Related Pages

| Page | Purpose |
|---|---|
| [[DOCUMENTATION_STANDARDS]] | Defines the standards that use this taxonomy for consistent wording and searchability. |
| [[salary-payment-options]] | Demonstrates high-value canonical terms and aliases in practice. |
| [[exchange-rates]] | Demonstrates currency-role terminology that should stay normalized. |
| [[currency-conversion-fees]] | Demonstrates fee terminology that benefits from controlled vocabulary. |
