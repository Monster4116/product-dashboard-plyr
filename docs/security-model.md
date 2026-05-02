# Security Model

## Purpose

This document explains the security rules for this repository in plain English.

The goal is simple:

- do not expose sensitive access
- do not make the browser more powerful than it should be
- make risky changes easy to spot during review

## Secrets That Must Never Be Committed

These must never be committed into the repository:

- database passwords
- private API keys
- access tokens
- refresh tokens
- signing secrets
- private service account credentials
- privileged Supabase keys
- production connection strings

If a value would give someone more access than a normal browser user should have, it does not belong in this repo.

## Why `service_role` Keys Must Never Be Used In Browser Code

A `service_role` key is highly privileged.

If it is placed in browser code:

- anyone can inspect it
- anyone can copy it
- anyone can call the backend directly with it
- row-level protections may be bypassed depending on usage

That means putting a privileged key into frontend code is effectively the same as publishing it.

Short version:

- browser code is public
- privileged keys are private
- public code must not contain private keys

## What Can Safely Live In Frontend/Public Config

Frontend/public config should be limited to values that are safe even if they are visible to users.

Examples of safer public config:

- feature flags that do not expose sensitive logic
- page labels
- non-sensitive UI settings
- public-safe endpoint paths
- public-safe project identifiers when intentionally designed for frontend use

Even then, public config should still be reviewed carefully.

## What Must Only Live Server-Side

These belong server-side only:

- privileged credentials
- database connection strings with write or admin access
- service-level secrets
- access control rules that must not be bypassed
- sensitive audit or admin logic

If a value or rule protects data, assume it belongs server-side.

## Recommended Environment Variable Rules

Use environment variables for non-public configuration when a backend or deployment platform is introduced.

Recommended rules:

- do not store secrets in repo-tracked files
- do not hardcode secrets in HTML, CSS, or browser JavaScript
- separate public config from private config clearly
- use descriptive variable names
- document what each variable is for
- rotate secrets if they are ever exposed

Recommended naming approach:

- public-safe frontend values: clearly marked as public
- private backend values: clearly marked as server-only

Do not include real example secrets in docs. Use descriptive names only.

## Recommended GitHub Security Rules

Recommended GitHub practices:

- protect the `main` branch
- require pull requests for changes into `main`
- review diffs before merging
- keep branches focused on one purpose
- enable secret scanning where available
- enable dependency and security alerts where available
- avoid committing generated files that may hide risky changes

Also:

- keep PRs small
- review changed files carefully
- pay extra attention to config, API, auth, and data-access changes

## Recommended Supabase RLS Assumptions

If Supabase is used later, plan around these assumptions:

- Row Level Security should be enabled on exposed data structures
- frontend access should be least-privilege and read-only where possible
- the browser should only access data that is safe for that user to see
- broad raw-table access should be avoided
- views, RPCs, or narrow APIs are safer than exposing large raw datasets

Important mindset:

- do not assume the UI being internal makes the data safe
- always assume requests can be inspected and replayed

## PR Review Checklist

Before approving a PR, review these questions:

- Are any secrets, tokens, or passwords present?
- Is any privileged key being added to browser code?
- Is the frontend being given direct access to something that should stay server-side?
- Are raw database shapes leaking directly into UI code?
- Does the change make future migration harder by tying the UI to one backend vendor?
- Are only the intended files changed?
- Is the change easy to explain and easy to reverse?

## Red Flags

These are warning signs that a change may be risky:

- “It’s fine because the repo is private.”
- “It’s only for internal users.”
- “We can hardcode the key temporarily.”
- “The browser needs direct access to everything for convenience.”
- “The UI can just query the table directly.”
- “We’ll lock it down later.”
- “This one secret is only for testing.”

If you see one of those patterns, stop and review carefully before merging.

## Practical Rules For This Repo

For this dashboard repository, the safest working rules are:

- keep the current repo documentation-first until the backend boundary is designed properly
- do not add live database connections casually
- do not expose privileged data access in the browser
- prefer an API/service layer before expanding data access
- keep the UI independent from backend-specific details

If a change feels powerful but hard to explain simply, it is a good candidate for extra review.
