# Exchange Rates

## Overview

The exchange rate context contains the currency and exchange rate information used when generating a calculator result. It records the employee's local payroll currency, the client billing currency, the exchange rate between them, standard reference rates from major currencies, the invoice conversion fee percentage, and foreign salary or salary peg currency details where applicable. This object is documented as a field on the calculator result record. Detailed salary payment method logic is documented in [[salary-payment-options]]. Detailed conversion fee rules are documented in [[currency-conversion-fees]].

**Search Tags:** `exchange rates`, `exchange rate context`, `exchangeRateContext`, `localCurrencyCode`, `billingCurrencyCode`, `foreignToLocalExchangeRate`, `peggedToLocalExchangeRate`, `invoiceConversionFeePercentage`

## Product Context

Accurate currency conversion is essential for producing correct invoice amounts and ensuring employees are paid the right amount. The exchange rate context captures all the currency relationships needed for a single calculation — it is a snapshot of the rates at calculation time, so the result remains auditable even after rates change. Operations teams can use this context to verify which exchange rates were applied to a particular invoice, and developers can use it to trace how amounts flowed from local payroll into billing currency totals.

## Where This Appears

| Field | Parent Record | Notes |
|---|---|---|
| `exchangeRateContext` | [[calculator-results]] | Stored as a JSON column. Defaults to an empty object for historical records created before exchange rate context was captured. |

The exchange rate context is used by:

| Related Field | Description |
|---|---|
| `salaryTotalsFull` | Uses exchange context to represent totals in local, salary payment, and billing currencies. See [[totals-breakdown]]. |
| `salaryTotalsProrated` | Uses exchange context where prorated totals require currency representation. See [[totals-breakdown]]. |

## Exchange Rate Context Structure

| Field | Description | Nullable? |
|---|---|---|
| `localCurrencyCode` | Currency code for the employee's local payroll currency — the currency of the employment territory. | No |
| `localToBillingExchangeRate` | Exchange rate used to convert from local currency to billing currency. | No |
| `usdToLocalExchangeRate` | Exchange rate from USD to the local currency. | No |
| `eurToLocalExchangeRate` | Exchange rate from EUR to the local currency. | No |
| `gbpToLocalExchangeRate` | Exchange rate from GBP to the local currency. | No |
| `billingCurrencyCode` | Currency code used to invoice the client. | No |
| `billingToLocalExchangeRate` | Exchange rate from billing currency to local currency. | No |
| `invoiceConversionFeePercentage` | Conversion fee percentage associated with invoice and billing currency conversion. See [[currency-conversion-fees]]. | Yes |
| `foreignSalaryCurrencyCode` | Currency code of the employee's actual foreign salary payment currency, where applicable. See [[salary-payment-options]]. | Yes |
| `foreignSalaryAmount` | Foreign salary amount, where applicable. | Yes |
| `foreignToLocalExchangeRate` | Exchange rate used to convert the foreign salary amount into local currency for payroll and tax calculations. | Yes |
| `peggedSalaryCurrencyCode` | Currency code used as the salary peg reference, where applicable. See [[salary-payment-options]]. | Yes |
| `peggedSalaryType` | Type of salary peg — either `DIRECT` or `ALLOWANCE`. See [[salary-payment-options]]. | Yes |
| `peggedSalaryAmount` | Pegged salary amount in the peg reference currency. | Yes |
| `peggedToLocalExchangeRate` | Exchange rate used to convert the pegged salary reference amount into local currency. | Yes |
| `peggedSalaryAdjustmentDay` | Day used for the pegged salary exchange rate adjustment or review. | Yes |
| `peggedSalaryAdjustmentEnabled` | Indicates whether pegged salary adjustment logic is enabled. | Yes |

## Currency Roles

| Currency Role | Field | Description |
|---|---|---|
| Local currency | `localCurrencyCode` | Employee territory currency used for payroll, tax calculation, and local statutory amounts. |
| Billing currency | `billingCurrencyCode` | Currency used to invoice the client. |
| Foreign salary currency | `foreignSalaryCurrencyCode` | Currency the employee is actually paid in for foreign salary arrangements. |
| Peg currency | `peggedSalaryCurrencyCode` | Reference currency used to calculate or adjust the local salary for salary peg arrangements. |

## Local and Billing Exchange Fields

These fields describe the relationship between the employee's local currency and the client billing currency.

| Field | Description |
|---|---|
| `localToBillingExchangeRate` | Used to represent local payroll amounts in the billing currency. |
| `billingToLocalExchangeRate` | Reverse direction rate from billing currency to local currency. |
| `invoiceConversionFeePercentage` | Fee percentage associated with converting funded amounts into billing currency. See [[currency-conversion-fees]]. |

## Standard Reference Exchange Fields

The exchange context includes standard reference rates from major currencies into the local currency.

| Field | Description |
|---|---|
| `usdToLocalExchangeRate` | USD to local currency rate. |
| `eurToLocalExchangeRate` | EUR to local currency rate. |
| `gbpToLocalExchangeRate` | GBP to local currency rate. |

These fields support foreign salary, salary peg, billing, and reporting scenarios.

## Foreign Salary Fields

Foreign salary fields are relevant when the employee is actually paid in a currency other than the local currency.

| Field | Description |
|---|---|
| `foreignSalaryCurrencyCode` | Actual salary payment currency for a foreign salary employee. |
| `foreignSalaryAmount` | Salary amount in the foreign salary currency. |
| `foreignToLocalExchangeRate` | Rate used to convert foreign salary inputs into local currency for payroll and tax calculation. |

Foreign salary logic is documented in [[salary-payment-options]]. Conversion fee treatment is documented in [[currency-conversion-fees]].

## Pegged Salary Fields

Pegged salary fields are relevant when an employee's salary value is linked to a foreign reference currency while payment remains local.

| Field | Description |
|---|---|
| `peggedSalaryCurrencyCode` | Currency used as the peg reference. |
| `peggedSalaryType` | Pegging method — `DIRECT` or `ALLOWANCE`. |
| `peggedSalaryAmount` | Peg reference salary amount. |
| `peggedToLocalExchangeRate` | Rate used to calculate the local salary value from the peg reference. |
| `peggedSalaryAdjustmentDay` | Day used for peg exchange rate review or adjustment. |
| `peggedSalaryAdjustmentEnabled` | Indicates whether pegged salary adjustment logic is active. |

Salary peg logic is documented in [[salary-payment-options]].

## Data Notes

| Observation | Note |
|---|---|
| Foreign salary fields can be null. | These fields are only populated when the employee has a foreign salary payment setup. |
| Pegged salary fields can be null. | These fields are only populated when a salary peg is configured for the employee. |
| `invoiceConversionFeePercentage` can be null. | No conversion fee is configured, or the value has not been set. |
| `foreignToLocalExchangeRate` can be null. | Only present when a foreign salary arrangement exists. |
| `peggedToLocalExchangeRate` can be null. | Only present when a salary peg arrangement exists. |
| `peggedSalaryAdjustmentEnabled` can be null. | Optional field — indicates active peg adjustment logic when present. |
| `exchangeRateContext` defaults to an empty object for historical records. | Records created before exchange rate context was captured may have an empty object rather than structured data. |

## Source Reference

| File Path | Purpose |
|---|---|
| `packages/util/src/invoice-employee-record.ts` | Defines `EmployeeInvoiceExchangeRateContext` and the corresponding TypeBox schema used for runtime validation of the JSON column. |

## Related Pages

| Page | Purpose |
|---|---|
| [[calculator-results]] | Parent record containing `exchangeRateContext`. |
| [[totals-breakdown]] | Shows local, salary payment, and billing currency totals that use this context. |
| [[salary-payment-options]] | Explains local salary, foreign salary, salary peg direct, and salary peg via allowance setups. |
| [[currency-conversion-fees]] | Explains when conversion fees apply and how `invoiceConversionFeePercentage` is used. |
| [[transaction-fee-calculation]] | Explains how to derive the embedded transaction fee using `localToBillingExchangeRate`. |
| [[employee-data]] | Employee-level context including territory and salary basis. |
