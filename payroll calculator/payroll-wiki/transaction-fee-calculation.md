# Transaction Fee Calculation

## Overview

The transaction fee is the embedded conversion fee applied when amounts paid or funded by Playroll in one currency are billed to the client in another currency. It is not stored as a separate line item; instead, it is already incorporated into the billing currency totals. The transaction fee can be derived by comparing the actual billing currency total against what the local currency total would have been if converted at the exchange rate alone.

## Product Context

Playroll applies a conversion fee when it funds payroll in one currency and invoices the client in another. This fee covers the cost of currency conversion and is embedded in the billing total rather than shown as a separate charge. Clients and operations teams may need to calculate the transaction fee independently to reconcile the billing total or to understand how much of the invoice amount reflects the conversion cost. This page provides the formula and worked example for that derivation.

## Core Rule

| Rule | Explanation |
|---|---|
| The transaction fee is embedded in `totalsBillingCurrency.totalExcludingPlayrollFee`. | The billing-currency invoice total before the Playroll fee already includes the transaction fee. It is not stored separately. |
| The transaction fee equals the actual billing total minus the expected billing total at the plain exchange rate. | The expected billing total is the local total multiplied by the local-to-billing exchange rate, with no fee applied. The difference between actual and expected is the fee. |
| The transaction fee does not include the Playroll fee layer. | Use `totalExcludingPlayrollFee`, not `totalIncludingPlayrollFee`. |
| Billing-only items such as `earlyTerminationFee` are added in billing currency. | These items are not subject to the transaction fee and should not be used to derive it. |

## Calculation Steps

| Step | Description |
|---|---|
| 1 | Take `totalsLocalCurrency.totalExcludingPlayrollFee` — the invoice-bearing total in the employee's local currency. |
| 2 | Multiply by `localToBillingExchangeRate` from the exchange rate context. This gives the expected billing total with no transaction fee applied. |
| 3 | Take `totalsBillingCurrency.totalExcludingPlayrollFee` — the actual billing-currency invoice total. |
| 4 | Subtract the expected amount from the actual amount. The result is the embedded transaction fee. |

## Formula

| Calculation |
|---|
| `transactionFee = totalsBillingCurrency.totalExcludingPlayrollFee - (totalsLocalCurrency.totalExcludingPlayrollFee * localToBillingExchangeRate)` |

## Field Mapping

| Formula Part | Source |
|---|---|
| `totalsLocalCurrency.totalExcludingPlayrollFee` | Local currency totals object in [[totals-breakdown]]. |
| `localToBillingExchangeRate` | Exchange rate from `exchangeRateContext`. See [[exchange-rates]]. |
| `totalsBillingCurrency.totalExcludingPlayrollFee` | Billing currency totals object in [[totals-breakdown]]. |
| `transactionFee` | Derived value — not stored as a separate field. |

## Examples

A South African employee is paid in `ZAR` and invoiced to the client in `USD`. The transaction fee is the additional amount charged above the plain exchange rate conversion.

| Field | Value |
|---|---:|
| `totalsLocalCurrency.totalExcludingPlayrollFee` | `100,000` ZAR |
| `localToBillingExchangeRate` | `0.055` |
| Expected billing amount without transaction fee | `5,500` USD |
| `totalsBillingCurrency.totalExcludingPlayrollFee` | `5,650` USD |
| Derived transaction fee | `150` USD |

The transaction fee is therefore:

| Calculation |
|---|
| `5,650 - (100,000 × 0.055) = 150 USD` |

## Exceptions and Edge Cases

| Scenario | Behaviour | Notes |
|---|---|---|
| Local currency equals billing currency | The transaction fee is zero. | No conversion is required, so the billing total equals the local total at an exchange rate of 1. |
| Employee has a foreign salary arrangement | The transaction fee applies to the foreign salary currency component, not the local currency component, if the foreign currency differs from the billing currency. | See [[currency-conversion-fees]] for the full conversion fee logic. |
| `earlyTerminationFee` is present | The early termination fee is a billing-only item and must not be used to derive the transaction fee. | It is added directly in billing currency and has no local currency equivalent. |

## Data Notes

| Observation | Note |
|---|---|
| The transaction fee is not stored as a separate field. | It is derived by comparison and is embedded within `totalsBillingCurrency.totalExcludingPlayrollFee`. |
| The formula uses `totalExcludingPlayrollFee`, not `totalIncludingPlayrollFee`. | The Playroll fee is added after the transaction fee layer and must not be included in the derivation. |
| The result may be zero or negative in edge cases. | A zero fee indicates the local and billing currencies are the same. A negative result would indicate a data anomaly. |

## TypeScript Reference

```ts
type BillingDetails = {
  currencyCode: string;
  totalExcludingPlayrollFee: number;
};

type LocalDetails = {
  currencyCode: string;
  totalExcludingPlayrollFee: number;
};

function calculateTransactionFee({
  billing,
  local,
  localToBillingExchangeRate,
}: {
  billing: BillingDetails;
  local: LocalDetails;
  localToBillingExchangeRate: number;
}) {
  const expectedBillingTotalExcludingTransactionFee =
    local.totalExcludingPlayrollFee * localToBillingExchangeRate;

  const transactionFee =
    billing.totalExcludingPlayrollFee -
    expectedBillingTotalExcludingTransactionFee;

  return {
    currencyCode: billing.currencyCode,
    expectedBillingTotalExcludingTransactionFee,
    actualBillingTotalExcludingPlayrollFee: billing.totalExcludingPlayrollFee,
    transactionFee,
  };
}
```

## Source Reference

| File Path | Purpose |
|---|---|
| `packages/calculator-service/src/helpers.ts` | Contains the currency conversion and billing total calculation helpers used to build the billing currency totals. |

> Transaction fee = actual billing total excluding Playroll fee minus local total excluding Playroll fee converted at the local-to-billing exchange rate.

## Related Pages

| Page | Purpose |
|---|---|
| [[totals-breakdown]] | Documents `totalExcludingPlayrollFee` in both local and billing currency total objects. |
| [[exchange-rates]] | Documents `localToBillingExchangeRate` used in the transaction fee formula. |
| [[currency-conversion-fees]] | Explains the broader rules for when conversion fees apply across different payment setups. |
| [[calculator-results]] | Parent record containing the salary totals and exchange rate context used for derivation. |
