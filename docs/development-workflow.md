# Development Workflow

## Purpose

This is a practical, beginner-friendly workflow for using Codex, VS Code, GitHub, and a local preview when working on this dashboard repository.

The main idea is:

- keep each change small
- review before merging
- use branches for focused work

## Recommended Step-By-Step Workflow

### 1. Pull The Latest `main`

Before starting new work:

1. Open your terminal in the repo
2. Switch to `main`
3. Pull the latest changes

This reduces the chance of starting from an outdated base.

## 2. Create A New Branch

Create a branch for one clear purpose.

Examples:

- `docs/security-foundation`
- `feature/finance-filter-improvements`
- `fix/nav-cache-behavior`

Keep the branch focused on one topic only.

## 3. Ask Codex For A Plan First

Before making changes, ask Codex for a plan.

Why:

- it helps define scope
- it keeps work reviewable
- it makes it easier to spot risky changes early

Good pattern:

- explain the goal
- mention any constraints
- ask for a plan before implementation

## 4. Let Codex Make Small Changes

Once the plan looks right:

- ask Codex to implement it
- prefer small, focused changes
- avoid mixing unrelated work into the same branch

If a task grows too large, split it into multiple branches.

## 5. Review The Diff In VS Code

Before committing:

- open the Source Control view in VS Code
- read the changed files carefully
- confirm the changes match the request
- look for accidental edits

Pay special attention to:

- config files
- data-loading code
- any future API or backend-related files
- anything that might expose secrets

## 6. Preview Locally

Preview the dashboard before committing.

Two easy options:

- VS Code Live Server
- `python3 -m http.server 8000`

If using Python:

1. run the command in the repo root
2. open `http://localhost:8000`
3. test the changed page

## 7. Commit Locally

Once the diff looks good and the preview works:

- stage the intended files
- write a clear commit message

Good commit messages are short and specific.

Examples:

- `Add security architecture docs`
- `Split finance dashboard into dedicated page`

## 8. Push The Branch

Push your branch to GitHub after the local commit is ready.

This creates a remote copy and prepares the branch for review.

## 9. Open A Pull Request

Create a PR from your branch into `main`.

Use the PR template and fill it in honestly.

The PR should explain:

- what changed
- why it changed
- how you checked it
- whether there are any risks or follow-ups

## 10. Review Before Merge

Before merging:

- read the PR diff again
- check that only intended files changed
- confirm styling was preserved if that mattered
- confirm no secrets or risky config were added

If something feels confusing, clarify it before merge.

## 11. Merge Into `main`

After review is complete:

- merge the PR into `main`

Prefer keeping merges tidy and focused.

## 12. Delete The Branch

After merge:

- delete the branch locally and remotely if you no longer need it

This keeps your branch list clean.

## 13. Pull Latest `main` Again

Before starting the next task:

1. switch back to `main`
2. pull the latest changes

Then create the next branch from the updated `main`.

## 14. Keep Each Branch Focused

One branch should have one main purpose.

Good examples:

- one branch for documentation
- one branch for navigation changes
- one branch for caching behavior

Avoid:

- mixing docs, styling, and backend work in one branch
- mixing unrelated fixes together

## Simple Working Habit

A good rhythm for this repo is:

1. pull latest `main`
2. create branch
3. ask Codex for a plan
4. implement small change
5. review diff in VS Code
6. preview locally
7. commit
8. push
9. open PR
10. merge
11. delete branch
12. repeat from fresh `main`

## Final Advice

If you are unsure:

- make the change smaller
- ask Codex for a plan
- review the diff slowly

Small, understandable changes are safer than large clever ones.
