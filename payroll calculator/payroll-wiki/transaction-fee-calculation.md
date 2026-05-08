## Transaction Fee Calculation

The transaction fee is the embedded conversion fee applied when amounts paid or funded by Playroll in one currency are billed to the client in another currency.

The transaction fee is not stored as a separate line item in the totals breakdown. Instead, it is embedded in:

| Field                                             | Meaning                                                                                        |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `totalsBillingCurrency.totalExcludingPlayrollFee` | Billing-currency invoice total before the Playroll fee, already including the transaction fee. |

---

## Core Rule

To calculate the transaction fee, compare:
1. What the billing total should have been using the exchange rate only.
2. What the billing total actually is.

| Value | Description |
|---|---|
| Expected billing amount without transaction fee | `totalsLocalCurrency.totalExcludingPlayrollFee * localToBillingExchangeRate` |
| Actual billing amount | `totalsBillingCurrency.totalExcludingPlayrollFee` |
| Transaction fee | Difference between the actual billing amount and the expected billing amount. |

---

## Formula

| Calculation |
|---|
| `transactionFee = totalsBillingCurrency.totalExcludingPlayrollFee - (totalsLocalCurrency.totalExcludingPlayrollFee * localToBillingExchangeRate)` |

---

## Field Mapping

| Formula Part | Source |
|---|---|
| `totalsLocalCurrency.totalExcludingPlayrollFee` | Local currency totals object in [[totals-breakdown]]. |
| `localToBillingExchangeRate` | Exchange rate from `exchangeRateContext`. See [[exchange-rates]]. |
| `totalsBillingCurrency.totalExcludingPlayrollFee` | Billing currency totals object in [[totals-breakdown]]. |
| `transactionFee` | Derived value, not stored as a separate field. |

---

## Example

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

---

## Important Notes

| Rule | Explanation |
|---|---|
| Do not use `totalIncludingPlayrollFee`. | The transaction fee is embedded before the Playroll fee layer. |
| Do not subtract `payrollFee`. | `payrollFee` is added separately after `totalExcludingPlayrollFee`. |
| Do not use `earlyTerminationFee` for this calculation. | Early termination fee is a billing-only item and should not be used to derive the transaction fee. |
| Use `totalExcludingPlayrollFee`. | This is the correct layer where the transaction fee is embedded. |
| The transaction fee is derived, not directly stored. | It is calculated by comparing billing total against local total converted at the exchange rate. |

---

## TypeScript Reference

```ts
type BillingDetails = {
  currencyCode: string;
  totalExcludingPlayrollFee: number;
  payrollFee?: number;
  totalIncludingPlayrollFee?: number;
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
````

---

## One-Line Rule

> Transaction fee = actual billing total excluding Playroll fee minus local total excluding Playroll fee converted at the local-to-billing exchange rate.

For [[totals-breakdown]], I would only add this short reference:


## Transaction Fee Note

`totalExcludingPlayrollFee` in `totalsBillingCurrency` may already include an embedded transaction/conversion fee. The transaction fee is not stored as a separate field. It can be derived by comparing the actual billing total against the local total converted using `localToBillingExchangeRate`.

See [[currency-conversion-fees]].
