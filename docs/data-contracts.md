# Data Contracts

## Purpose

This document explains how dashboard data should move from the database into the UI without tightly coupling the UI to raw backend table structures.

The main rule is:

- UI components should consume stable dashboard contracts
- UI components should not depend directly on raw Supabase table shapes

## Why This Matters

If the UI depends directly on raw database rows:

- backend changes can break the frontend easily
- vendor-specific column names leak into the UI
- migration from Supabase to core Postgres becomes harder
- data cleanup logic gets scattered across components

If the UI depends on stable contracts instead:

- backend details stay near the backend boundary
- the UI becomes easier to maintain
- changing adapters is much safer

## Recommended Pattern

Use this flow:

`raw database row -> mapper/normalizer -> dashboard data contract -> UI`

### Raw Database Row

This is the row returned by the current backend.

Example:

- column names may be uppercase
- field names may be vendor-specific
- values may need cleanup or conversion

### Mapper / Normalizer

This layer translates raw rows into a stable application shape.

What it should do:

- rename fields into clearer names
- convert data types
- fill in safe defaults where appropriate
- hide backend-specific naming from the UI

### Dashboard Data Contract

This is the clean, stable shape the frontend should expect.

The contract should be:

- easy to read
- stable over time
- focused on dashboard needs
- not tied to one database vendor

### UI

The UI should render the contract and avoid caring where the data originally came from.

## Example Contract

Example finance adjustment item:

```json
{
  "month": "2025-01",
  "companyId": "CO-123",
  "employeeId": "EE-456",
  "territory": "United Kingdom",
  "primaryAspect": "Payroll correction",
  "adjustmentUsd": -1200,
  "absoluteAdjustmentUsd": 1200,
  "confidence": 0.94
}
```

This contract is easier for the UI because:

- field names are clear
- values have predictable meaning
- naming is not tied to one specific table format

## Example Mapper Explanation

Example pseudocode only:

```text
Input row:
  MONTH
  CO_ID
  EE_ID
  TERRITORY
  PRIMARY_ASPECT
  ADJUSTMENT_USD
  ABS_ADJUSTMENT_USD
  CONFIDENCE

Mapper steps:
  month = normalize month into a stable string
  companyId = CO_ID
  employeeId = EE_ID
  territory = TERRITORY or "Unknown"
  primaryAspect = PRIMARY_ASPECT or "Unknown"
  adjustmentUsd = numeric value of ADJUSTMENT_USD
  absoluteAdjustmentUsd = numeric value of ABS_ADJUSTMENT_USD
  confidence = numeric value of CONFIDENCE

Output:
  return dashboard contract object
```

Important point:

- the mapper knows the raw source format
- the UI should not need to know it

## How This Helps Future Migration

If the data source changes later:

- Supabase rows may change
- core Postgres views may use different names
- query logic may move behind a new adapter

If the mapper layer exists, the change is mostly contained at the boundary.

That means:

- the adapter changes
- the mapper may change
- the UI contract can stay the same

This is exactly what we want for a future move from Supabase to core Postgres.

## Recommended Rule For This Repo

As this project grows:

- never let chart components depend on raw database rows directly
- map incoming data into stable dashboard contracts first
- keep backend-specific transformations in one place
- prefer neutral names like `backend`, `dataset`, `adapter`, and `contract`

That makes the frontend easier to understand now and easier to migrate later.
