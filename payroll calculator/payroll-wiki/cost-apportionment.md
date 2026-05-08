# Cost Apportionment

## Overview

Cost apportionment is the logic Playroll uses to prorate payroll amounts when an employee does not fully cover the relevant pay cycle or pay period. It determines the payable share of salary and, depending on territory configuration, can also prorate non-salary costs such as allowances and other monthly employment costs. The result of this logic is exposed through fields like `unworkedDaysPayMultiplier`, `workedWorkingDays`, and `workedCalendarDays` in [[totals-breakdown]].

**Search Tags:** `cost apportionment`, `apportionment`, `proration`, `prorated pay`, `unworkedDaysPayMultiplier`, `apportionmentExpression`, `apportionOtherCosts`, `unworkedDaysPolicy`

## Product Context

Payroll calculations are not always full-period calculations. Employees can start partway through a month, terminate before the end of a cycle, take unpaid leave, or fall into non-monthly pay periods such as US bi-weekly payroll. In these situations, Playroll needs a consistent way to reduce the payable amount to match the part of the period that should actually be paid. Cost apportionment provides that rule. Without it, salary and employer cost totals would overstate what the client owes and what the employee should receive.

## Core Rule

| Rule | Explanation |
|---|---|
| Apportionment calculates a payable fraction of the relevant period. | This fraction is exposed as `unworkedDaysPayMultiplier`. |
| The relevant period can be a full monthly cycle or a territory pay period. | Non-monthly territories still use the same concept, but over a pay-period-specific date range. |
| The territory decides the default apportionment method. | The main control is `unworkedDaysPolicy`. |
| A custom expression can override the default policy. | `apportionmentExpression` takes precedence over the preset policy logic. |
| Other costs may or may not be apportioned with salary. | `apportionOtherCosts` controls whether the active multiplier is applied to non-salary costs such as allowances. |

## Where This Appears

| Field | Parent Record | Notes |
|---|---|---|
| `salaryTotalsFull.unworkedDaysPayMultiplier` | [[calculator-results]] | Payable fraction for the full calculation result. |
| `salaryTotalsProrated.unworkedDaysPayMultiplier` | [[calculator-results]] | Payable fraction for a partial-period result, when present. |
| `salaryTotalsFull.workedWorkingDays` | [[calculator-results]] | Working days counted as payable in the period. |
| `salaryTotalsFull.workedCalendarDays` | [[calculator-results]] | Calendar days counted as payable in the period. |
| `employeeData.apportionOtherCosts` | [[employee-data]] | Snapshot of whether other costs were apportioned for the employee result. |

## Main Configuration Inputs

Cost apportionment is driven primarily by territory configuration.

| Field | Meaning |
|---|---|
| `unworkedDaysPolicy` | Default method used to derive the payable fraction. |
| `apportionmentExpression` | Optional custom expression that overrides the default policy. |
| `apportionOtherCosts` | Whether the same apportionment logic should also apply to non-salary costs. |
| `publicHolidaysPolicy` | Determines whether public holidays affect the day-counting logic. |

These settings live in the territory configuration described in [[territory]].

## Default Apportionment Policies

The territory can choose a preset apportionment policy.

| Policy | Behaviour |
|---|---|
| `WORKING_DAYS` | Uses payable working days over total working days in the relevant period. |
| `CALENDAR_DAYS` | Uses payable calendar days over total calendar days in the relevant period. |
| `AVG_DAILY_SALARY_WORKING_DAYS` | Legacy policy observed in migration scripts; later replaced in some configs by a custom expression. |

The output of these policies is reflected in:

| Output Field | Meaning |
|---|---|
| `workedWorkingDays` | Working days counted as payable. |
| `workedCalendarDays` | Calendar days counted as payable. |
| `totalWorkingDays` | Total working days in the relevant period. |
| `totalCalendarDays` | Total calendar days in the relevant period. |
| `unworkedDaysPayMultiplier` | Final multiplier applied to salary-driven values. |

## Custom Apportionment Expression

Some territories override the preset policy with an explicit expression.

Example observed in migration scripts:

```text
${monthlyGrossSalary} * ${workedWorkingDays} / ${averageWorkingDays}
```

This means:

- the calculator can use a salary-specific formula rather than a simple policy lookup
- the expression is resolved using calculation variables from the active employee and period context
- the formula can be changed without rewriting the entire calculator engine

The monorepo docs for non-monthly pay periods also show a previously used expression for pay-period conversion:

```text
(${monthlyGrossSalary} * 12 / 26 * 2) * ${workedWorkingDays} / ${totalWorkingDays}
```

This is important historically because it shows that apportionment can blend both salary conversion and worked-day proration in one expression.

## Salary vs Other Costs

By default, salary apportionment and non-salary cost apportionment are related but separate decisions.

| Component | Always apportioned? | Controlled by |
|---|---:|---|
| Base salary | Yes | Salary apportionment logic |
| Other costs / allowances | Not always | `apportionOtherCosts` |

When `apportionOtherCosts = true`, non-salary costs such as allowances can be multiplied by the same apportionment factor used for salary. When `apportionOtherCosts = false`, those costs remain at full value even if salary is prorated.

This distinction is visible in invoice-generation code where the allowance breakdown is multiplied by:

`unworkedDaysPayMultiplier`

only when `apportionOtherCosts` is enabled.

## Monthly Cycle vs Pay Period Behaviour

The same employee can produce different apportionment outcomes depending on whether the relevant calculation window is a full monthly cycle or a territory-specific pay period.

| Scenario | Behaviour |
|---|---|
| Employee fully covers the pay period | `unworkedDaysPayMultiplier = 1` for that pay period. |
| Employee starts during the pay period | Multiplier is less than `1`, based on the portion of payable days covered. |
| Employee appears full within a pay period but partial within a month | Pay-period calculation can be `1` while the monthly-cycle calculation is still prorated. |

This matters most for non-monthly payroll territories such as US bi-weekly payroll, where the pay period and the monthly cycle are not the same boundary.

## Worked Example

An employee starts during a 14-day pay period.

| Policy | Example ratio | Multiplier |
|---|---|---:|
| `WORKING_DAYS` | `6 / 10` | `0.6` |
| `CALENDAR_DAYS` | `8 / 14` | `0.5714...` |

The payroll result then uses that multiplier to reduce salary and, if configured, other apportioned costs.

## Relationship to Totals

Apportionment changes the values persisted in the totals breakdown.

| Field | Effect |
|---|---|
| `grossSalary` | Reduced when the employee only covers part of the relevant period. |
| `totalsLocalCurrency.baseSalary` | Reflects the apportioned salary amount. |
| `totalsBillingCurrency.baseSalary` | Reflects the apportioned amount after currency representation or conversion. |
| `totalsLocalCurrency.other` | May be apportioned when `apportionOtherCosts` is enabled. |

## Exceptions and Edge Cases

| Scenario | Behaviour | Notes |
|---|---|---|
| Full-period coverage | Multiplier is `1`. | No proration applies. |
| No payable days | Multiplier can be `0`. | The salary result for the period can reduce to zero. |
| Negative or differential comparison records | Worked-day and multiplier fields can appear as negative deltas in out-of-cycle comparison logic. | This happens in derived difference records rather than primary payroll outputs. |
| Non-monthly pay periods | The relevant denominator can be a pay period instead of a calendar month. | This is expected and not a special-case bug. |

## Data Notes

| Observation | Note |
|---|---|
| `unworkedDaysPayMultiplier` can be `0`, fractional, or `1`. | `1` means full coverage of the relevant period. |
| `workedWorkingDays` and `workedCalendarDays` are persisted outputs. | They are not just intermediate calculator values. |
| `apportionOtherCosts` is optional in `employeeData`. | When absent, behaviour follows the territory default captured at calculation time. |
| Apportionment logic can differ by territory. | A result should always be interpreted alongside its territory context. |

## Source Reference

| File Path | Purpose |
|---|---|
| `packages/calculator/src/context/territory.ts` | Defines `unworkedDaysPolicy`, `apportionmentExpression`, and `apportionOtherCosts` on the territory context. |
| `packages/calculator/src/engine/engine.non-monthly.test.ts` | Demonstrates the expected behaviour for apportionment across pay periods and monthly cycles. |
| `packages/invoice-service/src/service.ts` | Shows how `apportionOtherCosts` affects downstream invoice row generation and allowance breakdowns. |
| `scripts/apportionment/updateCustomSalaryBaseValue.js` | Example migration changing territory apportionment behaviour via `unworkedDaysPolicy` and `apportionmentExpression`. |
| `scripts/apportionment/updateApportionmentOtherCosts.js` | Example migration enabling `apportionOtherCosts` across territory configs. |

> Cost apportionment determines what fraction of the relevant period should be paid, and that fraction can apply to salary alone or to salary plus other costs depending on territory configuration.

## Related Pages

| Page | Purpose |
|---|---|
| [[totals-breakdown]] | Documents the multiplier and worked-day output fields. |
| [[employee-data]] | Documents `apportionOtherCosts` as captured on the employee calculation snapshot. |
| [[territory]] | Documents the territory configuration fields that drive apportionment. |
| [[usa-pay-periods]] | Documents non-monthly pay period behaviour where apportionment uses pay-period boundaries. |
| [[leave-adjustment]] | Documents leave-related salary changes that can interact with partial-period calculations. |
