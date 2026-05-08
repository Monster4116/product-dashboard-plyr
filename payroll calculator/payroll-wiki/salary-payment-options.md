# Salary Payment Options

## Overview

Salary payment options define how an employee’s salary is configured, valued, and paid.
This page explains the available salary setup options and the rules for when each option can be applied.
- Detailed exchange-rate fields are documented in [[exchange-rates]].  
- Detailed billing conversion fee rules are documented in [[currency-conversion-fees]].  
- Final calculated amounts are documented in [[totals-breakdown]].

---

## Core Currency Concepts

| Concept | Description |
|---|---|
| Local currency | Currency of the employee’s employment territory. |
| Billing currency | Currency used to invoice the client. |
| Foreign salary currency | Currency the employee is actually paid in, when foreign salary is configured. |
| Peg currency | Foreign reference currency used to value or adjust the employee’s local salary. |

---

## Salary Payment Option Types

| Option | What It Means | Employee Paid In | Payroll / Tax Currency | Availability / Rule |
|---|---|---|---|---|
| Local salary | Salary is defined and paid in the employee’s local currency. | Local currency | Local currency | Standard setup. |
| Foreign salary | Employee is actually paid in a currency other than the local currency. | Foreign salary currency | Local currency | Used when foreign salary payment is configured. |
| Salary peg - Direct | Salary value is directly linked to a foreign reference currency, but payment remains local. | Local currency | Local currency | Country-dependent. Rules are configured by Tax Analytics / R&D. |
| Salary peg - Via allowance | Salary value is linked to a foreign reference currency through an allowance or adjustment, but payment remains local. | Local currency | Local currency | Allowed for all countries. |

---

## Salary Peg vs Foreign Salary

| Concept | Meaning | Employee Paid In |
|---|---|---|
| Salary peg | Foreign currency is used as a reference to value or adjust the salary. | Local currency |
| Foreign salary | Foreign currency is the actual salary payment currency. | Foreign currency |

> Peg = reference currency.  
> Foreign salary = actual payment currency.

---

## Salary Peg Rules

| Rule | Description |
|---|---|
| Peg via allowance | Allowed for all countries. |
| Direct peg | Country-dependent and controlled by country rules configured by Tax Analytics / R&D. |
| Employee payment | Both peg methods still pay the employee in local currency. |
| Billing treatment | Depends on the billing currency. See [[currency-conversion-fees]]. |

---

## Salary Peg Reference Dates

Both salary peg methods can use one of three reference dates.

| Reference Date | Description | Payroll Impact |
|---|---|---|
| 5th of the month | Salary details are updated using the exchange rate for the 5th. | Included in the standard cycle if before cut-off. |
| 10th of the month | Salary details are updated using the exchange rate for the 10th. | Included in the standard cycle if before cut-off. |
| 15th of the month | Salary details are updated using the exchange rate for the 15th. | After internal cut-off; automatically treated as an [[out-of-cycle]] change. |

---

## Relevant Exchange Rate Fields

These fields are documented in more detail in [[exchange-rates]].

| Field | Description |
|---|---|
| `foreignSalaryCurrencyCode` | Currency used when the employee is actually paid in a foreign salary currency. |
| `foreignSalaryAmount` | Salary amount in the foreign salary currency. |
| `foreignToLocalExchangeRate` | Exchange rate used to support local payroll/tax calculation for foreign salary employees. |
| `peggedSalaryCurrencyCode` | Currency used as the salary peg reference. |
| `peggedSalaryType` | Type of salary peg, such as direct or allowance. |
| `peggedSalaryAmount` | Salary amount in the peg reference currency. |
| `peggedToLocalExchangeRate` | Exchange rate used to calculate or update the local salary value. |
| `peggedSalaryAdjustmentDay` | Reference day used for the peg exchange rate. |
| `peggedSalaryAdjustmentEnabled` | Indicates whether peg adjustment logic is active. |

---

## Related Pages

| Page | Purpose |
|---|---|
| [[exchange-rates]] | Exchange-rate fields and currency context. |
| [[currency-conversion-fees]] | Rules for when conversion fees apply during billing. |
| [[totals-breakdown]] | Final salary and invoice totals. |
| [[out-of-cycle]] | Salary updates or changes processed outside the standard payroll cycle. |
| [[employee-allowances]] | Allowance and adjustment structures. |
| [[calculator-results]] | Parent calculator result record. |
