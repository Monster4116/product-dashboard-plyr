# Payroll Calculator — Knowledge Base Index

This page is a directory of all pages in this knowledge base.

---

## Invoice and Records

- [[calculator-results]] — The root invoice result record for each employee per pay period.
- [[invoice-record-type]] — Classifies each calculator result as standard cycle, out-of-cycle, upcoming cycle, or ARR.
- [[invoice-details]] — 🚧 Stub. The deprecated `invoiceDetails` field on the calculator result record.

---

## Employee

- [[employee-data]] — Employee-level context captured at calculation time.
- [[employee-status]] — Onboarding and employment lifecycle status values.
- [[hourly-employee]] — Hourly employee payroll logic including estimates, timesheets, and variance adjustment.
- [[new-starters]] — 🚧 Stub. How new starter logic affects proration and partial-period calculations.
- [[employer-of-record]] — 🚧 Stub. The employer of record entity and its role in the employment structure.
- [[salary-basis]] — 🚧 Stub. The `salaryBasis` field values `MONTHLY` and `HOURLY`.

---

## Salary and Payments

- [[salary-payment-options]] — How an employee's salary is configured, valued, and paid.
- [[usa-pay-periods]] — US bi-weekly payroll logic and pay period calculations.
- [[out-of-cycle]] — 🚧 Stub. Salary changes and corrections processed outside the standard payroll cycle.
- [[custom-invoice-format]] — 🚧 Stub. Custom invoice display format configuration for US bi-weekly employees.

---

## Totals and Contributions

- [[totals-breakdown]] — Calculated salary and invoice totals for an employee invoice result.
- [[employer-contribution-breakdown]] — Line-item employer costs on an invoice result.
- [[employee-contributions-breakdown]] — 🚧 Stub. Line-item employee contributions and deductions on an invoice result.
- [[leave-adjustment]] — How leave applications become payroll salary adjustments.
- [[termination-results]] — Termination-related payouts including leave, severance, notice pay, and more.
- [[leave-payout]] — 🚧 Stub. How leave days are paid out at termination.
- [[cost-apportionment]] — 🚧 Stub. How payroll costs are apportioned for partial employment periods.
- [[contribution-classification]] — 🚧 Stub. Contribution classification values used on contribution line items.
- [[benefits]] — 🚧 Stub. Optional and configured employee benefits in employer contributions.

---

## Currency and Fees

- [[exchange-rates]] — Currency and exchange rate context used in calculator results.
- [[currency-conversion-fees]] — When and how conversion fees apply.
- [[transaction-fee-calculation]] — How the embedded transaction fee is calculated and derived.

---

## Reference Data

- [[employee-allowances]] — 🚧 Stub. Allowance types and how they appear in the employee data and totals.
- [[expenses]] — 🚧 Stub. Expense and direct expense treatment in payroll and invoice totals.
- [[territory]] — 🚧 Stub. Territory-level configuration for working days, contributions, and statutory rules.

---

## Meta

- [[open-questions]] — Tracks all unresolved business logic gaps across the wiki.
- [[taxonomy]] — Canonical payroll vocabulary, aliases, and code anchors for consistent documentation and glossary building.
