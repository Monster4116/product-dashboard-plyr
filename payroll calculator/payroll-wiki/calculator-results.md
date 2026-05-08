# Calculator Results

## Overview

The calculator result is the record Playroll generates for each employee per invoice period. It contains every calculated output for that employee in that period: salary totals in multiple currencies, employer and employee contributions, termination payouts where applicable, leave adjustment context, and the exchange rate context used during calculation. The record is the source of truth for what appears on a client invoice and what is paid to or on behalf of the employee.

**Search Tags:** `calculator result`, `invoice result`, `invoice employee record`, `InvoiceEmployeeRecord`, `calculationPeriod`, `isPrimary`, `isAggregated`, `payPeriodStart`

## Product Context

Clients and operators use the calculator result to understand exactly what was calculated for an employee in a given month or pay period. It provides a complete, auditable breakdown of salary, contributions, fees, and currency conversions, giving both Playroll operations teams and clients the data needed to verify invoice amounts, reconcile payments, and investigate discrepancies. Without this record, there would be no structured link between the payroll calculation engine and the invoice and payment systems.

## Where This Appears

The calculator result is the root record. All other documented objects in this wiki are nested within or referenced from the calculator result. It is stored as the `InvoiceEmployeeRecord` in the database.

## Calculator Results Structure

| Field | Description | Nullable? |
|---|---|---|
| `id` | Unique identifier for the invoice result record. | No |
| `employeeId` | Unique identifier for the employee linked to the invoice result. | No |
| `companyId` | Unique identifier for the company linked to the invoice result. | No |
| `invoiceDate` | The applicable invoice month and date for the invoice result. | No |
| `payPeriodStart` | Start date of the pay period. Primarily used for [[usa-pay-periods]]. | Sometimes — populated for bi-weekly employees only |
| `payPeriodEnd` | End date of the pay period. Primarily used for [[usa-pay-periods]]. | Sometimes — populated for bi-weekly employees only |
| `employeeData` | Employee-specific context used during calculation. See [[employee-data]]. | No |
| `salaryTotalsFull` | Full [[totals-breakdown]] for the current pay cycle. | No |
| `salaryTotalsProrated` | Prorated [[totals-breakdown]] for days worked in a partial pay cycle, such as a new starter or leaver period. | Yes |
| `employerContributionsFull` | Full [[employer-contribution-breakdown]] for the current pay cycle. | No |
| `employerContributionsProrated` | Prorated [[employer-contribution-breakdown]] for a partial pay cycle, where applicable. | No — defaults to empty array |
| `employeeContributionsFull` | Full [[employee-contributions-breakdown]] for the current pay cycle. | No |
| `employeeContributionsProrated` | Prorated [[employee-contributions-breakdown]] for a partial pay cycle, where applicable. | No — defaults to empty array |
| `terminationResults` | Employee [[termination-results]] applicable to the current pay cycle. | Yes |
| `leaveIds` | Array of identifiers for leave requests included in the pay cycle. | No — defaults to empty array |
| `expenseIds` | Array of identifiers for expense records included in the pay cycle. | No — defaults to empty array |
| `timeTrackingIds` | Array of identifiers for time tracking records used for [[hourly-employee]]. | No — defaults to empty array |
| `type` | Specifies the [[invoice-record-type]] for this result. | No |
| `calculationPeriod` | Specifies the calculation period. Values are `MONTHLY` or `BI_WEEKLY`. See [[usa-pay-periods]]. | No — defaults to `MONTHLY` |
| `isAggregated` | Indicates whether multiple pay cycle results have been aggregated into a single monthly result. Used for US employees. See [[usa-pay-periods]]. | No — defaults to `false` |
| `isPrimary` | Indicates whether this is the primary invoice-facing result record for the invoice period. Related to [[invoice-record-type]]. | No — defaults to `false` |
| `exchangeRateContext` | Exchange rate context used for currency conversion during calculation. See [[exchange-rates]] and [[salary-payment-options]]. | No — defaults to empty object |
| `leavePayoutAdjustmentContext` | Breakdown of leave payout adjustments. See [[leave-adjustment]]. | Yes |
| `createdAt` | Date and time when the invoice result record was created. | No |
| `updatedAt` | Date and time when the invoice result record was last updated. | No |

## Data Notes

| Observation | Note |
|---|---|
| `salaryTotalsProrated` can be null. | Not every calculation has a prorated result. A prorated result is only populated when partial-period logic applies, such as for new starters, leavers, or partial months. |
| `terminationResults` can be null. | Only populated when termination or final-pay logic applies to the employee in the period. |
| `leavePayoutAdjustmentContext` can be null. | Only populated when leave payout adjustment logic has run for the employee in the period. |
| `payPeriodStart` and `payPeriodEnd` can be null. | These fields are only populated for bi-weekly pay period records. Monthly records leave these fields null. |
| `employerContributionsProrated` defaults to an empty array. | An empty array does not indicate an error; it means no prorated employer contributions were calculated. |
| `employeeContributionsProrated` defaults to an empty array. | Same as above for employee contributions. |
| `exchangeRateContext` defaults to an empty object. | Historical records created before exchange rate context was captured may have an empty object rather than null. |
| `invoiceDetails` is deprecated. | This field exists on historical records and is expected to be removed once old records are cleaned up. See [[invoice-details]]. |
| `salaryPaymentCurrencyDetails` is deprecated. | This field exists on historical records and is expected to be removed once old records are cleaned up. |
| The combination of `employeeId`, `companyId`, `invoiceDate`, `payPeriodStart`, `payPeriodEnd`, and `type` is unique. | This unique constraint prevents duplicate results for the same employee, company, period, and record type. |

## Source Reference

| File Path | Purpose |
|---|---|
| `prisma/schema.prisma` | Defines the `InvoiceEmployeeRecord` model and the `InvoiceEmployeeRecordType` and `InvoiceEmployeeRecordCalculationPeriod` enums. |
| `packages/util/src/invoice-employee-record.ts` | Defines the TypeScript types for `employeeData`, `exchangeRateContext`, `salaryTotalsFull`, contributions, and termination results stored as JSON columns. |

## Related Pages

| Page | Purpose |
|---|---|
| [[employee-data]] | Documents the employee calculation context stored in `employeeData`. |
| [[totals-breakdown]] | Documents the salary and invoice total structure in `salaryTotalsFull` and `salaryTotalsProrated`. |
| [[employer-contribution-breakdown]] | Documents the employer contribution line-item structure. |
| [[employee-contributions-breakdown]] | Documents the employee contribution and deduction line-item structure. |
| [[termination-results]] | Documents the termination payout structure in `terminationResults`. |
| [[leave-adjustment]] | Documents the leave payout adjustment context in `leavePayoutAdjustmentContext`. |
| [[exchange-rates]] | Documents the exchange rate context in `exchangeRateContext`. |
| [[invoice-record-type]] | Documents the `type` field values and their meanings. |
| [[usa-pay-periods]] | Documents bi-weekly pay period logic and the `payPeriodStart`, `payPeriodEnd`, `calculationPeriod`, `isAggregated`, and `isPrimary` fields. |
| [[hourly-employee]] | Documents hourly employee payroll logic and the `timeTrackingIds` field. |
| [[salary-payment-options]] | Documents salary payment setup and its relationship to `exchangeRateContext`. |
| [[invoice-details]] | Documents the deprecated `invoiceDetails` field. |
