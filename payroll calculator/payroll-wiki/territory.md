# Territory

## Overview

In payroll documentation, a territory is the employment-country context that determines which payroll rules apply to an employee. In implementation, this concept is backed by a territory configuration object that defines how the calculator should handle items such as pay periods, apportionment, statutory contributions, leave payout, termination payout, and salary-payment options. This page documents the territory concept at the business level and the territory configuration at the code level.

**Search Tags:** `territory`, `territory configuration`, `employment country`, `territory rules`, `calculatorTerritoryConfig`, `payPeriods`, `unworkedDaysPolicy`, `leavePayoutConfig`

## Product Context

Playroll does not run one universal payroll ruleset. The same employee scenario can produce very different outcomes depending on the territory: one country may prorate on calendar days, another on working days; one may allow direct salary pegging, another may not; one may require severance accrual, another may not. Territory is the boundary that explains those differences. When payroll results look surprising, the territory configuration is often the first place to look for the governing rule.

## Core Rule

| Rule | Explanation |
|---|---|
| Every payroll calculation runs within a territory context. | The employee's territory determines the applicable calculator rules. |
| Territory is both a business concept and a configuration concept. | Business users think in countries or employment territories; the code uses a territory configuration object. |
| Territory rules affect multiple downstream objects. | Salary totals, contributions, leave adjustments, terminations, and pay-period behaviour can all vary by territory. |
| Regional overrides can refine the base territory rules. | A region-specific context can override selected base territory properties. |

## Business Fields Seen on Employee Data

The employee-level result snapshot stores the territory in business-friendly fields.

| Field | Meaning |
|---|---|
| `countryCode` | ISO-style country code used to identify the employment country. |
| `territory` | Human-readable territory or country name used in payroll context. |

These fields appear in [[employee-data]], but they are only the visible identifiers. The calculation behaviour itself comes from the territory configuration described below.

## Territory Configuration

The monorepo calculator uses a territory context object to define payroll rules.

Key observed configuration areas:

| Configuration Area | What It Controls |
|---|---|
| `payPeriods` | Whether the territory uses monthly or custom pay periods and how those periods are generated. |
| `taxYear` | Tax year boundaries for the territory. |
| `unworkedDaysPolicy` | Default partial-period apportionment method. |
| `apportionmentExpression` | Optional custom formula overriding the default apportionment policy. |
| `apportionOtherCosts` | Whether non-salary costs are prorated with salary. |
| `publicHolidaysPolicy` | How public holidays affect apportionment and leave-related calculations. |
| `employerContributionConfigurations` | Territory-specific employer contribution rules. |
| `employeeContributionConfigurations` | Territory-specific employee contribution rules. |
| `salaryPaymentCurrencies` | Alternative currencies employees may be paid in for that territory. |
| `leavePayoutConfig` | Territory-level leave payout rules. |
| `terminationPayout` | Whether territory-specific termination payout handling is enabled. |
| `featureFlags` | Territory-scoped enablement for features such as salary peg tooling and foreign-currency salary payments. |

## Key Territory-Driven Domains

### Pay Period Behaviour

Some territories support non-monthly pay periods.

| Field | Description |
|---|---|
| `payPeriods.initial` | Known starting point for generating recurring pay periods. |
| `payPeriods.length` | Length of the pay period in days, for example `14` for bi-weekly payroll. |
| `payPeriods.lockOffset` | Offset used to align pay-period windows with the monthly payroll lock model. |
| `payPeriods.periodRatioOverride` | Override used when converting monthly values into pay-period values. |

This is the core configuration area behind [[usa-pay-periods]].

### Apportionment

Territory determines how partial-period salary is prorated.

| Field | Description |
|---|---|
| `unworkedDaysPolicy` | Preset policy such as `WORKING_DAYS` or `CALENDAR_DAYS`. |
| `apportionmentExpression` | Custom expression that can replace the preset logic. |
| `apportionOtherCosts` | Whether allowances and similar non-salary costs should also be apportioned. |

This area is documented in more detail in [[cost-apportionment]].

### Contributions

Territory defines statutory and optional contribution logic.

| Field | Description |
|---|---|
| `employerContributionConfigurations` | Employer-side cost rules for the territory. |
| `employeeContributionConfigurations` | Employee-side deduction rules for the territory. |
| `constants` | Territory constants used inside contribution expressions. |
| `options` | Optional employer or employee choices that affect contribution behaviour. |

These rules feed the line items documented in [[employer-contribution-breakdown]] and [[employee-contributions-breakdown]].

### Leave Payout

Territory also controls leave payout behaviour.

| Field | Description |
|---|---|
| `leavePayoutConfig` | Leave-type payout rules for the territory. |
| `leaveEntitlements` | Leave entitlement definitions, which may include payout config. |
| `leaveCyclePeriod` | Number of days in the annual leave cycle. |
| `sickLeaveCycle` | Number of days in the sick leave cycle. |
| `sickLeavePolicy` | Territory rule governing sick leave treatment. |

These rules connect to [[leave-adjustment]] and [[leave-payout]].

### Termination and Severance

Final-pay behaviour is also territory-driven.

| Field | Description |
|---|---|
| `severancePolicy` | Territory-level severance handling. |
| `accruedSeveranceRate` | Rate used to accrue severance cost per pay period where required. |
| `terminationPayout` | Territory-specific termination payout feature/configuration. |

These rules feed the structures documented in [[termination-results]].

### Salary Payment Options

Territory influences which salary-payment models are valid.

| Field | Description |
|---|---|
| `salaryPaymentCurrencies` | Alternative currencies that employees in the territory may be paid in. |
| `featureFlags.salaryPaymentsInForeignCurrency` | Whether foreign-currency salary payments are enabled for the territory. |
| `featureFlags.salaryPegTool` | Whether salary-peg functionality is enabled for the territory. |

This interacts directly with [[salary-payment-options]] and [[exchange-rates]].

## Base Context and Regional Overrides

Territory configuration can have a base context plus optional regional overrides.

| Concept | Meaning |
|---|---|
| Base territory context | The main configuration for the territory as a whole. |
| `regionalContexts` | Partial overrides for sub-regions within the territory. |
| Regional leave payout config | Region-specific override of the base leave payout configuration. |

This matters because two employees in the same country can still calculate differently if one falls under a regional override.

## Examples of Observed Territory Variation

Observed examples from the calculator package show that territories do not all use the same apportionment rule.

| Territory File | Observed Policy |
|---|---|
| `territories/ZA.ts` | `CALENDAR_DAYS` |
| `territories/CO.ts` | `WORKING_DAYS` |
| `territories/FR.ts` | `WORKING_DAYS` |
| `territories/IN.ts` | `CALENDAR_DAYS` |

These examples are useful because they confirm that territory is not just descriptive metadata. It changes actual calculation behaviour.

## Territory vs Territory Configuration

The docs and code use related but different meanings.

| Term | Recommended Use |
|---|---|
| `territory` | Use for the business concept: the employee's employment country or payroll jurisdiction. |
| `territory configuration` | Use for the calculator object that defines the active rules for that territory. |

This distinction helps avoid confusion when discussing employee data versus implementation detail.

## Data Notes

| Observation | Note |
|---|---|
| `territory` on employee data is a label, not the full rule definition. | The actual payroll logic comes from the territory configuration in the calculator codebase. |
| Territory behaviour can be overridden regionally. | Two employees with the same country code may still use different effective rules. |
| Territory config includes feature flags. | Availability of things like salary peg tooling can be territory-specific. |
| Territory config contains both business rules and technical toggles. | Not every config field should be surfaced directly to end users. |

## Source Reference

| File Path | Purpose |
|---|---|
| `packages/calculator/src/context/territory.ts` | Defines the main territory context shape, including pay periods, apportionment, contributions, leave payout, feature flags, and regional overrides. |
| `packages/calculator/src/territories/*.ts` | Territory-specific rule files showing how actual country contexts differ in implementation. |
| `packages/util/src/invoice-employee-record.ts` | Shows how territory-adjacent values such as `countryCode` and `territory` are persisted onto invoice employee records. |

> Territory is the boundary that explains why the same payroll event can be calculated differently across countries, while territory configuration is the concrete rule object that makes those differences executable.

## Related Pages

| Page | Purpose |
|---|---|
| [[employee-data]] | Documents `countryCode` and `territory` on the employee result snapshot. |
| [[cost-apportionment]] | Documents territory-driven apportionment logic. |
| [[usa-pay-periods]] | Documents territory-specific non-monthly pay period logic. |
| [[salary-payment-options]] | Documents territory-dependent salary-payment setups. |
| [[exchange-rates]] | Documents currency context affected by territory salary-payment rules. |
| [[employer-contribution-breakdown]] | Documents employer-side contribution outputs driven by territory rules. |
| [[employee-contributions-breakdown]] | Documents employee-side contribution outputs driven by territory rules. |
| [[leave-adjustment]] | Documents leave-related payroll adjustments influenced by territory config. |
| [[termination-results]] | Documents final-pay structures influenced by territory config. |
