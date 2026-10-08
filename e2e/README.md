# Playwright E2E (UI smoke)

Browser tests against the Vite app + **real API** (`seed-dev`). Prefer this over mocks.

## Prerequisites

1. Backend up with seed data (Postgres 16 on `:5432`, then API on `:8080`):

```bash
cd /agent/repos/ps-be
# Prefer Docker when available:
docker compose up -d db
# Or local Postgres 16 with DATABASE_URL=postgres://postgres:postgres@localhost:5432/pokeslide_db?sslmode=disable
cp -n .env.example .env   # JWT_SECRET ≥ 32 chars
make migrate && make seed-dev && make dev
# http://localhost:8080
```

`test:e2e:um` and `test:e2e:projects` share this prerequisite — same Playwright + real API.

2. Node deps in this repo (`npm install`). First time / CI:

```bash
npx playwright install chromium
```

## Run

```bash
# From ps-webapp — starts Vite automatically (webServer) if nothing is on :5173
npm run test:e2e

# UM smoke only (UM-11, UM-13, UM-18)
npm run test:e2e:um

# Project-mgmt UI smoke (PM-31, PM-40, PM-41)
npm run test:e2e:projects

# Headed / UI mode
npm run test:e2e:headed
npm run test:e2e:ui
```

### Env

| Variable              | Default                        | Notes                                 |
| --------------------- | ------------------------------ | ------------------------------------- |
| `PLAYWRIGHT_BASE_URL` | `http://localhost:5173`        | App under test                        |
| `VITE_API_URL`        | `http://localhost:8080/api/v1` | Real API (mocks forced off by config) |
| `E2E_PASSWORD`        | `ps123`                        | Shared seed password                  |
| `E2E_ADMIN_EMAIL`     | `admin@pokeslide.dev`          | Override per role if needed           |
| `E2E_PM_EMAIL`        | `pm@pokeslide.dev`             |                                       |
| `E2E_EMPLOYEE_EMAIL`  | `employee@pokeslide.dev`       |                                       |

Do not commit secrets; seed passwords are documented fixtures only.

## Layout

```
e2e/
  fixtures/auth.ts    # loginAs(role), sidebar helpers
  um/                 # User-mgmt UI cases (UM-11, 13, 18, …)
  projects/           # Project-mgmt UI cases (PM-31, 40, 41, …)
  README.md
```

Add new UM UI specs under `e2e/um/` and project specs under `e2e/projects/`; reuse `loginAs` / sidebar helpers.

## Covered smoke (proof harness)

| Case                           | Spec                                           |
| ------------------------------ | ---------------------------------------------- |
| UM-11 Admin opens `/roles`     | `um/um-11-roles-page.spec.ts`                  |
| UM-13 PM blocked from `/roles` | `um/um-13-pm-roles-blocked.spec.ts`            |
| UM-18 Sidebar by role          | `um/um-18-sidebar-by-role.spec.ts`             |
| PM-31 Sidebar Projects by role | `projects/pm-31-sidebar-projects.spec.ts`      |
| PM-40 Create button by role    | `projects/pm-40-create-button-by-role.spec.ts` |
| PM-41 Active ↔ Archived nav   | `projects/pm-41-archived-nav.spec.ts`          |
