# Task Scores — Backend API TODO

The **Task score** page (`/settings/task-score`) is implemented on the frontend with **in-memory mock data** in development. Use this document when implementing the backend endpoints.

## API purpose

**Manage the task-type score catalog** — each row maps a task name (e.g. `Slides 1`, `QA 3`) to a numeric **score** and a **group** used for reporting/classification.

This is **not** the same as:

| | Task scores (`/settings/task-score`) | My Tasks (`/tasks/...`) |
|---|-------------------------------------|-------------------------|
| **Purpose** | Admin config: score weights per task type | User's assigned work items |
| **Audience** | Admin (`MANAGE_USERS`) | All authenticated users |
| **Entity** | `TaskScore` catalog row | `MyTask` work record |

## Current frontend behavior

| Concern | Temporary solution | Location |
|---------|-------------------|----------|
| Data source | In-memory mock (~93 seed rows) | `src/features/task-scores/mock/` |
| Mock toggle | `VITE_USE_TASK_SCORES_MOCK` (default `true` in dev) | `src/config/env.ts` |
| API client | Calls real endpoints when mock is disabled | `src/features/task-scores/api.ts` |
| Validation | Zod schemas at API boundary | `src/features/task-scores/schemas/taskScore.schema.ts` |
| UI routes | `/settings/task-score` — list, create modal, edit modal | `src/pages/TaskScorePage/` |
| Access control | `MANAGE_USERS` (Admin only) | `src/config/permissions.ts`, router, sidebar |

To test against a real API locally:

```
VITE_USE_TASK_SCORES_MOCK=false
```

### Mock file layout

```
src/features/task-scores/mock/
├── taskScores.data.ts   # INITIAL_TASK_SCORES seed + mutable store
└── taskScores.mock.ts   # async mock API (filter, create, update)
```

**Groups** are dynamic records (seed: Implementation, Quality control, Edit & others).  
Store: `src/features/task-scores/mock/taskScoreGroups.data.ts`.

---

## Backend API to implement

```
GET    /task-score-groups       → list groups
POST   /task-score-groups       → create group
DELETE /task-score-groups/:id  → delete group (only if no tasks reference it)

GET    /task-scores        → filtered list
POST   /task-scores        → create task score row
PATCH  /task-scores/:id    → update task score row
```

All endpoints require **`MANAGE_USERS`** (Admin).

There is **no v1 delete** in the frontend.

---

## Response models (align with Zod)

Source of truth:  
- `src/features/task-scores/schemas/taskScoreGroup.schema.ts`  
- `src/features/task-scores/schemas/taskScore.schema.ts`

### `TaskScoreGroupRecord`

```typescript
interface TaskScoreGroupRecord {
  id: string;
  code: string;              // slug, e.g. "quality_control"
  label: string;             // display name, e.g. "Quality control"
  colorKey: string;          // UI pill color token
  sortOrder: number;
  createdAt: string;
}
```

### `TaskScore`

```typescript
interface TaskScore {
  id: string;
  name: string;              // unique (case-insensitive), e.g. "Slides 1"
  score: number;             // >= 0, integer in UI
  group: string;             // `TaskScoreGroupRecord.code`
  sortOrder: number;         // display order
  createdAt: string;         // ISO 8601
  updatedAt?: string;        // ISO 8601 — set on update
}
```

### List response

```typescript
interface TaskScoreListResponse {
  items: TaskScore[];
  total: number;
}
```

Sort: primary by group order (implementation → quality_control → edit_others), then `sortOrder`, then `name`.

---

## Endpoints

### `GET /task-score-groups`

**Response:** `{ items: TaskScoreGroupRecord[]; total: number }` sorted by `sortOrder`.

### `POST /task-score-groups`

**Body:** `{ label: string }` — server derives `code` from label slug; assigns `colorKey` and `sortOrder`.

### `DELETE /task-score-groups/:id`

- Reject if group is referenced by any task score row.
- Reject if it is the last remaining group.
- **Response:** `204 No Content`

### `GET /task-scores`

**Query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Case-insensitive substring match on `name` |
| `group` | string | Filter by group `code` |

**Response:** `TaskScoreListResponse`.

### `POST /task-scores`

**Body:**

```typescript
interface CreateTaskScoreRequest {
  name: string;
  score: number;             // >= 0
  group: string;             // existing group code
}
```

- Trim `name`; reject empty.
- Reject duplicate name (case-insensitive).
- Assign `sortOrder` after existing max.

### `PATCH /task-scores/:id`

**Body:** `UpdateTaskScoreRequest` — same fields as create (`name`, `score`, `group`).

- Reject duplicate `name` on other rows.
- Set `updatedAt`.

**Response:** updated `TaskScore`.

---

## Seed data reference

Initial mock rows mirror the spreadsheet catalog (Slides, Slide master, Convert, QA, Animation, DA, Motion graphic, Showreel, Supervise DE, etc.) with levels 1–5 (or fewer for some types like Complicated Animation, Rework DA).

Backend may import the same seed via migration or admin import — not required for API contract.

---

## Open questions for backend

1. Should task names be unique globally, or unique per `group`?
2. Will scores ever be fractional, or always integers?
3. Is `sortOrder` user-reorderable later, or append-only on create?
