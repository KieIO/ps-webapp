# Automating milestone manual cases (MS-01–MS-20)

Companion to [`milestone-test-cases.md`](./milestone-test-cases.md).

**Short answer:** Do not auto-run the markdown checklist. Automate **API integration tests** (Go + in-memory SQLite, same pattern as project-mgmt) for replace/add/edit, authz, optional volume, completed, locks, and tracker/project embeds. Keep **Playwright** for tracker QuickModal / dots / empty-volume hover / employee chrome (`npm run test:e2e:milestones`). Manual checklist for residual smoke.

---

## 1. What can be automated today vs needs e2e

| Case  | Flow                                      | Automate **without** browser?  | How                                                                                                             |
| ----- | ----------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| MS-01 | Initial replace (Admin)                   | **Yes**                        | API `PUT …/milestones` → 200 + GET                                                                              |
| MS-02 | Edit after setup (reuse id)               | **Yes**                        | PUT with same `id`; assert no PK error                                                                          |
| MS-03 | Add after setup                           | **Yes + UI e2e**               | PUT full set with new row; **Playwright** QuickModal add (Head/Admin)                                           |
| MS-04 | Clear all                                 | **Yes**                        | PUT `[]` → empty embed                                                                                          |
| MS-05 | PM allowed                                | **Yes + UI e2e**               | API as `pm@…` → 200; **Playwright** seed PM `cuong.le@…` (pm@ empty tracker)                                    |
| MS-06 | CM allowed                                | **Yes**                        | API as `creative-manager@…` → 200                                                                               |
| MS-07 | Head allowed                              | **Yes + UI e2e**               | API as `head@…`; covered in MS-03 UI spec                                                                       |
| MS-08 | Admin allowed                             | **Yes + UI e2e**               | Covered by MS-01 API + MS-03 UI Admin                                                                           |
| MS-09 | Employee denied                           | **Yes + UI e2e**               | API 403; **Playwright** manage chrome hidden                                                                    |
| MS-10 | Creative Head denied                      | **Yes**                        | API 403                                                                                                         |
| MS-11 | Empty volume OK                           | **Yes + UI e2e**               | `unit:""` + null qty → 200; **Playwright** hover `Tên mốc - Ghi chú`                                            |
| MS-12 | Slides qty required                       | **Yes**                        | → 422                                                                                                           |
| MS-13 | DA qty required                           | **Yes**                        | → 422                                                                                                           |
| MS-14 | completed true + completedAt              | **Yes + UI e2e**               | Assert ISO `completedAt`; **Playwright** Hoàn thành checkbox                                                    |
| MS-15 | completed false clears                    | **Yes**                        | Assert cleared                                                                                                  |
| MS-16 | Archived lock                             | **Yes**                        | Archive then PUT → 422                                                                                          |
| MS-17 | Finish lock                               | **Yes**                        | status finish → 422                                                                                             |
| MS-18 | Cancel lock                               | **Yes**                        | status cancel → 422                                                                                             |
| MS-19 | Tracker embed + completed                 | **Yes + UI e2e**               | `GET /tracker` milestones; **Playwright** red→green                                                             |
| MS-20 | Project GET embed                         | **Yes**                        | `GET /projects/{id}`                                                                                            |
| MS-21 | Click bar in a later month                | **Unit now; Playwright later** | `resolveBarClickDate` in `calendar.test.ts`. UI: đổi tháng rồi bấm thanh — chưa có spec                         |
| MS-22 | Slides sum may exceed project totalSlides | **Yes (unit)**                 | FE `milestoneValidation.test.ts`; BE `TestValidateMilestoneInputs` allows the sum. No cap on `PUT …/milestones` |

**Rough split**

| Bucket               | Cases                                              | Share                  |
| -------------------- | -------------------------------------------------- | ---------------------- |
| API / Go integration | MS-01–08, MS-10–18, MS-19–20 (+ MS-09 API)         | **20** API tests       |
| Needs browser e2e    | MS-03/05/07/08 UI, MS-09 UI, MS-11 UI, MS-14/19 UI | **5** Playwright tests |
| Manual residual      | Visual polish after API + e2e green                | smoke path             |

---

## 2. Primary approach

### **API integration suite** (recommended — mirrors `make test-projectmgmt`)

Package: `ps-be/internal/integration/`

1. In-memory SQLite + real chi handlers/middleware/services
2. Seeds admin / head / pm / creative_manager / creative_head / employee + client + department
3. Routes: auth login, projects CRUD subset, `PUT …/milestones`, `GET /tracker`
4. Fails `go test` per `MS-xx` in test names (`-run Milestone`)

**Why this over Playwright first**

- Covers authz + hard-delete replace + optional volume + completed + locks without seed-dev
- Reuses harness style from project-mgmt / task-mgmt
- Sibling owns Playwright tracker chrome

---

## 3. Exact commands for green/red

### A. API suite (implemented)

Suite: `/agent/repos/ps-be/internal/integration/milestone_*.go`  
Branch: `cursor/milestone-api-tests-f862` (based on feature tip `cursor/tracker-milestone-be-1ba6` / PR #14)

```bash
cd /agent/repos/ps-be
make test-milestone
# equivalent:
go test ./internal/integration/ -run Milestone -v -count=1
```

Expected output shape:

```
=== RUN   TestMilestone_MS01_InitialReplaceAdmin
--- PASS: TestMilestone_MS01_InitialReplaceAdmin
...
PASS
ok  	github.com/goware/pokeslide-be/internal/integration
```

**Covered (API):** MS-01–MS-08, MS-09 (API 403), MS-10–MS-20 — **20** `Milestone` tests, verified green.

### B. Unit tests (service — already on feature branch)

```bash
cd /agent/repos/ps-be
go test ./internal/service/ -run 'Milestone|CanManageProject' -v -count=1
```

Covers validate optional volume, slides/da qty required, authz allow/deny matrix, `buildMilestoneModels` completed/optional qty.

### C. Playwright UI (implemented)

Repo: `/agent/repos/ps-webapp` — `e2e/milestones/`  
Branch: `cursor/milestone-e2e-e7ab` (from FE tip `cursor/tracker-milestone-fe-5be2` / PR #13)  
**Requires** BE with #14 behavior on `:8080` + `seed-dev` + Chromium.

| Case                     | Spec                                                              |
| ------------------------ | ----------------------------------------------------------------- |
| MS-03 / MS-07 / MS-08 UI | `e2e/milestones/ms-03-add-after-setup.spec.ts` (Admin + Head add) |
| MS-05 UI                 | same file — seed project PM `cuong.le@pokeslide.com`              |
| MS-09 UI                 | `e2e/milestones/ms-09-employee-manage-hidden.spec.ts`             |
| MS-11 UI                 | `e2e/milestones/ms-11-empty-volume-quick-view.spec.ts`            |
| MS-14 / MS-19 UI         | `e2e/milestones/ms-19-complete-marker-green.spec.ts`              |

```bash
# Backend: checkout ps-be PR #14 tip, migrate + seed-dev + make dev
cd /agent/repos/ps-webapp
npm run test:e2e:milestones
```

**Same harness as other UI smokes:** real API (mocks off), Vite webServer on `:5173`, workers=1.

**Seed note:** `pm@pokeslide.dev` has **empty** tracker visibility (`ProjectVisibilityPM`). UI PM slice uses `cuong.le@pokeslide.com` (PM on Sanofi Meninga). Project under test: **Sanofi Meninga** (`E2E_MILESTONE_PROJECT_NAME` override).

### D. Manual residual

Quick smoke path in [`milestone-test-cases.md`](./milestone-test-cases.md) (~10 min) after API green + Playwright.

---

## 4. Case → test function map

| ID    | Go test                                       | Playwright                              |
| ----- | --------------------------------------------- | --------------------------------------- |
| MS-01 | `TestMilestone_MS01_InitialReplaceAdmin`      | —                                       |
| MS-02 | `TestMilestone_MS02_EditReuseID`              | —                                       |
| MS-03 | `TestMilestone_MS03_AddAfterSetup`            | `ms-03-add-after-setup.spec.ts`         |
| MS-04 | `TestMilestone_MS04_ClearAll`                 | —                                       |
| MS-05 | `TestMilestone_MS05_PMAllowed`                | `ms-03-…` (seed PM `cuong.le@`)         |
| MS-06 | `TestMilestone_MS06_CMAllowed`                | —                                       |
| MS-07 | `TestMilestone_MS07_HeadAllowed`              | `ms-03-…` (Head)                        |
| MS-08 | `TestMilestone_MS08_AdminAllowed`             | `ms-03-…` (Admin)                       |
| MS-09 | `TestMilestone_MS09_EmployeeDenied`           | `ms-09-employee-manage-hidden.spec.ts`  |
| MS-10 | `TestMilestone_MS10_CreativeHeadDenied`       | —                                       |
| MS-11 | `TestMilestone_MS11_EmptyVolumeOK`            | `ms-11-empty-volume-quick-view.spec.ts` |
| MS-12 | `TestMilestone_MS12_SlidesQtyRequired`        | —                                       |
| MS-13 | `TestMilestone_MS13_DAQtyRequired`            | —                                       |
| MS-14 | `TestMilestone_MS14_CompletedSetsCompletedAt` | `ms-19-complete-marker-green.spec.ts`   |
| MS-15 | `TestMilestone_MS15_CompletedFalseClears`     | —                                       |
| MS-16 | `TestMilestone_MS16_ArchivedBlocks`           | —                                       |
| MS-17 | `TestMilestone_MS17_FinishBlocks`             | —                                       |
| MS-18 | `TestMilestone_MS18_CancelBlocks`             | —                                       |
| MS-19 | `TestMilestone_MS19_TrackerEmbedsCompleted`   | `ms-19-complete-marker-green.spec.ts`   |
| MS-20 | `TestMilestone_MS20_ProjectGetEmbeds`         | —                                       |

---

## 5. Notes / sharp edges

- Replace-all: FE must resend full truth including `completed`.
- Hard-delete on replace is required so reused UUIDs do not PK-collide (MS-02).
- Milestone **write** uses `RequireRole(pm, creative_manager, head, admin)` — not `EDIT_PROJECT` — so PM/CM succeed even when default RBAC denies project meta edit.
- Tracker off-days query needs `leave_requests` migrated in the harness (empty table OK).
- FE + e2e depend on BE #14 for empty volume, `completed`, and PM/CM writes against live API.
- Marker colors: incomplete `#dc2626` / completed `#16a34a` (`.milestoneDot` / `.milestoneDotCompleted`).
- Empty-volume hover uses `formatMilestoneNameNote` → `{name} - {note}` (name only if note empty).
