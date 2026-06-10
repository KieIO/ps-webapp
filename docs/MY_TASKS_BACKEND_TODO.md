# My Tasks — Backend API TODO

The **My Tasks** pages (`/tasks/project`, `/tasks/non-project`) and **task detail** (`/tasks/detail/:id`) are implemented on the frontend with **in-memory mock data** in development. Use this document when implementing the backend endpoints.

## API purpose

**List and manage tasks for the authenticated user** — personal task lists (project vs non-project) with project context, classification levels, PM evaluation, staff confirmation, and role-based modals (create, edit, assign, status, evaluate).

This is **not** the same as task management (`/tasks/manage`) for PMs. My Tasks is scoped to the current assignee (with manager overrides defined by backend RBAC, not dev-mock admin bypass).

| | My Tasks (`GET /tasks/my`) | Task manage (future) |
|---|---------------------------|----------------------|
| **Purpose** | Personal assigned task list | PM / manager task board |
| **Audience** | All authenticated users | PM, managers (`VIEW_ALL_TASKS`) |
| **Scope** | Current user only | Team / org tasks |
| **v1 writes** | `POST /tasks/my`, `PATCH /tasks/my/:id` (all authenticated roles) | Assign / manage others TBD |

## Current frontend behavior

| Concern | Temporary solution | Location |
|---------|-------------------|----------|
| Data source | In-memory mock (10 sample tasks from spreadsheet reference) | `src/features/tasks/mock/` |
| Mock toggle | `VITE_USE_TASKS_MOCK` (default `true` in dev) | `src/config/env.ts` |
| API client | Calls real endpoints when mock is disabled | `src/features/tasks/api.ts` |
| Validation | Zod schemas at API boundary | `src/features/tasks/schemas/task.schema.ts` |
| UI routes | `/tasks/project`, `/tasks/non-project`, `/tasks/detail/:id` | `src/pages/MyTasksPage/`, `NonProjectTasksPage/`, `MyTaskDetailPage/` |
| Access control | All authenticated users (no permission key) | `src/config/sidebar.ts` |

To test against a real API locally, set in `.env.local`:

```
VITE_USE_TASKS_MOCK=false
```

In dev mock, tasks are filtered by `staff.userId` matching the logged-in user's `id` (e.g. `dev-employee`). **Unassigned tasks** (no `staff`) are visible to all authenticated users. **Temporary:** `dev-admin` sees all mock tasks for demo purposes — remove when the real API is wired.

---

## Backend API to implement

```
GET    /tasks/my                  → filtered list of tasks for current user
POST   /tasks/my                  → create task (assigned to current user; all authenticated roles)
PATCH  /tasks/my/:id              → update task (edit modal; all authenticated roles)
GET    /tasks/my/project-options  → project name dropdown for filters
GET    /tasks/my/pm-options       → PM code/name options for create form
GET    /tasks/my/staff-options    → Staff assignee options for create form
```

All endpoints require authentication. **Always scope list/update to the authenticated assignee** — never return or modify other users' tasks (admin override is dev-mock only).

---

### `GET /tasks/my`

Returns tasks assigned to the **current user**.

#### Query parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `taskCategory` | enum | No | `project` or `non_project` — scopes list to one task list page |
| `search` | string | No | Case-insensitive match against project name, task name, task code, or description |
| `projectName` | string | No | Exact project name filter |
| `staffName` | string | No | Exact staff name filter (project tasks list; includes `Unassigned` sentinel) |
| `confirmation` | enum | No | One of: `not_updated`, `finished`, `confirmed`, `decline` |

#### Response shape

Align with `MyTaskListResponseSchema` in `src/features/tasks/schemas/task.schema.ts`:

```typescript
interface MyTaskListResponse {
  items: MyTask[];
  total: number;
}

interface MyTask {
  id: string;
  taskCode: string;
  projectId?: string;              // linked project record — required for Head edit → PATCH /projects/:id
  projectName: string;
  projectManager: { code: string; name: string };
  taskName: string;
  level: number;                   // 1–4, calculated from classification
  quantity: number;
  date: string;                    // ISO 8601
  description: string;
  staff: { code: string; name: string; userId?: string }[];
  taskCategory: 'project' | 'non_project';
  designThinking: number;          // 1–4
  technical: number;               // 1–4
  contentProcessing: number;       // 1–4
  additionalFactors: string;
  completionPercent?: number;        // PM completion % (0–100)
  pmEvaluation: string;
  pmNote: string;
  staffConfirmation: 'not_updated' | 'finished' | 'confirmed' | 'decline';
  staffNote: string;
  updatedAt?: string;
  /** Denormalized project snapshot for Department Head table — optional until linked project is resolved. */
  projectStartDate?: string;
  projectEndDate?: string;
  projectLevel?: number;             // 1–4
  projectBrief?: string;
  projectVolume?: number;            // 1–4 (KHỐI LƯỢNG)
  projectNature?: number;            // 1–4 (TÍNH CHẤT)
  projectTime?: number;              // 1–4 (THỜI GIAN)
  projectStatus?: 'not_updated' | 'in_progress' | 'finish' | 'cancel';
  projectFinishedDate?: string;
}
```

#### Table columns rendered in UI

Frontend routes: **`/tasks/project`** (project tasks) and **`/tasks/non-project`** (non-project tasks). Both use the same `MyTask` shape; the API should accept optional query param `taskCategory` (`project` | `non_project`).

| Column header | Source field |
|---------------|--------------|
| PROJECTS NAME | `projectName` |
| PROJECT MANAGER | `projectManager.name` + `projectManager.code` |
| TASK NAME | `description` |
| TASK TYPE | `taskName` |
| LEVEL | `level` (Level 1–4 badge, calculated) |
| QUANTITY | `quantity` |
| DATE | `date` |
| STAFF NAME | `staff[].name` (comma-separated) |
| TƯ DUY THIẾT KẾ | `designThinking` |
| KỸ THUẬT | `technical` |
| XỬ LÝ NỘI DUNG | `contentProcessing` |
| YẾU TỐ BỔ SUNG | `additionalFactors` |
| HOÀN THÀNH | `completionPercent` |
| ĐÁNH GIÁ | `pmEvaluation` |
| NOTE (PM) | `pmNote` |
| Trạng thái | `staffConfirmation` |
| NOTE (staff) | `staffNote` |

**Role-based column visibility** (configured in `src/features/tasks/constants.ts` + `getMyTaskColumnKeysForRole`):

| Role | Visible columns |
|------|-----------------|
| **Employee** | PROJECTS NAME, PROJECT MANAGER, TASK NAME, TASK TYPE, QUANTITY, DATE, Trạng thái, NOTE (staff) |
| **Project Manager** | Full PM set (all columns above) with PM classification labels |
| **Creative Head** | Same as Project Manager |
| **Creative Manager** | Same as Project Manager |
| **Department Head** | PROJECT NAME, START DATE, END DATE, PROJECT LEVEL, BRIEF, KHỐI LƯỢNG, TÍNH CHẤT, THỜI GIAN, YẾU TỐ BỔ SUNG, PM NAME, ĐÁNH GIÁ, NOTE, PROJECT STATUS, FINISHED DATE (denormalized project fields on `MyTask`) |
| **Admin** | Full PM set (all task columns above) with PM classification labels |

The API returns the full `MyTask` object for all roles; the frontend hides columns per role. Export CSV respects the same column subset.

Dates are formatted as **`DD/MM/YYYY`** in the UI via `dayjs`; API should return ISO 8601 strings.

#### Task level calculation

`level` = rounded average of `designThinking`, `technical`, and `contentProcessing` (1–4). Server should calculate and return — do not trust client-supplied level.

---

### `POST /tasks/my`

Creates a new task. Used by the **Create task** action on `/tasks`. Assignee is optional — omit or send `null` for `staff` to leave the task unassigned.

**Access:** all authenticated roles (no separate permission key).

**Request body:** align with `CreateMyTaskRequestSchema` in `src/features/tasks/schemas/task.schema.ts`:

```typescript
interface CreateMyTaskRequest {
  projectName: string;
  projectManager: { code: string; name: string };
  taskName: string;
  level: number;                   // 1–4, set by user on create
  quantity: number;
  date: string;                    // ISO 8601
  description: string;
  designThinking: number;          // 1–4
  technical: number;               // 1–4
  contentProcessing: number;       // 1–4
  additionalFactors: string;
  staff: { code: string; name: string; userId?: string }[];
  taskCategory: 'project' | 'non_project';
  staffConfirmation: 'not_updated' | 'finished' | 'confirmed' | 'decline';
  staffNote: string;
}
```

**`staff` in request:** optional. `null` or omitted = unassigned. When set, must reference a valid staff member (`code`, `name`, optional `userId`).

**Server-set fields (not in request body):**

| Field | Rule |
|-------|------|
| `id` | Generate unique id |
| `taskCode` | Generate from PM code + project context |
| `completionPercent`, `pmEvaluation`, `pmNote` | Empty / null until PM workflow |
| `updatedAt` | Set to now |

**Response:** created `MyTask` object (HTTP 201).

---

### `PATCH /tasks/my/:id`

Updates a task assigned to the **current user**. Used by the **Edit** action on `/tasks`.

**Access:** all authenticated roles (no separate permission key). User may only update their own assigned tasks.

**Request body:** align with `UpdateMyTaskRequestSchema` in `src/features/tasks/schemas/task.schema.ts`:

```typescript
interface UpdateMyTaskRequest {
  taskName: string;
  quantity: number;
  date: string;                    // ISO 8601
  description: string;
  designThinking: number;          // 1–4
  technical: number;               // 1–4
  contentProcessing: number;       // 1–4
  additionalFactors: string;
  staffConfirmation: 'not_updated' | 'finished' | 'confirmed' | 'decline';
  staffNote: string;
}
```

**Read-only on update (not in request body):**

| Field | Rule |
|-------|------|
| `taskCode`, `projectName`, `projectManager` | From project / system |
| `staff` | Assignee — immutable on My Tasks edit |
| `level` | Recalculate from classification fields |
| `completionPercent`, `pmEvaluation`, `pmNote` | PM evaluation — separate workflow |

**Response:** updated `MyTask` object.

---

### `PATCH /tasks/my/:id/status`

Updates **staff confirmation status** only. Used by the inline status picker next to **Edit** on `/tasks`.

**Request body:**

```typescript
interface UpdateMyTaskStatusRequest {
  staffConfirmation: 'not_updated' | 'finished' | 'confirmed' | 'decline';
  staffNote: string;
}
```

**Response:** updated `MyTask` object.

---

### `PATCH /tasks/my/:id/pm-evaluation`

Updates **PM evaluation fields** only. Used by the **Evaluate** action on `/tasks`.

**Access:** `EVALUATE_TASK` permission (PM, Head, Admin).

**Request body:**

```typescript
interface UpdateMyTaskPmEvaluationRequest {
  completionPercent: number;       // 0–100
  pmEvaluation: string;
  pmNote: string;
}
```

**Response:** updated `MyTask` object.

---

### `DELETE /tasks/my/:id`

Deletes a task. Used by the **Delete** action on `/tasks/project` and `/tasks/non-project`.

**Access:** all authenticated roles (no separate permission key).

**Response:** `204 No Content` (or `{ success: true }`).

---

### `GET /tasks/my/project-options`

Returns project name options for filter dropdowns and the create-task form.

#### Query parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `taskCategory` | enum | No | `project` or `non_project` |
| `scope` | enum | No | `assignee` (default) — projects from the user's assigned tasks; `all` — broader list for create form |

```typescript
type ProjectOptions = string[];
```

Sorted alphabetically is preferred.

---

### `GET /tasks/my/pm-options`

Returns distinct project managers for the create-task form (code + name pairs).

```typescript
type PmOptions = { code: string; name: string }[];
```

---

### `GET /tasks/my/staff-options`

Returns staff members available for assignment when creating a task.

```typescript
type StaffOptions = { code: string; name: string; userId?: string }[];
```

Sorted by name is preferred.

---

## Server-side requirements

- [ ] Authenticate all requests (JWT)
- [ ] **Scope all queries to the authenticated user as assignee**
- [ ] Return ISO 8601 datetimes for date fields
- [ ] Validate enum query params (`confirmation`)
- [ ] Calculate `level` from classification fields
- [ ] Resolve `projectManager.name` from `projectManager.code` where applicable

---

## Frontend migration steps (when API is ready)

1. Implement `GET /tasks/my`, `POST /tasks/my`, `PATCH /tasks/my/:id`, `PATCH /tasks/my/:id/status`, `PATCH /tasks/my/:id/pm-evaluation`, `DELETE /tasks/my/:id`, `GET /tasks/my/project-options`, `GET /tasks/my/pm-options`, and `GET /tasks/my/staff-options`.
2. Set `VITE_USE_TASKS_MOCK=false` in staging/production env.
3. Verify Zod parsing passes — responses must match schemas exactly.
4. Confirm backend filters by JWT user id (not a client-supplied user id).

---

## Related files

| File | Purpose |
|------|---------|
| `src/features/tasks/schemas/task.schema.ts` | **Source of truth** for request/response types |
| `src/features/tasks/api.ts` | Axios calls |
| `src/features/tasks/mock/tasks.mock.ts` | Reference filter logic for backend parity |
| `docs/BACKEND_API.md` | Index of all backend API specs |

---

## Export note

The “Export Excel” button exports the **currently loaded filtered list** as CSV on the client. No dedicated export endpoint is required for v1.
