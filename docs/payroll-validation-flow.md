# Payroll Validation Flow

## Purpose

This note translates the payroll validation discussion into a practical, reviewable implementation shape.

The goal is not to rebuild the All Territories Report. The goal is to create a payroll validation layer that:

- compares expected payroll events against calculated payroll results
- explains why each alert exists
- logs mismatches so recurring process failures become measurable
- keeps the UI independent of Monday, Supabase, or any future core Postgres implementation

## Source Material

Inputs reviewed:

- Payroll Validation Sample Google Sheet: `Payroll Validation Sample`
- Sheet tab: `RawData`
- Sheet size: 4,649 rows, 27 columns
- Meeting transcript with Jed, Ben, and Tristan
- Existing payroll wiki pages for employee data, salary basis, salary payment options, hourly employees, and termination results

The sample sheet is a payroll calculation or invoice-result snapshot. It is not enough on its own to replace the manual process because the most painful checks depend on comparing calculated/admin-panel state against expected events from Monday boards.

## Sample Sheet Shape

`RawData` contains one row per payroll result record.

Important top-level fields:

| Field | Validation use |
| --- | --- |
| `employeeId` | Primary employee match key where Monday/admin sources can provide the same ID. |
| `companyId` | Company-level grouping and customer-specific rules such as Lemon Edge cutoff handling. |
| `invoiceDate` | Payroll month under validation. |
| `employeeData` | JSON snapshot of employee profile context at calculation time. |
| `salaryTotalsFull` | JSON payroll and invoice totals in local, billing, and sometimes salary-payment currency. |
| `terminationResults` | JSON final-pay context when termination logic produced payouts. |
| `leaveIds` | Links result back to leave inputs. |
| `expenseIds` | Links result back to expenses included in the run. |
| `type` | Result type, for example `OUT_OF_CYCLE`. |
| `isPrimary` | Helps distinguish primary monthly result rows from secondary or aggregate rows. |
| `exchangeRateContext` | JSON salary payment, foreign salary, peg, and billing-currency context. |
| `timeTrackingIds` | Links result back to time tracking inputs. |
| `leavePayoutAdjustmentContext` | JSON leave adjustment context, especially unpaid leave deduction setup. |

Useful nested `employeeData` fields:

| Field | Validation use |
| --- | --- |
| `employeeName` | Human review, duplicate-name checks, search display. |
| `externalId` | Secondary match key where client/provider IDs are involved. |
| `countryCode` / `territory` | Territory-specific rule routing and USA pay-period handling. |
| `grossMonthlySalary` | Monthly salary baseline and materiality denominator. |
| `isNewStarter` | Current-period new starter validation. |
| `status` | Onboarding/termination state signal. |
| `startDate` | New starter and prior-month starter checks. |
| `endDate` | Termination and post-termination input checks. |
| `salaryBasis` | Monthly vs hourly processing path. |
| `otherAllowances` | Allowance checks and addendum matching. |
| `employerOfRecordId` | Missing or wrong EOR checks. |
| `confirmedLeaveDays` | Leave context. |
| `unpaidLeaveDeductionMultiplier` | Unpaid leave anomaly checks. |
| `grossHourlySalary` | Hourly employee validation. |
| `timeTrackingEnabled` | Time tracking expectation for hourly or special employees. |
| `hourlyBasisContext` | Estimated salary, timesheet salary, and previous-period hours context. |

Useful nested `salaryTotalsFull.totalsLocalCurrency` fields:

| Field | Validation use |
| --- | --- |
| `baseSalary` | Salary comparison, proration, termination zero-pay checks. |
| `bonus` | Materiality and duplicate bonus/commission checks. |
| `commission` | Materiality and duplicate bonus/commission checks. |
| `expenses` | Expense materiality and post-termination expense checks. |
| `directExpenses` | Client invoice inclusion checks. |
| `grossDeductions` / `netDeductions` | Negative net or deductions-greater-than-income checks. |
| `other` | Allowance/addendum checks. |
| `employeeTerminationPayout` | Termination payout checks. |
| `employeeLeaveDaysAmount` | Termination leave payout checks. |
| `leaveAdjustment` | Leave adjustment checks. |
| `totalExcludingPlayrollFee` | Cost-to-company sanity checks. |

## What The Sample Can Already Support

These checks can be run from the sample snapshot alone or with a narrow lookup table:

| Check | Signal | Notes |
| --- | --- | --- |
| Duplicate employee IDs | repeated `employeeId` within payroll month | Needs logic to account for legitimate primary/OOC combinations. |
| Duplicate employee names | repeated normalized `employeeData.employeeName` | Should be warning severity unless IDs also collide. |
| Missing EOR | empty `employeeData.employerOfRecordId` | Needs EOR master data to distinguish unknown from intentionally absent. |
| New starter flag present/missing | compare `employeeData.startDate` to `invoiceDate` month and `employeeData.isNewStarter` | Existing sample includes current-month starters with `isNewStarter: true`. |
| Prior-month new starter context | `startDate` in previous payroll month | Useful as a review bucket, not always an error. |
| Terminated employee still included | `endDate` before payroll month and non-zero totals | Can be valid for final payments, expenses, or catchups, so classify by amount type. |
| Termination result consistency | `terminationResults` vs termination payout totals | `terminationResults` can be absent even when end date exists; only alert when payout totals require supporting context. |
| Unpaid leave anomaly | `unpaidLeaveDeductionMultiplier`, `leaveAdjustment`, confirmed leave fields | Needs threshold, for example greater than one full month equivalent. |
| Bonus/commission duplication | `bonus > 0` and `commission > 0` with same or suspiciously similar values | Should be materiality-scored, not automatic error. |
| Expense materiality | `expenses` compared to base salary or historical average | Needs thresholds by currency/territory/company. |
| Direct expenses included | `directExpenses > 0` | Needs invoice source later to prove inclusion. |
| Negative or impossible totals | deductions greater than income, negative CTC | Exact formula should be defined with payroll team. |
| Hourly employee visibility | `employeeData.salaryBasis = "HOURLY"` | Existing sample has hourly records and `hourlyBasisContext.estimatedSalary`. |
| Foreign salary employee | `exchangeRateContext.foreignSalaryCurrencyCode` present | Existing sample includes foreign-salary rows. |
| Pegged salary employee | `exchangeRateContext.peggedSalaryCurrencyCode` present | Existing sample includes peg rows. |
| USA pay-period context | `employeeData.countryCode = "US"` | Should suppress noisy month-on-month salary-change alerts and explain pay-period effect. |

## What The Sample Cannot Prove Alone

These checks require additional sources:

| Missing source | Needed for |
| --- | --- |
| Monday terminations board | Whether a completed termination event exists and what end date payroll should match. |
| Monday addendums board | Whether salary and allowance changes are approved and expected. |
| Monday manual data change board | Whether manual bonuses, deductions, allowances, or expenses should appear in the snapshot. |
| Admin-panel live profile or profile-history view | What the current platform state says before calculation snapshots are generated. |
| Onboarding workflow state | Whether a new starter is complete enough to be payroll-ready. |
| Expense approval source | Whether terminating employees have pending/unapproved expenses. |
| Visa employee source | Whether the EOR should be the visa partner rather than the payroll entity. |
| EOR master data | Human-readable EOR names and valid EOR-by-territory mappings. |
| Invoice/Xero output | Whether direct expenses and payroll totals actually reached the customer invoice. |
| Customer cutoff rules | Lemon Edge and future customer-specific late-change handling. |

## Recommended Architecture

Use a source-neutral validation service:

`source adapters -> canonical validation inputs -> validation engine -> alert log -> dashboard contract -> UI`

### Source Adapters

Each adapter should return stable internal shapes and hide source-specific details.

Initial adapters:

| Adapter | Responsibility |
| --- | --- |
| `payrollResultAdapter` | Read calculation snapshots like the sample sheet or future payroll result table. |
| `adminEmployeeAdapter` | Read current employee profile/admin-panel state. |
| `terminationEventAdapter` | Read completed termination events from Monday or a future offboarding workflow. |
| `addendumEventAdapter` | Read expected salary and allowance changes. |
| `manualChangeEventAdapter` | Read manual payroll input changes. |
| `expenseEventAdapter` | Read expense state and approval state. |
| `referenceDataAdapter` | Read EOR, visa, territory, cutoff, and threshold reference data. |

### Canonical Input Contract

```json
{
  "period": "2026-04",
  "employeeId": "employee-uuid",
  "companyId": "company-uuid",
  "employeeName": "Employee Name",
  "sourceRecords": {
    "payrollResultId": "result-uuid",
    "adminEmployeeId": "employee-uuid",
    "expectedEventIds": ["event-id"]
  },
  "profile": {
    "countryCode": "ZA",
    "territory": "South Africa",
    "status": "EMPLOYEE_SIGNED",
    "startDate": "2026-04-07",
    "endDate": null,
    "salaryBasis": "MONTHLY",
    "employerOfRecordId": "eor-uuid",
    "timeTrackingEnabled": false
  },
  "salarySetup": {
    "grossMonthlySalary": 80000,
    "grossHourlySalary": null,
    "foreignSalaryCurrencyCode": null,
    "peggedSalaryCurrencyCode": null,
    "peggedSalaryType": null
  },
  "totals": {
    "localCurrencyCode": "ZAR",
    "baseSalary": 65454.55,
    "bonus": 0,
    "commission": 0,
    "expenses": 0,
    "directExpenses": 0,
    "grossDeductions": 0,
    "netDeductions": 0,
    "employeeTerminationPayout": 0,
    "employeeLeaveDaysAmount": 0,
    "leaveAdjustment": 0,
    "totalExcludingPlayrollFee": 69700.73
  },
  "expectedEvents": [
    {
      "eventType": "termination",
      "source": "monday",
      "effectiveDate": "2026-04-30",
      "status": "complete",
      "matchedBy": "employeeId"
    }
  ]
}
```

### Alert Contract

```json
{
  "id": "validation-run-id:employee-id:check-id",
  "runId": "validation-run-id",
  "period": "2026-04",
  "employeeId": "employee-uuid",
  "companyId": "company-uuid",
  "checkId": "termination-admin-monday-mismatch",
  "category": "termination",
  "severity": "error",
  "status": "open",
  "summary": "Termination date differs between Monday and admin profile.",
  "expected": {
    "source": "monday",
    "endDate": "2026-04-30"
  },
  "actual": {
    "source": "admin",
    "endDate": null
  },
  "likelyOwner": "operations",
  "sourceOfTruthHint": "monday",
  "nextAction": "Confirm whether admin profile or Monday board is stale.",
  "evidence": [
    {
      "source": "payroll-result",
      "recordId": "result-uuid"
    },
    {
      "source": "monday",
      "recordId": "board-item-id"
    }
  ]
}
```

## Priority Flow

### Phase 1: Termination Audit

This is the highest-impact interim flow because it replaces the 2 to 3 hour export and VLOOKUP process.

Inputs:

- Completed termination events from the Monday terminations board
- Admin employee profile `endDate`
- Payroll result `employeeData.endDate`, status, totals, and `terminationResults`

Match order:

1. `employeeId`
2. external employee ID
3. normalized employee name plus company

Alerts:

| Check | Error condition |
| --- | --- |
| Monday complete, admin missing | Completed termination exists but admin profile has no end date. |
| Admin terminating, Monday missing | Admin profile has current-period end date but no completed Monday event. |
| Date mismatch | Both sources have an end date, but dates differ. |
| Payroll result missing termination context | End date requires final-pay review, but payroll result lacks expected termination result or payout support. |
| Post-termination activity | Prior-month termination has current-month expenses, bonus, commission, allowance, or cost to company. |
| Pending expense on current-month leaver | Current-month leaver has expenses that are pending or unapproved. |

Dashboard output:

- Total termination events checked
- Matched cleanly
- Monday missing
- Admin missing
- Date mismatches
- Post-termination payroll activity
- Open issues by owner and age

### Phase 2: Salary And Allowance Change Audit

Inputs:

- Addendum board expected changes
- Admin profile salary and allowance state
- Payroll result salary and allowance totals
- Prior payroll result or baseline salary snapshot

Alerts:

| Check | Error condition |
| --- | --- |
| Addendum complete, admin unchanged | Approved change exists but admin profile does not reflect it. |
| Admin changed, addendum missing | Salary or allowance changed without a matching addendum event. |
| Amount mismatch | Addendum amount differs from admin or payroll result. |
| Unexpected month-on-month salary change | Salary changed without supporting event, excluding USA pay-period context and known proration. |
| Allowance mismatch | `employeeData.otherAllowances` or totals `other` differs from expected addendum. |

Dashboard output:

- Changes checked
- Clean matches
- Missing addendums
- Admin not updated
- Payroll result not updated
- USA/contextual suppressions

### Phase 3: Snapshot-Only Data Quality Checks

These can run once the payroll result adapter is in place.

| Category | Checks |
| --- | --- |
| Identity | duplicate IDs, duplicate names, test/ignore employees if a marker exists |
| Employee setup | missing EOR, unknown EOR, visa EOR mismatch, USA territory context |
| New starters | current-month start missing new starter flag, new starter flag outside current month, onboarding not ready |
| Terminations | prior-month termination with current-month inputs, current-month termination absent from reporting pack |
| Inputs | duplicate bonus and commission, material expense or bonus, deductions greater than income |
| Special salary setup | foreign salary, salary peg, hourly employee visibility |
| Leave | unpaid leave days or deduction multiplier above threshold |
| Invoice tie-out | direct expenses included in invoice, final customer invoice matches payroll totals |

## Check Inventory

| Priority | Check ID | Description | Source requirement | Initial action |
| --- | --- | --- | --- | --- |
| P0 | `termination-cross-source-match` | Compare completed Monday terminations to admin and payroll end dates. | Monday + admin + payroll result | Build first. |
| P0 | `salary-change-cross-source-match` | Compare addendums to admin and payroll salary/allowance state. | Monday + admin + payroll result | Build second. |
| P0 | `manual-change-presence` | Confirm manual payroll data changes appear in calculation snapshots. | Monday/manual changes + payroll result | Build after source list from Jed. |
| P1 | `new-starter-flag-consistency` | Validate current-month starters and new starter flag. | payroll result, optional admin | Build from sample. |
| P1 | `termination-post-activity` | Flag prior-month leavers with current-month payroll inputs. | payroll result | Build from sample. |
| P1 | `hourly-employee-visibility` | Surface hourly employees and validate hourly context exists. | payroll result | Build from sample. |
| P1 | `foreign-or-pegged-salary` | Surface foreign currency and pegged employees. | payroll result | Build from sample. |
| P1 | `material-inputs` | Flag large bonus, commission, expense, and allowance amounts. | payroll result + thresholds | Needs threshold sign-off. |
| P1 | `deductions-greater-than-income` | Flag impossible or negative payroll totals. | payroll result | Needs exact formula. |
| P2 | `usa-pay-period-context` | Suppress/explain recurring USA salary movement. | payroll result + territory rules | Use as tooltip/context. |
| P2 | `visa-eor-match` | Validate visa employees have the correct EOR. | visa list + admin/payroll result | Needs benefits source. |
| P2 | `invoice-direct-expense-tieout` | Confirm direct expenses reached customer invoice. | payroll result + invoice/Xero | Later integration. |
| P2 | `customer-cutoff-policy` | Flag customer-specific late changes, including Lemon Edge. | admin changes + cutoff config | Separate policy workflow. |

## Dashboard Shape

The first usable dashboard should be operational rather than pretty.

Recommended sections:

| Section | Purpose |
| --- | --- |
| Run controls | Period selector, sync button, last sync time, source freshness. |
| Summary cards | Employees checked, alerts open, critical mismatches, clean match rate. |
| Source health | Monday fetched, admin fetched, payroll result fetched, stale source warnings. |
| Alert queue | Filterable table grouped by category, severity, owner, and source-of-truth hint. |
| Employee detail drawer | Expected vs actual values, source records, calculation evidence, next action. |
| Mismatch log | Historical counts by check and source so repeated process gaps become visible. |

Do not put Monday-specific concepts into the UI contract. The UI should show neutral source labels such as `expected event`, `profile`, and `payroll result`, with source metadata available in the evidence panel.

## Logging

Each validation run should create:

- one `validation_run` record
- many `validation_alert` records
- optional `validation_alert_event` records for status changes and comments

Minimal run fields:

| Field | Meaning |
| --- | --- |
| `runId` | Unique run identifier. |
| `period` | Payroll month. |
| `startedAt` / `finishedAt` | Run timing. |
| `triggeredBy` | User, schedule, or system. |
| `sourceFreshness` | Last fetched timestamp per source. |
| `summary` | Count of checked records and alerts by severity/category. |

Minimal alert event fields:

| Field | Meaning |
| --- | --- |
| `alertId` | Alert being updated. |
| `eventType` | Created, assigned, resolved, suppressed, reopened. |
| `actor` | User or system. |
| `note` | Short reason. |
| `createdAt` | Event timestamp. |

This log is important because Ben's proposed interim tool should not only show mismatches. It should measure whether the mismatch was caused by Monday being wrong, admin being wrong, payroll calculation being wrong, or a legitimate timing edge case.

## Open Questions For Jed And Ben

1. Which exact Monday boards are used for terminations, salary changes, allowance changes, manual data changes, onboarding items, and operations requests?
2. For each board, what fields should be treated as the expected value?
3. What board statuses mean "ready to validate" or "complete"?
4. Which identifier is most reliable per board: employee ID, external ID, email, or name/company?
5. Which source wins when Monday and admin disagree?
6. Which mismatches are actionable by operations, product, finance, or R&D?
7. What thresholds should apply to expenses, bonuses, commissions, deductions, and negative CTC?
8. Which new starter onboarding step means payroll-ready?
9. Which expense statuses count as pending/unapproved for terminating employees?
10. What is the owner and allowed action for Lemon Edge post-cutoff changes?

## Recommended Next Step

Build the termination audit as the first narrow slice:

1. Ingest one payroll period from the payroll result source.
2. Ingest the completed group from the Monday terminations board.
3. Ingest admin employee `endDate` values.
4. Normalize all three into the canonical input contract.
5. Emit only the termination alert set.
6. Show the queue and log counts in the dashboard.

This gives the payroll team immediate time savings while creating the exact boundary needed for the later all-check validation dashboard.
