# Manual test cases — Task management (seed-dev)

> **Coverage index (SoT for what’s automated):** [`task-flow-test-coverage.md`](./task-flow-test-coverage.md).  
> Some checklist IDs drifted vs current `task_mgmt_test.go` / `e2e/tasks/` — trust the index + test names when they disagree.

Checklist for create / edit / status / delete / filters / permissions / switch-user flows on a local `seed-dev` environment.

**Pass/fail:** tick `[ ]` → `[x]`. Prefer UI; use Swagger when noted.  
**IDs:** `TASK-xx` (task management). Companion automation: [`task-mgmt-automation.md`](./task-mgmt-automation.md).

---

## Setup (once)

```bash
# Backend
cd /agent/repos/ps-be
docker compose up -d db
# If no docker: apt install postgresql-16; create DB pokeslide_db; see automation doc
cp -n .env.example .env   # JWT_SECRET ≥ 32 chars
make migrate
make seed-dev
make dev                  # http://localhost:8080

# Frontend (real API — not mocks)
cd /agent/repos/ps-webapp
cp -n .env.example .env.local
# Ensure:
#   VITE_API_URL=http://localhost:8080/api/v1
#   VITE_USE_TASKS_MOCK=false
#   VITE_USE_AUTH_MOCK=false
npm install
npm run dev               # http://localhost:5173
```

Optional API UI: `http://localhost:8080/swagger/index.html`

### Seed accounts (password `ps123` for all)

| Email                            | Role             | Notes                                                                                       |
| -------------------------------- | ---------------- | ------------------------------------------------------------------------------------------- |
| `admin@pokeslide.dev`            | admin            | Create / edit / delete / evaluate; `VIEW_ALL_TASKS`                                         |
| `pm@pokeslide.dev`               | pm               | Create / evaluate / assign; `VIEW_ALL_TASKS`; meta edit only if **creator** (or Admin/Head) |
| `head@pokeslide.dev`             | head             | **No** `CREATE_TASK` by default; can edit any meta; can delete; `VIEW_ALL_TASKS`            |
| `creative-head@pokeslide.dev`    | creative_head    | No create by default; evaluate / creative pipeline; `VIEW_ALL_TASKS`                        |
| `creative-manager@pokeslide.dev` | creative_manager | Scoped list (no `VIEW_ALL_TASKS`); **cannot delete**; evaluate                              |
| `employee@pokeslide.dev`         | employee         | Assignee on seed project tasks; status updates; **no** create/meta-edit/delete/cancel       |

Routes: `/tasks/project` · `/tasks/non-project` · `/tasks/detail/:id`  
API base: `/api/v1/tasks/my`  
v1: **soft delete** (`DELETE` → GORM `DeletedAt`); **no task archive** (projects archive; tasks do not).

### Seeded demo tasks (after `seed-dev`)

| Task code (prefix)                | Project              | Category    | Confirmation  | Staff             |
| --------------------------------- | -------------------- | ----------- | ------------- | ----------------- |
| `PO.031.04.0306 - POKE001…`       | Sanofi Meninga       | project     | `not_updated` | employee@         |
| `PO.012.03.0306 - POKE016…`       | Altevia Renault…     | project     | `confirmed`   | creative-manager@ |
| `PO.031.11.1803 - POKE011…`       | Sanofi Annual Review | project     | `finished`    | employee@         |
| `PO.012.13.2002 - POKE013…`       | Legacy Portal Deck   | project     | `decline`     | creative-manager@ |
| `INT.01.0106 - INTERNAL_TRAINING` | Internal Training    | non_project | `not_updated` | employee@         |
| `INT.04.1006 - IT_ONBOARDING`     | IT Onboarding        | non_project | `finished`    | employee@         |

---

## A. Create

### TASK-01 — Create project task (Admin)

|                   |                                                                                                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preconditions** | Logged in as `admin@pokeslide.dev`                                                                                                                                     |
| **Steps**         | 1. Open `/tasks/project` → **Tạo task**<br>2. Pick seeded project (e.g. Sanofi Meninga); dept `project`; assign `employee@`; criteria 2/2/2; unique task name → Submit |
| **Expected**      | Success; row on project list; auto `taskCode`; status default `not_updated`; **level 2**; `createdById` = admin                                                        |
| **Note**          | Explicit department contrast pair: **TASK-61** / **TASK-63**                                                                                                           |

### TASK-02 — Create project task (PM)

|                   |                                             |
| ----------------- | ------------------------------------------- |
| **Preconditions** | Logout → login `pm@pokeslide.dev` / `ps123` |
| **Steps**         | Same as TASK-01 with unique name            |
| **Expected**      | Create succeeds (PM has `CREATE_TASK`)      |

### TASK-03 — Create non-project task (staff optional)

|                   |                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------- |
| **Preconditions** | Admin or PM                                                                        |
| **Steps**         | `/tasks/non-project` → **Create task** → name + PM ref; leave staff empty → Submit |
| **Expected**      | Created under non-project; staff may be empty                                      |

### TASK-04 — task level derived from classification

|                   |                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------- |
| **Preconditions** | Admin/PM create                                                                       |
| **Steps**         | Set designThinking=1, technical=2, contentProcessing=3 (client may also send `level`) |
| **Expected**      | Stored **level** = `round((1+2+3)/3)` = **2** (server-derived; ignore client `level`) |

### TASK-05 — Project task (non-creative) requires staff

|                   |                                                                                |
| ----------------- | ------------------------------------------------------------------------------ |
| **Preconditions** | Admin; Swagger or UI                                                           |
| **Steps**         | `POST /tasks/my` with `taskCategory=project`, `department=project`, `staff=[]` |
| **Expected**      | **422** `VALIDATION_ERROR` (staff required)                                    |

### TASK-06 — Creative handoff with empty staff → awaiting_ch

|                   |                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| **Preconditions** | Admin/PM                                                                                              |
| **Steps**         | `POST /tasks/my` with `taskCategory=project`, **`department=creative`**, `staff=[]`                   |
| **Expected**      | **201**; `department` = `creative`; `staff` empty; `pipelineStage` = `awaiting_ch` (CH queue handoff) |

### TASK-80 — Create task: Add unknown project → Create project modal

|                   |                                                                                                                                                                                                                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preconditions** | Admin (`CREATE_TASK` + `CREATE_PROJECT`); seed client e.g. SANOFI                                                                                                                                                                                                                                  |
| **Steps**         | 1. `/tasks/project` → **Tạo task** → Project Task<br>2. Gõ tên **không substring-match** project nào (vd. `phan…` / unique) — dropdown có thể empty list<br>3. Vẫn thấy **Add "…"** → modal **Create project** (tên prefill)<br>4. Client + Dept. head + PM → Create<br>5. Drawer: tên + PM đã gắn |
| **Expected**      | **Add** hiện cả khi không còn option khớp filter; project mới + form điền name/PM; tạo task có `projectId` → link xanh                                                                                                                                                                             |
| **Automation**    | E2E `task-80-81-create-task-add-project.spec.ts`                                                                                                                                                                                                                                                   |

### TASK-81 — Create task: PM cannot Add project inline

|                   |                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| **Preconditions** | PM (`CREATE_TASK`, **không** `CREATE_PROJECT`)                                                 |
| **Steps**         | Gõ tên project chưa có trên Create Task drawer                                                 |
| **Expected**      | **Không** hiện **Add "…"**; giá trị free-text vẫn giữ (label ad-hoc, không tạo `projects` row) |
| **Automation**    | E2E cùng file task-80-81                                                                       |

### TASK-82 — Create task: Deadline limited to project date range

|                   |                                                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Preconditions** | Project catalog có `startDate` / `endDate` (vd. goware project)                                                                           |
| **Steps**         | Create Task → chọn đúng tên project catalog → mở Deadline picker                                                                          |
| **Expected**      | Chỉ chọn được ngày trong khoảng project; ngoài khoảng disabled; hint khoảng ngày dưới field; deadline đang ngoài range bị clamp vào trong |
| **Automation**    | Unit `taskDates.test.ts`; E2E chưa bắt buộc                                                                                               |

---

## B. Edit

### TASK-07 — Admin edits name / description / criteria

|                   |                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| **Preconditions** | Admin; active task from TASK-01 (not finished/cancelled)                                         |
| **Steps**         | Detail **Edit** or `PATCH /tasks/my/{id}` → change taskName + description; criteria 3/3/3 → Save |
| **Expected**      | Saved; level recalculated to **3**                                                               |

### TASK-08 — Head can edit any active task meta

|                   |                                                      |
| ----------------- | ---------------------------------------------------- |
| **Preconditions** | `head@pokeslide.dev`; any active non-locked task     |
| **Steps**         | `PATCH` taskName → Save                              |
| **Expected**      | Save succeeds (Head bypasses creator-only meta lock) |

### TASK-09 — Creator can edit own task

|                   |                                             |
| ----------------- | ------------------------------------------- |
| **Preconditions** | Create as PM (TASK-02); stay as that PM     |
| **Steps**         | Edit taskName → Save                        |
| **Expected**      | Save succeeds when `userId === createdById` |

### TASK-10 — PM (non-creator) cannot edit meta

|                   |                                                           |
| ----------------- | --------------------------------------------------------- |
| **Preconditions** | Create as Admin; login `pm@pokeslide.dev`                 |
| **Steps**         | Confirm Edit hidden/disabled; Swagger `PATCH` with PM JWT |
| **Expected**      | UI: Edit not usable. API: **403** `FORBIDDEN`             |

### TASK-11 — Employee cannot meta-edit

|                   |                                               |
| ----------------- | --------------------------------------------- |
| **Preconditions** | `employee@pokeslide.dev`; a task they can see |
| **Steps**         | `PATCH /tasks/my/{id}` meta fields            |
| **Expected**      | **403** `FORBIDDEN`                           |

### TASK-12 — Cannot edit finished task

|                   |                                                                |
| ----------------- | -------------------------------------------------------------- |
| **Preconditions** | Admin; seed `POKE011…` finished task **or** finish a test task |
| **Steps**         | Try Edit / `PATCH`                                             |
| **Expected**      | Meta locked; API **422** (finished/cancelled) or **403**       |

### TASK-13 — Cannot edit cancelled task

|                   |                                        |
| ----------------- | -------------------------------------- |
| **Preconditions** | Admin; set a task to `cancelled` first |
| **Steps**         | Try meta `PATCH`                       |
| **Expected**      | Meta locked; API **422**/forbidden     |

---

## C. Status

### TASK-14 — Assignee updates staffConfirmation

|                   |                                                                          |
| ----------------- | ------------------------------------------------------------------------ |
| **Preconditions** | Employee assigned on an active task (`not_updated`)                      |
| **Steps**         | Detail → set confirmation `confirmed` (+ note) → Save / `PATCH …/status` |
| **Expected**      | Status saved; employee path works without meta-edit                      |

### TASK-15 — Employee cannot set cancelled

|                   |                                                     |
| ----------------- | --------------------------------------------------- |
| **Preconditions** | Employee JWT; owned task                            |
| **Steps**         | `PATCH …/status` with `staffConfirmation=cancelled` |
| **Expected**      | **403** `TASK_CANCEL_FORBIDDEN`                     |

### TASK-16 — Admin (or manager) can cancel

|                   |                        |
| ----------------- | ---------------------- |
| **Preconditions** | Admin; active task     |
| **Steps**         | Set status `cancelled` |
| **Expected**      | Success                |

### TASK-17 — Only Admin can leave cancelled

|                   |                                                   |
| ----------------- | ------------------------------------------------- |
| **Preconditions** | Task already `cancelled`; login as PM (not admin) |
| **Steps**         | `PATCH …/status` to `not_updated`                 |
| **Expected**      | **403** `TASK_STATUS_LOCKED`; Admin can unlock    |

---

## D. Delete

### TASK-18 — Soft delete (Admin / Head / PM in scope)

|                   |                                             |
| ----------------- | ------------------------------------------- |
| **Preconditions** | Admin; disposable task created this session |
| **Steps**         | Delete → confirm                            |
| **Expected**      | Success; gone from lists                    |

### TASK-19 — Deleted task not returned by GET

|                   |                               |
| ----------------- | ----------------------------- |
| **Preconditions** | TASK-18 done; know deleted id |
| **Steps**         | `GET /tasks/my/{id}`          |
| **Expected**      | **404** `NOT_FOUND`           |

### TASK-20 — Employee cannot delete

|                   |                                                   |
| ----------------- | ------------------------------------------------- |
| **Preconditions** | Employee; known task id in scope                  |
| **Steps**         | Confirm Delete hidden; `DELETE` with employee JWT |
| **Expected**      | UI hidden; API **403** `TASK_DELETE_FORBIDDEN`    |

### TASK-21 — Creative Manager cannot delete

|                   |                                                    |
| ----------------- | -------------------------------------------------- |
| **Preconditions** | `creative-manager@pokeslide.dev`; task in CM scope |
| **Steps**         | `DELETE /tasks/my/{id}`                            |
| **Expected**      | **403** `TASK_DELETE_FORBIDDEN`                    |

---

## E. Filters

### TASK-22 — Filter by taskCategory

|                   |                                                                     |
| ----------------- | ------------------------------------------------------------------- |
| **Preconditions** | Admin on `/tasks/project` vs `/tasks/non-project`                   |
| **Steps**         | UI tabs **or** `GET /tasks/my?taskCategory=project` / `non_project` |
| **Expected**      | Only matching category                                              |

### TASK-23 — Search filter

|                   |                                         |
| ----------------- | --------------------------------------- |
| **Preconditions** | TASK-01 done (unique name)              |
| **Steps**         | Search unique name on list / `?search=` |
| **Expected**      | Matching task(s) only                   |

### TASK-24 — Filter by projectName

|                   |                                                    |
| ----------------- | -------------------------------------------------- |
| **Preconditions** | Admin                                              |
| **Steps**         | Project filter = seeded name (e.g. Sanofi Meninga) |
| **Expected**      | Only that project’s tasks                          |

### TASK-25 — Filter by staffName

|                   |                                                         |
| ----------------- | ------------------------------------------------------- |
| **Preconditions** | Admin; know assignee display name                       |
| **Steps**         | Staff filter = employee name (or sentinel `Unassigned`) |
| **Expected**      | Matching assignee rows                                  |

### TASK-26 — Filter by confirmation

|                   |                                          |
| ----------------- | ---------------------------------------- |
| **Preconditions** | Admin; seed has `finished` / `confirmed` |
| **Steps**         | Confirmation = `finished`                |
| **Expected**      | Only finished rows                       |

---

## F. Permissions by role

### TASK-27 — Head cannot create (default matrix)

|                   |                                                              |
| ----------------- | ------------------------------------------------------------ |
| **Preconditions** | `head@pokeslide.dev`                                         |
| **Steps**         | `/tasks/project` — no **Tạo task**; Swagger `POST /tasks/my` |
| **Expected**      | No create UI; API **403** (`CREATE_TASK` = pm, admin only)   |

### TASK-28 — Employee cannot create

|                   |                           |
| ----------------- | ------------------------- |
| **Preconditions** | `employee@pokeslide.dev`  |
| **Steps**         | Same as TASK-27           |
| **Expected**      | No create UI; API **403** |

### TASK-29 — Employee list is visibility-scoped

|                   |                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| **Preconditions** | Employee with limited involvement                                                                            |
| **Steps**         | `GET /tasks/my` as employee                                                                                  |
| **Expected**      | Only tasks where employee is assignee / creator / assignedBy / CM / `task_assignees` — **not** full registry |

### TASK-30 — Admin / PM see all (VIEW_ALL_TASKS)

|                   |                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| **Preconditions** | Admin then PM                                                                                            |
| **Steps**         | `GET /tasks/my?taskCategory=project` — count ≥ seeded demos (+ session creates)                          |
| **Expected**      | Full visibility for oversight roles (split children may be hidden from list — parents + revisions shown) |

### TASK-31 — Creative Manager list is scoped

|                   |                                                        |
| ----------------- | ------------------------------------------------------ |
| **Preconditions** | `creative-manager@pokeslide.dev` (no `VIEW_ALL_TASKS`) |
| **Steps**         | `GET /tasks/my`                                        |
| **Expected**      | Only CM-owned / involved tasks — not company-wide      |

---

## G. Switch users

### TASK-32 — Admin → Employee

|                   |                                                       |
| ----------------- | ----------------------------------------------------- |
| **Preconditions** | Session as Admin                                      |
| **Steps**         | Logout → login `employee@` → `/tasks/project`         |
| **Expected**      | Tasks nav present; **Tạo task** absent; Delete absent |

### TASK-33 — Employee → PM

|                   |                                          |
| ----------------- | ---------------------------------------- |
| **Preconditions** | Session as Employee                      |
| **Steps**         | Logout → login `pm@` → `/tasks/project`  |
| **Expected**      | **Tạo task** visible; create API allowed |

### TASK-34 — Sidebar Task management by role

|                   |                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| **Preconditions** | Switch Admin, PM, Employee                                                                             |
| **Steps**         | After each login, check sidebar **Project Tasks** and **Non-project tasks**                            |
| **Expected**      | Present for seed roles that use task management (default all authenticated roles with those nav items) |

---

## H. Evaluate / Assign

### TASK-35 — PM evaluation (EVALUATE_TASK)

|                   |                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Preconditions** | PM or Admin; active **project** task (parent layer)                                                                                  |
| **Steps**         | UI: list **Evaluate** → modal **Evaluate task** (completed qty → %, score, note) → Save<br>API: `PATCH /tasks/my/{id}/pm-evaluation` |
| **Expected**      | UI toast `Task evaluation saved`; API **200**; fields saved                                                                          |
| **Automation**    | API + Playwright UI slice (`task-35-evaluate-task-modal.spec.ts`)                                                                    |

### TASK-36 — Employee cannot evaluate

|                   |                                                                         |
| ----------------- | ----------------------------------------------------------------------- |
| **Preconditions** | Employee JWT / UI session                                               |
| **Steps**         | UI: `/tasks/project` — no Evaluate star<br>API: `PATCH …/pm-evaluation` |
| **Expected**      | UI: Evaluate hidden; API **403** (`EVALUATE_TASK`)                      |
| **Automation**    | API + Playwright UI slice (`task-36-evaluate-hidden-by-role.spec.ts`)   |

### TASK-37 — Assign staff

|                   |                                                                   |
| ----------------- | ----------------------------------------------------------------- |
| **Preconditions** | Admin/PM; task with empty or replaceable staff                    |
| **Steps**         | `PATCH /tasks/my/{id}/assign` with one staff `{userId,code,name}` |
| **Expected**      | Staff updated; max one assignee                                   |

### TASK-38 — Assignee on leave rejected

|                   |                                                               |
| ----------------- | ------------------------------------------------------------- |
| **Preconditions** | Target user `on_leave` **or** active leave covering task date |
| **Steps**         | Create or assign with that userId                             |
| **Expected**      | **422** `ASSIGNEE_ON_LEAVE`                                   |

---

## I. Negative / validation

### TASK-39 — Empty taskName rejected

|                   |                            |
| ----------------- | -------------------------- |
| **Preconditions** | Admin; create              |
| **Steps**         | POST with empty `taskName` |
| **Expected**      | **422**; not created       |

### TASK-40 — Criteria out of range

|                   |                            |
| ----------------- | -------------------------- |
| **Preconditions** | Admin                      |
| **Steps**         | designThinking=5 (or 0)    |
| **Expected**      | **422** `VALIDATION_ERROR` |

### TASK-41 — Missing projectManager

|                   |                            |
| ----------------- | -------------------------- |
| **Preconditions** | Admin                      |
| **Steps**         | POST omitting PM code/name |
| **Expected**      | **422**; not created       |

### TASK-42 — Two staff members rejected

|                   |                                  |
| ----------------- | -------------------------------- |
| **Preconditions** | Admin                            |
| **Steps**         | POST/PATCH with `staff` length 2 |
| **Expected**      | **422** (only one staff member)  |

---

## J. Urgency

### TASK-43 — Update urgency on active task

|                   |                                                                     |
| ----------------- | ------------------------------------------------------------------- |
| **Preconditions** | Admin/creator; active task                                          |
| **Steps**         | Meta PATCH urgency to locked color (e.g. `red`) or `auto`           |
| **Expected**      | Saved on active task; finished/cancelled reject meta urgency change |

---

## K. UI-only (prefer Playwright / manual)

### TASK-44 — Create button visible only for PM / Admin

|                   |                                                                            |
| ----------------- | -------------------------------------------------------------------------- |
| **Preconditions** | Switch Admin → PM → Head → Employee                                        |
| **Steps**         | On `/tasks/project`, observe **Tạo task**                                  |
| **Expected**      | Visible for Admin/PM; **hidden** for Head/Employee (default `CREATE_TASK`) |

### TASK-45 — Project ↔ Non-project navigation

|                   |                                                    |
| ----------------- | -------------------------------------------------- |
| **Preconditions** | Admin                                              |
| **Steps**         | From `/tasks/project` open Non-project → return    |
| **Expected**      | Both pages load lists with correct category chrome |

### TASK-46 — Filter controls + Reset

|                   |                                     |
| ----------------- | ----------------------------------- |
| **Preconditions** | Admin on `/tasks/project`           |
| **Steps**         | Set search + confirmation → Reset   |
| **Expected**      | Filters clear; default list returns |

---

## L. Creative assign / split / quantity pipeline

API focus: `PATCH /tasks/my/{id}/assign-cm`, `…/assign-staff`, `…/creative-edit`.  
Stages: `awaiting_ch` → `awaiting_cm` → `assigned_staff` | `split`.

### TASK-47 — CH assigns CM (awaiting_ch → awaiting_cm)

|                   |                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preconditions** | Admin creates creative task with empty staff (TASK-06); login `creative-head@`                                                                |
| **Steps**         | UI: detail **Giao cho CM** / **Bổ sung brief** → drawer → submit<br>API: `PATCH /tasks/my/{id}/assign-cm` with `cmUserId` = creative-manager@ |
| **Expected**      | UI drawer chrome visible; API **200**; `pipelineStage` = `awaiting_cm`; staff shows CM; `creativeManager` set                                 |
| **Automation**    | API + Playwright UI slice (`task-47-ch-assign-cm-drawer.spec.ts`)                                                                             |

### TASK-48 — Non-CH cannot assign-cm

|                   |                                                                      |
| ----------------- | -------------------------------------------------------------------- |
| **Preconditions** | Creative task in `awaiting_ch`                                       |
| **Steps**         | `PATCH …/assign-cm` as `employee@`, `creative-manager@`, and `pm@`   |
| **Expected**      | **403** `FORBIDDEN`. CH và Admin vẫn **200** trên task `awaiting_ch` |

### TASK-49 — assign-cm rejects bad target / wrong stage

|                   |                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------- |
| **Preconditions** | CH JWT; awaiting_ch task; also a project (non-creative) or already-assigned creative task |
| **Steps**         | (a) `cmUserId` = employee@ · (b) assign-cm on non-awaiting_ch task                        |
| **Expected**      | **422** `VALIDATION_ERROR` both cases                                                     |

### TASK-50 — CM giao nguyên khối (whole → assigned_staff)

|                   |                                                                                  |
| ----------------- | -------------------------------------------------------------------------------- |
| **Preconditions** | TASK-47 done (awaiting_cm owned by CM); login `creative-manager@`                |
| **Steps**         | `PATCH …/assign-staff` `{ mode: "whole", staffUserId: employee@, quantity: 24 }` |
| **Expected**      | **200**; `pipelineStage` = `assigned_staff`; staff = employee; `quantity` = 24   |

### TASK-51 — PM/Admin chia nhỏ (split → parent + children)

|                   |                                                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Preconditions** | awaiting_cm; parent quantity > 0; login PM hoặc Admin                                                                                     |
| **Steps**         | `PATCH …/assign-staff` `{ mode: "split", subtasks: [2+] }` với brief; Staff và số lượng có thể trống / 0                                  |
| **Expected**      | Parent `pipelineStage` = `split`; `quantity` **giữ nguyên** (không bằng tổng các phần); children `taskKind=split`. CM gọi split → **403** |

### TASK-52 — assign-staff authz / ownership

|                   |                                                                            |
| ----------------- | -------------------------------------------------------------------------- |
| **Preconditions** | awaiting_cm assigned to CM-A; login employee and (if available) another CM |
| **Steps**         | Employee `PATCH …/assign-staff`; wrong CM tries whole/split                |
| **Expected**      | **403** for employee and non-owner CM                                      |

### TASK-53 — Quantity of an unassigned creative task

|                   |                                                                  |
| ----------------- | ---------------------------------------------------------------- |
| **Preconditions** | awaiting_cm; CM and Admin                                        |
| **Steps**         | `PATCH …/creative-edit` `{ quantity: 30 }`                       |
| **Expected**      | CM **422**. Admin **200**; quantity updated; still `awaiting_cm` |

### TASK-54 — Child quantities stay within parent total

|                   |                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------ |
| **Preconditions** | Split parent quantity 30; children sum ≤ 30                                                |
| **Steps**         | (a) CM đổi SL tổng · (b) childQuantities tổng > SL cha · (c) childQuantities tổng ≤ SL cha |
| **Expected**      | (a)(b) **422**, SL cha không đổi; (c) **200** — children đổi, SL cha không bị ghi đè       |

### TASK-55 — Reassign CM while awaiting_cm

|                   |                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Preconditions** | awaiting_cm on CM-A; second creative_manager user; login CH or Admin                                                 |
| **Steps**         | `PATCH …/creative-edit` `{ cmUserId: CM-B }`                                                                         |
| **Expected**      | **200**; creativeManager / parked staff = CM-B; still `awaiting_cm`. CM alone cannot reassign CM (**422**/forbidden) |

### TASK-56 — Split parent/child list visibility

|                   |                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Preconditions** | Split family from TASK-51                                                                                                             |
| **Steps**         | `GET /tasks/my` as Admin (VIEW_ALL) and as owning CM                                                                                  |
| **Expected**      | Admin list shows **parent**, hides split **children**; CM list includes children (scoped ownership). Admin may still `GET /{childId}` |

### TASK-57 — Happy path stages awaiting_ch → awaiting_cm → assigned_staff

|                   |                                                                           |
| ----------------- | ------------------------------------------------------------------------- |
| **Preconditions** | Admin + CH + CM + employee                                                |
| **Steps**         | Create creative empty staff → assign-cm → assign-staff whole              |
| **Expected**      | Stages progress exactly: `awaiting_ch` → `awaiting_cm` → `assigned_staff` |

### TASK-58 — assign-staff validation (whole vs split)

|                   |                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------- |
| **Preconditions** | awaiting_cm; CM JWT                                                                           |
| **Steps**         | (a) whole without quantity · (b) split with &lt;2 subtasks · (c) mode neither whole nor split |
| **Expected**      | **422** each                                                                                  |

### TASK-59 — Reassign Staff on assigned_staff

|                   |                                                             |
| ----------------- | ----------------------------------------------------------- |
| **Preconditions** | Whole-assigned creative task; second employee; CM or Admin  |
| **Steps**         | `PATCH …/creative-edit` `{ staffUserId: employee2 }`        |
| **Expected**      | **200**; staff updated to employee2; still `assigned_staff` |

### TASK-60 — Confirmed child quantity cannot change

|                   |                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Preconditions** | Split children; set one child `staffConfirmation=confirmed`                                                      |
| **Steps**         | creative-edit with childQuantities that change the confirmed child’s qty (sum still equals parent)               |
| **Expected**      | **422** (cannot change SL of confirmed/finished/cancelled child). Repeating same qty for confirmed sibling is OK |

---

## M. Create department = project vs creative

Paired create cases for the department / assign-direction choice (UI: Project staff vs Creative department).  
Server rule (`resolvePipelineOnCreate`): non-creative + staff → `assigned_staff`; creative + empty staff → `awaiting_ch`; creative + staff → `assigned_staff` (skips CH queue).

### TASK-61 — Create department=project + staff → assigned_staff

|                   |                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| **Preconditions** | Admin (or PM); seeded project + employee                                                              |
| **Steps**         | `POST /tasks/my` with `taskCategory=project`, **`department=project`**, staff = employee@             |
| **Expected**      | **201**; `department` = `project`; staff present; `pipelineStage` = `assigned_staff` (not CH handoff) |

### TASK-62 — Create department=creative + staff → assigned_staff

|                   |                                                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Preconditions** | Admin; product allows creative create with staff (API yes; drawer usually uses empty-staff handoff)               |
| **Steps**         | `POST /tasks/my` with `department=creative`, staff = employee@                                                    |
| **Expected**      | **201**; `department` = `creative`; staff = employee; `pipelineStage` = `assigned_staff` (bypasses `awaiting_ch`) |

### TASK-63 — Side-by-side: same payload except department

|                   |                                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Preconditions** | Admin; identical create body except `department`                                                                                                                         |
| **Steps**         | (a) `department=project` + staff · (b) `department=creative` + empty staff · (optional c) `department=creative` + same staff as (a)                                      |
| **Expected**      | (a) `assigned_staff` + dept project · (b) `awaiting_ch` + empty staff · (c) `assigned_staff` + dept creative — only `department` (and staff for handoff) drives the fork |

---

## N. Creative decline rollback + layered evaluation

Product truth: **CH does not reject `awaiting_ch`** (no refuse-inbox API). Real refuse = `PATCH …/status` `{staffConfirmation:decline}` by CM (`awaiting_cm` → `awaiting_ch`) or staff (`assigned_staff` → `awaiting_cm`).  
Layered `PATCH …/pm-evaluation`: PM/CH/Head = **parent** only; CM = staff execution (whole `assigned_staff` / split **child**); not project-level Head eval (PM-48+).

### TASK-64 — CM decline awaiting_cm → awaiting_ch

|                   |                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Preconditions** | Creative task at `awaiting_cm` owned by CM (TASK-47)                                                                        |
| **Steps**         | UI: detail **Từ chối nhận** → confirm dialog<br>API: As `creative-manager@`, `PATCH …/status` `{staffConfirmation:decline}` |
| **Expected**      | UI confirm chrome; API **200**; `pipelineStage` = `awaiting_ch`; confirmation reset `not_updated`; CM cleared; staff empty  |
| **Automation**    | API + Playwright chrome (`task-64-cm-refuse-chrome.spec.ts`)                                                                |

### TASK-65 — Staff decline assigned_staff → awaiting_cm

|                   |                                                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Preconditions** | Creative whole-assigned to employee (TASK-50)                                                                                       |
| **Steps**         | UI: detail **Từ chối** → confirm dialog<br>API: As assignee `employee@`, `PATCH …/status` `{staffConfirmation:decline}`             |
| **Expected**      | UI confirm chrome; API **200**; `pipelineStage` = `awaiting_cm`; staff = CM; confirmation `not_updated`; `creativeManager` retained |
| **Automation**    | API + Playwright chrome (`task-65-staff-decline-chrome.spec.ts`)                                                                    |

### TASK-66 — Decline at awaiting_ch rejected

|                   |                                            |
| ----------------- | ------------------------------------------ |
| **Preconditions** | Creative task at `awaiting_ch`             |
| **Steps**         | `PATCH …/status` decline as CH (and Admin) |
| **Expected**      | **422** — no CH reject-of-inbox path       |

### TASK-67 — PM evaluates creative-handoff parent

|                   |                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------- |
| **Preconditions** | Creative parent after assign-cm (`awaiting_cm`); login `pm@`                       |
| **Steps**         | `PATCH …/pm-evaluation` completion + evaluation + note                             |
| **Expected**      | **200**; fields saved; stage unchanged. Extends TASK-35 beyond project-dept parent |

### TASK-68 — CH evaluates creative parent (CM handoff)

|                   |                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| **Preconditions** | Creative parent at `awaiting_cm`; login `creative-head@`                                            |
| **Steps**         | UI: **Evaluate** → Evaluate task modal<br>API: `PATCH …/pm-evaluation`                              |
| **Expected**      | Modal opens (shared chrome); API **200**; evaluation saved on parent (CH → CM layer)                |
| **Automation**    | API + Playwright UI slice (`task-68-ch-evaluate-modal.spec.ts` — project parent chrome; same modal) |

### TASK-69 — CH evaluates project-dept parent

|                   |                                                                               |
| ----------------- | ----------------------------------------------------------------------------- |
| **Preconditions** | Project-dept task with staff; login `creative-head@`                          |
| **Steps**         | UI: **Evaluate** on project parent · API: `PATCH …/pm-evaluation`             |
| **Expected**      | **200**; evaluation saved (same endpoint; not PM-48 project Head eval)        |
| **Automation**    | API + same Playwright CH Evaluate modal (`task-68-ch-evaluate-modal.spec.ts`) |

### TASK-70 — CH cannot evaluate split child

|                   |                                                  |
| ----------------- | ------------------------------------------------ |
| **Preconditions** | Split family (TASK-51); login CH                 |
| **Steps**         | `PATCH …/pm-evaluation` on a split child         |
| **Expected**      | **422** (evaluate on parent, not CM-staff child) |

### TASK-71 — CM evaluates whole assigned_staff

|                   |                                                                             |
| ----------------- | --------------------------------------------------------------------------- |
| **Preconditions** | Creative whole → `assigned_staff`; login owning CM                          |
| **Steps**         | UI: list **Evaluate** → Evaluate task modal<br>API: `PATCH …/pm-evaluation` |
| **Expected**      | Modal opens; API **200**; CM scores staff execution on whole parent         |
| **Automation**    | API + Playwright UI slice (`task-71-cm-evaluate-modal.spec.ts`)             |

### TASK-72 — CM evaluates split child; denies split parent

|                   |                                                                    |
| ----------------- | ------------------------------------------------------------------ |
| **Preconditions** | Split parent + children; login owning CM                           |
| **Steps**         | (a) `pm-evaluation` on child · (b) on split parent                 |
| **Expected**      | (a) **200** · (b) **422** (score each child, not the split parent) |

---

## O. Post-assign meta edit

Assign does **not** freeze task meta. Locks are **role + status** (`finished`/`cancelled`) and creative **stage** — not “once staff is set.”  
Project path: `PATCH /tasks/my/{id}`. Creative path: `PATCH …/creative-edit` (no `taskName`; UI drawer read-only for name).

### TASK-73 — Assign then edit full field matrix (project PATCH)

|                   |                                                                                                                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preconditions** | Admin; project-dept task created with staff                                                                                                                                                                             |
| **Steps**         | 1. `PATCH …/assign` → employee2<br>2. `PATCH /tasks/my/{id}` → taskName, description, date, quantity, urgency, staff (back to employee), criteria<br>3. UI: detail **Edit task** → Edit modal → change Task Name → Save |
| **Expected**      | **200** after assign; **200** after PATCH; all fields saved (name/desc/date/qty/urgency/staff/level). UI: Edit modal opens post-assign; save toast                                                                      |
| **Automation**    | API (`TestTaskMgmt_TASK73_AssignThenEditFullMatrix`) + Playwright UI slice (`task-73-edit-modal-after-assign.spec.ts`)                                                                                                  |

### TASK-74 — Edit meta while staffConfirmation=confirmed

|                   |                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------- |
| **Preconditions** | Admin; active task; set status `confirmed` (not finished)                               |
| **Steps**         | `PATCH /tasks/my/{id}` change name/desc/qty/urgency; keep `staffConfirmation=confirmed` |
| **Expected**      | **200**; meta updated; confirmation stays `confirmed` (confirmed ≠ finished lock)       |
| **Automation**    | API                                                                                     |

### TASK-75 — Creative whole assigned_staff meta via creative-edit

|                   |                                                                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preconditions** | Creative whole → `assigned_staff` (create → assign-cm → assign-staff whole); Admin JWT                                                                                          |
| **Steps**         | API: `PATCH …/creative-edit` description + quantity + deadline + urgency + level criteria<br>UI: detail **Sửa / Đổi giao** → CreativeEditDrawer → edit Brief → **Lưu thay đổi** |
| **Expected**      | **200**; desc/qty/urgency/level/date saved; stage remains `assigned_staff`. UI: drawer opens; no Task Name field (rename = TASK-76 / generic PATCH); save toast                 |
| **Automation**    | API + Playwright UI slice (`task-75-creative-edit-after-assign.spec.ts`)                                                                                                        |

### TASK-76 — Creative taskName: creative-edit ignores; generic PATCH allows

|                   |                                                                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preconditions** | Creative whole `assigned_staff`; Admin                                                                                                                                  |
| **Steps**         | (a) `creative-edit` with `taskName` in body · (b) `PATCH /tasks/my/{id}` with new taskName                                                                              |
| **Expected**      | (a) **200** but **taskName unchanged** (field not in creative-edit schema; UI read-only) · (b) **200** name updated (Admin/Head/creator still allowed on generic PATCH) |
| **Automation**    | API                                                                                                                                                                     |

### TASK-77 — Creative-edit locked when finished/cancelled

|                   |                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------- |
| **Preconditions** | Two creative whole-assigned tasks; Admin finishes one, cancels the other                 |
| **Steps**         | `PATCH …/creative-edit` description on each                                              |
| **Expected**      | **422** (or **403**) both — finished/cancelled lock creative-edit (same as generic meta) |
| **Automation**    | API                                                                                      |

### TASK-78 — Post-assign role denial (non Admin/Head/creator)

|                   |                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------- |
| **Preconditions** | Admin creates + assigns project task; separate creative whole-assigned task                  |
| **Steps**         | (a) Employee `PATCH /{id}` · (b) non-creator PM `PATCH /{id}` · (c) Employee `creative-edit` |
| **Expected**      | **403** each                                                                                 |
| **Automation**    | API                                                                                          |

---

## Quick smoke path (~15 min)

1. TASK-01 → TASK-04 → TASK-07 → TASK-10
2. TASK-14 → TASK-15 → TASK-18 → TASK-19
3. TASK-22 → TASK-26
4. TASK-27 → TASK-30 → TASK-31
5. TASK-32 → TASK-33 → TASK-44
6. TASK-39 → TASK-40 → TASK-38
7. TASK-47 → TASK-50 → TASK-51 → TASK-54 → TASK-57
8. TASK-61 → TASK-06 → TASK-63 → TASK-80 → TASK-81 → TASK-82
9. TASK-64 → TASK-65 → TASK-67 → TASK-68 → TASK-71 → TASK-72
10. TASK-73 → TASK-74 → TASK-75 → TASK-76 → TASK-77 → TASK-78

---

## Notes

- Default password: **`ps123`** (same as seed).
- **No task archive** — cancel locks status; soft delete removes from lists.
- Meta edit lock: blocked when `finished`/`cancelled`; otherwise Admin/Head **or** creator.
- Create requires `CREATE_TASK` (PM/Admin by default) — **Head does not create** unless Roles matrix grants it.
- List visibility uses `VIEW_ALL_TASKS` (PM, creative_head, head, admin) — CM and employee are scoped.
- `ASSIGN_TASK` exists in the Roles matrix but assign HTTP routes are auth + service rules (not middleware-gated today).
- Level = `round(avg(designThinking, technical, contentProcessing))` — server only.
- Swagger: login → Authorize Bearer → `/tasks/my` CRUD + status / assign / assign-cm / assign-staff / creative-edit / pm-evaluation.
- Creative pipeline: CH `assign-cm`; CM `assign-staff` (`whole` \| `split`); post-split SL via `childQuantities` only — parent total locked.
- Create department fork: `project` (+ staff) → execution; `creative` (+ empty staff) → CH handoff; `creative` (+ staff) → direct `assigned_staff`.
- Creative decline: CM refuse at `awaiting_cm` → `awaiting_ch`; staff decline at `assigned_staff` → `awaiting_cm`. **No** CH decline of `awaiting_ch`.
- Task eval layers (`pm-evaluation`): PM/CH/Head → parent; CM → whole `assigned_staff` / split child. Same Evaluate task modal for all roles. Do **not** confuse with project Head eval (**PM-48+**).
- Post-assign edit: assign does **not** lock meta. Generic `PATCH /{id}` until finished/cancelled (Admin/Head/creator). Creative drawer uses `creative-edit` (no taskName); rename only via generic PATCH if role allows. Confirmed still editable; finished/cancelled locked.
