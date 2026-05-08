# Leave Adjustment

## Overview

`leave adjustment` is the salary impact created when approved leave is processed in payroll.

At a high level, the system:

1. Counts how many leave days fall into the payroll period
2. Converts those days into an effective leave-day value
3. Calculates a daily deduction amount
4. Calculates a daily payout/addition amount
5. Applies payout-rate rules, tier rules, and payout limits
6. Produces a final net adjustment

The final formula is:

`adjustment = totalAddition - totalDeduction`

---

## What Counts As Leave Days

The leave calculator counts leave days using:

- approved leave records only
- the payroll period start and end dates
- the employee's working days
- public holidays
- half-day flags

This means the raw leave-day value is not just a simple calendar-day count. It is the leave duration after removing non-working days and applying half-day logic where relevant.

If only part of a leave record overlaps the payroll period, only the overlapping portion is counted.

---

## Core Fields In The Result

The leave adjustment result contains the main fields below.

| Field | Meaning |
|---|---|
| `rawLeaveDays` | Leave days counted before rounding |
| `effectiveLeaveDays` | Leave days after rounding rules are applied |
| `dailyDeduction` | Salary deduction value per leave day |
| `dailyAddition` | Salary payout/addition value per leave day |
| `historicalLeaveDays` | Prior leave days used when tier logic needs history |
| `totalDeduction` | Total salary deduction for the leave days |
| `totalAddition` | Total salary payout/addition for the leave days |
| `adjustment` | Final net impact: `totalAddition - totalDeduction` |
| `tierAllocations` | How leave days were split across payout tiers |

---

## Step 1: Count `rawLeaveDays`

The calculator first counts `rawLeaveDays`.

This count is based on:

- approved leave only
- leave type or entitlement ID, depending on which calculation path is used
- overlap with the payroll period
- working-day rules for the employee
- public holidays in the employee's country
- half-day start / end settings

This raw number can be fractional. For example, half-day leave can produce `0.5`.

---

## Step 2: Convert To `effectiveLeaveDays`

The system then applies a rounding rule to `rawLeaveDays`.

Supported rounding modes are:

| Rounding Mode | Result |
|---|---|
| `NONE` | Keep the raw value as-is |
| `FLOOR` | Round down |
| `CEILING` | Round up |

Examples:

| `rawLeaveDays` | Rounding Mode | `effectiveLeaveDays` |
|---|---|---:|
| `0.5` | `FLOOR` | `0` |
| `0.5` | `CEILING` | `1` |
| `2.0` | `NONE` | `2` |

---

## Step 3: Resolve Daily Amounts

The leave payout config contains two division expressions:

- `salaryDeduction`
- `salaryAddition`

Each one is calculated as:

`daily amount = base / divisor`

This produces:

- `dailyDeduction`
- `dailyAddition`

These values can be different.

That is important because some leave types are unpaid, partially paid, or fully paid.

Examples:

| Scenario | Outcome |
|---|---|
| `dailyAddition = 0` and `dailyDeduction > 0` | Fully unpaid leave |
| `dailyAddition = dailyDeduction` | Fully paid leave |
| `dailyAddition < dailyDeduction` | Partially paid leave |

---

## Step 4: Calculate `totalDeduction`

The total deduction is straightforward:

`totalDeduction = effectiveLeaveDays * dailyDeduction`

This is the gross amount removed for the leave days.

---

## Step 5: Calculate `totalAddition`

The total addition depends on payout-rate rules.

There are two main models:

| Model | Meaning |
|---|---|
| Flat payout rate | All effective leave days use one percentage |
| Tiered payout rate | Different groups of days use different percentages |

### Flat Payout Rate

If a flat payout rate is used, all effective leave days use the same percentage.

Example:

- `effectiveLeaveDays = 3`
- `dailyAddition = 100`
- payout rate = `50%`

Then:

`totalAddition = 3 * 100 * 0.5 = 150`

### Tiered Payout Rate

If tiered payout is enabled, leave days are split across tiers.

Example:

| Tier | Rule |
|---|---|
| Tier 1 | First 5 days paid at 100% |
| Tier 2 | Thereafter paid at 50% |

If the employee has 7 effective leave days in the current calculation:

- 5 days go to Tier 1
- 2 days go to Tier 2

If historical leave days are relevant, they can consume part of an earlier tier before the current period days are allocated.

---

## Historical Leave Days And Tier Positioning

When tiered payout is used, the calculator may use `historicalLeaveDays` to decide where the current leave days should land in the tier structure.

This means current-period leave can start in a lower tier if earlier leave has already consumed the higher-paid tier.

Simple example:

| Value | Amount |
|---|---:|
| Historical leave days | `5` |
| Current effective leave days | `3` |
| Tier 1 | Up to 5 days at 100% |
| Tier 2 | Thereafter at 50% |

Result:

- Tier 1 is already exhausted by history
- all 3 current days fall into Tier 2

---

## Payout Limits

After the payout rate is applied, the result can also be limited.

Supported limit types are:

| Limit Type | Meaning |
|---|---|
| `NONE` | No cap |
| `DAILY` | Cap each day's payout before summing |
| `MONTHLY` | Cap the total payout after summing |

This affects `totalAddition`, not `totalDeduction`.

---

## Gap Reset Behaviour

Some tiered configurations use `GAP_RESET`.

In this mode, tier accumulation resets whenever there is a working-day gap between leave sequences.

This means separate blocks of leave are treated independently for tier allocation.

Instead of using one continuous tier history across the whole period, each consecutive leave block starts again from the first tier.

---

## Hourly Employees

Leave payout adjustment is disabled for hourly employees in this calculator path.

If `employeeContext.isHourlyEmployee` is true, the result is returned as zero adjustment.

So for this package:

- `adjustment = 0`
- `totalDeduction = 0`
- `totalAddition = 0`

This is an important exception to the normal leave-adjustment flow.

---

## Practical Interpretation

The final leave adjustment tells us how payroll should change salary for leave in the period.

| Final Result | Meaning |
|---|---|
| Negative adjustment | Leave reduced salary overall |
| Zero adjustment | No net payroll impact |
| Positive adjustment | Unusual, but possible if addition rules exceed deduction rules |

In most common cases:

- unpaid leave creates a negative adjustment
- fully paid leave creates little or no net adjustment
- partially paid leave creates a smaller negative adjustment than unpaid leave

---

## Related Pages

- [[calculator-results]]
- [[employee-data]]
- [[totals-breakdown]]
- [[termination-results]]
