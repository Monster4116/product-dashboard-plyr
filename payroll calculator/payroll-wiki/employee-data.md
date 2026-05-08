# Employee Data

## Overview

Employee data contains the employee-level context captured at the time a calculator result is generated. It records who the employee is, where they are employed, which salary setup applies, and any special calculation flags relevant to the period. This object is calculation context, not payroll output — the actual calculated amounts are stored in the salary totals and contribution fields on the parent record.

**Search Tags:** `employee data`, `employee snapshot`, `employee context`, `employeeData`, `salaryBasis`, `grossHourlySalary`, `otherAllowances`, `hourlyBasisContext`

## Product Context

Payroll calculations depend on a snapshot of employee details that were current at the time the calculation ran. The employee data object provides that snapshot, ensuring that the calculator result remains a faithful record of what was known at calculation time even if the employee's details change later. It gives operations teams the information needed to understand salary basis, territory, allowances, leave context, and any hourly tracking setup without looking up the live employee record.

## Where This Appears

| Field | Parent Record | Notes |
|---|---|---|
| `employeeData` | [[calculator-results]] | Stored as a JSON column on the `InvoiceEmployeeRecord`. |

## Employee Data Structure

| Field | Description | Nullable? |
|---|---|---|
| `employeeName` | Name of the employee linked to the invoice result. | No |
| `externalId` | External employee identifier, usually provided by the client, payroll provider, or another external system. | Yes |
| `countryCode` | Country code for the employee's employment country. Example values: `US`, `GB`, `ZA`, `IN`, `JP`. | No |
| `grossMonthlySalary` | Gross monthly salary value stored on the employee context at calculation time. For hourly employees this field requires careful interpretation. See [[hourly-employee]]. | No |
| `isNewStarter` | Indicates whether the employee is a new starter in the current invoice or calculation period. See [[new-starters]]. | No |
| `companyName` | Name of the client company linked to the employee. | Yes |
| `status` | Employment or onboarding status of the employee at the time of calculation. See [[employee-status]]. | No |
| `territory` | Full territory or country name used for payroll calculation context. See [[territory]]. | No |
| `startDate` | Employee's employment start date. | No |
| `endDate` | Employee's employment end date, if applicable. See [[termination-results]]. | Yes |
| `salaryBasis` | Basis on which the employee's salary is defined. Observed values are `MONTHLY` and `HOURLY`. See [[salary-basis]] and [[hourly-employee]]. | No |
| `otherAllowances` | Additional employee allowances included in the calculation context. Stored as a stringified JSON array. See [[employee-allowances]]. | Yes |
| `employerOfRecordId` | Unique identifier for the employer of record entity linked to the employee. See [[employer-of-record]]. | Yes |
| `confirmedLeaveDays` | Number of confirmed leave days included in the employee calculation context. See [[leave-adjustment]]. | No |
| `remainingLeaveDays` | Number of remaining leave days available or carried into the calculation context. See [[leave-adjustment]]. | No |
| `unpaidLeaveDeductionMultiplier` | Multiplier used to calculate unpaid leave deductions. Usual value is `0`, but may contain fractional or full deduction values. See [[leave-adjustment]]. | No |
| `grossHourlySalary` | Hourly salary value stored on the employee context. Relevant for hourly employees. See [[hourly-employee]]. | Yes |
| `apportionOtherCosts` | Indicates whether other costs should be apportioned or prorated for the employee. | Sometimes — optional field |
| `timeTrackingEnabled` | Indicates whether time tracking is enabled for the employee. Relevant for hourly employees. See [[hourly-employee]]. | No |
| `hourlyBasisContext` | Nested object containing hourly and time-tracking context. See [[hourly-employee]]. | Sometimes — optional field |

## Nested Structure: hourlyBasisContext

`hourlyBasisContext` contains additional context for employees where hourly or time-tracking logic applies. Detailed hourly calculation logic is documented in [[hourly-employee]].

| Field | Description | Nullable? |
|---|---|---|
| `totalHoursLoggedForPreviousMonth` | Total hours logged for the previous month. Relevant for hourly employees. | Yes |
| `estimatedSalary` | Estimated salary value used for the current hourly calculation cycle. | Sometimes — optional field |
| `lastInvoiceEstimatedSalary` | Previous invoice estimated salary, used for hourly variance adjustment. | Sometimes — optional field |
| `salaryForTimesheet` | Timesheet-based salary value calculated from approved logged hours. | Sometimes — optional field |

## Nested Structure: otherAllowances

`otherAllowances` contains additional allowances attached to the employee. Detailed allowance logic is documented in [[employee-allowances]].

This field may appear in three formats:

| Format | Description |
|---|---|
| `[]` | No allowances are attached. |
| `null` | No allowance data or missing allowance data. |
| Stringified JSON array | One or more allowances are attached to the employee. |

Example structure when allowances are present:

```json
[
  {
    "type": "OTHER",
    "amount": 87.11,
    "description": "Wellness Stipend"
  }
]
```

## Data Notes

| Observation | Note |
|---|---|
| `externalId` can be null. | Not all employees have an external identifier provided by the client or payroll provider. |
| `companyName` can be null. | The company name may not be populated for all records. |
| `endDate` can be null for active employees. | Only populated for employees who have been terminated or are terminating. |
| `otherAllowances` can be null or an empty array. | A null value and an empty array both indicate no allowances. |
| `employerOfRecordId` can be null. | Not all employees are linked to an employer of record entity. |
| `grossHourlySalary` can be null. | Only relevant for employees with `salaryBasis = HOURLY`. |
| `apportionOtherCosts` is optional. | When absent, apportionment behaviour follows the default for the territory or configuration. |
| `hourlyBasisContext` is optional. | Only present for hourly employees or employees with time tracking enabled. |
| `grossMonthlySalary` for hourly employees requires careful interpretation. | For hourly employees, the useful fields are `grossHourlySalary` and `hourlyBasisContext`, not `grossMonthlySalary`. See [[hourly-employee]]. |

## Source Reference

| File Path | Purpose |
|---|---|
| `packages/util/src/invoice-employee-record.ts` | Defines `EmployeeInvoiceEmployeeData` and the `EmployeeInvoiceEmployeeDataSchema` TypeBox schema used for runtime validation. |

## Related Pages

| Page | Purpose |
|---|---|
| [[calculator-results]] | Parent record that stores `employeeData` as a JSON column. |
| [[employee-status]] | Documents the `status` field values and their meanings. |
| [[hourly-employee]] | Documents hourly salary basis, time tracking, and the `hourlyBasisContext` nested object. |
| [[leave-adjustment]] | Documents leave day fields and the unpaid leave deduction multiplier. |
| [[termination-results]] | Documents the `endDate` field context for terminating employees. |
| [[new-starters]] | Documents the `isNewStarter` flag and its effect on payroll calculations. |
| [[employee-allowances]] | Documents the `otherAllowances` field structure and allowance types. |
| [[territory]] | Documents territory-level payroll rules referenced by `territory` and `countryCode`. |
| [[salary-basis]] | Documents the `salaryBasis` field values `MONTHLY` and `HOURLY`. |
| [[employer-of-record]] | Documents the employer of record entity referenced by `employerOfRecordId`. |
