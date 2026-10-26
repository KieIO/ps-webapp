# Manual test cases — Project milestones (tracker / seed-dev)

Checklist for **post-setup add/edit**, **authz (PM/CM/Head/Admin)**, **optional volume**, **completed**, **archive/finish/cancel locks**, and **tracker embed** on a local `seed-dev` environment.

**Pass/fail:** tick `[ ]` → `[x]`. Prefer Tracker UI + project detail; use Swagger when noted.  
**IDs:** `MS-xx` (milestones; through **MS-22**; UI slices share the same IDs). Companion automation: [`milestone-automation.md`](./milestone-automation.md).  
**Product context:** [`milestone-flow-change-plan.md`](./milestone-flow-change-plan.md) · BE handoff [`../internal/tracker-milestone-be-result.md`](../internal/tracker-milestone-be-result.md) · FE handoff [`../internal/tracker-milestone-fe-result.md`](../internal/tracker-milestone-fe-result.md).

---

## Setup (once)

```bash
# Backend (branch with milestone write changes, e.g. PR #14 tip)
cd /agent/repos/ps-be
docker compose up -d db
cp -n .env.example .env   # JWT_SECRET ≥ 32 chars
make migrate
make seed-dev
make dev                  # http://localhost:8080

# Frontend (real API — not mocks)
cd /agent/repos/ps-webapp
cp -n .env.example .env.local
# Ensure:
#   VITE_API_URL=http://localhost:8080/api/v1
#   VITE_USE_PROJECTS_MOCK=false
#   VITE_USE_AUTH_MOCK=false
npm install
npm run dev               # http://localhost:5173
```

Optional API UI: `http://localhost:8080/swagger/index.html`  
Write API: `PUT /api/v1/projects/{id}/milestones`  
Read: `GET /api/v1/projects/{id}`, `GET /api/v1/tracker`

### Seed accounts (password `ps123` for all)

| Email                            | Role             | Milestone write |
| -------------------------------- | ---------------- | --------------- |
| `admin@pokeslide.dev`            | admin            | ✓               |
| `head@pokeslide.dev`             | head             | ✓               |
| `pm@pokeslide.dev`               | pm               | ✓               |
| `creative-manager@pokeslide.dev` | creative_manager | ✓               |
| `creative-head@pokeslide.dev`    | creative_head    | ✗ (403)         |
| `employee@pokeslide.dev`         | employee         | ✗ (403)         |

Routes: `/tracker` · `/projects/:id`  
Locks (unchanged): **archived** project; status **finish** / **cancel**.

### Payload shape (write)

```json
{
  "milestones": [
    {
      "id": "optional-uuid",
      "name": "Batch 1",
      "deadlineDate": "2026-09-10",
      "quantity": 40,
      "unit": "slides",
      "note": "",
      "completed": false
    },
    {
      "name": "Kickoff",
      "deadlineDate": "2026-09-05",
      "quantity": null,
      "unit": "",
      "note": "sync",
      "completed": true
    }
  ]
}
```

Rules: `quantity` required `> 0` only when `unit` is `slides` or `da`. `others` is the UI default; quantity may be null or an integer `> 0`. Empty `unit` still accepted for older rows (`quantity` null/omit OK). Tổng slides các mốc **không** bị chặn bởi `totalSlides` của project. Server sets `completedAt` when `completed: true`, clears when `false`.

---

## A. Happy path — replace / add / edit after setup

### MS-01 — Initial replace (Admin)

|                   |                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| **Preconditions** | Admin; active non-archived project with dates covering milestones (e.g. seed `POKE001…` or create via PM-01)  |
| **Steps**         | Swagger / Tracker: `PUT …/milestones` with one slides row (`quantity` 10, `unit` `slides`, `completed` false) |
| **Expected**      | **200**; project/tracker show the milestone; `completed=false`; no `completedAt` (or omit)                    |

### MS-02 — Edit after setup (reuse id / hard-delete replace)

|                   |                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| **Preconditions** | MS-01 done; note returned milestone `id`                                                                |
| **Steps**         | `PUT` same project with **same `id`**, changed `name` (and optional note)                               |
| **Expected**      | **200**; name updated; **no 500** / PK collision (hard-delete replace). GET shows one row with new name |

### MS-03 — Add milestone after setup

|                   |                                                                                                                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Preconditions** | MS-01/02 set present (or live seed project on Tracker, e.g. **Sanofi Meninga**)                                                                                                                                                |
| **Steps**         | API: `PUT` full set: keep existing row(s) + **new** row without `id` (e.g. Kickoff, empty unit). **UI:** login Head/Admin → `/` (Project Tracker) → click project bar (`Add milestone on …`) → fill **Tên mốc** → **Thêm mốc** |
| **Expected**      | API **200**; both milestones present on GET. UI: toast `Đã thêm mốc bàn giao`; marker `Mốc {name} ngày …` appears                                                                                                              |
| **Automation**    | API `TestMilestone_MS03_*`; Playwright `e2e/milestones/ms-03-add-after-setup.spec.ts` (`npm run test:e2e:milestones`)                                                                                                          |

### MS-04 — Clear all milestones

|                   |                                                                    |
| ----------------- | ------------------------------------------------------------------ |
| **Preconditions** | Project has ≥1 milestone                                           |
| **Steps**         | `PUT` `{ "milestones": [] }` as Admin                              |
| **Expected**      | **200**; GET project `milestones: []`; tracker project embed empty |

---

## B. Authz

### MS-05 — PM can replace

|                   |                                                                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preconditions** | API harness: `pm@…`. **UI seed:** tracker PM scope is empty for `pm@pokeslide.dev` — use seed project PM `cuong.le@pokeslide.com` (PM on Sanofi/Altevia) |
| **Steps**         | API: `PUT …/milestones` with one valid row. **UI:** login seed project PM → Tracker → bar → **Thêm mốc**                                                 |
| **Expected**      | API **200**. UI: QuickModal opens; milestone marker appears                                                                                              |
| **Automation**    | API `TestMilestone_MS05_*`; Playwright PM test in `ms-03-add-after-setup.spec.ts`                                                                        |

### MS-06 — Creative Manager can replace

|                   |                                                  |
| ----------------- | ------------------------------------------------ |
| **Preconditions** | `creative-manager@pokeslide.dev`; active project |
| **Steps**         | Same as MS-05                                    |
| **Expected**      | **200**                                          |

### MS-07 — Head can replace

|                   |                      |
| ----------------- | -------------------- |
| **Preconditions** | `head@pokeslide.dev` |
| **Steps**         | Same as MS-05        |
| **Expected**      | **200**              |

### MS-08 — Admin can replace

|                   |                                      |
| ----------------- | ------------------------------------ |
| **Preconditions** | Covered by MS-01; re-check if needed |
| **Steps**         | `PUT` as admin                       |
| **Expected**      | **200**                              |

### MS-09 — Employee denied

|                   |                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| **Preconditions** | `employee@pokeslide.dev`; know a project id                                                                 |
| **Steps**         | Swagger `PUT …/milestones`; UI: open Tracker — no `Add milestone on …` button; bar is `Open project …` link |
| **Expected**      | API **403** `FORBIDDEN`. UI: no manage chrome; clicking bar opens project detail (no QuickModal)            |
| **Automation**    | API `TestMilestone_MS09_*`; Playwright `e2e/milestones/ms-09-employee-manage-hidden.spec.ts`                |

### MS-10 — Creative Head denied

|                   |                                                             |
| ----------------- | ----------------------------------------------------------- |
| **Preconditions** | `creative-head@pokeslide.dev`                               |
| **Steps**         | `PUT …/milestones`                                          |
| **Expected**      | **403** `FORBIDDEN` (write roles are PM/CM/Head/Admin only) |

---

## C. Optional volume + unit validation

### MS-11 — Non-DA/Slides: null quantity + empty unit OK

|                   |                                                                                                                                                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preconditions** | Admin; active project                                                                                                                                                                                             |
| **Steps**         | API: `PUT` row: `unit: "others"` or `""`, `quantity: null` (or omit), name + deadline in range. **UI:** QuickModal giữ **Đơn vị = Others** (mặc định), không nhập khối lượng; set **Ghi chú**; save; hover marker |
| **Expected**      | API **200**; GET `quantity: null`. UI mới lưu `unit: "others"`; `unit: ""` vẫn hợp lệ với dữ liệu cũ. Quick view dòng chính **`{Tên mốc} - {Ghi chú}`**; `Hạn nộp: …`; **không** có dòng `Khối lượng:`            |
| **Automation**    | API `TestMilestone_MS11_*`; Playwright `e2e/milestones/ms-11-empty-volume-quick-view.spec.ts`                                                                                                                     |

### MS-12 — Slides require quantity > 0

|              |                                                   |
| ------------ | ------------------------------------------------- |
| **Steps**    | `PUT` `unit: "slides"`, `quantity: null` (or ≤ 0) |
| **Expected** | **422** `VALIDATION_ERROR`                        |

### MS-13 — DA require quantity > 0

|              |                                      |
| ------------ | ------------------------------------ |
| **Steps**    | `PUT` `unit: "da"`, `quantity: null` |
| **Expected** | **422** `VALIDATION_ERROR`           |

---

## D. Completed flag

### MS-14 — `completed: true` sets `completedAt`

|                |                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| **Steps**      | API: `PUT` row with `completed: true`. **UI:** edit marker → check **Hoàn thành** → **Lưu**                    |
| **Expected**   | API **200**; response/GET: `completed=true` and `completedAt` ISO present. UI toast `Đã cập nhật mốc bàn giao` |
| **Automation** | API `TestMilestone_MS14_*`; Playwright (with MS-19) `e2e/milestones/ms-19-complete-marker-green.spec.ts`       |

### MS-15 — `completed: false` clears `completedAt`

|                   |                                                                        |
| ----------------- | ---------------------------------------------------------------------- |
| **Preconditions** | MS-14 done (or row already completed)                                  |
| **Steps**         | `PUT` same logical set with `completed: false` (reuse `id` if desired) |
| **Expected**      | **200**; `completed=false`; `completedAt` absent/null                  |

---

## E. Locks

### MS-16 — Archived project blocks replace

|                   |                                                                                  |
| ----------------- | -------------------------------------------------------------------------------- |
| **Preconditions** | Head/Admin archive a project that had milestones (or archive then attempt write) |
| **Steps**         | `PUT …/milestones` as Admin or PM                                                |
| **Expected**      | **422** validation (archived message) — not 200                                  |

### MS-17 — Finish status blocks replace

|                   |                                                           |
| ----------------- | --------------------------------------------------------- |
| **Preconditions** | Project `status=finish` (seed `POKE011…` or create+patch) |
| **Steps**         | `PUT …/milestones`                                        |
| **Expected**      | **422** (finish/cancel lock)                              |

### MS-18 — Cancel status blocks replace

|                   |                                                           |
| ----------------- | --------------------------------------------------------- |
| **Preconditions** | Project `status=cancel` (seed `POKE013…` or create+patch) |
| **Steps**         | `PUT …/milestones`                                        |
| **Expected**      | **422**                                                   |

---

## F. Read embeds

### MS-19 — Tracker GET embeds milestones + completed

|                   |                                                                                                                                                                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preconditions** | MS-01/14: project has mixed completed/incomplete milestones                                                                                                                                                                                  |
| **Steps**         | As Admin/PM: `GET /api/v1/tracker` (or open `/` Project Tracker). **UI:** create incomplete mốc → assert red `#dc2626`; tick **Hoàn thành** → assert green `#16a34a`                                                                         |
| **Expected**      | Matching project’s `milestones[]` includes `id`, `name`, `deadlineDate`, `quantity`, `unit`, `note`, `completed`, and `completedAt` when completed. UI: incomplete → red; completed → green (same-day stack green only if **all** completed) |
| **Automation**    | API `TestMilestone_MS19_*`; Playwright `e2e/milestones/ms-19-complete-marker-green.spec.ts`                                                                                                                                                  |

### MS-20 — Project GET embeds milestones + completed

|              |                                                     |
| ------------ | --------------------------------------------------- |
| **Steps**    | `GET /api/v1/projects/{id}`                         |
| **Expected** | Same milestone fields as MS-19 on `data.milestones` |

### MS-21 — Click project bar in a later month opens QuickModal

|                   |                                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Preconditions** | Role được tạo mốc (Admin / PM / Head / CM). Project có timeline bắt đầu trước tháng đang xem và vẫn còn chồng lên tháng đó (ví dụ bắt đầu tháng 10, xem tháng 11 — thanh vẫn hiện từ ngày 1)           |
| **Steps**         | Mở Project Tracker → đổi sang tháng sau ngày bắt đầu project → bấm một ngày trên thanh timeline của project                                                                                            |
| **Expected**      | Modal tạo milestone mở, hạn nộp là **ngày vừa bấm** trên tháng đang xem. Lưu thì tạo được mốc ngày đó. Không được nuốt cú bấm                                                                          |
| **Automation**    | Unit `resolveBarClickDate` trong `src/features/tracker/utils/calendar.test.ts` (bấm thanh bị cắt từ tháng trước). Playwright **chưa có** — MS-03 chỉ bấm thanh ở tháng tracker đang mở, chưa đổi tháng |

### MS-22 — Milestone slides may exceed project totalSlides

|                   |                                                                                                                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preconditions** | Project có `totalSlides` > 0 (ví dụ 46). Role được tạo mốc                                                                                                                               |
| **Steps**         | Tracker QuickModal hoặc `PUT …/milestones`: thêm mốc đơn vị Slides với khối lượng làm tổng các mốc slides **lớn hơn** `totalSlides` (ví dụ thêm 100 khi project đang 46)                 |
| **Expected**      | Lưu được. Không còn lỗi `Tổng slides các mốc (…) vượt totalSlides của dự án (…)`                                                                                                         |
| **Automation**    | Unit `validateMilestones` (`allows slides sum above the project totalSlides`) và `TestValidateMilestoneInputs` / `allows slides sum above any project total`. Không cần Playwright riêng |

---

## Quick smoke path (~10 min)

1. Login Admin → Tracker / Swagger → MS-01 then MS-02 (edit same id) → MS-03 add Kickoff (empty volume).
2. Toggle completed (MS-14/15); confirm tracker colors if UI available.
3. Switch to `pm@` and `creative-manager@` → each succeeds once (MS-05/06).
4. Switch to `employee@` → 403 (MS-09).
5. Archive or use finish project → replace fails (MS-16 or MS-17).

---

## Mapping to automation

| Cases                                                                 | Layer                                                                   |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| MS-01–08, MS-10–18, MS-19–20 (+ MS-09 API)                            | Go API integration (`make test-milestone` in ps-be)                     |
| MS-03/05/07/08 UI add; MS-09 UI; MS-11 quick view; MS-14/19 red→green | Playwright `npm run test:e2e:milestones` in ps-webapp                   |
| MS-21 click bar on a later month                                      | Unit `calendar.test.ts` now. Playwright later (not in MS-03)            |
| MS-22 slides sum may exceed project totalSlides                       | Unit FE `milestoneValidation.test.ts` + BE `project_milestones_test.go` |
| Residual visual polish                                                | Manual smoke path above                                                 |
