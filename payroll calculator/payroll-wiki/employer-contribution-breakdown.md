# Employer Contribution Breakdown

## Overview

The employer contribution breakdown represents the line-item employer costs calculated for an employee invoice result. The [[calculator-results]] record can contain two employer contribution fields:

| Field | Description |
|---|---|
| `employerContributionsFull` | Full employer contribution line-item breakdown for the invoice period. |
| `employerContributionsProrated` | Prorated employer contribution line-item breakdown for a partial period, where applicable. |

This page documents the structure of employer contribution line items only. Detailed payroll/tax calculation logic should be documented in territory-specific payroll rules or the relevant tax configuration pages.

---

## Structure

`employerContributionsFull` and `employerContributionsProrated` are arrays of contribution objects. Each object represents one employer-side contribution, tax, insurance, benefit, or statutory cost.

---

## Contribution Line Item Fields

| Field | Description |
|---|---|
| `type` | High-level contribution category. |
| `subtype` | More specific contribution name, benefit name, package name, or rule identifier. |
| `contributionClassification` | Classification used to determine how the contribution should be treated in the calculation. |
| `annual` | Annual value, where applicable. Can be `null`. |
| `amountWithoutBenefitMarkup` | Contribution amount before benefit markup is applied. |
| `amount` | Final contribution amount included in the employer contribution total. |
| `benefitId` | Unique identifier for the benefit configuration, where the contribution line item relates to a benefit. Optional field. |

- Note: `type` may not always represent the full picture of the contribution and should be paired with the `subtype`.
- Note: `benefitId` is generally only present for optional or configured benefits.

---

## Optional Benefits

Employer contribution line items can include optional or configured benefits.

These are usually identifiable by `type = BENEFIT` and may include a `benefitId`.

| Field | Description |
|---|---|
| `type` | Usually `BENEFIT` for benefit-related line items. |
| `subtype` | Benefit name or package name. |
| `benefitId` | Unique identifier for the benefit configuration. |
| `amountWithoutBenefitMarkup` | Benefit amount before benefit markup is applied. |
| `amount` | Final benefit amount included in the employer contribution total. |

Optional benefits should be treated as employer-side costs when they appear in the employer contribution array.

Detailed benefit setup and benefit-specific rules should be documented in [[benefits]].

---

## Amount Fields

| Field | Description |
|---|---|
| `amountWithoutBenefitMarkup` | Amount before benefit markup is applied. |
| `amount` | Final employer contribution amount included in the calculation. |

In many examples, `amountWithoutBenefitMarkup` and `amount` are the same.

If benefit markup applies, these fields may differ.

---

## Full vs Prorated Employer Contributions

`employerContributionsFull` and `employerContributionsProrated` use the same line-item structure.

| Field | Meaning |
|---|---|
| `employerContributionsFull` | Full employer contribution calculation for the invoice period. |
| `employerContributionsProrated` | Partial or prorated employer contribution calculation for the relevant period. |

Proration logic should be documented in [[cost-apportionment]].

---

## Relationship to Totals Breakdown

The individual employer contribution line items roll up into the totals breakdown.

| Source Field | Rolls Up To |
|---|---|
| `employerContributionsFull[].amount` | `salaryTotalsFull.totalsLocalCurrency.employerContribution` |
| `employerContributionsProrated[].amount` | `salaryTotalsProrated.totalsLocalCurrency.employerContribution` |

Where billing currency conversion applies, employer contribution totals are represented in:

| Totals Field | Description |
|---|---|
| `salaryTotalsFull.totalsBillingCurrency.employerContribution` | Employer contribution total represented in billing currency. |
| `salaryTotalsProrated.totalsBillingCurrency.employerContribution` | Prorated employer contribution total represented in billing currency. |

See [[totals-breakdown]] and [[currency-conversion-fees]].

---

## Data Notes

| Observation | Note |
|---|---|
| The field is an array. | An employee can have multiple employer contribution line items. |
| Some contribution amounts can be `0`. | The contribution can exist structurally even when no amount is due. |
| `annual` can be `null`. | Annualized values are not always provided. |
| `amountWithoutBenefitMarkup` and `amount` can be the same. | Benefit markup may not apply to every contribution. |
| `benefitId` is optional. | Usually present only for optional or configured benefit line items. |
| `type = BENEFIT` may appear in employer contributions. | Benefits are treated as employer-side costs when included in the array. |
| Duplicate-looking line items can appear in some records. | This may reflect multiple periods, aggregation, or data duplication and should be reviewed in context. |
| Contribution types and subtypes are country-specific. | The observed US examples are not exhaustive globally. |

---

## Related Pages

| Page | Purpose |
|---|---|
| [[calculator-results]] | Parent invoice result record. |
| [[totals-breakdown]] | Shows employer contribution totals in local and billing currency. |
| [[employee-contributions-breakdown]] | Employee-side contribution and deduction line items. |
| [[contribution-classification]] | Explains contribution classification values. |
| [[benefits]] | Explains optional or configured benefits linked by `benefitId`. |
| [[cost-apportionment]] | Explains prorated contribution calculations. |
| [[currency-conversion-fees]] | Explains conversion fee treatment when billing currency differs. |
| [[exchange-rates]] | Exchange-rate context used for billing currency representation. |
| [[territory]] | Territory-specific payroll and contribution rules. |