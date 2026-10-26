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
# Coverage index (create/assign/decline/edit/delete): docs/task-flow-test-coverage.md
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

# Leave smoke (multi-period + login/auto-Active/tracker weekends)
npm run test:e2e:leave

# Milestone tracker UI smoke (MS-03/05/09/11/19)
npm run test:e2e:milestones

# Tracker PM rights + VN dates (TRK-01…05)
npm run test:e2e:tracker

# Headed / UI mode
npm run test:e2e:headed
npm run test:e2e:ui
```

### Env

| Variable                     | Default                          | Notes                                 |
| ---------------------------- | -------------------------------- | ------------------------------------- |
| `PLAYWRIGHT_BASE_URL`        | `http://localhost:5173`          | App under test                        |
| `VITE_API_URL`               | `http://localhost:8080/api/v1`   | Real API (mocks forced off by config) |
| `E2E_PASSWORD`               | `ps123`                          | Shared seed password                  |
| `E2E_ADMIN_EMAIL`            | `admin@pokeslide.dev`            | Override per role if needed           |
| `E2E_PM_EMAIL`               | `pm@pokeslide.dev`               |                                       |
| `E2E_EMPLOYEE_EMAIL`         | `employee@pokeslide.dev`         |                                       |
| `E2E_CREATIVE_MANAGER_EMAIL` | `creative-manager@pokeslide.dev` | CM for TASK-66                        |

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
  milestones/              # Tracker milestone UI cases (MS-03/05/09/11/19)
  tracker/                 # Tracker PM urgency/timeline/VN dates (TRK-01…05)
  README.md
```

Add new UM UI specs under `e2e/um/`, project specs under `e2e/projects/`, department specs under `e2e/departments/`, milestone specs under `e2e/milestones/`, and tracker specs under `e2e/tracker/`; reuse `loginAs` / sidebar helpers.

## Covered smoke (proof harness)

| Case                                           | Spec                                                       |
| ---------------------------------------------- | ---------------------------------------------------------- | ----- |
| UM-11 Admin opens `/roles`                     | `um/um-11-roles-page.spec.ts`                              |
| UM-13 PM blocked from `/roles`                 | `um/um-13-pm-roles-blocked.spec.ts`                        |
| UM-18 Sidebar by role                          | `um/um-18-sidebar-by-role.spec.ts`                         |
| PM-31 Sidebar Projects by role                 | `projects/pm-31-sidebar-projects.spec.ts`                  |
| PM-39 Urgency via Edit modal                   | `projects/pm-39-urgency-edit-modal.spec.ts`                |
| PM-40 Create button by role                    | `projects/pm-40-create-button-by-role.spec.ts`             |
| PM-41 Active ↔ Archived nav                   | `projects/pm-41-archived-nav.spec.ts`                      |
| PM-11 / PM-13 Archive + Unarchive click        | `projects/pm-11-archive-unarchive-click.spec.ts`           |
| PM-24 PM Archive/Delete hidden                 | `projects/pm-24-pm-archive-hidden.spec.ts`                 |
| PM-48 Evaluate project modal                   | `projects/pm-48-evaluate-project-modal.spec.ts`            |
| PM-52 Evaluate hidden (Employee)               | `projects/pm-52-evaluate-hidden-by-role.spec.ts`           |
| PM-53 Head My Tasks → project eval             | `tasks/pm-53-head-edit-project-evaluation.spec.ts`         |
| TASK-37/56 Project assign + split list hide    | `tasks/task-37-56-project-assign-visibility.spec.ts`       |
| TASK-47/50/51/57 Creative assign UI pipe       | `tasks/task-47-57-creative-assign-ui.spec.ts`              |
| TASK-48/49/52/58 Assign guards (+ TASK-38 ~)   | `tasks/task-48-58-assign-guards.spec.ts`                   |
| TASK-55/59 Reassign CM / Staff                 | `tasks/task-55-59-reassign-ui.spec.ts`                     |
| TASK-64 CH refuse PM creative handoff          | `tasks/task-64-ch-refuse-pm-handoff.spec.ts` (+ manual md) |
| TASK-77 CM refuse → CH queue                   | `tasks/task-77-cm-refuse-to-ch.spec.ts`                    |
| TASK-78 Staff refuse → CM queue                | `tasks/task-78-staff-refuse-to-cm.spec.ts`                 |
| TASK-66 Split evaluate remainder + SL edit     | `tasks/task-66-split-evaluate-remainder.spec.ts`           |
| TASK-70/71 Deadline PM + Creative by role      | `tasks/task-70-71-deadlines-by-role.spec.ts`               |
| TASK-72–76 Layered eval + visibility           | `tasks/task-72-76-eval-layers-visibility.spec.ts`          |
| DEPT-30 Sidebar Department management          | `departments/dept-30-sidebar-departments.spec.ts`          |
| DEPT-31 Admin opens `/settings/departments`    | `departments/dept-31-admin-page.spec.ts`                   |
| DEPT-32 PM blocked from departments page       | `departments/dept-32-pm-page-blocked.spec.ts`              |
| TITLE-36 Sidebar Capacity formula              | `titles/title-36-sidebar-capacity-formula.spec.ts`         |
| TITLE-37 PM/Employee blocked                   | `titles/title-37-pm-titles-blocked.spec.ts`                |
| TITLE-38 Tabs + create chrome                  | `titles/title-38-tabs-create-chrome.spec.ts`               |
| TITLE-39 Capacity page no-create               | `titles/title-39-capacity-page-no-create.spec.ts`          |
| Variable                                       | Default                                                    | Notes |
| CAP-28 PM blocked from formula page            | `capacity-formula/cap-28-pm-formula-blocked.spec.ts`       |
| CAP-29 Employee blocked from formula page      | `capacity-formula/cap-29-employee-formula-blocked.spec.ts` |
| CAP-30 Formula page chrome                     | `capacity-formula/cap-30-page-chrome.spec.ts`              |
| Leave-01 Multi-period schedule + overlap       | `leave/leave-01-multi-period-schedule.spec.ts`             |
| Leave-02 Login on leave, auto Active, weekends | `leave/leave-02-login-auto-active-tracker.spec.ts`         |
| TRK-01 PM urgency on Tracker (+ Employee 403)  | `tracker/trk-01-pm-urgency-on-tracker.spec.ts`             |
| TRK-02/05 PM Edit timeline + YYYY-MM-DD body   | `tracker/trk-02-05-pm-edit-timeline-dateonly.spec.ts`      |
| TRK-03 PM Add-milestone chrome on Tracker      | `tracker/trk-03-pm-milestone-chrome.spec.ts`               |
| TRK-04 VN calendar bar end date via /tracker   | `tracker/trk-04-vn-timeline-bar.spec.ts`                   |
