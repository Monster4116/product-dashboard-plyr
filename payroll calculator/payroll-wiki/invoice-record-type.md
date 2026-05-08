# Invoice Record Type

## Overview

Invoice record type classifies the purpose of each calculator result record. The `type` field on the [[calculator-results]] record stores this value. It determines whether a record represents a live standard payroll run, a simulation, an out-of-cycle adjustment, or an annual recurring revenue calculation.

## Product Context

Playroll generates multiple types of calculator results for different operational purposes. Standard cycle records drive actual client invoices. Upcoming cycle records are simulations used for forecasting and client visibility before the real payroll run. Out-of-cycle records capture adjustments made outside the normal monthly schedule. The type value tells operations teams, reporting logic, and invoice generation which records should be used for billing and which are for informational or system purposes only.

## Values

| Value | Label | Description | When Used |
|---|---|---|---|
| `STANDARD_CYCLE` | Standard Cycle | A completed payroll calculation for the standard monthly or bi-weekly billing cycle. | Assigned when a standard payroll run completes for an employee in the current billing period. |
| `OUT_OF_CYCLE` | Out of Cycle | A payroll calculation for an adjustment or change processed outside the standard billing schedule. | Assigned when salary changes, corrections, or other adjustments are processed between standard payroll runs. |
| `UPCOMING_CYCLE` | Upcoming Cycle | A simulation of the upcoming month's payroll, used for forecasting and pre-run visibility. | Assigned during the daily simulation runs that preview the upcoming invoice period before it is finalised. |
| `SIGNED_ARR` | Signed ARR | An annual recurring revenue record for a signed arrangement. **[❓ BQ-1]** | Assigned under conditions that require clarification from the product team. |
| `ACTIVE_ARR` | Active ARR | An annual recurring revenue record for an active arrangement. **[❓ BQ-2]** | Assigned under conditions that require clarification from the product team. |

## Behaviour Notes

| Scenario | Behaviour |
|---|---|
| Record `type` is `STANDARD_CYCLE` and `isPrimary` is `true` | This record is the primary invoice-facing result for the period and is used for billing. |
| Record `type` is `UPCOMING_CYCLE` | This record is a simulation and is not used for billing. It is recalculated daily until the period is finalised. |
| Record `type` is `OUT_OF_CYCLE` and `isPrimary` is `true` | For US bi-weekly employees, this record may also be invoice-bearing. See [[usa-pay-periods]]. |
| Record `type` is `STANDARD_CYCLE` or `OUT_OF_CYCLE` with `isPrimary` is `true` | For US bi-weekly employees, the invoice uses these records for the per-pay-period breakdown. See [[usa-pay-periods]]. |
| Multiple records exist for the same employee and period | The `isPrimary` flag and `type` together identify which record represents the billable result. |

## Open Questions

| ID | Question | Context | Status |
|---|---|---|---|
| BQ-1 | The enum value `SIGNED_ARR` in `prisma/schema.prisma` has no description in the source code or existing wiki documentation. What does this value represent? Under what conditions is it assigned, and what behaviour does it trigger? | `## Values` table — `SIGNED_ARR` row. The prisma schema lists the value with no comment. | Unanswered |
| BQ-2 | The enum value `ACTIVE_ARR` in `prisma/schema.prisma` has no description in the source code or existing wiki documentation. What does this value represent? Under what conditions is it assigned, and what behaviour does it trigger? | `## Values` table — `ACTIVE_ARR` row. The prisma schema lists the value with no comment. | Unanswered |

## Source Reference

| File Path | Purpose |
|---|---|
| `prisma/schema.prisma` | Defines the `InvoiceEmployeeRecordType` enum with all values. |
| `packages/util/src/invoice-employee-record.ts` | Defines the TypeScript types that reference `InvoiceEmployeeRecordType` values. |

## Related Pages

| Page | Purpose |
|---|---|
| [[calculator-results]] | Parent record that stores the `type` field. |
| [[usa-pay-periods]] | Explains how `isPrimary` and `type` combine to identify invoice-bearing results for US bi-weekly employees. |
