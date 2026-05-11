# Employee Status

## Overview

Employee status explains where an employee currently sits in the Playroll employment lifecycle. Internal teams usually see this in two forms: the raw employee status stored on the employee record, and the derived Platform Action Status shown in the admin panel. This page separates those two layers and explains what operators should read first when they are trying to understand whether an employee is onboarding, active, terminating, or stuck.

**Search Tags:** `employee status`, `platform action status`, `employment status`, `onboarding status`, `EMPLOYEE_SIGNED`, `EMPLOYEE_ON_NOTICE`, `EMPLOYEE_TERMINATED`, `EMPLOYER_SIGNED`

## Product Context

Employee status helps internal teams answer three practical questions quickly: where the employee is in the journey, whether payroll should already be happening, and what action is likely needed next. The raw status is important for data integrity and downstream processing, while the Platform Action Status is a friendlier admin-facing signal that tries to summarize the employee's real-world progress. When these two views appear to disagree, the right interpretation is usually that the raw status shows the formal lifecycle step and the Platform Action Status shows the current operational posture.

## What Internal Teams Should Read First

| If you need to know... | Start with | Why |
|---|---|---|
| Whether the employee should already be live on payroll | Platform Action Status | This is the quickest operational signal in the admin panel. |
| Whether the employee has fully completed onboarding | Platform Action Status plus start date | Some statuses change meaning depending on whether the start date is in the future or already in the past. |
| Whether the employee is formally active, terminating, or terminated | Raw employee status | This is the system-of-record lifecycle state. |
| Why the admin panel label looks unexpected | The input signals table below | The admin label is derived from a combination of status, dates, and onboarding data. |

## Key Operational Signals

| Signal | What it usually means for ops |
|---|---|
| `Invitation Sent` | The employee has been invited but has not yet meaningfully entered onboarding. |
| `Accepted Invitation` | The employee relationship exists, but self-onboarding has not clearly progressed yet. |
| `Employee Self-Onboarding` | The employee has started filling in portal information. |
| `Work Eligibility Checks` | The employee has progressed far enough that Playroll operations is now validating required onboarding details. |
| `Agreement Sent` | Agreement-related progress exists, but the employee is not yet fully live. |
| `Agreement Signed` | Signatures are complete, but the start date is still in the future. |
| `Not Started` | The start date is already in the past, but the employee has not progressed far enough to be considered active. This is usually a follow-up signal, not a final state. |
| `Active` | The employee is fully signed and has reached or passed the start date. |
| `Terminating` | The employee is in notice and may still appear in payroll-related flows. |
| `Terminated` | The employee is no longer in the standard active employment lifecycle. |

## Which Employee Data Drives The Admin Label

| Employee data point | Why it matters |
|---|---|
| Raw employee status | This is the primary starting point for the derived label. |
| Start date | Distinguishes future-start signed employees from already-active employees, and also helps determine `Not Started`. |
| Personal address presence | Used as a practical sign that self-onboarding has begun. |
| Company ownership / accepted relationship | Used as a sign that the employee has accepted the invitation or has an account relationship with the company. |
| Employee portal details and employment options | Used to decide whether required onboarding information is complete enough for the next step. |
| Country and region | Needed when validating onboarding requirements because required fields differ by territory. |
| Employee documents | Used for some UI-only relabelling such as pending deposit messaging. |

## Platform Action Status Logic

This is the business-friendly interpretation of the admin panel logic.

| Priority order | Result shown in admin panel | Business meaning |
|---|---|---|
| 1 | `Terminating` | The employee is in notice, so the termination journey has already started. |
| 2 | `Active` | The employee is fully signed and their start date has arrived. |
| 3 | `Terminated` | The employee has fully left active employment. |
| 4 | `Cancelled` | The addendum process was cancelled before the employee became active. |
| 5 | `Not Started` | The employee's start date has already passed, but they are still stuck in an earlier onboarding step. |
| 6 | `Created` | The record exists but has barely started moving through onboarding. |
| 7 | `Addendum Sent for Signature` | The addendum has been sent but not completed. |
| 8 | `Agreement Signed` | Signatures are complete, but the employee has not reached their start date yet. |
| 9 | `Agreement Sent` | Agreement-related progress exists, but the employee is not yet treated as active. |
| 10 | `Work Eligibility Checks` | The employee has progressed far enough that Playroll is validating onboarding completeness. |
| 11 | `Employee Self-Onboarding` | The employee has clearly started entering their own details. |
| 12 | `Accepted Invitation` | The employee relationship exists, but onboarding detail entry has not clearly started. |
| 13 | `Invitation Sent` | The employee is still at the earliest invitation stage. |

## Raw Employee Statuses

These are the stored lifecycle values that exist on the employee record itself.

| Value | Plain-English meaning | Operational note |
|---|---|---|
| `CREATED` | The employee record has been created. | Early setup state. |
| `ADDENDUM_SENT` | The addendum process has started but is not yet complete. | Still onboarding. |
| `EMPLOYER_SIGNED` | The employer side is signed. | The employee is still progressing through onboarding. |
| `EMPLOYEE_AGREEMENT_UPLOADED` | Agreement-related progress has advanced beyond employer signature. | Often appears before the employee is fully live. |
| `EMPLOYEE_UPDATED_TERMS` | The employee's terms were updated. | The precise business meaning still needs final clarification. |
| `EMPLOYEE_SIGNED` | The employee has completed signing. | Combined with start date, this becomes either `Agreement Signed` or `Active`. |
| `EMPLOYEE_ON_NOTICE` | The employee is in notice. | Usually shown as `Terminating` in admin. |
| `EMPLOYEE_TERMINATED` | The employee is terminated. | End of standard employment lifecycle. |
| `ADDENDUM_CANCELLED` | The addendum process was cancelled. | Usually shown as `Cancelled` in admin. |
| `DRAFT` | Draft employee record. | Not part of the normal live employee journey. |
| `INACTIVE` | Soft-deleted or inactive record. | Not part of standard active operations. |
| `PENDING` | Pending state. | The exact trigger still needs clarification. |

## Important Interpretation Notes

| Situation | How to interpret it |
|---|---|
| Raw status looks advanced but admin label says `Not Started` | The employee's start date has already passed, but onboarding did not progress far enough to treat them as active. |
| Admin label says `Agreement Signed` | The employee is fully signed, but the start date is still in the future. |
| Admin label says `Work Eligibility Checks` | The employee is not yet fully live; internal validation is still part of the path. |
| Admin label says `Pending Deposit Payment` | This is a UI relabel, not a separate core lifecycle status. |
| Historical report status differs from the live admin panel | Some status derivations are evaluated relative to the report invoice date rather than today's date. |

## Payroll And Invoice Impact

| State category | Expected payroll impact |
|---|---|
| Early onboarding states | The employee is not yet expected to appear as a normal active payroll employee. |
| `Agreement Signed` with future start date | The employee is close to live, but payroll should still respect the future start date. |
| `Active` | The employee is eligible for standard payroll processing. |
| `Terminating` | The employee may still appear in payroll and invoice flows during notice, including termination-related calculations. |
| `Terminated` | Standard payroll should no longer continue, although final payout logic may still apply on the last relevant cycle. |

## Technical Developer Reference

<details>
<summary>Expand technical source logic and implementation notes</summary>

### Admin panel source path

| File path | Purpose |
|---|---|
| `admin-webapp/pages/employees/view/[id].tsx` | Renders the employee detail page and requests the platform action label for display. |
| `admin-webapp/src/components/shared/PlatformActionStatus.tsx` | Shared UI component that displays the derived platform action status. |
| `monorepo/packages/util/src/employee.ts` | Contains the shared `getEmployeeOnboardingStatus(...)` logic used to derive the status label. |
| `admin-webapp/src/api/routes/employees/get-employee.ts` | Enriches the employee payload with derived helper fields used by the UI. |

### Exact derived logic order

| Rule order | Condition | Returned label |
|---|---|---|
| 1 | `status === EMPLOYEE_ON_NOTICE` | `Terminating` |
| 2 | `status === EMPLOYEE_SIGNED` and `startDate <= today` | `Active` |
| 3 | `status === EMPLOYEE_TERMINATED` | `Terminated` |
| 4 | `status === ADDENDUM_CANCELLED` | `Cancelled` |
| 5 | `status` in `EMPLOYER_SIGNED`, `EMPLOYEE_AGREEMENT_UPLOADED`, `EMPLOYEE_UPDATED_TERMS` and `startDate < today` | `Not Started` |
| 6 | `status === CREATED` | `Created` |
| 7 | `status === ADDENDUM_SENT` | `Addendum Sent for Signature` |
| 8 | `status === EMPLOYEE_SIGNED` and `startDate > today` | `Agreement Signed` |
| 9 | `status === EMPLOYEE_AGREEMENT_UPLOADED` or `status === EMPLOYEE_UPDATED_TERMS` | `Agreement Sent` |
| 10 | `status === EMPLOYER_SIGNED` and onboarding is complete | `Work Eligibility Checks` |
| 11 | Personal address exists | `Employee Self-Onboarding` |
| 12 | Company ownership exists | `Accepted Invitation` |
| 13 | Fallback | `Invitation Sent` |

### Derived helper inputs

| Technical field | Role in the logic |
|---|---|
| `employee.status` | Primary lifecycle driver. |
| `employee.startDate` | Compared against current date or report date, depending on context. |
| `employee.personalAddressLine1` | Used as a signal that self-onboarding has started. |
| `employee.companyOwnership` | Used as a signal that the invitation relationship exists. |
| `employee.employeePortalDetails` | Evaluated when deciding onboarding completeness. |
| `employee.employmentOptions` | Used alongside portal details for onboarding validation. |
| `employee.countryCode` | Needed to resolve territory-specific onboarding requirements. |
| `employee.region` | Used where onboarding validation depends on regional rule sets. |
| `employee.employeeDocuments` | Used for some UI-specific relabelling, including pending deposit messaging. |

### Technical nuances

| Topic | Detail |
|---|---|
| `hasCompletedOnboarding` | This is derived, not stored. It is based on whether required onboarding sections validate successfully for the employee's territory. |
| `Pending Deposit Payment` | This is not a separate onboarding status. It is a label-level adjustment layered on top of an agreement-related state in the UI. |
| Historical report comparison | Payroll-processing report logic can evaluate status relative to `invoiceDate`, which means historical outputs may not exactly match today's admin panel label. |

</details>

## Open Questions

| ID | Question | Context | Status |
|---|---|---|---|
| BQ-1 | What is the intended business distinction for `EMPLOYEE_UPDATED_TERMS`, and in which workflows should operators expect to see it? | The status exists in the raw employee lifecycle and is also folded into the derived admin-panel logic, but its product-facing explanation is still weak. | Unanswered |
| BQ-2 | Under what exact workflow is `ADDENDUM_CANCELLED` assigned, and should internal users treat it as terminal or reversible? | The admin panel can show `Cancelled`, but the operational guidance for what to do next is still not explicit. | Unanswered |
| BQ-3 | What is the intended meaning of `PENDING`, and how should teams distinguish it from `CREATED` in day-to-day operations? | The enum value exists, but the practical trigger and expected operational interpretation still need clarification. | Unanswered |

## Related Pages

| Page | Purpose |
|---|---|
| [[calculator-results]] | Stores a snapshot of the employee status at the time of invoice generation. |
| [[employee-data]] | Contains the broader employee calculation context used in payroll logic. |
| [[termination-results]] | Documents termination payouts that apply when an employee is terminating or terminated. |
