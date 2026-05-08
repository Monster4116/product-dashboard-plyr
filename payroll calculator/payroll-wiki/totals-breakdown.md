# Totals Breakdown

## Overview

The totals breakdown contains the calculated salary and invoice totals for an employee invoice result. It groups amounts across up to three currency representations — local, salary payment, and billing — along with day counts, a multiplier for partial periods, and the employee's take-home amount. The calculator result record can contain two totals breakdown fields: one for the full period and one for any prorated portion.

## Product Context

Clients receive an invoice that reflects the full cost of employing each person, including salary, employer contributions, and Playroll fees, expressed in the billing currency. The totals breakdown is the structured data behind those invoice amounts. It also exposes the local-currency payroll figures needed for statutory compliance reporting and the salary payment currency figures needed for foreign salary arrangements. Having the totals in multiple currency representations in one object means clients and operations teams can trace how an amount moved from payroll to invoice without looking across multiple records.

## Where This Appears

| Field | Parent Record | Notes |
|---|---|---|
| `salaryTotalsFull` | [[calculator-results]] | Full totals for the current pay cycle. |
| `salaryTotalsProrated` | [[calculator-results]] | Prorated totals for a partial period. Nullable — only present when partial-period logic applies. |

## Totals Breakdown Structure

| Field | Description | Nullable? |
|---|---|---|
| `grossSalary` | Gross salary amount calculated for the result. | No |
| `unworkedDaysPayMultiplier` | Multiplier used for partial-period, unpaid leave, or prorated calculations. | No |
| `totalsLocalCurrency` | Totals calculated in the employee's local payroll currency. See [[exchange-rates]]. | No |
| `totalsSalaryPaymentCurrency` | Totals calculated in the salary payment currency, where applicable. See [[salary-payment-options]]. | Yes |
| `totalsBillingCurrency` | Totals calculated or converted into the client billing currency. See [[currency-conversion-fees]]. | No |
| `totalWorkingDays` | Total working days in the calculation period. | No |
| `totalCalendarDays` | Total calendar days in the calculation period. | No |
| `workedWorkingDays` | Number of working days worked or payable in the calculation period. | No |
| `workedCalendarDays` | Number of calendar days worked or payable in the calculation period. | No |
| `totalEmployeeTakeHome` | Employee take-home amount after employee-side deductions and contributions. See [[employee-contributions-breakdown]]. | No |

## Currency Total Objects

The totals breakdown contains up to three currency total objects. Each represents the same set of salary and invoice components expressed in a different currency.

| Object | Description |
|---|---|
| `totalsLocalCurrency` | Breakdown in the employee's local payroll currency. Always present. |
| `totalsSalaryPaymentCurrency` | Breakdown in the salary payment currency. Present only for foreign salary and salary peg arrangements. |
| `totalsBillingCurrency` | Breakdown in the client billing currency. Always present. |

## Currency Total Fields

| Field | Description | Nullable? |
|---|---|---|
| `currencyCode` | Currency code for the totals object. | No |
| `baseSalary` | Base salary amount. See [[salary-payment-options]]. | No |
| `overtimePay` | Overtime pay amount. | No |
| `backPay` | Back pay amount. | No |
| `bonus` | Bonus amount. | No |
| `shiftDifferentialPay` | Shift differential pay amount. | No |
| `discretionary` | Discretionary pay amount. | No |
| `commission` | Commission amount. | No |
| `expenses` | Expense amount included in the total. See [[expenses]]. | No |
| `directExpenses` | Direct expense amount included in the total. See [[expenses]]. | No |
| `grossDeductions` | Gross deduction amount. See [[employee-contributions-breakdown]]. | No |
| `netDeductions` | Net deduction amount. See [[employee-contributions-breakdown]]. | No |
| `salaryWageOverPaymentDeduction` | Salary or wage overpayment deduction amount. Not included in the invoice total calculation. | No |
| `other` | Other salary, allowance, or miscellaneous amount. See [[employee-allowances]]. | No |
| `employerContribution` | Total employer contribution amount. See [[employer-contribution-breakdown]]. | No |
| `employeeContribution` | Total employee contribution and deduction amount. See [[employee-contributions-breakdown]]. | No |
| `employeeTerminationPayout` | Termination payout amount included in the totals. See [[termination-results]]. | Sometimes — optional field |
| `employeeLeaveDaysAmount` | Leave days amount included in the totals. See [[leave-adjustment]]. | Sometimes — optional field |
| `leaveAdjustment` | Leave adjustment amount, where present. See [[leave-adjustment]]. | Sometimes — optional field |
| `totalExcludingPlayrollFee` | Total invoice amount before the Playroll fee. Built from invoice-bearing components. | No |
| `earlyTerminationFee` | Early termination fee amount, where applicable. See [[termination-results]]. | Sometimes — optional field |
| `payrollFee` | Playroll fee amount. | No |
| `totalIncludingPlayrollFee` | Final invoice amount including the Playroll fee. | No |

## Full vs Prorated Totals

`salaryTotalsFull` and `salaryTotalsProrated` use the same internal structure. The difference is the period being represented.

| Field | Meaning |
|---|---|
| `salaryTotalsFull` | Represents the full calculation for the relevant invoice period. |
| `salaryTotalsProrated` | Represents a partial or prorated calculation for the relevant invoice period. |

The following fields indicate proration:

| Field | Description |
|---|---|
| `unworkedDaysPayMultiplier` | Multiplier used to determine the payable portion of the period. |
| `totalWorkingDays` | Full working days in the period. |
| `workedWorkingDays` | Working days actually worked or payable. |
| `totalCalendarDays` | Full calendar days in the period. |
| `workedCalendarDays` | Calendar days actually worked or payable. |

Detailed proration logic is documented in [[cost-apportionment]].

## Invoice Total Fields

| Field | Description |
|---|---|
| `totalExcludingPlayrollFee` | Total invoice amount before the Playroll fee is added. Built from invoice-bearing components such as salary, earnings, expenses, employer contributions, and applicable leave or termination amounts. |
| `totalIncludingPlayrollFee` | Final invoice amount including the Playroll fee. |

## Invoice-Bearing Components

| Field | Included in `totalExcludingPlayrollFee`? | Notes |
|---|---:|---|
| `baseSalary` | Yes | Base salary amount. |
| `overtimePay` | Yes | Additional earnings. |
| `backPay` | Yes | Additional earnings. |
| `bonus` | Yes | Additional earnings. |
| `shiftDifferentialPay` | Yes | Additional earnings. |
| `discretionary` | Yes | Additional earnings. |
| `commission` | Yes | Additional earnings. |
| `expenses` | Yes | Expense amount included in invoice total. |
| `directExpenses` | Yes | Direct expense amount included in invoice total. |
| `other` | Yes | Allowance or miscellaneous amount. |
| `employerContribution` | Yes | Employer cost. |
| `employeeTerminationPayout` | Yes | Where applicable. |
| `employeeLeaveDaysAmount` | Yes | Where applicable. |
| `leaveAdjustment` | Yes | Where present. |
| `earlyTerminationFee` | Depends | If treated as a billing-only item, see [[currency-conversion-fees]] and [[termination-results]]. |
| `employeeContribution` | No | Employee-side deduction — not invoice-bearing. |
| `salaryWageOverPaymentDeduction` | No | Not included in invoice total calculation. |
| `payrollFee` | No | Added after `totalExcludingPlayrollFee`. |

## Representation Fields

Some fields appear in the totals breakdown for reporting or calculation visibility, even when they are not invoice-bearing.

| Field | Purpose |
|---|---|
| `employeeContribution` | Shows employee-side deductions and contributions; helps explain employee take-home. |
| `grossDeductions` | Shows deductions applied against gross pay. |
| `netDeductions` | Shows deductions applied after net pay. |
| `salaryWageOverPaymentDeduction` | Shows salary or wage overpayment deduction amount. |
| `payrollFee` | Billing fee added separately to reach `totalIncludingPlayrollFee`. |

## Rollup Behaviour

The totals breakdown aggregates individual contribution line items from the employer and employee contribution arrays.

| Source Field | Rolls Up To |
|---|---|
| `employerContributionsFull[].amount` | `salaryTotalsFull.totalsLocalCurrency.employerContribution` |
| `employerContributionsProrated[].amount` | `salaryTotalsProrated.totalsLocalCurrency.employerContribution` |

See [[employer-contribution-breakdown]] and [[currency-conversion-fees]] for how individual contributions are represented across currency objects.

## Data Notes

| Observation | Note |
|---|---|
| `salaryTotalsProrated` can be null. | Not every calculation has a prorated result. |
| `totalsSalaryPaymentCurrency` can be null. | Only populated where salary payment currency logic applies. See [[salary-payment-options]]. |
| `totalsLocalCurrency` and `totalsBillingCurrency` may use the same currency code. | No currency conversion is required when local and billing currencies match. |
| `totalsLocalCurrency` and `totalsBillingCurrency` may use different currency codes. | Currency conversion applies. See [[currency-conversion-fees]]. |
| `leaveAdjustment` may not be present in every record. | Treat as an optional field. |
| `unworkedDaysPayMultiplier` is numeric and can be `0`, fractional, or `1`. | A value of `1` means a full period. A fractional value indicates partial-period calculation. |
| `workedWorkingDays` can be lower than `totalWorkingDays`. | Indicates partial-period or prorated logic applies. |
| Currency total objects may contain fields with `0` values. | A field can be present with a zero value even when the component does not apply to the employee. |
| `totalsBillingCurrency.totalExcludingPlayrollFee` may include an embedded transaction fee. | The transaction fee is not stored separately. See [[transaction-fee-calculation]] for how to derive it. |

## Source Reference

| File Path | Purpose |
|---|---|
| `packages/util/src/invoice-employee-record.ts` | Defines `EmployeeInvoiceCurrencySalaryTotals` (the top-level totals object) and `EmployeeInvoiceSalaryTotals` (each currency total object). |
| `packages/calculator-service/src/model.ts` | Defines `CalculationResultTotals`, the internal model used by the calculator service before results are persisted. |

## Related Pages

| Page | Purpose |
|---|---|
| [[calculator-results]] | Parent record that stores `salaryTotalsFull` and `salaryTotalsProrated`. |
| [[employee-data]] | Employee-level calculation context. |
| [[salary-payment-options]] | Documents local, foreign, and salary peg payment setups. |
| [[currency-conversion-fees]] | Documents when conversion fees apply to the billing currency totals. |
| [[exchange-rates]] | Documents the exchange rate context used for currency conversion. |
| [[employer-contribution-breakdown]] | Documents the employer contribution line items that roll up into `employerContribution`. |
| [[employee-contributions-breakdown]] | Documents the employee contribution and deduction line items. |
| [[employee-allowances]] | Documents allowance types that contribute to the `other` field. |
| [[expenses]] | Documents expense and direct expense treatment. |
| [[leave-adjustment]] | Documents leave-related amounts in `leaveAdjustment` and `employeeLeaveDaysAmount`. |
| [[termination-results]] | Documents termination payout amounts in `employeeTerminationPayout`. |
| [[cost-apportionment]] | Documents proration logic for partial-period totals. |
| [[transaction-fee-calculation]] | Documents how to derive the embedded transaction fee from billing currency totals. |
| [[usa-pay-periods]] | Documents US bi-weekly pay period logic affecting totals. |
| [[hourly-employee]] | Documents hourly employee calculation context. |
| [[invoice-record-type]] | Documents the record type and primary result fields. |
