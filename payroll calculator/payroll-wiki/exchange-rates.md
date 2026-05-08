# Exchange Rates

## Overview

`exchangeRateContext` contains the currency and exchange-rate context used when generating calculator results. This object explains:

- the employee’s local payroll currency
- the client billing currency
- the exchange rate between local and billing currency
- standard reference exchange rates
- invoice conversion fee percentage
- foreign salary currency context, where applicable
- salary peg context, where applicable

This page documents the structure of `exchangeRateContext`.
Detailed salary payment method logic should be documented in [[salary-payment-options]].
Detailed conversion fee rules should be documented in [[currency-conversion-fees]].

---

## Where This Appears

`exchangeRateContext` appears on the [[calculator-results]] record.

It is related to:

| Related Field                  | Description                                                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `salaryTotalsFull`             | Uses exchange context to represent totals in local, salary payment, and billing currencies. See [[totals-breakdown]]. |
| `salaryTotalsProrated`         | Uses exchange context where prorated totals require currency representation. See [[totals-breakdown]].                |
| `salaryPaymentCurrencyDetails` | Contains salary payment currency setup details. See [[salary-payment-options]].                                       |


---

## Exchange Rate Context Structure

| Field                            | Description                                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `localCurrencyCode`              | Currency code for the employee’s local payroll currency. This is the currency of the employee’s employment territory.     |
| `localToBillingExchangeRate`     | Exchange rate used to convert from local currency to billing currency.                                                    |
| `usdToLocalExchangeRate`         | Exchange rate from USD to the local currency.                                                                             |
| `eurToLocalExchangeRate`         | Exchange rate from EUR to the local currency.                                                                             |
| `gbpToLocalExchangeRate`         | Exchange rate from GBP to the local currency.                                                                             |
| `billingCurrencyCode`            | Currency code used to invoice the client.                                                                                 |
| `billingToLocalExchangeRate`     | Exchange rate from billing currency to local currency.                                                                    |
| `invoiceConversionFeePercentage` | Conversion fee percentage associated with invoice/billing currency conversion. See [[currency-conversion-fees]].          |
| `foreignSalaryCurrencyCode`      | Currency code of the employee’s actual foreign salary payment currency, where applicable. See [[salary-payment-options]]. |
| `foreignSalaryAmount`            | Foreign salary amount, where applicable.                                                                                  |
| `foreignToLocalExchangeRate`     | Exchange rate used to convert the foreign salary amount into local currency for local payroll/tax calculations.           |
| `peggedSalaryCurrencyCode`       | Currency code used as the salary peg reference, where applicable. See [[salary-payment-options]].                         |
| `peggedSalaryType`               | Type of salary peg, such as direct or allowance-based pegging. See [[salary-payment-options]].                            |
| `peggedSalaryAmount`             | Pegged salary amount in the peg reference currency.                                                                       |
| `peggedToLocalExchangeRate`      | Exchange rate used to convert the pegged salary reference amount into local currency.                                     |
| `peggedSalaryAdjustmentDay`      | Day used for the pegged salary exchange-rate adjustment or review.                                                        |
| `peggedSalaryAdjustmentEnabled`  | Indicates whether pegged salary adjustment logic is enabled.                                                              |

---

## Currency Roles

| Currency Role | Field | Description |
|---|---|---|
| Local currency | `localCurrencyCode` | Employee territory currency used for payroll/tax calculation and local statutory amounts. |
| Billing currency | `billingCurrencyCode` | Currency used to invoice the client. |
| Foreign salary currency | `foreignSalaryCurrencyCode` | Currency the employee is actually paid in for foreign salary arrangements. |
| Peg currency | `peggedSalaryCurrencyCode` | Reference currency used to calculate or adjust local salary for pegged salary arrangements. |

---

## Local and Billing Exchange Fields

These fields explain the relationship between the employee’s local currency and the client billing currency.

| Field | Description |
|---|---|
| `localToBillingExchangeRate` | Used to represent local payroll amounts in the billing currency. |
| `billingToLocalExchangeRate` | Reverse direction exchange rate from billing currency to local currency. |
| `invoiceConversionFeePercentage` | Fee percentage associated with converting paid/funded amounts into billing currency. See [[currency-conversion-fees]]. |

---

## Standard Reference Exchange Fields

The exchange context may include standard reference rates from major currencies into the local currency.

| Field | Description |
|---|---|
| `usdToLocalExchangeRate` | USD to local currency rate. |
| `eurToLocalExchangeRate` | EUR to local currency rate. |
| `gbpToLocalExchangeRate` | GBP to local currency rate. |

These fields help support foreign salary, salary peg, billing, and reporting scenarios.

---

## Foreign Salary Fields

Foreign salary fields are relevant when the employee is actually paid in a currency other than the local currency.

| Field | Description |
|---|---|
| `foreignSalaryCurrencyCode` | Actual salary payment currency for a foreign salary employee. |
| `foreignSalaryAmount` | Salary amount in the foreign salary currency. |
| `foreignToLocalExchangeRate` | Rate used to convert foreign salary inputs into local currency for payroll/tax calculation. |

Foreign salary logic should be documented in [[salary-payment-options]].

Conversion fee treatment should be documented in [[currency-conversion-fees]].

---

## Pegged Salary Fields

Pegged salary fields are relevant when an employee’s salary value is linked to a foreign reference currency while payment remains local.

| Field | Description |
|---|---|
| `peggedSalaryCurrencyCode` | Currency used as the peg reference. |
| `peggedSalaryType` | Pegging method, such as direct or allowance-based. |
| `peggedSalaryAmount` | Peg reference salary amount. |
| `peggedToLocalExchangeRate` | Rate used to calculate the local salary value from the peg reference. |
| `peggedSalaryAdjustmentDay` | Day used for peg exchange-rate review or adjustment. |
| `peggedSalaryAdjustmentEnabled` | Indicates whether pegged salary adjustment logic is active. |

Salary peg logic should be documented in [[salary-payment-options]].

---

## Null Fields

Some exchange-rate fields can be `null`.

| Field Group                      | When Values May Be `null`                                                   |
| -------------------------------- | --------------------------------------------------------------------------- |
| Foreign salary fields            | When the employee is not a foreign salary employee.                         |
| Pegged salary fields             | When the employee is not on a salary peg.                                   |
| `invoiceConversionFeePercentage` | When no invoice conversion fee applies or when the value is not configured. |
| `foreignToLocalExchangeRate`     | When there is no foreign salary setup.                                      |
| `peggedToLocalExchangeRate`      | When there is no salary peg setup.                                          |

---

## Related Pages

| Page                         | Purpose                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| [[calculator-results]]       | Parent record containing `exchangeRateContext`.                                                   |
| [[totals-breakdown]]         | Shows local, salary payment, and billing currency totals.                                         |
| [[salary-payment-options]]   | Explains local salary, foreign salary, pegged direct salary, and pegged allowance salary methods. |
| [[currency-conversion-fees]] | Explains when conversion fees apply.                                                              |
| [[exchange-rates]]           | Invoice-level billing currency and fee context.                                                   |
| [[employee-data]]            | Employee-level context, including territory and salary basis.                                     |