# `src/config`

This folder is for future frontend configuration that is safe to expose publicly.

Examples of suitable content:

- non-sensitive feature flags
- public-safe route names
- page-level configuration

This folder should not contain:

- secrets
- private credentials
- privileged database access details

Rule of thumb:

- if it would be unsafe for a user to inspect it in the browser, it does not belong here
