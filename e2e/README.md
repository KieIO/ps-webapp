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

`test:e2e:um`, `test:e2e:projects`, and `test:e2e:departments` share this prerequisite — same Playwright + real API.

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

# Project-mgmt UI smoke (PM-31/39/40/41/48/52 + PM-11/13/24 archive)
npm run test:e2e:projects

# Task UI smoke (+ PM-53 Head My Tasks → project evaluation)
npm run test:e2e:tasks

# Department management UI smoke (DEPT-30–32)
npm run test:e2e:departments

# Title-mgmt UI smoke (TITLE-35–39)
npm run test:e2e:titles

# Client-mgmt UI smoke (CLIENT-41, CLIENT-42, CLIENT-43)
npm run test:e2e:clients

# Task scores UI smoke (TSCORE-39, TSCORE-40)
npm run test:e2e:taskscores

# Capacity formula UI smoke (CAP-27–30)
npm run test:e2e:capacity

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
  departments/        # Dept-mgmt UI cases (DEPT-30–32)
  titles/             # Title-mgmt UI cases (TITLE-35–39, …)
  clients/            # Client-mgmt UI cases (CLIENT-41, 42, 43, …)
  task-scores/        # Task types & scores UI cases (TSCORE-39, 40, …)
  capacity-formula/        # Capacity formula UI cases (CAP-27–30)
  README.md
```

Add new UM UI specs under `e2e/um/`, project specs under `e2e/projects/`, and department specs under `e2e/departments/`; reuse `loginAs` / sidebar helpers.

## Covered smoke (proof harness)

| Case                                        | Spec                                                       |
| ------------------------------------------- | ---------------------------------------------------------- | ----- |
| UM-11 Admin opens `/roles`                  | `um/um-11-roles-page.spec.ts`                              |
| UM-13 PM blocked from `/roles`              | `um/um-13-pm-roles-blocked.spec.ts`                        |
| UM-18 Sidebar by role                       | `um/um-18-sidebar-by-role.spec.ts`                         |
| PM-31 Sidebar Projects by role              | `projects/pm-31-sidebar-projects.spec.ts`                  |
| PM-39 Urgency via Edit modal                | `projects/pm-39-urgency-edit-modal.spec.ts`                |
| PM-40 Create button by role                 | `projects/pm-40-create-button-by-role.spec.ts`             |
| PM-41 Active ↔ Archived nav                | `projects/pm-41-archived-nav.spec.ts`                      |
| PM-11 / PM-13 Archive + Unarchive click     | `projects/pm-11-archive-unarchive-click.spec.ts`           |
| PM-24 PM Archive/Delete hidden              | `projects/pm-24-pm-archive-hidden.spec.ts`                 |
| PM-48 Evaluate project modal                | `projects/pm-48-evaluate-project-modal.spec.ts`            |
| PM-52 Evaluate hidden (Employee)            | `projects/pm-52-evaluate-hidden-by-role.spec.ts`           |
| PM-53 Head My Tasks → project eval          | `tasks/pm-53-head-edit-project-evaluation.spec.ts`         |
| DEPT-30 Sidebar Department management       | `departments/dept-30-sidebar-departments.spec.ts`          |
| DEPT-31 Admin opens `/settings/departments` | `departments/dept-31-admin-page.spec.ts`                   |
| DEPT-32 PM blocked from departments page    | `departments/dept-32-pm-page-blocked.spec.ts`              |
| TITLE-36 Sidebar Capacity formula           | `titles/title-36-sidebar-capacity-formula.spec.ts`         |
| TITLE-37 PM/Employee blocked                | `titles/title-37-pm-titles-blocked.spec.ts`                |
| TITLE-38 Tabs + create chrome               | `titles/title-38-tabs-create-chrome.spec.ts`               |
| TITLE-39 Capacity page no-create            | `titles/title-39-capacity-page-no-create.spec.ts`          |
| Variable                                    | Default                                                    | Notes |
| CAP-28 PM blocked from formula page         | `capacity-formula/cap-28-pm-formula-blocked.spec.ts`       |
| CAP-29 Employee blocked from formula page   | `capacity-formula/cap-29-employee-formula-blocked.spec.ts` |
| CAP-30 Formula page chrome                  | `capacity-formula/cap-30-page-chrome.spec.ts`              |
