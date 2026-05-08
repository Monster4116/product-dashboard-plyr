# Salary Basis

## Overview

Salary basis is the employee-level classification that determines how gross pay is calculated before currency handling, billing conversion, and reporting take place. The observed values are `MONTHLY` and `HOURLY`. `salaryBasis` does not decide which currency model applies to the employee; that is handled separately by the salary payment option documented in [[salary-payment-options]].

**Search Tags:** `salary basis`, `pay basis`, `monthly vs hourly`, `salaryBasis`, `MONTHLY`, `HOURLY`, `grossHourlySalary`, `hourlyBasisContext`

## Product Context

Two employees can share the same territory, billing currency, and salary payment arrangement while still following very different payroll calculation paths. A monthly employee starts from a fixed monthly salary value. An hourly employee starts from an hourly rate and may use estimate, timesheet, and variance-adjustment logic. Salary basis is the switch that decides which gross-pay path the calculator should use. The currency and invoice layers happen after that.

## Core Rule

| Rule | Explanation |
|---|---|
| `salaryBasis` determines the gross-pay calculation path. | It answers "how is pay calculated?" rather than "which currency is used?" |
| `MONTHLY` and `HOURLY` are separate from salary payment setup. | Local salary, foreign salary, and salary peg are separate dimensions. |
| The result snapshot stores the chosen basis in `employeeData.salaryBasis`. | This preserves the calculation path used at the time the result was generated. |

## Values

| Value | Meaning | Primary Gross-Pay Input |
|---|---|---|
| `MONTHLY` | Employee is processed through the monthly salary path. | `grossMonthlySalary` |
| `HOURLY` | Employee is processed through the hourly payroll path. | `grossHourlySalary` plus `hourlyBasisContext` |

## Salary Basis vs Salary Payment Option

These concepts should be kept separate in documentation.

| Concept | Main Question |
|---|---|
| Salary basis | How is gross pay calculated? |
| Salary payment option | In which currency model is that pay defined, represented, and paid? |

Examples:

| Scenario | Salary Basis | Salary Payment Option |
|---|---|---|
| Standard salaried employee in local currency | `MONTHLY` | Local salary |
| Salaried employee paid in USD | `MONTHLY` | Foreign salary |
| Hourly employee paid locally | `HOURLY` | Local salary |
| Hourly employee with foreign-currency payment | `HOURLY` | Foreign salary |
| Hourly employee with a peg arrangement | `HOURLY` | Salary peg, where supported |

## Monthly Basis

For `MONTHLY` employees:

| Characteristic | Behaviour |
|---|---|
| Main salary input | `grossMonthlySalary` |
| Standard use case | Fixed monthly salary payroll |
| Proration path | Uses territory apportionment rules for partial periods |
| Currency handling | Still subject to local / foreign / peg salary payment logic |

## Hourly Basis

For `HOURLY` employees:

| Characteristic | Behaviour |
|---|---|
| Main salary input | `grossHourlySalary` |
| Supporting context | `hourlyBasisContext` |
| Estimation | Can produce `estimatedSalary` when timesheets are not yet final |
| Confirmed pay | Can produce `salaryForTimesheet` from approved logged hours |
| Variance handling | Uses `lastInvoiceEstimatedSalary` to carry forward estimate vs actual differences |

See [[hourly-employee]] for the full hourly calculation path.

## Relationship to Calculator Results

The chosen basis is persisted in the employee snapshot used by the calculator result.

| Result Field | Meaning |
|---|---|
| `employeeData.salaryBasis` | Monthly vs hourly path used for the result |
| `employeeData.grossMonthlySalary` | Monthly salary snapshot |
| `employeeData.grossHourlySalary` | Hourly rate snapshot |
| `employeeData.timeTrackingEnabled` | Indicates whether time tracking is expected for the employee |
| `employeeData.hourlyBasisContext.*` | Estimate, timesheet, and prior-estimate values for hourly processing |

## Relationship to Currency and Billing

Salary basis does not replace salary payment setup. It runs before it.

Practical sequence:

1. `salaryBasis` determines how gross pay is derived.
2. Salary payment setup determines how that pay is represented across local, salary payment, and billing currencies.
3. Totals and invoice outputs are generated from that combination.

So:

- `salaryBasis` controls the gross-pay engine
- salary payment option controls the currency and billing path

## Exceptions and Edge Cases

| Scenario | Behaviour | Notes |
|---|---|---|
| `HOURLY` employee without `grossHourlySalary` | Payroll cannot be calculated correctly. | This is a configuration issue. |
| `MONTHLY` employee with `grossHourlySalary = null` | Expected. | Hourly rate is irrelevant for monthly basis. |
| Hourly employee with foreign salary or salary peg fields | Valid as a model. | Salary basis and salary payment option are separate dimensions. |
| Hourly employee leave adjustment | Leave payout adjustment is disabled in the standard hourly path. | See [[leave-adjustment]]. |

## Data Notes

| Observation | Note |
|---|---|
| `salaryBasis` is stored as a string in the employee snapshot. | The wiki should still treat `MONTHLY` and `HOURLY` as controlled values. |
| `grossMonthlySalary` can still be present on hourly records. | It should not be treated as the primary hourly input. |
| `hourlyBasisContext` is optional. | It is only meaningful when hourly or time-tracking logic applies. |

## Source Reference

| File Path | Purpose |
|---|---|
| `packages/util/src/invoice-employee-record.ts` | Defines `salaryBasis`, `grossMonthlySalary`, `grossHourlySalary`, and `hourlyBasisContext` on the employee snapshot. |
| `packages/invoice-service/src/helpers.ts` | Populates the salary-basis-related fields persisted onto invoice employee records. |
| `packages/calculator/src/engine/estimation.ts` | Shows how hourly salary is estimated from hourly rate and working-time assumptions. |

> Salary basis answers how gross pay is calculated; salary payment option answers how that pay is represented and paid across currencies.

## Related Pages

| Page | Purpose |
|---|---|
| [[employee-data]] | Documents the persisted employee snapshot fields including `salaryBasis`. |
| [[hourly-employee]] | Documents the detailed hourly payroll calculation path. |
| [[salary-payment-options]] | Documents the separate salary payment dimension for local, foreign, and pegged arrangements. |
| [[totals-breakdown]] | Documents the totals that receive the output of the chosen salary-basis path. |
| [[exchange-rates]] | Documents the currency context layered on top of the gross-pay result. |
