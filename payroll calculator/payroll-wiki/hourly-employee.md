---
aliases:
  - hourly-employees
---

# Hourly Employees

## Overview

Hourly employees are employees whose `salaryBasis` is `HOURLY`.

Unlike standard monthly employees, their payroll result is not based on a fixed monthly gross salary. Instead, payroll uses an hourly rate together with working-time assumptions and, where available, approved time tracking data.

This means hourly payroll usually has two concepts:

1. An **estimated salary** for the current cycle
2. A **timesheet-based salary** based on approved logged hours

---

## Core Processing Logic

At a high level, hourly employees are processed as follows:

| Step | What Happens |
|---|---|
| Identify hourly employee | The employee has `salaryBasis = HOURLY`. |
| Read hourly rate | Payroll uses `grossHourlySalary` or another hourly-equivalent salary value. |
| Build estimate | The calculator creates an `estimatedSalary` for the cycle using expected working days / hours. |
| Check time tracking | If approved time tracking exists, payroll also calculates `salaryForTimesheet`. |
| Apply variance logic | If a previous invoice already used an estimate, payroll adjusts the current cycle to account for the difference between the old estimate and the real timesheet result. |

In simple terms:

- no timesheet data -> payroll uses an estimate
- timesheet data available -> payroll can use actual worked hours
- prior estimate exists -> payroll carries the variance forward into the next cycle

---

## Simple Payroll Interpretation

Hourly payroll is designed so that the employee can still be processed even when final timesheet data is not yet available.

| Scenario | Payroll Behaviour |
|---|---|
| No approved time tracking yet | Use estimated salary |
| Approved time tracking exists for the relevant period | Use timesheet salary |
| Prior month was estimated and actual hours arrive later | Adjust the current payroll cycle for the difference |

This helps payroll continue on time while still correcting for over- or under-estimation later.

---

## Relevant Fields

These fields are the main hourly fields visible in invoice results and employee calculation context.

| Field | Description |
|---|---|
| `salaryBasis` | Should be `HOURLY` for hourly employees. |
| `grossHourlySalary` | Hourly rate used in payroll calculations. |
| `timeTrackingEnabled` | Indicates whether time tracking is expected for the employee. |
| `hourlyBasisContext.estimatedSalary` | Estimated salary generated for the cycle. |
| `hourlyBasisContext.salaryForTimesheet` | Salary based on approved logged hours. |
| `hourlyBasisContext.lastInvoiceEstimatedSalary` | Prior estimated salary used for variance adjustment. |
| `timeTrackingIds` | Time tracking records linked to the invoice result. |

Related pages:

- [[employee-data]]
- [[calculator-results]]
- [[totals-breakdown]]

---

## Important Note

For hourly employees, `grossMonthlySalary` should not be interpreted the same way as for fixed monthly employees.

The more useful fields are usually:

- `grossHourlySalary`
- `hourlyBasisContext`
- `timeTrackingIds`

These show whether the result was estimated, based on timesheets, or adjusted from a prior estimate.
