# Backend API — Index

Start here for backend work on the Pokeslide Internal Platform frontend. Each feature has its own spec; this page is the table of contents only.

**Base URL:** `VITE_API_URL` (default `https://api.pokeslide-internal.com/v1`)  
**Auth:** JWT on all endpoints unless noted otherwise  
**Dates:** ISO 8601 in API responses; UI displays `DD/MM/YYYY`

---

## Feature specs

| Feature | Frontend route | API purpose | Status | Spec |
|---------|----------------|-------------|--------|------|
| **RBAC** | `/roles`, `/audit` | Persist & audit permission config | UI live; config in `localStorage` | [RBAC_BACKEND_TODO.md](./RBAC_BACKEND_TODO.md) |
| **Project Tracker** | `/tracker` | Calendar timeline view (blocks, urgency, off-days) | UI live; mock data in dev | [TRACKER_BACKEND_TODO.md](./TRACKER_BACKEND_TODO.md) |
| **Projects** | `/projects` | **List projects** (master registry: dates, evaluation levels, PM, brief) | UI live; mock data in dev | [PROJECTS_BACKEND_TODO.md](./PROJECTS_BACKEND_TODO.md) |
| **My Tasks** | `/tasks/project`, `/tasks/non-project`, `/tasks/detail/:id` | **List tasks** (by `taskCategory`), task detail, status/assign — role-based table columns | UI live; mock data in dev | [MY_TASKS_BACKEND_TODO.md](./MY_TASKS_BACKEND_TODO.md) |
| **Users** | `/users`, `/users/:id` | User registry — list, invite, edit role/status/department | UI live; mock data in dev | [USERS_BACKEND_TODO.md](./USERS_BACKEND_TODO.md) |
| **Titles** | `/settings/titles` | Job titles, levels, groups — list + create | UI live; mock data in dev | [TITLES_BACKEND_TODO.md](./TITLES_BACKEND_TODO.md) |
| **Employee capacity** | `/settings/employee-capacity-formula` | Per-title capacity/ratio (same `JobTitle` entity) | UI live; mock data in dev | [TITLES_BACKEND_TODO.md](./TITLES_BACKEND_TODO.md) |
| **Task scores** | `/settings/task-score` | Task type score catalog — list, create, edit | UI live; mock data in dev | [TASK_SCORES_BACKEND_TODO.md](./TASK_SCORES_BACKEND_TODO.md) |
### Tracker vs Projects (do not merge)

Both surfaces show projects in a table, but the backend APIs serve **different purposes** and return **different shapes**:

| | `GET /tracker` | `GET /projects` |
|---|----------------|-----------------|
| **What it is for** | Calendar operational monitoring — timeline blocks, urgency, off-days | Project registry — list, create, and edit project records |
| **Who uses it** | Head, Admin | PM, managers |
| **Required fields** | `projects[]` with blocks, urgency, team; `offDays[]` | `ProjectRecord`: code, dates, `department`, evaluation levels, PM, brief, quality fields |
| **Optional on Projects only** | — | `taskCount`, `members`, `totalSlides`, `completionPercent` (UI defaults to 0/empty if omitted) |
| **v1 writes** | Read-only | `POST` / `PATCH` / `DELETE` on `/projects` |

Implement as **separate endpoints**. The tracker may query the same underlying project tables but must assemble a different response — not a redirect or alias to `/projects`.

### Status legend

| Status | Meaning |
|--------|---------|
| **UI live; mock data in dev** | Frontend implemented; uses in-memory mock until API is ready (`VITE_USE_*_MOCK`) |
| **UI live; config in localStorage** | Frontend implemented; persists locally until backend replaces it |

---

## Endpoints at a glance

| Method | Path | Purpose | Auth / permission |
|--------|------|---------|-------------------|
| `GET` | `/api/rbac/permissions` | Load permission config | Admin |
| `PUT` | `/api/rbac/permissions` | Save permission config | Admin |
| `POST` | `/api/rbac/permissions/reset` | Reset permissions to defaults | Admin |
| `GET` | `/api/rbac/audit` | Paginated RBAC audit log | Admin |
| `GET` | `/tracker` | Calendar tracker (projects + off-days) | `VIEW_CAPACITY_FULL` |
| `GET` | `/projects` | List project records (`ProjectRecord` + optional list aggregates) | `MANAGE_PROJECTS` |
| `GET` | `/projects/:id` | Get one project record | `MANAGE_PROJECTS` |
| `POST` | `/projects` | Create project record | `EDIT_PROJECT` |
| `PATCH` | `/projects/:id` | Update project record | `EDIT_PROJECT` |
| `DELETE` | `/projects/:id` | Delete project record | Authenticated user (v1) |
| `GET` | `/projects/client-options` | Client filter options for projects list | `MANAGE_PROJECTS` |
| `GET` | `/projects/pm-options` | PM filter options for projects list | `MANAGE_PROJECTS` |
| `GET` | `/projects/head-name-options` | Head name filter options for projects list | `MANAGE_PROJECTS` |
| `GET` | `/projects/head-options` | Head code/name options for create/edit forms | `MANAGE_PROJECTS` |
| `GET` | `/tasks/my` | List tasks for current assignee | Authenticated user |
| `POST` | `/tasks/my` | Create task (assigned to current user) | Authenticated user |
| `PATCH` | `/tasks/my/:id` | Update own assigned task | Authenticated user |
| `PATCH` | `/tasks/my/:id/status` | Update task staff status | Authenticated user |
| `PATCH` | `/tasks/my/:id/pm-evaluation` | PM evaluation (completion, evaluation, note) | `EVALUATE_TASK` |
| `DELETE` | `/tasks/my/:id` | Delete task | Authenticated user |
| `GET` | `/tasks/my/project-options` | Project filter options for my tasks | Authenticated user |
| `GET` | `/tasks/my/pm-options` | PM options for create-task form | Authenticated user |
| `GET` | `/tasks/my/staff-options` | Staff assignee options for create-task form | Authenticated user |
| `GET` | `/users` | List users (search, role, status filters) | `MANAGE_USERS` |
| `GET` | `/users/:id` | Get one user record | `MANAGE_USERS` |
| `POST` | `/users` | Invite / create user (`status` → `invited`) | `MANAGE_USERS` |
| `PATCH` | `/users/:id` | Update user profile, role, status, department | `MANAGE_USERS` |
| `GET` | `/job-levels` | List job levels | `MANAGE_TITLES` |
| `POST` | `/job-levels` | Create job level | `MANAGE_TITLES` |
| `GET` | `/job-groups` | List job groups | `MANAGE_TITLES` |
| `POST` | `/job-groups` | Create job group | `MANAGE_TITLES` |
| `DELETE` | `/job-groups/:id` | Delete job group (unused only) | `MANAGE_TITLES` |
| `GET` | `/job-titles` | List job titles (with level/group labels) | `MANAGE_TITLES` |
| `POST` | `/job-titles` | Create job title | `MANAGE_TITLES` |
| `PATCH` | `/job-titles/:id/capacity` | Update title capacity formula fields | `MANAGE_TITLES` |
| `GET` | `/task-score-groups` | List task score groups | `MANAGE_USERS` |
| `POST` | `/task-score-groups` | Create task score group | `MANAGE_USERS` |
| `DELETE` | `/task-score-groups/:id` | Delete task score group (unused only) | `MANAGE_USERS` |
| `GET` | `/task-scores` | List task score catalog | `MANAGE_USERS` |
| `POST` | `/task-scores` | Create task score row | `MANAGE_USERS` |
| `PATCH` | `/task-scores/:id` | Update task score row | `MANAGE_USERS` |

> Path prefixes may differ between features during early development. Each spec doc is the source of truth for that feature.

---

## Adding a new spec

When a frontend feature ships with mock data or a local fallback:

1. Add `docs/[FEATURE]_BACKEND_TODO.md` following the same structure as existing specs.
2. Add a row to the table above.
3. Link the spec from the feature's `api.ts` and Zod schema file.
4. Update **§15 Questions?** in [POKESLIDE_PROJECT_SETUP.md](./POKESLIDE_PROJECT_SETUP.md) if needed.

Planned specs (not yet written): Task manage, Notifications, etc.

**Settings mock toggles:** `VITE_USE_TITLES_MOCK`, `VITE_USE_TASK_SCORES_MOCK` (see respective spec docs).

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [POKESLIDE_PROJECT_SETUP.md](./POKESLIDE_PROJECT_SETUP.md) | Routes, roles, feature modules, business rules |
| [POKESLIDE_REACT_PROJECT_STRUCTURE_GUIDE.md](./POKESLIDE_REACT_PROJECT_STRUCTURE_GUIDE.md) | Frontend API layer patterns (Zod, TanStack Query) |
