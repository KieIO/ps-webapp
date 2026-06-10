# Projects — Backend API TODO

The **Projects** page (`/projects`) is implemented on the frontend with **in-memory mock data** in development. Use this document when implementing the backend endpoints.

## API purpose

**List projects** — the master project registry with core project attributes and evaluation metadata (dates, levels, brief, department head, PM, quality evaluation).

This is **not** the same as `GET /tracker` (see [TRACKER_BACKEND_TODO.md](./TRACKER_BACKEND_TODO.md)). The Projects API is the **master registry** — stored evaluation metadata, ownership, and lifecycle fields. The Tracker API is a separate **operational monitoring** view (dual deadlines, priority, org-wide summary, different status model).

| | Projects (`/projects`) | Project Tracker (`/tracker`) |
|---|------------------------|------------------------------|
| **Purpose** | List / edit project records (registry) | Monitor progress and risk across all projects |
| **Audience** | PM and above (`MANAGE_PROJECTS`) | Head, Admin (`VIEW_CAPACITY_FULL`) |
| **Required fields** | Code, dates, `department`, evaluation levels (`volume`/`nature`/`time`), PM, brief, quality rating | Calendar rows: blocks, urgency, team, off-days — see [TRACKER_BACKEND_TODO.md](./TRACKER_BACKEND_TODO.md) |
| **Optional list aggregates** | `taskCount`, `members`, `totalSlides`, `completionPercent` — see [Response model](#response-model-align-with-zod-schemas) | N/A (different UI) |
| **Writes** | `POST`, `PATCH`, `DELETE` on `/projects` | None in v1 (read-only) |

## Current frontend behavior

| Concern | Temporary solution | Location |
|---------|-------------------|----------|
| Data source | In-memory mock (12 sample projects from spreadsheet reference) | `src/features/projects/mock/` |
| Mock toggle | `VITE_USE_PROJECTS_MOCK` (default `true` in dev) | `src/config/env.ts` |
| API client | Calls real endpoints when mock is disabled | `src/features/projects/api.ts` |
| Validation | Zod schemas at API boundary | `src/features/projects/schemas/project.schema.ts` |
| UI route | `/projects` | `src/pages/ProjectsPage/` |
| Access control | View: `MANAGE_PROJECTS` · Edit: `EDIT_PROJECT` (default: PM, Head, Admin) | `src/config/permissions.ts` |

To test against a real API locally, set in `.env.local`:

```
VITE_USE_PROJECTS_MOCK=false
```

---

## Backend API to implement

Base path assumes the same prefix as other v1 endpoints (e.g. `VITE_API_URL=https://api.pokeslide-internal.com/v1`).

```
GET    /projects                     → filtered project list (master registry)
GET    /projects/:id                 → single project record (detail page)
POST   /projects                     → create project record
PATCH  /projects/:id                 → update project record (edit modal)
DELETE /projects/:id                 → delete project record
GET    /projects/client-options      → client dropdown options for Projects filters
GET    /projects/pm-options          → PM dropdown options for Projects filters
GET    /projects/head-name-options   → department head name options for Projects filters
GET    /projects/head-options        → department head code/name options (create/edit forms)
```

Read endpoints require **`MANAGE_PROJECTS`**. Create/update require **`EDIT_PROJECT`** (PM, Head, Admin by default). Delete is authenticated in v1 frontend (RBAC TBD).

---

## Response model (align with Zod schemas)

The frontend splits the API contract in `src/features/projects/schemas/project.schema.ts`:

| Schema | Purpose |
|--------|---------|
| **`ProjectRecordSchema`** | **Required** fields the backend must persist and return — the project registry |
| **`ProjectListDerivedSchema`** | **Optional** task-derived aggregates for the Projects list table |
| **`ProjectSchema`** | Full list-row shape after the client applies defaults |

When the real API is wired (`VITE_USE_PROJECTS_MOCK=false`), `projectApi` parses responses with `ProjectListRecordResponseSchema`, then maps each item through `withProjectListDefaults()` in `src/features/projects/utils/projectDefaults.ts`.

### Required: `ProjectRecord`

```typescript
interface ProjectRecord {
  id: string;
  code: string;                    // e.g. "POKE001.29.04.SAN"
  client: string;
  name: string;
  startDate: string;               // ISO 8601
  endDate: string;                 // ISO 8601
  projectLevel: number;            // 1–4, server-calculated from volume + nature + time
  department: 'project' | 'creative' | 'admin';
  departmentHead: { code: string; name: string };
  brief: string;
  volume: number;                  // 1–4 evaluation level
  nature: number;                  // 1–4 evaluation level
  time: number;                    // 1–4 evaluation level
  additionalFactors: string;
  pm: { code: string; name: string };
  evaluation: string;              // quality evaluation / rating
  note: string;
  status: 'not_updated' | 'in_progress' | 'finish' | 'cancel';
  finishedDate?: string;           // ISO 8601 — set when status is `finish`
  updatedAt?: string;
}
```

### Optional: list aggregates (`ProjectListDerived`)

These fields power extra columns on `/projects`. **Backend may omit them** on `GET /projects` and `GET /projects/:id`:

```typescript
interface ProjectListDerived {
  taskCount?: number;              // count of linked project tasks
  members?: { code: string; name: string }[];
  totalSlides?: number;
  completionPercent?: number;      // 0–100
}
```

| If omitted | Frontend default (`withProjectListDefaults`) | UI effect |
|------------|-----------------------------------------------|-----------|
| `taskCount` | `0` | Tasks column shows `0` |
| `members` | `[]` | Members column shows `—` |
| `totalSlides` | `0` | Slides column shows `0` |
| `completionPercent` | `0` | Progress bar at 0% |

**Recommendation:** Include aggregates on `GET /projects` when cheap to compute (same DB as tasks). They are **not required** for v1 — the UI degrades gracefully. Do **not** substitute `GET /tracker` for `GET /projects`; tracker uses a different shape and permission model.

> **Tracker-only fields** (never on Projects API): `blocks`, `urgency`, `offDays`, and other calendar-view fields — see [TRACKER_BACKEND_TODO.md](./TRACKER_BACKEND_TODO.md).

---

### `GET /projects`

Returns the **project registry** for the Projects table — one row per project with evaluation and ownership fields.

Use this endpoint when the client needs to **list or look up projects**. For org-wide progress monitoring, use `GET /tracker` instead.

#### Query parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `search` | string | No | Case-insensitive match against project code, name, client, or brief |
| `client` | string | No | Exact client name filter |
| `status` | enum | No | One of: `not_updated`, `in_progress`, `finish`, `cancel` |
| `pmCode` | string | No | Filter by project manager employee code (e.g. `PO.031`) |
| `headName` | string | No | Filter by department head display name |
| `projectLevel` | number | No | Filter by calculated project level (`1`–`4`) |

#### Response shape

Parse with `ProjectListRecordResponseSchema`; client merges defaults to `ProjectListResponse`:

```typescript
interface ProjectListResponse {
  items: Array<ProjectRecord & Partial<ProjectListDerived>>;
  total: number;
}
```

Each item is at minimum a `ProjectRecord`. Optional `ProjectListDerived` fields improve list-table columns (see [Response model](#response-model-align-with-zod-schemas)).

#### Table columns rendered in UI

| Column (English) | Source field | Required on API |
|------------------|--------------|-----------------|
| Client | `client` | Yes |
| Project Name | `name` (links to `/projects/:id`) | Yes |
| Phòng ban | `department` | Yes |
| Tasks | `taskCount` | Optional (default `0`) |
| Start Date | `startDate` | Yes |
| End Date | `endDate` | Yes |
| Project Level | `projectLevel` | Yes |
| Head Name | `departmentHead.name` | Yes |
| Brief | `brief` | Yes |
| Volume | `volume` | Yes |
| Nature | `nature` | Yes |
| Time | `time` | Yes |
| Additional Factors | `additionalFactors` | Yes |
| PM Name | `pm.name` | Yes |
| Members | `members[].name` | Optional (default `—`) |
| Slides | `totalSlides` | Optional (default `0`) |
| % Hoàn Thành | `completionPercent` | Optional (default `0`) |
| Đánh Giá | `evaluation` | Yes |
| Note | `note` | Yes |
| Trạng thái | `status` | Yes |
| Finished Date | `finishedDate` | When `status === 'finish'` |

Dates are formatted as **`DD/MM/YYYY`** in the UI via `dayjs`; API should return ISO 8601 strings.

#### Evaluation levels

Volume, Nature, and Time are stored as integers `1`–`4`. UI displays **Level 1** through **Level 4** with color coding:

| Level | Color |
|-------|-------|
| 1 | Green |
| 2 | Blue |
| 3 | Orange |
| 4 | Red |

**Project level** is a separate calculated field (1–4) derived from Volume + Nature + Time per business rules in `POKESLIDE_PROJECT_SETUP.md` §13.

---

### `GET /projects/:id`

Returns a **single project record** for the detail page (`/projects/:id`).

**Response:** `ProjectRecord` with optional `ProjectListDerived` fields (same rules as list). Parsed via `ProjectRecordSchema.merge(ProjectListDerivedSchema)` + `withProjectListDefaults`.

---

### `POST /projects`

Creates a new project record. Used by the **Create project** modal on `/projects`.

**Permission:** `EDIT_PROJECT`.

**Request body:** same shape as `UpdateProjectRequest` (see `CreateProjectRequestSchema`).

**Response:** created `ProjectRecord` (+ optional derived fields). Server generates `code` and calculates `projectLevel`.

---

### `PATCH /projects/:id`

Updates an existing project record. Used by the **Edit project** modal on `/projects`.

**Permission:** `EDIT_PROJECT` (default roles: PM, Head, Admin).

**Request body:** align with `UpdateProjectRequestSchema` in `src/features/projects/schemas/project.schema.ts`:

```typescript
interface UpdateProjectRequest {
  client: string;
  name: string;
  startDate: string;               // ISO 8601
  endDate: string;                 // ISO 8601
  department: 'project' | 'creative' | 'admin';
  departmentHead: { code: string; name: string };
  brief: string;
  volume: number;                  // 1–4
  nature: number;                  // 1–4
  time: number;                    // 1–4
  additionalFactors: string;
  pm: { code: string; name: string };
  evaluation: string;
  note: string;
  status: 'not_updated' | 'in_progress' | 'finish' | 'cancel';
}
```

**Read-only on update (server-calculated or immutable):**

| Field | Rule |
|-------|------|
| `code` | Immutable — not in request body |
| `projectLevel` | Recalculate from average of `volume`, `nature`, `time` |
| `finishedDate` | Set when `status` becomes `finish`; clear otherwise |

**Response:** updated `Project` object (same shape as list item).

---

### `DELETE /projects/:id`

Deletes a project record. Used by the **Delete** action on `/projects`.

**Access (v1 frontend):** all authenticated roles — temporary until backend RBAC is finalized.

**Response:** `204 No Content` (or `{ success: true }`).

---

### `GET /projects/client-options`

Returns distinct client names for the filter dropdown.

```typescript
type ClientOptions = string[];

// Example: ["ALLIANZ", "EG", "EVEREST", "Internal", "SANOFI"]
```

Sorted alphabetically is preferred.

---

### `GET /projects/pm-options`

Returns distinct project managers for the filter dropdown.

```typescript
type PmOption = { code: string; name: string }[];

// Example:
[{ "code": "PO.012", "name": "Phan Thi Cam Tu" }]
```

Sorted alphabetically by `name` is preferred.

---

### `GET /projects/head-name-options`

Returns distinct department head **display names** for the Projects list filter.

```typescript
type HeadNameOptions = string[];
```

---

### `GET /projects/head-options`

Returns department head **code + name** pairs for create/edit project forms.

```typescript
type HeadOptions = { code: string; name: string }[];
```

---

## Server-side requirements

- [ ] Authenticate all requests (JWT)
- [ ] Authorize with `MANAGE_PROJECTS`
- [ ] Return ISO 8601 datetimes for all date fields
- [ ] Validate enum query params (`status`) and numeric ranges (`projectLevel`, evaluation levels)
- [ ] Resolve `departmentHead.name` from `departmentHead.code` (spreadsheet stores code only)
- [ ] Resolve `pm.name` from `pm.code`
- [ ] Calculate `projectLevel` from Volume + Nature + Time (average) — do not accept client-supplied value without validation
- [ ] Set `finishedDate` when status transitions to `finish`
- [ ] Support combined filters (search + client + status + pmCode + headName + projectLevel)
- [ ] Optionally compute and return `ProjectListDerived` fields on list/detail reads
- [ ] Never require client to send `taskCount`, `members`, `totalSlides`, or `completionPercent` on write

### Suggested data sources

| Field | Likely source |
|-------|---------------|
| `code` | System-generated project code |
| `department` | Project department assignment |
| `departmentHead` | Department head assignment on project |
| `volume`, `nature`, `time` | Project evaluation inputs |
| `projectLevel` | Calculated from evaluation criteria |
| `evaluation`, `note` | Quality evaluation fields |
| `status`, `finishedDate` | Project lifecycle state |
| `taskCount`, `totalSlides`, `completionPercent` | Aggregated from linked tasks (optional on read) |
| `members` | Distinct staff on linked tasks + roster (optional on read) |

---

## Frontend migration steps (when API is ready)

1. Implement endpoints above; **minimum viable** response is `ProjectRecord` only (derived fields optional).
2. Set `VITE_USE_PROJECTS_MOCK=false` in staging/production env.
3. Verify `ProjectListRecordResponseSchema` parsing passes — required fields must match `ProjectRecordSchema`.
4. Confirm list table renders with defaults when derived fields are omitted; add aggregates when backend can supply them.
5. `ProjectDetailPage` already calls `GET /projects/:id` via `useProject` — no extra frontend wiring needed.

---

## Related files

| File | Purpose |
|------|---------|
| `src/features/projects/schemas/project.schema.ts` | **Source of truth** — `ProjectRecordSchema`, `ProjectListDerivedSchema` |
| `src/features/projects/utils/projectDefaults.ts` | `withProjectListDefaults()` when API omits derived fields |
| `src/features/projects/api.ts` | Axios calls + mock toggle |
| `src/features/projects/mock/projects.mock.ts` | Reference filter logic for backend parity |
| `src/features/projects/components/` | Table, filters, level/status badges |
| `docs/BACKEND_API.md` | Index of all backend API specs |

---

## Export note

The “Export Excel” button exports the **currently loaded filtered list** as CSV on the client. No dedicated export endpoint is required for v1.
