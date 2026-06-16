# Titles & Employee Capacity — Backend API TODO

The **Title management** page (`/settings/titles`) and **Employee capacity formula** page (`/settings/employee-capacity-formula`) are implemented on the frontend with **in-memory mock data** in development. Use this document when implementing the backend.

## API purpose

**Manage job titles, job levels, job groups, and per-title capacity formula fields.**

| Surface                   | Route                                 | What it does                                                                                       |
| ------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Title management          | `/settings/titles`                    | 3 tabs: job titles, job levels, job groups — list + create                                         |
| Employee capacity formula | `/settings/employee-capacity-formula` | Same **job titles** list with extra capacity columns — inline edit capacity/ratio only (no create) |

Both surfaces read/write the same **`JobTitle`** entity. Capacity fields live on the title record, not a separate table.

## Current frontend behavior

| Concern          | Temporary solution                                     | Location                                       |
| ---------------- | ------------------------------------------------------ | ---------------------------------------------- |
| Data source      | In-memory mock stores                                  | `src/features/titles/mock/`                    |
| Mock toggle      | `VITE_USE_TITLES_MOCK` (default `true` in dev)         | `src/config/env.ts`                            |
| API client       | Calls real endpoints when mock is disabled             | `src/features/titles/api.ts`                   |
| Validation       | Zod schemas at API boundary                            | `src/features/titles/schemas/title.schema.ts`  |
| Capacity formula | `specialistTaskPoints = round(capacity × ratio / 100)` | `src/features/titles/utils/capacityFormula.ts` |
| Access control   | `MANAGE_TITLES` (manager-level roles by default)       | `src/config/permissions.ts`, router, sidebar   |

To test against a real API locally:

```
VITE_USE_TITLES_MOCK=false
```

### Mock file layout

```
src/features/titles/mock/
├── titles.data.ts          # INITIAL_* seed data + mutable stores (levels, groups, titles)
├── titles.mock.ts          # async mock API (filter, create, update capacity)
└── capacityFormula.data.ts # dev-only default capacity/ratio when seeding or creating by code prefix
```

**Seed data:** 5 job levels, 2 job groups, 77 job titles (spreadsheet order via `sortOrder`).  
**Capacity defaults** in dev are derived from title `code` family (e.g. `JPE-1`, `SPE-6`) — backend may seed the same values or compute on create.

---

## Backend API to implement

```
GET    /job-levels              → list job levels
POST   /job-levels              → create job level

GET    /job-groups              → list job groups
POST   /job-groups              → create job group
DELETE /job-groups/:id          → delete job group (only if no titles reference it)

GET    /job-titles              → list job titles (enriched with level/group labels)
POST   /job-titles              → create job title
PATCH  /job-titles/:id/capacity → update capacity formula fields on a title
```

All endpoints require **`MANAGE_TITLES`**.

Job groups support **create + delete** (unused groups only). There is **no v1 delete** for job levels/titles or **edit title metadata** (rename/code/level/group) — only create + capacity patch.

---

## Response models (align with Zod)

Source of truth: `src/features/titles/schemas/title.schema.ts`.

### `JobLevel`

```typescript
interface JobLevel {
  id: string;
  code: string; // e.g. "JUNIOR" — stored uppercase
  label: string; // e.g. "Junior"
  sortOrder: number; // display order (Intern → Manager)
  createdAt: string; // ISO 8601
}
```

### `JobGroup`

```typescript
interface JobGroup {
  id: string;
  code: string; // e.g. "STAFF"
  label: string; // e.g. "Staff"
  sortOrder: number;
  createdAt: string;
}
```

### `JobTitle` (storage)

```typescript
interface JobTitle {
  id: string;
  code: string; // e.g. "JPE-1", "IN.0"
  name: string; // e.g. "Junior Project Executive Level 1"
  jobLevelId: string;
  jobGroupId: string;
  sortOrder: number;
  dailyCapacityPoints: number; // >= 0
  taskConversionRatio: number; // 0–100 (percent, not decimal)
  specialistTaskPoints: number; // server-computed, see below
  createdAt: string;
}
```

### `JobTitleListItem` (list response)

Same as `JobTitle` plus denormalized labels for the table:

```typescript
interface JobTitleListItem extends JobTitle {
  jobLevelCode: string;
  jobLevelLabel: string;
  jobGroupCode: string;
  jobGroupLabel: string;
}
```

### Capacity formula (business rule)

```
specialistTaskPoints = Math.round(dailyCapacityPoints * taskConversionRatio / 100)
```

- Backend **must** compute `specialistTaskPoints` on create and on `PATCH .../capacity`.
- Do not trust client-sent `specialistTaskPoints` on write.
- `taskConversionRatio` is clamped to **0–100** (frontend enforces this inline).

---

## Endpoints

### `GET /job-levels`

```typescript
interface JobLevelListResponse {
  items: JobLevel[];
  total: number;
}
```

Sort by `sortOrder` ascending.

### `POST /job-levels`

**Body:**

```typescript
interface CreateJobLevelRequest {
  code: string;
  label: string;
}
```

- Normalize `code` to uppercase; reject duplicates.
- Assign `sortOrder` after existing max.

### `GET /job-groups`

Same list shape as levels (`JobGroupListResponse`).

### `POST /job-groups`

**Body:** `CreateJobGroupRequest` — `{ code, label }`.

### `DELETE /job-groups/:id`

- Reject if any job title references this group.
- Reject if it is the last remaining group.
- **Response:** `204 No Content`

### `GET /job-titles`

**Query parameters:**

| Param        | Type   | Description                                |
| ------------ | ------ | ------------------------------------------ |
| `search`     | string | Case-insensitive match on `code` or `name` |
| `jobLevelId` | string | Filter by level id                         |
| `jobGroupId` | string | Filter by group id                         |

**Response:**

```typescript
interface JobTitleListResponse {
  items: JobTitleListItem[];
  total: number;
}
```

Sort by `sortOrder` ascending (frontend displays grouped rows by title family).

### `POST /job-titles`

**Body:**

```typescript
interface CreateJobTitleRequest {
  code: string;
  name: string;
  jobLevelId: string;
  jobGroupId: string;
}
```

- Reject duplicate `code` (case-insensitive).
- Validate `jobLevelId` / `jobGroupId` exist.
- Set initial capacity fields (either spreadsheet defaults by code family, or `0` / `100` / `0`).
- Compute `specialistTaskPoints`.
- Assign `sortOrder` after existing max.

### `PATCH /job-titles/:id/capacity`

Used by **Employee capacity formula** page only.

**Body:**

```typescript
interface UpdateJobTitleCapacityRequest {
  dailyCapacityPoints: number; // >= 0
  taskConversionRatio: number; // 0–100
}
```

**Response:** `JobTitleListItem` with updated capacity fields and recomputed `specialistTaskPoints`.

---

## Relations to other features

- **Users** (`/users`) assign an optional `jobTitleId` (FK to `JobTitle.id`) on the detail page — not the same as job level/group entities. Invite flow leaves title unassigned until admin sets it.
- **Task scores** (`/settings/task-score`) is a separate catalog — see [TASK_SCORES_BACKEND_TODO.md](./TASK_SCORES_BACKEND_TODO.md).

---

## Open questions for backend

1. Should `sortOrder` be user-reorderable (drag-and-drop) later, or append-only on create?
2. Should capacity defaults on `POST /job-titles` mirror the spreadsheet seed rules in `capacityFormula.data.ts`, or always start at zero until edited?
3. Single-tenant global config, or per-department overrides later?
