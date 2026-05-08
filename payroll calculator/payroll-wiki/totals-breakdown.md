# Totals Breakdown

## Overview

The totals breakdown represents the calculated salary and invoice totals for an employee invoice result.

The [[calculator-results]] record can contain two totals breakdown fields:

| Field | Description |
|---|---|
| `salaryTotalsFull` | Full totals calculation for the employee’s invoice period. |
| `salaryTotalsProrated` | Prorated totals calculation for a partial period, partial month, previous pay period, new starter, leaver, or other scenario where only part of the full amount applies. |

This page documents the structure of the totals breakdown only.

Detailed calculation logic is documented in the linked pages for salary payment options, exchange rates, conversion fees, contributions, expenses, leave, and terminations.

---

## First-Level JSON Structure

| Field | Description |
|---|---|
| `grossSalary` | Gross salary amount calculated for the result. |
| `unworkedDaysPayMultiplier` | Multiplier used for partial-period, unpaid leave, or prorated calculations. |
| `totalsLocalCurrency` | Totals calculated in the employee’s local payroll currency. See [[exchange-rates]]. |
| `totalsSalaryPaymentCurrency` | Totals calculated in the salary payment currency, where applicable. Can be `null`. See [[salary-payment-options]]. |
| `totalsBillingCurrency` | Totals calculated or converted into the client billing currency. See [[currency-conversion-fees]]. |
| `totalWorkingDays` | Total working days in the calculation period. |
| `totalCalendarDays` | Total calendar days in the calculation period. |
| `workedWorkingDays` | Number of working days worked or payable in the calculation period. |
| `workedCalendarDays` | Number of calendar days worked or payable in the calculation period. |
| `totalEmployeeTakeHome` | Employee take-home amount after employee-side deductions/contributions. See [[employee-contributions-breakdown]]. |

---

## Currency Total Objects

The totals breakdown can contain up to three currency total objects.

| Object | Description |
|---|---|
| `totalsLocalCurrency` | Breakdown in the employee’s local payroll currency. |
| `totalsSalaryPaymentCurrency` | Breakdown in the salary payment currency, where applicable. |
| `totalsBillingCurrency` | Breakdown in the client billing currency. |

These objects generally follow the same internal structure.

---

## Currency Total Fields

| Field                            | Description                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `currencyCode`                   | Currency code for the totals object.                                                                          |
| `baseSalary`                     | Base salary amount. See [[salary-payment-options]].                                                           |
| `overtimePay`                    | Overtime pay amount.                                                                                          |
| `backPay`                        | Back pay amount.                                                                                              |
| `bonus`                          | Bonus amount.                                                                                                 |
| `shiftDifferentialPay`           | Shift differential pay amount.                                                                                |
| `discretionary`                  | Discretionary pay amount.                                                                                     |
| `commission`                     | Commission amount.                                                                                            |
| `expenses`                       | Expense amount included in the total. See [[expenses]].                                                       |
| `directExpenses`                 | Direct expense amount included in the total. See [[expenses]].                                                |
| `grossDeductions`                | Gross deduction amount. See [[employee-contributions-breakdown]].                                             |
| `netDeductions`                  | Net deduction amount. See [[employee-contributions-breakdown]].                                               |
| `salaryWageOverPaymentDeduction` | Salary or wage overpayment deduction amount. This deduction is not included in the invoice total calculation. |
| `other`                          | Other salary, allowance, or miscellaneous amount. See [[employee-allowances]].                                |
| `employerContribution`           | Total employer contribution amount. See [[employer-contribution-breakdown]].                                  |
| `employeeContribution`           | Total employee contribution/deduction amount. See [[employee-contributions-breakdown]].                       |
| `employeeTerminationPayout`      | Termination payout amount included in the totals. See [[termination-results]].                                |
| `employeeLeaveDaysAmount`        | Leave days amount included in the totals. See [[leave-adjustment]].                                           |
| `leaveAdjustment`                | Leave adjustment amount, where present. See [[leave-adjustment]].                                             |
| `totalExcludingPlayrollFee`      | Total invoice amount before Playroll fee.                                                                     |
| `earlyTerminationFee`            | Early termination fee amount, where applicable. See [[termination-results]].                                  |
| `payrollFee`                     | Playroll fee amount.                                                                                          |
| `totalIncludingPlayrollFee`      | Final invoice amount including Playroll fee.                                                                  |

---

## Full vs Prorated Totals

`salaryTotalsFull` and `salaryTotalsProrated` use the same structure.

The difference is the period being represented.

| Field | Meaning |
|---|---|
| `salaryTotalsFull` | Represents the full calculation for the relevant invoice period. |
| `salaryTotalsProrated` | Represents a partial or prorated calculation for the relevant invoice period. |

---

## Proration Fields

Proration is usually indicated by the following fields:

| Field | Description |
|---|---|
| `unworkedDaysPayMultiplier` | Multiplier used to determine the payable portion of the period. |
| `totalWorkingDays` | Full working days in the period. |
| `workedWorkingDays` | Working days actually worked or payable. |
| `totalCalendarDays` | Full calendar days in the period. |
| `workedCalendarDays` | Calendar days actually worked or payable. |

Detailed proration logic should be documented in [[cost-apportionment]].

---

## Invoice Total Fields

The totals breakdown includes two key invoice total fields.

| Field | Description |
|---|---|
| `totalExcludingPlayrollFee` | Total invoice amount before the Playroll fee is added. This is built from invoice-bearing components such as salary, earnings, expenses, employer contributions, and applicable leave or termination amounts. |
| `totalIncludingPlayrollFee` | Final invoice amount including the Playroll fee. |

Detailed conversion and billing logic should be documented in [[currency-conversion-fees]].

---

## Invoice-Bearing Components

The following fields generally contribute to `totalExcludingPlayrollFee` when present:

| Field                            | Included in `totalExcludingPlayrollFee`? | Notes                                                                                     |
| -------------------------------- | ---------------------------------------: | ----------------------------------------------------------------------------------------- |
| `baseSalary`                     |                                      Yes | Salary amount.                                                                            |
| `overtimePay`                    |                                      Yes | Additional earnings.                                                                      |
| `backPay`                        |                                      Yes | Additional earnings.                                                                      |
| `bonus`                          |                                      Yes | Additional earnings.                                                                      |
| `shiftDifferentialPay`           |                                      Yes | Additional earnings.                                                                      |
| `discretionary`                  |                                      Yes | Additional earnings.                                                                      |
| `commission`                     |                                      Yes | Additional earnings.                                                                      |
| `expenses`                       |                                      Yes | Expense amount included in invoice total.                                                 |
| `directExpenses`                 |                                      Yes | Direct expense amount included in invoice total.                                          |
| `other`                          |                                      Yes | Allowance or miscellaneous amount.                                                        |
| `employerContribution`           |                                      Yes | Employer cost.                                                                            |
| `employeeTerminationPayout`      |                                      Yes | Where applicable.                                                                         |
| `employeeLeaveDaysAmount`        |                                      Yes | Where applicable.                                                                         |
| `leaveAdjustment`                |                                      Yes | Where present.                                                                            |
| `earlyTerminationFee`            |                                  Depends | If treated as billing-only, see [[currency-conversion-fees]] and [[termination-results]]. |
| `employeeContribution`           |                                       No | Employee-side deduction/contribution.                                                     |
| `salaryWageOverPaymentDeduction` |                                       No | Not included in invoice total calculation.                                                |
| `payrollFee`                     |                                       No | Added after `totalExcludingPlayrollFee`.                                                  |

---

## Representation Fields

Some fields may appear in the totals breakdown for representation or calculation visibility, even if they are not invoice-bearing.

| Field | Purpose |
|---|---|
| `employeeContribution` | Shows employee-side deductions/contributions and helps explain employee take-home. |
| `grossDeductions` | Shows deductions applied against gross pay. |
| `netDeductions` | Shows deductions applied after net pay. |
| `salaryWageOverPaymentDeduction` | Shows salary or wage overpayment deduction amount. |
| `payrollFee` | Billing fee added separately to reach `totalIncludingPlayrollFee`. |

---

## Related Calculator Result Fields

The totals breakdown is connected to other fields in the [[calculator-results]] record.

| Related Field | Description |
|---|---|
| `employeeData` | Employee-level context used for the calculation. See [[employee-data]]. |
| `salaryPaymentCurrencyDetails` | Salary payment currency setup. See [[salary-payment-options]]. |
| `employerContributionsFull` | Full employer contribution line-item breakdown. See [[employer-contribution-breakdown]]. |
| `employerContributionsProrated` | Prorated employer contribution line-item breakdown. See [[employer-contribution-breakdown]]. |
| `employeeContributionsFull` | Full employee contribution line-item breakdown. See [[employee-contributions-breakdown]]. |
| `employeeContributionsProrated` | Prorated employee contribution line-item breakdown. See [[employee-contributions-breakdown]]. |
| `terminationResults` | Termination-related calculation details. See [[termination-results]]. |
| `exchangeRateContext` | Exchange rate context used for currency conversion. See [[exchange-rates]]. |
| `leavePayoutAdjustmentContext` | Leave payout adjustment details. See [[leave-adjustment]]. |
| `leaveIds` | Leave records linked to the invoice result. See [[leave-adjustment]]. |
| `expenseIds` | Expense records linked to the invoice result. See [[expenses]]. |
| `timeTrackingIds` | Time tracking records linked to the invoice result. See [[hourly-employees]]. |

---

## Data Notes

| Observation | Note |
|---|---|
| `salaryTotalsProrated` can be blank or missing. | Not every calculation has a prorated result. |
| `totalsSalaryPaymentCurrency` can be `null`. | Only populated where salary payment currency logic applies. |
| `totalsLocalCurrency` and `totalsBillingCurrency` can use the same currency. | No currency conversion may be required. |
| `totalsLocalCurrency` and `totalsBillingCurrency` can use different currencies. | Currency conversion applies. See [[currency-conversion-fees]]. |
| `leaveAdjustment` may not appear in every record. | Treat as optional. |
| `unworkedDaysPayMultiplier` is numeric. | Can be `0`, fractional, or `1`. |
| `workedWorkingDays` can be lower than `totalWorkingDays`. | Usually indicates partial-period or prorated logic. |
| Currency total objects may contain fields with `0` values. | The field can exist even when not applicable for that employee. |

---

## Suggested Linked Pages

| Page                                 | Purpose                                                                    |
| ------------------------------------ | -------------------------------------------------------------------------- |
| [[calculator-results]]               | Parent page for the full invoice result record.                            |
| [[employee-data]]                    | Employee-level calculation context.                                        |
| [[salary-payment-options]]           | Local salary, foreign salary, salary peg direct, and salary peg allowance. |
| [[currency-conversion-fees]]         | Rules for when conversion fees apply.                                      |
| [[exchange-rates]]                   | Exchange rate fields and currency conversion paths.                        |
| [[employer-contribution-breakdown]]  | Employer contribution line-item breakdown.                                 |
| [[employee-contributions-breakdown]] | Employee contribution/deduction line-item breakdown.                       |
| [[employee-allowances]]              | Allowance types and how they appear in totals.                             |
| [[expenses]]                         | Expense and direct expense treatment.                                      |
| [[leave-adjustment]]                 | Leave-related amounts, leave payout, leave adjustment, and leave IDs.      |
| [[termination-results]]              | Termination payout and termination-specific outputs.                       |
| [[cost-apportionment]]               | Proration/apportionment of costs for partial periods.                      |
| [[usa-pay-periods]]                  | US bi-weekly pay period logic.                                             |
| [[hourly-employees]]                 | Hourly employee and timesheet-specific calculation context.                |
| [[invoice-record-type]]              | Record type, primary result, aggregated result, and standard cycle logic.  |
