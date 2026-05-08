# Termination Results

## Overview

`terminationResults` contains the termination-related payout context for an employee invoice result. This field is populated when termination or final-pay logic applies to an employee. It can include leave payout, severance, notice pay, ex gratia payments, holiday allowance, bonus, or other miscellaneous termination amounts. This page documents the structure of `terminationResults` only.

Detailed leave payout logic should be documented in [[leave-payout]].  
Detailed country-specific termination rules should be documented in [[territory]] or territory-specific termination pages.

---

## Structure

`terminationResults` is a JSON object containing summary payout fields, currency-specific payout amounts, and a list of payout line items.

| Field              | Description                                                     |
| ------------------ | --------------------------------------------------------------- |
| `amounts`          | Currency-specific termination amount breakdown.                 |
| `payouts`          | Array of termination payout line items.                         |
| `reason`           | Reason for the termination.                                     |
| `payout`           | Total non-leave payout amount, where applicable.                |
| `applicableMonth`  | Invoice/calculation month where the termination result applies. |
| `leaveEntitlement` | Leave entitlement value used in the termination context.        |
| `leaveDayPayout`   | Leave payout amount included in the termination result.         |

---

## Amounts Structure

`amounts` contains the termination result amounts grouped by currency.

| Field | Description |
|---|---|
| `amounts.localCurrency` | Termination payout amounts in the employee’s local currency. |
| `amounts.billingCurrency` | Termination payout amounts in the client billing currency. |

The fields inside `localCurrency` and `billingCurrency` depend on which payout types apply.

---

## Observed Amount Types

| Amount Type | Description |
|---|---|
| `LEAVE` | Leave payout amount. |
| `SEVERANCE` | Severance payout amount. |
| `NOTICE_PAY` | Notice pay amount. |
| `EX_GRATIA` | Ex gratia payout amount. |
| `BONUS` | Bonus payout amount. |
| `HOLIDAY_ALLOWANCE` | Holiday allowance payout amount. |
| `MISCELLANEOUS` | Miscellaneous termination payout amount. |

Not every termination result contains every amount type. Some records may only contain `LEAVE`

---

## Payouts Array

`payouts` is an array of payout line items.

Each object represents one termination-related payout type.

| Field | Description |
|---|---|
| `type` | Type of termination payout. |
| `amount` | Payout amount for the line item. |
| `override` | Override value, where applicable. Can be `null`. |
| `reason` | Reason for the specific payout override or adjustment. Can be `null`. |
| `calculationType` | Calculation method used for the payout. |
| `isStatutoryRequirement` | Indicates whether the payout is a statutory requirement. |

---

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

---

## Observed Calculation Types

| Calculation Type | Description |
|---|---|
| `WORKING_DAY` | Payout calculated using working-day logic. |
| `MANUAL` | Payout entered or calculated manually. |
| `null` | No calculation type specified. |

Detailed calculation rules should be documented in the relevant linked page, such as [[leave-adjustment]] or [[territory]].

---

## Observed Termination Reasons

| Reason | Description |
|---|---|
| `RESIGNATION` | Employee resignation. |
| `RESIGNATION_PLAYROLL_RELATED` | Resignation with payroll-related context. |
| `MUTUAL_SEPARATION` | Mutual separation between employee and employer/client. |
| `RELOCATING_TO_CLIENT_ENTITY` | Employee is relocating to the client’s own entity. |
| `CLIENT_OWN_ENTITY_SETUP` | Termination or transition related to client own-entity setup. |

Reason values may expand as additional termination scenarios are supported.

---

## Key Summary Fields

| Field | Description |
|---|---|
| `payout` | Total non-leave termination payout amount. For example, severance may be included here. |
| `leaveDayPayout` | Leave payout amount. This is usually linked to `LEAVE` payout values. |
| `leaveEntitlement` | Leave entitlement value used in the calculation context. |
| `applicableMonth` | Month where the termination result applies. |

---

## Relationship to Totals Breakdown

Termination result values can roll up into the totals breakdown.

| Termination Field | Related Totals Field |
|---|---|
| `amounts.localCurrency.LEAVE` | `salaryTotalsFull.totalsLocalCurrency.employeeLeaveDaysAmount` |
| `amounts.billingCurrency.LEAVE` | `salaryTotalsFull.totalsBillingCurrency.employeeLeaveDaysAmount` |
| Non-leave payout amounts such as `SEVERANCE` | `salaryTotalsFull.totalsLocalCurrency.employeeTerminationPayout` |
| Billing-currency non-leave payout amounts | `salaryTotalsFull.totalsBillingCurrency.employeeTerminationPayout` |

See [[totals-breakdown]].

---

## Leave Payout

Leave payout is commonly represented through:

| Field | Description |
|---|---|
| `amounts.localCurrency.LEAVE` | Leave payout in local currency. |
| `amounts.billingCurrency.LEAVE` | Leave payout in billing currency. |
| `payouts[].type = LEAVE` | Leave payout line item. |
| `leaveDayPayout` | Leave payout summary amount. |

Detailed leave payout logic should be documented in [[leave-adjustment]].

---

## Currency Representation

Termination results can contain both local currency and billing currency values.

| Currency Object | Description |
|---|---|
| `localCurrency` | Termination amounts in the employee’s local currency. |
| `billingCurrency` | Termination amounts represented in the client billing currency. |

Currency conversion and conversion fee rules should be documented in [[exchange-rates]] and [[currency-conversion-fees]].

---

## Data Notes

| Observation | Note |
|---|---|
| `terminationResults` can be blank or missing. | Not every employee has termination-related results. |
| `amounts.localCurrency` and `amounts.billingCurrency` may contain different values. | Currency conversion may apply. |
| Some payout amounts can be `0`. | The payout type may exist structurally even when no payout is due. |
| `override` can be `null`. | No override was applied. |
| `reason` inside a payout line item can be `null`. | No payout-specific reason was provided. |
| `calculationType` can be `null`. | No calculation method was specified for that payout type. |
| `isStatutoryRequirement` can be `false`. | The payout is not marked as statutory in the result. |
| Some records only contain leave payout. | Not all terminations include severance, notice pay, or other payout types. |

---

## Related Pages

| Page                         | Purpose                                                      |
| ---------------------------- | ------------------------------------------------------------ |
| [[calculator-results]]       | Parent invoice result record.                                |
| [[totals-breakdown]]         | Shows how termination amounts roll into invoice totals.      |
| [[leave-payout]]             | Explains leave days are paid out                             |
| [[exchange-rates]]           | Exchange-rate context for local and billing currency values. |
| [[currency-conversion-fees]] | Conversion fee treatment when billing currency differs.      |
| [[employee-data]]            | Employee context including status and end date.              |
| [[territory]]                | Territory-specific termination and statutory payout rules.   |