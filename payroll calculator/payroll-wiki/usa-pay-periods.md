# US Bi-Weekly Payroll Logic

## Core Concept

In the US, employees are paid **bi-weekly**, meaning they are paid once every 2 weeks. This creates **26 pay periods per year**. (52 weeks per year / 2 weeks = 26 pay periods). However, invoicing is still managed across **12 calendar months**. This means the 26 pay periods do not divide evenly into 12 months.

As a result:
We have 2 months a year with 3 pay periods, and 10 months with 2 pay periods

| Month Type | Number of Pay Periods | Frequency |
|---|---:|---:|
| Standard month | 2 pay periods | 10 months per year |
| Three-pay-period month | 3 pay periods | 2 months per year |

## Why This Matters

Most US invoice months include **2 bi-weekly pay periods**. However, because there are 26 pay periods in a year and only 12 invoice months, **2 months in the year will include 3 pay periods**.

This means that invoice totals for US employees can vary from month to month, even when the employee’s salary has not changed. A higher invoice amount in a three-pay-period month is expected because the employee is being paid for an additional pay cycle.

## Simple Example

If a US employee earns a fixed amount per bi-weekly pay period:

| Pay Period Amount | Month Type         | Monthly Invoice Salary Amount |
| :---------------- | :----------------- | :---------------------------- |
| $2,000            | 2-pay-period month | $4,000                        |
| $2,000            | 3-pay-period month | $6,000                        |

The employee’s pay did not change. The invoice is higher because the month contains one additional pay period.

## Product Interpretation

For US employees, the invoice result should be understood as **pay-period-based**, not purely monthly-salary-based.

| Concept                  | Explanation                                                                     |
| ------------------------ | ------------------------------------------------------------------------------- |
| Pay frequency            | Employees are paid every 2 weeks.                                               |
| Annual pay periods       | There are 26 pay periods per year.                                              |
| Monthly invoice mismatch | 26 pay periods do not fit evenly into 12 months.                                |
| Standard invoice month   | Usually contains 2 pay periods.                                                 |
| Higher invoice month     | Some months contain 3 pay periods.                                              |
| Product impact           | Invoice results may be higher in 3-pay-period months without any salary change. |

## Relevant Invoice Result Fields ([[calculator-results]])

| Field               | Why It Matters                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `payPeriodStart`    | Shows when the bi-weekly pay period begins.                                                   |
| `payPeriodEnd`      | Shows when the bi-weekly pay period ends.                                                     |
| `calculationPeriod` | Identifies the result as `BI_WEEKLY`.                                                         |
| `isAggregated`      | Indicates whether multiple pay period results have been rolled into a monthly invoice result. |
| `isPrimary`         | Helps identify the main invoice-facing result where multiple records exist.                   |
| `invoiceDate`       | Shows the invoice month that the pay period result belongs to.                                |

## Invoicing For US Employees

For US employees, we based on invoice totals on the per pay period result being where the [[invoice-record-type]] is either STANDARD_CYCLE or OUT_OF_CYCLE but the isPrimary is TRUE.

On the invoice breakdown, depending on the [[custom-invoice-format]] employees are not displayed with a single line item, we always display their amounts on a pay period level to ensure clarity on the amount
