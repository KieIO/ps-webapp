# Playwright E2E (UI smoke)

Browser tests against the Vite app + **real API** (`seed-dev`). Prefer this over mocks.

## Prerequisites

1. Backend up with seed data:

```bash
cd /agent/repos/ps-be
docker compose up -d db
cp -n .env.example .env   # JWT_SECRET ≥ 32 chars
make migrate && make seed-dev && make dev
# http://localhost:8080
```

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

# Headed / UI mode
npm run test:e2e:headed
npm run test:e2e:ui
```

### Env

| Variable | Default | Notes |
|----------|---------|--------|
| `PLAYWRIGHT_BASE_URL` | `http://localhost:5173` | App under test |
| `VITE_API_URL` | `http://localhost:8080/api/v1` | Real API (mocks forced off by config) |
| `E2E_PASSWORD` | `ps123` | Shared seed password |
| `E2E_ADMIN_EMAIL` | `admin@pokeslide.dev` | Override per role if needed |
| `E2E_PM_EMAIL` | `pm@pokeslide.dev` | |
| `E2E_EMPLOYEE_EMAIL` | `employee@pokeslide.dev` | |

Do not commit secrets; seed passwords are documented fixtures only.

## Layout

```
e2e/
  fixtures/auth.ts    # loginAs(role), sidebar helpers
  um/                 # User-mgmt UI cases (UM-11, 13, 18, …)
  README.md
```

Add new UM UI specs under `e2e/um/` and reuse `loginAs` / sidebar helpers.

## Covered smoke (proof harness)

| Case | Spec |
|------|------|
| UM-11 Admin opens `/roles` | `um/um-11-roles-page.spec.ts` |
| UM-13 PM blocked from `/roles` | `um/um-13-pm-roles-blocked.spec.ts` |
| UM-18 Sidebar by role | `um/um-18-sidebar-by-role.spec.ts` |
