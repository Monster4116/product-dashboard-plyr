# Employee Status

## Overview

Employee status represents the current onboarding or employment lifecycle state of an employee record in Playroll. The `status` field on the employee record stores this value, and it is also captured on the [[calculator-results]] record at the time of invoice generation. Notable constraints: status advances through the lifecycle in a defined sequence, and only employees in certain statuses are eligible for payroll processing.

**Search Tags:** `employee status`, `employment status`, `onboarding status`, `status`, `EMPLOYEE_SIGNED`, `EMPLOYEE_ON_NOTICE`, `EMPLOYEE_TERMINATED`, `EMPLOYER_SIGNED`

## Product Context

The employee status determines where an employee sits in the Playroll onboarding and employment lifecycle. Clients and the Playroll operations team use it to understand whether an employee is actively employed, still onboarding, serving notice, or terminated. Payroll processing and invoice generation are gated by employee status — an employee who has not completed the onboarding process will not appear on an invoice. The status also drives operational workflows such as document collection, agreement signing, and termination processing.

## Values

| Value | Label | Description | When Used |
|---|---|---|---|
| `CREATED` | Created | The employee entity has been created in the system. | Assigned when a new employee record is first created, before any onboarding action has been taken. |
| `ADDENDUM_SENT` | Onboarding — Addendum Sent | The MSA Addendum has been opened by the employer but has not yet been signed by anyone. | Assigned when the employer initiates the addendum signing process. |
| `EMPLOYER_SIGNED` | Onboarding — Employer Signed | The employer has signed the MSA Addendum but the employee has not yet signed. | Assigned after the employer's signature is recorded on the addendum. |
| `EMPLOYEE_AGREEMENT_UPLOADED` | Agreement Sent | The employee's work eligibility has been confirmed by the Playroll operations team. | Assigned when the ops team confirms eligibility after the employer has signed. |
| `EMPLOYEE_SIGNED` | Active | Both the employer and the employee have signed the MSA Addendum. | Assigned when the employee completes signing, making the employee fully onboarded and active. |
| `EMPLOYEE_ON_NOTICE` | Terminating | The employee has entered the notice period for contract termination. | Assigned when a termination is initiated and the employee begins serving notice. |
| `EMPLOYEE_TERMINATED` | Terminated | The employee has been fully terminated. | Assigned when the termination process is complete and the employment has ended. |
| `DRAFT` | Hidden | The employee is a draft record. Fields will be copied to another employee record if the MSA Addendum is signed. | Assigned for draft employee records that are not yet active and should not appear in standard views. |
| `INACTIVE` | Inactive | The employee record has been soft deleted. | Assigned when a record is soft deleted rather than fully removed from the database. |
| `PENDING` | Pending | The employee is in a pending state. **[❓ BQ-3]** | Assigned when the employee is in a pending state. The exact conditions that trigger this status and how it differs from `CREATED` require clarification. |
| `EMPLOYEE_UPDATED_TERMS` | Updated Terms | The employee's terms have been updated. **[❓ BQ-1]** | Assigned under conditions that require clarification from the product team. |
| `ADDENDUM_CANCELLED` | Addendum Cancelled | The MSA Addendum process has been cancelled. **[❓ BQ-2]** | Assigned under conditions that require clarification from the product team. |

## Behaviour Notes

| Scenario | Behaviour |
|---|---|
| Employee is `EMPLOYEE_SIGNED` | The employee is considered active and is eligible for payroll processing and invoice generation. |
| Employee is `EMPLOYEE_ON_NOTICE` | The employee may still appear on invoices during the notice period, including termination payout calculations. |
| Employee is `EMPLOYEE_TERMINATED` | The employee is no longer eligible for standard payroll. Final pay and termination results may still appear on the last applicable invoice. |
| Employee is `DRAFT` | The employee does not appear in standard active employee lists or payroll processing runs. |
| Employee is `INACTIVE` | The employee record is soft deleted and does not appear in active lists or payroll runs. |
| Employee is in any onboarding status | The employee is not yet eligible for payroll processing. |

## Open Questions

| ID | Question | Context | Status |
|---|---|---|---|
| BQ-1 | The enum value `EMPLOYEE_UPDATED_TERMS` in `prisma/schema.prisma` has no JSDoc comment. What does this status represent and when is it assigned? | `## Values` table — `EMPLOYEE_UPDATED_TERMS` row. The source code contains the enum value with no comment or description. | Unanswered |
| BQ-2 | The enum value `ADDENDUM_CANCELLED` in `prisma/schema.prisma` has no JSDoc comment. What does this status represent and when is it assigned? | `## Values` table — `ADDENDUM_CANCELLED` row. The source code contains the enum value with no comment or description. | Unanswered |
| BQ-3 | The enum value `PENDING` in `prisma/schema.prisma` has only the comment "Employee Pending" with no further description. What triggers this status and how does it differ from `CREATED`? | `## Values` table — `PENDING` row. The source code comment reads "Employee Pending" with no further context. | Unanswered |

## Source Reference

| File Path | Purpose |
|---|---|
| `prisma/schema.prisma` | Defines the `EmployeeStatus` enum with all values and available comments. |

## Related Pages

| Page | Purpose |
|---|---|
| [[calculator-results]] | Stores a snapshot of the employee status at the time of invoice generation. |
| [[employee-data]] | Contains the `status` field as part of the employee calculation context. |
| [[termination-results]] | Documents termination payouts that apply when an employee is terminating or terminated. |
