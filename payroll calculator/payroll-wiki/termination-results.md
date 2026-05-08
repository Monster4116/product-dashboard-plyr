# Termination Results

## Overview

Termination results contain the termination-related payout context for an employee invoice result. This field is populated when termination or final-pay logic applies to an employee in the period. It can include leave payout, severance, notice pay, ex gratia payments, holiday allowance, bonus, or other miscellaneous termination amounts. This page documents the structure of the termination results object only. Detailed leave payout logic is documented in [[leave-payout]], and country-specific termination rules are documented in [[territory]].

**Search Tags:** `termination results`, `termination payout`, `final pay`, `terminationResults`, `SEVERANCE`, `NOTICE_PAY`, `leaveDayPayout`, `EmployeeTerminationPayoutType`

## Product Context

When an employee's employment ends, Playroll must calculate all final entitlements and include them in the last invoice. The amounts owed can vary significantly by territory — some countries require statutory severance pay, others mandate notice pay or holiday allowance payouts. By capturing these as structured payout line items, Playroll gives operations teams and clients full visibility into what was paid at termination and why. The amounts flow into the invoice totals so the client receives an accurate final bill.

## Where This Appears

| Field | Parent Record | Notes |
|---|---|---|
| `terminationResults` | [[calculator-results]] | Stored as a JSON column. Nullable — only populated when termination or final-pay logic applies. |

## Structure

`terminationResults` is a JSON object containing summary payout fields, currency-specific payout amounts, and an array of payout line items.

| Field | Description | Nullable? |
|---|---|---|
| `amounts` | Currency-specific termination amount breakdown, grouped by local and billing currency. | No — when `terminationResults` is present |
| `payouts` | Array of termination payout line items. | No — when `terminationResults` is present |
| `reason` | Reason for the termination. | No — when `terminationResults` is present |
| `payout` | Total non-leave payout amount, where applicable. | No — when `terminationResults` is present |
| `applicableMonth` | Invoice or calculation month where the termination result applies. | No — when `terminationResults` is present |
| `leaveEntitlement` | Leave entitlement value used in the termination context. | No — when `terminationResults` is present |
| `leaveDayPayout` | Leave payout amount included in the termination result. | No — when `terminationResults` is present |

## Amounts Structure

`amounts` contains the termination result amounts grouped by currency.

| Field | Description |
|---|---|
| `amounts.localCurrency` | Termination payout amounts in the employee's local currency. |
| `amounts.billingCurrency` | Termination payout amounts in the client billing currency. |

The fields inside `localCurrency` and `billingCurrency` depend on which payout types apply.

## Observed Amount Types

| Amount Type | Description |
|---|---|
| `LEAVE` | Leave payout amount. |
| `SEVERANCE` | Severance payout amount. |
| `NOTICE_PAY` | Notice pay payout amount. |
| `EX_GRATIA` | Ex gratia payout amount. |
| `BONUS` | Bonus payout amount. |
| `HOLIDAY_ALLOWANCE` | Holiday allowance payout amount. |
| `MISCELLANEOUS` | Miscellaneous termination payout amount. |

Not every termination result contains every amount type. Some records may only contain `LEAVE`.

## Payouts Array

`payouts` is an array of payout line items. Each object represents one termination-related payout type.

| Field | Description | Nullable? |
|---|---|---|
| `type` | Type of termination payout. | No |
| `amount` | Payout amount for the line item. | No |
| `override` | Override value, where applicable. | Yes |
| `reason` | Reason for the specific payout override or adjustment. | Yes |
| `calculationType` | Calculation method used for the payout. | Yes |
| `isStatutoryRequirement` | Indicates whether the payout is a statutory requirement. | No |

## Observed Payout Types

| Payout Type | Description |
|---|---|
| `LEAVE` | Leave payout. |
| `SEVERANCE` | Severance payout. |
| `NOTICE_PAY` | Notice pay payout. |
| `EX_GRATIA` | Ex gratia payout. |
| `BONUS` | Bonus payout. |
| `HOLIDAY_ALLOWANCE` | Holiday allowance payout. |
| `MISCELLANEOUS` | Miscellaneous payout. |

## Observed Calculation Types

| Calculation Type | Description |
|---|---|
| `WORKING_DAY` | Payout calculated using working-day logic. |
| `MANUAL` | Payout entered or calculated manually. |
| `null` | No calculation type specified. |

Detailed calculation rules are documented in [[leave-adjustment]] or [[territory]].

## Observed Termination Reasons

| Reason | Description |
|---|---|
| `RESIGNATION` | Employee resignation. |
| `RESIGNATION_PLAYROLL_RELATED` | Resignation with payroll-related context. |
| `MUTUAL_SEPARATION` | Mutual separation between employee and employer or client. |
| `RELOCATING_TO_CLIENT_ENTITY` | Employee is relocating to the client's own entity. |
| `CLIENT_OWN_ENTITY_SETUP` | Termination or transition related to client own-entity setup. |

Reason values may expand as additional termination scenarios are supported.

## Key Summary Fields

| Field | Description |
|---|---|
| `payout` | Total non-leave termination payout amount. Severance, for example, may be included here. |
| `leaveDayPayout` | Leave payout amount. Usually linked to `LEAVE` payout values. |
| `leaveEntitlement` | Leave entitlement value used in the calculation context. |
| `applicableMonth` | Month where the termination result applies. |

## Rollup Behaviour

Termination result values roll up into the totals breakdown.

| Source Field | Rolls Up To |
|---|---|
| `amounts.localCurrency.LEAVE` | `salaryTotalsFull.totalsLocalCurrency.employeeLeaveDaysAmount` in [[totals-breakdown]] |
| `amounts.billingCurrency.LEAVE` | `salaryTotalsFull.totalsBillingCurrency.employeeLeaveDaysAmount` in [[totals-breakdown]] |
| Non-leave amounts such as `SEVERANCE` | `salaryTotalsFull.totalsLocalCurrency.employeeTerminationPayout` in [[totals-breakdown]] |
| Billing-currency non-leave amounts | `salaryTotalsFull.totalsBillingCurrency.employeeTerminationPayout` in [[totals-breakdown]] |

## Leave Payout

Leave payout at termination is represented through multiple fields.

| Field | Description |
|---|---|
| `amounts.localCurrency.LEAVE` | Leave payout in local currency. |
| `amounts.billingCurrency.LEAVE` | Leave payout in billing currency. |
| `payouts[].type = LEAVE` | Leave payout line item. |
| `leaveDayPayout` | Leave payout summary amount. |

Detailed leave payout logic is documented in [[leave-payout]].

## Currency Representation

Termination results contain both local currency and billing currency values.

| Currency Object | Description |
|---|---|
| `localCurrency` | Termination amounts in the employee's local currency. |
| `billingCurrency` | Termination amounts represented in the client billing currency. |

Currency conversion and conversion fee rules are documented in [[exchange-rates]] and [[currency-conversion-fees]].

## Data Notes

| Observation | Note |
|---|---|
| `terminationResults` can be null. | Not every employee has termination-related results. The field is only populated when termination logic applies. |
| `amounts.localCurrency` and `amounts.billingCurrency` may contain different values. | Currency conversion may apply when local and billing currencies differ. |
| Some payout amounts can be zero. | A payout type may exist structurally even when no amount is due. |
| `override` can be null. | No override was applied to the payout. |
| `reason` inside a payout line item can be null. | No payout-specific reason was provided for that line item. |
| `calculationType` can be null. | No calculation method was specified for the payout type. |
| `isStatutoryRequirement` can be `false`. | The payout is not marked as a statutory requirement in the result. |
| Some records contain only leave payout. | Not all terminations include severance, notice pay, or other payout types. |

## Source Reference

| File Path | Purpose |
|---|---|
| `packages/util/src/invoice-employee-record.ts` | Defines `EmployeeInvoiceTerminationResults` and the related TypeBox schemas used for runtime validation of the termination results JSON column. |
| `prisma/schema.prisma` | Defines `EmployeeTerminationPayoutType` and `EmployeeTerminationApportionmentCalculationType` enums used in termination payout line items. |

## Related Pages

| Page | Purpose |
|---|---|
| [[calculator-results]] | Parent invoice result record containing `terminationResults`. |
| [[totals-breakdown]] | Documents how termination amounts roll into invoice totals. |
| [[leave-payout]] | Explains how leave days are paid out at termination. |
| [[leave-adjustment]] | Documents the standard leave adjustment logic for active employees. |
| [[exchange-rates]] | Documents exchange rate context for local and billing currency values. |
| [[currency-conversion-fees]] | Documents conversion fee treatment when billing currency differs from local currency. |
| [[employee-data]] | Documents employee context including status and end date. |
| [[territory]] | Documents territory-specific termination and statutory payout rules. |
