# Automating task-mgmt manual cases (TASK-01–TASK-78)

> **Living coverage map:** [`task-flow-test-coverage.md`](./task-flow-test-coverage.md) (synced to current repo tests).  
> This file keeps the original automation strategy + historical TASK-01…78 table. **IDs below may drift** (e.g. old TASK-64/65 = CM/Staff decline; repo TASK-64 = CH refuse, TASK-65 = PM rehand, TASK-67 = decline reason E2E).

Companion to [`task-mgmt-test-cases.md`](./task-mgmt-test-cases.md).

**Short answer:** Do not auto-run the markdown checklist. Automate **API integration tests** (Go + in-memory SQLite, same pattern as user-mgmt / project-mgmt) for CRUD / filters / authz / status / assign / **creative pipeline** / **create department fork** / **decline rollback** / **layered pm-evaluation** / **post-assign meta edit**. Keep **Playwright** for UI chrome (create button, sidebar, nav, **Evaluate modal**, **CH/CM decline/assign drawers**, **Edit modal / CreativeEditDrawer after assign**). Manual checklist for residual smoke (TASK-46).

---

## 1. What can be automated today vs needs e2e

| Case       | Flow                                                          | Automate **without** browser? | How                                                                                       |
| ---------- | ------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------- |
| TASK-01    | Create project (Admin)                                        | **Yes**                       | API: login → `POST /tasks/my` → 201                                                       |
| TASK-02    | Create project (PM)                                           | **Yes**                       | API as `pm@…`                                                                             |
| TASK-03    | Create non_project                                            | **Yes**                       | API `taskCategory=non_project`                                                            |
| TASK-04    | Derived level                                                 | **Yes**                       | Assert level from DT/tech/content                                                         |
| TASK-05    | Staff required                                                | **Yes**                       | API empty staff → 422                                                                     |
| TASK-06    | Creative awaiting_ch                                          | **Yes**                       | API `department=creative` + empty staff (+ dept/staff asserts)                            |
| TASK-07–13 | Edit / locks                                                  | **Yes**                       | API `PATCH` + assert 200/403/422                                                          |
| TASK-14–17 | Status / cancel rules                                         | **Yes**                       | API `PATCH …/status`                                                                      |
| TASK-18–21 | Soft delete + role delete                                     | **Yes**                       | `DELETE` → 204/403; `GET` → 404                                                           |
| TASK-22–26 | Filters                                                       | **Yes**                       | API query params                                                                          |
| TASK-27–31 | Role create + visibility                                      | **Yes**                       | API expect 403 / scoped list                                                              |
| TASK-32–33 | Switch-user (API slice)                                       | **Partial**                   | Login each role + assert create 403/200                                                   |
| TASK-34    | Sidebar tasks                                                 | **E2E / manual**              | Playwright                                                                                |
| TASK-35    | PM evaluate                                                   | **Yes** + **E2E**             | API + Playwright Evaluate modal                                                           |
| TASK-36    | Employee cannot evaluate                                      | **Yes** + **E2E**             | API 403 + Playwright Evaluate hidden                                                      |
| TASK-37–38 | Assign / leave                                                | **Yes**                       | API assign                                                                                |
| TASK-39–42 | Validation                                                    | **Yes**                       | API expect 4xx                                                                            |
| TASK-43    | Urgency                                                       | **Yes**                       | API meta PATCH urgency                                                                    |
| TASK-44    | Create button chrome                                          | **E2E / manual**              | Playwright                                                                                |
| TASK-45    | Project ↔ Non-project nav                                    | **E2E / manual**              | Playwright                                                                                |
| TASK-46    | Filter Reset chrome                                           | **E2E / manual**              | Playwright (API covers filter logic)                                                      |
| TASK-47    | CH assign-cm                                                  | **Yes** + **E2E**             | API + Playwright Giao CM drawer                                                           |
| TASK-48    | Staff, CM, and PM assign-cm forbidden                         | **Yes**                       | API 403                                                                                   |
| TASK-49    | assign-cm validation                                          | **Yes**                       | API 422                                                                                   |
| TASK-50    | CM whole assign-staff                                         | **Yes**                       | API `mode=whole`                                                                          |
| TASK-51    | PM/Admin split; parent qty unchanged                          | **Yes**                       | API `mode=split`; CM split 403                                                            |
| TASK-52    | assign-staff authz                                            | **Yes**                       | API 403                                                                                   |
| TASK-53    | Qty before split                                              | **Yes**                       | API creative-edit quantity                                                                |
| TASK-54    | Child qty must not exceed parent                              | **Yes**                       | API cap; parent qty not overwritten                                                       |
| TASK-55    | Reassign CM                                                   | **Yes**                       | API creative-edit `cmUserId`                                                              |
| TASK-56    | Split list visibility                                         | **Yes**                       | API list Admin vs CM                                                                      |
| TASK-57    | Stage happy path                                              | **Yes**                       | API create → assign-cm → whole                                                            |
| TASK-58    | assign-staff validation                                       | **Yes**                       | API 422                                                                                   |
| TASK-59    | Reassign Staff                                                | **Yes**                       | API creative-edit `staffUserId`                                                           |
| TASK-60    | Confirmed child qty lock                                      | **Yes**                       | API status + childQuantities                                                              |
| TASK-61    | Create dept=project + staff                                   | **Yes**                       | API `department=project` → `assigned_staff`                                               |
| TASK-62    | Create dept=creative + staff                                  | **Yes**                       | API creative+staff → `assigned_staff`                                                     |
| TASK-63    | Dept contrast side-by-side                                    | **Yes**                       | Same payload except department                                                            |
| TASK-80    | Create-task **Add** unknown project (incl. empty filter list) | **E2E**                       | Playwright `task-80-81-…`                                                                 |
| TASK-81    | PM no inline Add (no `CREATE_PROJECT`)                        | **E2E**                       | Same spec — free-text kept, no Add button                                                 |
| TASK-82    | Deadline disabled/clamped outside project start–end           | **Unit**                      | `taskDates.test.ts`                                                                       |
| TASK-83    | PM add zero-qty unassigned child after split                  | **Yes** + **E2E**             | API `TASK83` · `task-83-pm-add-zero-child.spec.ts`                                        |
| TASK-84    | Parent split / add-child / qty-change audit history           | **Yes**                       | API `TASK84`                                                                              |
| TASK-85    | PM/Admin add QA child (qty outside parent SL; CM denied)      | **Yes** + **E2E** + **Unit**  | API `TASK85` · `task-85-pm-add-qa-child.spec.ts` · mock QA child                          |
| TASK-64    | CM decline → awaiting_ch                                      | **Yes** + **E2E**             | API + Playwright Từ chối nhận chrome                                                      |
| TASK-65    | Staff decline → awaiting_cm                                   | **Yes** + **E2E**             | API + Playwright Từ chối chrome                                                           |
| TASK-66    | Decline awaiting_ch rejected                                  | **Yes**                       | API 422 (no CH reject-inbox) — no UI                                                      |
| TASK-67    | PM eval creative-handoff parent                               | **Yes**                       | API only (modal chrome = TASK-35 UI)                                                      |
| TASK-68    | CH eval creative parent                                       | **Yes** + **E2E**             | API + Playwright CH Evaluate modal                                                        |
| TASK-69    | CH eval project parent                                        | **Yes** + **E2E**             | API + same CH Evaluate modal spec                                                         |
| TASK-70    | CH deny split child eval                                      | **Yes**                       | API 422 — no UI                                                                           |
| TASK-71    | CM eval whole assigned_staff                                  | **Yes** + **E2E**             | API + Playwright CM Evaluate modal                                                        |
| TASK-72    | CM eval split child; deny parent                              | **Yes**                       | API 200 child / 422 parent — no UI                                                        |
| TASK-73    | Assign then edit full matrix                                  | **Yes** + **E2E**             | API assign → `PATCH /{id}` + Playwright Edit modal                                        |
| TASK-74    | Edit while confirmed                                          | **Yes**                       | API status confirmed → meta PATCH still 200                                               |
| TASK-75    | Creative assigned_staff meta                                  | **Yes** + **E2E**             | API creative-edit + Playwright CreativeEditDrawer                                         |
| TASK-76    | Creative taskName path                                        | **Yes**                       | API creative-edit ignores name; generic PATCH renames (drawer chrome asserted in TASK-75) |
| TASK-77    | Creative-edit finished/cancelled lock                         | **Yes**                       | API 422/403 — no UI (pure lock)                                                           |
| TASK-78    | Post-assign role denial                                       | **Yes**                       | API employee + non-creator PM 403 — no UI (pure lock)                                     |

**Rough split**

| Bucket                                | Cases                                       | Share    |
| ------------------------------------- | ------------------------------------------- | -------- |
| API / Go integration                  | TASK-01–33, 35–43, **47–78**                | ~74 / 78 |
| Playwright UI (incl. pipeline chrome) | TASK-34, 35–36, 44–45, 47, 64–65, 68–69, 71 | ~11      |
| Manual residual                       | TASK-46                                     | 1        |

---

## 2. Primary approach

### **API integration suite** (recommended — mirrors `make test-usermgmt` / `make test-projectmgmt`)

One Go test package under `ps-be/internal/integration/`:

1. In-memory SQLite + real chi handlers/middleware/services
2. Seeds admin / pm / head / employee(+2) / creative_manager(+2) / creative_head + project + department
3. Calls the same endpoints the checklist uses (incl. assign-cm / assign-staff / creative-edit)
4. Fails `go test` per `TASK-xx` in test names

**Why this over Playwright first**

- Covers most of TASK-01–43 and **all of TASK-47–60** (creative assign / split / quantity)
- Reuses harness style from user-mgmt / project-mgmt / prior task-mgmt
- No browser / seed-dev dependency for CI green/red

**Playwright (UI chrome):** `ps-webapp` `e2e/tasks/` — sidebar / create button / category nav + **Evaluate modal** (PM/CH/CM) + **CH Giao CM drawer** + **CM/staff decline chrome**. Pipeline stage setup via `e2e/fixtures/taskApi.ts` (real API); logic/authz remain API-covered.

---

## 3. Exact commands for green/red

### A. API suite (implemented — green)

Suite: `/agent/repos/ps-be/internal/integration/task_mgmt_*.go`  
Prior base: [`KieIO/ps-be#8`](https://github.com/KieIO/ps-be/pull/8) · extension branch `cursor/creative-assign-pipeline-tests-7cab`

```bash
cd /agent/repos/ps-be
make test-taskmgmt
# equivalent:
go test ./internal/integration/ -run TaskMgmt -v -count=1
```

Expected output shape:

```
=== RUN   TestTaskMgmt_TASK01_CreateAdmin
--- PASS: TestTaskMgmt_TASK01_CreateAdmin
...
=== RUN   TestTaskMgmt_TASK47_CHAssignCM
--- PASS: TestTaskMgmt_TASK47_CHAssignCM
...
PASS
ok  	github.com/goware/pokeslide-be/internal/integration
```

**Verified green (2026-10-08):** **56 passed** (TASK-01–33, TASK-35–43, TASK-47–60) in ~33s — before dept-create extension.  
Harness identifiers renamed `tm*` → `tkm*` to avoid collision with title-mgmt (`tmEnv`).  
Also fixed split `childQuantities` Save-on-partial-row bug (`UpdateQuantity`).  
**Dept-create extension:** +3 tests (TASK-61–63); tighten TASK-06. No new Playwright (department fork is API-covered).  
**Pipeline coverage gaps (decline + layered eval):** +9 tests (TASK-64–72). No product API invented — CM/staff decline via existing status PATCH; CH reject-inbox documented as 422.  
**Post-assign meta edit:** +6 tests (TASK-73–78). Explicit assign→edit matrix, confirmed edit, creative whole `assigned_staff` creative-edit, taskName path, creative finished/cancelled locks, role denial. Branched from `main` (IDs continue after TASK-72; independent of open ps-be#12).  
**Skipped UI-only:** TASK-34, TASK-44, TASK-45, TASK-46.  
**Post-assign Edit chrome (Playwright sibling):** TASK-73 Edit modal · TASK-75 CreativeEditDrawer. Skip TASK-74/76–78 UI (API locks / same chrome).

### B. Playwright UI smoke (pipeline chrome + Evaluate + post-assign Edit)

Repo: `/agent/repos/ps-webapp` — `e2e/tasks/`  
Prior: [`KieIO/ps-webapp#8`](https://github.com/KieIO/ps-webapp/pull/8) · pipeline UI: [`#11`](https://github.com/KieIO/ps-webapp/pull/11) · post-assign edit: branch `cursor/task-post-assign-edit-e2e-7fd5`

| Case       | Spec                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| TASK-34    | `e2e/tasks/task-34-sidebar-tasks.spec.ts`                                       |
| TASK-35    | `e2e/tasks/task-35-evaluate-task-modal.spec.ts`                                 |
| TASK-36    | `e2e/tasks/task-36-evaluate-hidden-by-role.spec.ts`                             |
| TASK-44    | `e2e/tasks/task-44-create-button-by-role.spec.ts`                               |
| TASK-45    | `e2e/tasks/task-45-category-nav.spec.ts`                                        |
| TASK-47    | `e2e/tasks/task-47-ch-assign-cm-drawer.spec.ts`                                 |
| TASK-64    | `e2e/tasks/task-64-cm-refuse-chrome.spec.ts`                                    |
| TASK-65    | `e2e/tasks/task-65-staff-decline-chrome.spec.ts`                                |
| TASK-68/69 | `e2e/tasks/task-68-ch-evaluate-modal.spec.ts`                                   |
| TASK-71    | `e2e/tasks/task-71-cm-evaluate-modal.spec.ts`                                   |
| TASK-73    | `e2e/tasks/task-73-edit-modal-after-assign.spec.ts`                             |
| TASK-75    | `e2e/tasks/task-75-creative-edit-after-assign.spec.ts`                          |
| PM-53      | `e2e/tasks/pm-53-head-edit-project-evaluation.spec.ts` (project eval; adjacent) |

```bash
# Terminal 1 — API + seed-dev
cd /agent/repos/ps-be
docker compose up -d db   # or apt postgresql-16 if no docker
cp -n .env.example .env
make migrate && make seed-dev && make dev

# Terminal 2
cd /agent/repos/ps-webapp
npm install
npx playwright install chromium
npm run test:e2e:tasks
```

`playwright.config.ts` forces `VITE_USE_AUTH_MOCK=false`, `VITE_USE_USERS_MOCK=false`, `VITE_USE_TASKS_MOCK=false`.

**Verified green (2026-10-08):** prior **3** (TASK-34/44/45); pipeline UI extension adds Evaluate + decline/assign chrome (see verified runs).

### C. Manual residual

**TASK-46** (filter Reset chrome): run **Quick smoke path** in the test-cases doc.

---

## 4. Effort & what NOT to do

| Work                                                   | Effort                                               |
| ------------------------------------------------------ | ---------------------------------------------------- |
| Go `TaskMgmt` creative pipeline extension (TASK-47–60) | **Small–medium** — extend existing harness           |
| Playwright TASK-34/44/45                               | Already shipped                                      |
| Playwright Evaluate + decline/assign chrome            | **Done** — UI slices of TASK-35/36/47/64/65/68/69/71 |
| Full Playwright for split-drawer mutations             | **Avoid** — API covers logic/authz                   |

### Do NOT

1. **Parse/execute `task-mgmt-test-cases.md` as a runner** — markdown is for humans.
2. **Start with Playwright** to “run the checklist” — most assertions are API-level.
3. **Treat cancel as archive** — tasks have no archive endpoint.
4. **Mock-only Vitest as seed-dev pass/fail** — mocks ≠ RBAC/visibility.
5. **Assume Head can create tasks** — default `CREATE_TASK` is PM + Admin only.
6. **Assume `ASSIGN_TASK` middleware gates assign routes** — assign / assign-cm / assign-staff are auth + service today.
7. **Edit child quantity after split** — `childQuantities` sum must stay ≤ parent quantity. Parent quantity is not overwritten by the child sum.

---

## Mapping cheat sheet

| Manual ID                                                         | Automation                                                                                                      |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| TASK-01–33, 35–43, 47–78                                          | `make test-taskmgmt` — **74 tests** when TASK-64–72 + 73–78 both present; **65** on main+73–78 before #12 merge |
| TASK-34, 35–36, 44–45, 47, 64–65, 68–69, 71, **73, 75** (+ PM-53) | `npm run test:e2e:tasks`                                                                                        |
| TASK-46                                                           | Manual residual                                                                                                 |
| TASK-66, 67, 70, 72, 74, 76–78                                    | API only (no distinct UI chrome / pure locks)                                                                   |

---

## Verified runs

| Date       | Suite                                  | Command                  | Result                                                                                                                                          |
| ---------- | -------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-08 | API (baseline)                         | `make test-taskmgmt`     | **41 passed** (~21s)                                                                                                                            |
| 2026-10-08 | Playwright                             | `npm run test:e2e:tasks` | **3 passed** (~17s)                                                                                                                             |
| 2026-10-08 | API (+ creative pipeline TASK-47–60)   | `make test-taskmgmt`     | **56 passed** (~33s)                                                                                                                            |
| 2026-10-08 | API (+ dept create TASK-61–63)         | `make test-taskmgmt`     | **59 passed** (~34s)                                                                                                                            |
| 2026-10-08 | API (+ decline/eval TASK-64–72)        | `make test-taskmgmt`     | **68 passed** (ps-be#12; may be draft/unmerged)                                                                                                 |
| 2026-10-08 | Playwright (+ pipeline UI)             | `npm run test:e2e:tasks` | **11 passed** (~47s) — TASK-34/35/36/44/45/47/64/65/68/71 + PM-53                                                                               |
| 2026-10-08 | API (+ post-assign edit TASK-73–78)    | `make test-taskmgmt`     | **65 passed** (~40s) — main tip + TASK-73–78 (without #12’s 64–72)                                                                              |
| 2026-10-08 | Playwright (+ post-assign Edit chrome) | `npm run test:e2e:tasks` | **6 passed** (~30s) — TASK-34/44/45 + PM-53 + TASK-73/75 ([ps-webapp#12](https://github.com/KieIO/ps-webapp/pull/12); pipeline UI still on #11) |
