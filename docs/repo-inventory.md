# Repository Inventory

## Analysis Snapshot

- Branch: `feature/repo-structure-documentation`
- Analysis time: `2026-05-02 18:35:11 SAST`
- Working tree at inspection time: clean
- Scope: tracked repository files only

## High-Level Tree

```text
product-dashboard-plyr/
├── .env.example
├── .github/
│   └── pull_request_template.md
├── .gitignore
├── AGENTS.md
├── api/
│   ├── README.md
│   └── adapters/
│       └── README.md
├── dashboard-pages.js
├── docs/
│   ├── architecture.md
│   ├── data-contracts.md
│   ├── development-workflow.md
│   ├── security-model.md
│   └── supabase-connection-model.md
├── finance-adjustments.html
├── index.html
├── sql/
│   ├── README.md
│   └── templates/
│       └── dashboard_read_model_template.sql
├── src/
│   ├── config/
│   │   ├── README.md
│   │   └── public-config.js
│   ├── mappers/
│   │   ├── README.md
│   │   └── dashboard.mapper.js
│   ├── services/
│   │   ├── README.md
│   │   ├── dashboard-api.browser.js
│   │   ├── dashboard-api.js
│   │   └── mock-data/
│   │       └── dashboard.mock.js
│   └── utils/
│       └── http.js
└── styles.css
```

## File Inventory

| Path | Category | Purpose | Affects runtime dashboard behavior | Type | Security relevance | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `.env.example` | Config | Safe example of expected environment variables | No | Config | Defines public-safe vs server-only config boundaries | Implemented |
| `.github/pull_request_template.md` | GitHub | Pull request checklist and review guardrails | No | Documentation / workflow | Adds merge-time security checks | Implemented |
| `.gitignore` | Config | Prevents common secret and build artifacts from being committed | No | Config | Important for secret hygiene | Implemented |
| `AGENTS.md` | Governance | Repository instructions for safe, minimal, security-aware changes | No | Documentation / workflow | Sets security and architecture rules for contributors and agents | Implemented |
| `api/README.md` | API scaffold | Describes the future secure API boundary | No | Scaffold documentation | Explains where server-side secrets and validation belong | Scaffolded |
| `api/adapters/README.md` | Adapter scaffold | Describes future database adapter pattern | No | Scaffold documentation | Keeps database-specific logic out of frontend code | Scaffolded |
| `dashboard-pages.js` | Runtime navigation | Shared page registry, sidebar rendering, dashboard metadata | Yes | Runtime | Low direct security impact, but runtime shell content source | Implemented |
| `docs/architecture.md` | Docs | Explains target architecture and layers | No | Documentation | Architecture and security boundary guidance | Implemented |
| `docs/data-contracts.md` | Docs | Explains stable UI data contracts and mapping | No | Documentation | Reduces backend coupling and accidental overexposure of raw data | Implemented |
| `docs/development-workflow.md` | Docs | Beginner-friendly branch, preview, PR, and merge workflow | No | Documentation | Supports safer review and change control | Implemented |
| `docs/security-model.md` | Docs | Explains secret handling, frontend vs server boundaries, and review checks | No | Documentation | Core security guidance | Implemented |
| `docs/supabase-connection-model.md` | Docs | Explains how Supabase should fit behind a secure API boundary | No | Documentation | Clarifies safe use of anon vs secret keys and RLS | Implemented |
| `finance-adjustments.html` | Runtime dashboard | Finance Adjustments dashboard page | Yes | Runtime | High relevance: browser-executed data loading, session cache, page-level public config | Implemented |
| `index.html` | Runtime dashboard | Dashboard home page and dashboard entry point | Yes | Runtime | Medium relevance: runtime shell, navigation, and UI content rendering | Implemented |
| `sql/README.md` | SQL scaffold | Explains where reviewed SQL drafts, views, and RLS notes belong | No | Scaffold documentation | Prepares safer database review practices | Scaffolded |
| `sql/templates/dashboard_read_model_template.sql` | SQL scaffold | Placeholder template for future read models and RLS planning | No | Scaffold / template | Security planning example only, not production SQL | Placeholder |
| `src/config/README.md` | Frontend scaffold | Explains purpose of public-safe frontend config folder | No | Scaffold documentation | Helps keep secrets out of browser code | Scaffolded |
| `src/config/public-config.js` | Frontend runtime support | Public-safe config used by frontend service layer | Yes | Runtime support / config | High relevance: safe browser config boundary | Implemented |
| `src/mappers/README.md` | Frontend scaffold | Explains mapper/normalizer folder purpose | No | Scaffold documentation | Encourages safe stable contracts | Scaffolded |
| `src/mappers/dashboard.mapper.js` | Frontend runtime support | Maps raw API-shaped data into stable dashboard contracts | Yes | Runtime support | Medium relevance: prevents UI from depending on backend-specific shapes | Implemented |
| `src/services/README.md` | Frontend scaffold | Explains service layer purpose and boundaries | No | Scaffold documentation | Keeps endpoint knowledge centralized | Scaffolded |
| `src/services/dashboard-api.browser.js` | Frontend runtime bridge | Exposes service layer to static HTML pages via `window.dashboardApi` | Yes | Runtime support | Medium relevance: runtime bridge between static page and service layer | Implemented |
| `src/services/dashboard-api.js` | Frontend runtime support | Shared frontend service for dashboard data loading | Yes | Runtime support | High relevance: centralizes endpoint paths and keeps direct DB logic out of pages | Implemented |
| `src/services/mock-data/dashboard.mock.js` | Frontend runtime support | Local mock data for finance page integration | Yes | Runtime support / mock | Medium relevance: safe non-live data source for current phase | Implemented |
| `src/utils/http.js` | Frontend runtime support | Shared safe fetch helper | Yes | Runtime support | High relevance: centralizes HTTP error handling and public config pathing | Implemented |
| `styles.css` | Runtime styling | Shared visual language across the dashboard pages | Yes | Runtime | Low direct security relevance, high UI continuity relevance | Implemented |

## Runtime Vs Scaffold Summary

### Current runtime dashboard files

- `index.html`
- `finance-adjustments.html`
- `styles.css`
- `dashboard-pages.js`
- `src/config/public-config.js`
- `src/services/dashboard-api.browser.js`
- `src/services/dashboard-api.js`
- `src/services/mock-data/dashboard.mock.js`
- `src/mappers/dashboard.mapper.js`
- `src/utils/http.js`

### Documentation-only files

- `AGENTS.md`
- `.github/pull_request_template.md`
- All files in `docs/`

### Future-facing scaffold or placeholder files

- `api/README.md`
- `api/adapters/README.md`
- `src/config/README.md`
- `src/mappers/README.md`
- `src/services/README.md`
- `sql/README.md`
- `sql/templates/dashboard_read_model_template.sql`

## Notes On Current State

- The repository is no longer purely static documentation plus HTML. One dashboard page already uses the new frontend service, mapper, config, mock-data, and HTTP helper layers.
- There is no verified live privileged Supabase connection in the tracked repository.
- No real secrets were found during this review.
- Several folders are intentionally future-facing and are present to prepare for a safer backend integration later.
