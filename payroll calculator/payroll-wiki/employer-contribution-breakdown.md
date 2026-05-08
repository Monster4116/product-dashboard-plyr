# Employer Contribution Breakdown

## Overview

The employer contribution breakdown represents the line-item employer costs calculated for an employee invoice result. The calculator result record can contain two employer contribution fields: a full breakdown for the invoice period and a prorated breakdown for partial periods. This page documents the structure of employer contribution line items only. Detailed payroll and tax calculation logic is documented in territory-specific payroll rules or the relevant tax configuration pages.

**Search Tags:** `employer contribution`, `employer contributions`, `employer contribution breakdown`, `benefits`, `taxes`, `contributionClassification`, `amountWithoutBenefitMarkup`, `benefitId`

## Product Context

Employer contributions are the statutory taxes, insurance, pension, and benefit costs that Playroll must pay on behalf of the employer for each employee. These vary by territory and can include social security, health insurance, retirement fund contributions, and optional benefits. By exposing each contribution as a line item, clients can see exactly what they are being charged for and reconcile it against local statutory obligations. Operations teams use the breakdown to verify that the correct contribution types and amounts have been applied for each employee's territory.

## Where This Appears

| Field | Parent Record | Notes |
|---|---|---|
| `employerContributionsFull` | [[calculator-results]] | Full employer contribution line-item array for the invoice period. |
| `employerContributionsProrated` | [[calculator-results]] | Prorated employer contribution line-item array for partial periods. Defaults to an empty array. |

## Structure

`employerContributionsFull` and `employerContributionsProrated` are arrays of contribution objects. Each object represents one employer-side contribution, tax, insurance, benefit, or statutory cost.

## Contribution Line Item Fields

| Field | Description | Nullable? |
|---|---|---|
| `type` | High-level contribution category. | No |
| `subtype` | More specific contribution name, benefit name, package name, or rule identifier. | Sometimes — optional field |
| `contributionClassification` | Classification used to determine how the contribution should be treated in the calculation. Values observed: `DEFAULT`, `OVERRIDE_AS_MANDATORY`, `OVERRIDE_AS_OPTIONAL`. | Sometimes — optional field |
| `annual` | Annual value object, where applicable. Contains a `type` field indicating the annual calculation method. | Sometimes — optional field |
| `amountWithoutBenefitMarkup` | Contribution amount before benefit markup is applied. | No |
| `amount` | Final contribution amount included in the employer contribution total. | No |
| `benefitId` | Unique identifier for the benefit configuration, where the contribution line item relates to a benefit. | Sometimes — optional field |

Note: `type` may not always provide the full picture of the contribution and should be paired with `subtype` for a complete description.

## Optional Benefits

Employer contribution line items can include optional or configured benefits. These are generally identifiable by `type = BENEFIT` and may include a `benefitId`.

| Field | Description |
|---|---|
| `type` | Usually `BENEFIT` for benefit-related line items. |
| `subtype` | Benefit name or package name. |
| `benefitId` | Unique identifier for the benefit configuration. |
| `amountWithoutBenefitMarkup` | Benefit amount before benefit markup is applied. |
| `amount` | Final benefit amount included in the employer contribution total. |

Optional benefits are treated as employer-side costs when they appear in the employer contribution array. Detailed benefit setup and benefit-specific rules are documented in [[benefits]].

## Amount Fields

| Field | Description |
|---|---|
| `amountWithoutBenefitMarkup` | Amount before benefit markup is applied. |
| `amount` | Final employer contribution amount included in the calculation. |

In many cases, `amountWithoutBenefitMarkup` and `amount` are the same. If benefit markup applies, these fields may differ.

## Full vs Prorated Employer Contributions

`employerContributionsFull` and `employerContributionsProrated` use the same line-item structure. The difference is the period being represented.

| Field | Meaning |
|---|---|
| `employerContributionsFull` | Full employer contribution calculation for the invoice period. |
| `employerContributionsProrated` | Partial or prorated employer contribution calculation for the relevant period. |

Proration logic is documented in [[cost-apportionment]].

## Rollup Behaviour

Individual employer contribution line item amounts roll up into the totals breakdown.

| Source Field | Rolls Up To |
|---|---|
| `employerContributionsFull[].amount` | `salaryTotalsFull.totalsLocalCurrency.employerContribution` in [[totals-breakdown]] |
| `employerContributionsProrated[].amount` | `salaryTotalsProrated.totalsLocalCurrency.employerContribution` in [[totals-breakdown]] |

Where billing currency conversion applies, employer contribution totals are also represented in `salaryTotalsFull.totalsBillingCurrency.employerContribution` and `salaryTotalsProrated.totalsBillingCurrency.employerContribution`. See [[currency-conversion-fees]].

## Data Notes

| Observation | Note |
|---|---|
| The field is an array. | An employee can have multiple employer contribution line items in a single period. |
| Some contribution amounts can be zero. | A contribution can exist structurally even when no amount is due for the period. |
| `annual` can be null. | Annualised values are not always provided for all contribution types. |
| `amountWithoutBenefitMarkup` and `amount` can be the same. | Benefit markup does not apply to every contribution type. |
| `benefitId` is optional. | Usually present only for optional or configured benefit line items. |
| `type = BENEFIT` may appear in employer contributions. | Benefits are treated as employer-side costs when included in the array. |
| Duplicate-looking line items can appear in some records. | This may reflect multiple periods, aggregation, or data duplication and should be reviewed in context. |
| Contribution types and subtypes are country-specific. | Observed values are not exhaustive globally. |

## Source Reference

| File Path | Purpose |
|---|---|
| `packages/util/src/invoice-employee-record.ts` | Defines `EmployeeInvoiceContribution` and the `EmployeeInvoiceContributionSchema` TypeBox schema used for runtime validation of employer contribution line items. |

## Related Pages

| Page | Purpose |
|---|---|
| [[calculator-results]] | Parent invoice result record containing `employerContributionsFull` and `employerContributionsProrated`. |
| [[totals-breakdown]] | Shows employer contribution totals in local and billing currency. |
| [[employee-contributions-breakdown]] | Documents employee-side contribution and deduction line items. |
| [[contribution-classification]] | Explains contribution classification values used in line items. |
| [[benefits]] | Explains optional or configured benefits linked by `benefitId`. |
| [[cost-apportionment]] | Explains prorated contribution calculations. |
| [[currency-conversion-fees]] | Explains conversion fee treatment when billing currency differs from local currency. |
| [[exchange-rates]] | Documents the exchange rate context used for billing currency representation. |
| [[territory]] | Documents territory-specific payroll and contribution rules. |
