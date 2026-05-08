# Employee Data

## Overview

`employeeData` contains the employee-level context used when generating invoice results.

It provides the core employee information required to understand **who the employee is**, **where they are employed**, **which salary setup applies**, and whether any special calculation contexts may be relevant.

This object should be treated as **employee calculation context**, not the final payroll or invoice output.

Detailed calculation results are stored in other invoice result fields, such as:

- `salaryTotalsFull`
- `salaryTotalsProrated`
- `employerContributionsFull`
- `employerContributionsProrated`
- `employeeContributionsFull`
- `employeeContributionsProrated`
- `terminationResults`
- `leavePayoutAdjustmentContext`

---

## Employee Data Structure

| Field                            | Description                                                                                                                                                                 |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `employeeName`                   | Name of the employee linked to the invoice result.                                                                                                                          |
| `externalId`                     | External employee identifier, usually provided by the client, payroll provider, or another external system. Can be `null`.                                                  |
| `countryCode`                    | Country code for the employee’s employment country. Example: `US`, `GB`, `ZA`, `IN`, `JP`.                                                                                  |
| `grossMonthlySalary`             | Gross monthly salary value stored on the employee context. Usually in local currency. For hourly employees, this should be interpreted carefully. See [[hourly-employees]]. |
| `isNewStarter`                   | Indicates whether the employee is a new starter in the current invoice/calculation period. See [[new-starters]].                                                            |
| `companyName`                    | Name of the client company linked to the employee.                                                                                                                          |
| `status`                         | Current employment or onboarding status of the employee. See [[employee-status]].                                                                                           |
| `territory`                      | Full territory/country name used for payroll calculation context. See [[territory]].                                                                                        |
| `startDate`                      | Employee’s employment start date.                                                                                                                                           |
| `endDate`                        | Employee’s employment end date, if applicable. Can be `null` for active employees. See [[termination-results]].                                                             |
| `salaryBasis`                    | Basis on which the employee’s salary is defined. Common observed values are `MONTHLY` and `HOURLY`. See [[salary-basis]] and [[hourly-employees]].                          |
| `otherAllowances`                | Additional employee allowances included in the calculation context. Usually stored as a stringified JSON array. See [[employee-allowances]].                                |
| `employerOfRecordId`             | Unique identifier for the employer of record entity linked to the employee. See [[employer-of-record]].                                                                     |
| `confirmedLeaveDays`             | Number of confirmed leave days included in the employee calculation context. See [[leave-adjustment]].                                                                      |
| `remainingLeaveDays`             | Number of remaining leave days available or carried into the calculation context. See [[leave-adjustment]].                                                                 |
| `unpaidLeaveDeductionMultiplier` | Multiplier used to calculate unpaid leave deductions. Usually `0`, but may contain fractional or full deduction values. See [[leave-adjustment]].                           |
| `grossHourlySalary`              | Hourly salary value stored on the employee context. Relevant for [[hourly-employees]]. Can be `null`.                                                                       |
| `apportionOtherCosts`            | Indicates whether other costs should be apportioned or prorated for the employee.                                                                                           |
| `timeTrackingEnabled`            | Indicates whether time tracking is enabled for the employee. Relevant for [[hourly-employees]].                                                                             |
| `hourlyBasisContext`             | Nested object containing hourly/time-tracking context. See [[hourly-employees]].                                                                                            |

---

## Nested Structure: `hourlyBasisContext`

`hourlyBasisContext` contains additional context for employees where hourly or time-tracking logic may apply.

Detailed hourly calculation logic should be documented in [[hourly-employees]].

| Field | Description |
|---|---|
| `totalHoursLoggedForPreviousMonth` | Total hours logged for the previous month. Usually relevant for [[hourly-employees]]. |
| `estimatedSalary` | Estimated salary value used for hourly calculation context. See [[hourly-employees]]. |
| `lastInvoiceEstimatedSalary` | Previous invoice estimate used in hourly calculation context. See [[hourly-employees]]. |
| `salaryForTimesheet` | Timesheet-based salary value used in hourly calculation context. See [[hourly-employees]]. |

---

## Nested Structure: `otherAllowances`

`otherAllowances` contains additional allowances attached to the employee.

Detailed allowance logic should be documented in [[employee-allowances]].

This field may appear as:

| Format | Description |
|---|---|
| `[]` | No allowances. |
| `null` | No allowance data or missing allowance data. |
| Stringified JSON array | One or more allowances are attached to the employee. |

Example structure:

```
[
  {
    "type": "OTHER",
    "amount": 87.11,
    "description": "Wellness Stipend"
  }
]
```
