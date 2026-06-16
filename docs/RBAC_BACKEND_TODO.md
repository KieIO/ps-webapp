# RBAC — Backend API TODO

The **Roles & Permissions** page (`/roles`) and **Audit Log** page (`/audit`) are implemented on the frontend. Permission config is **editable in the UI** but persists to **`localStorage`** only until the backend is wired. Use this document when implementing the backend endpoints.

## API purpose

**Persist and audit the permission matrix** — which organizational roles are granted each permission key. The matrix drives runtime UI access (`roleHasPermission`) after login; it does not replace JWT role assignment on user records.

| Surface             | Route    | What it does                                                             |
| ------------------- | -------- | ------------------------------------------------------------------------ |
| Roles & Permissions | `/roles` | Editable permission matrix — save / reset to defaults                    |
| Audit Log           | `/audit` | Paginated history of permission changes (UI placeholder; API spec below) |

This is **not** user role assignment (`PATCH /users/:id` sets a user's single role). RBAC config defines what each role _can do_ platform-wide.

## URL conventions (no `/api` path prefix)

All frontend HTTP calls use Axios `baseURL` = `VITE_API_URL` (default `https://api.pokeslide-internal.com/v1`). Paths in this doc are **relative to that base** — the same pattern as titles, users, and tasks:

| Feature | Example full URL                  |
| ------- | --------------------------------- |
| Auth    | `{VITE_API_URL}/auth/login`       |
| Users   | `{VITE_API_URL}/users`            |
| Titles  | `{VITE_API_URL}/job-titles`       |
| RBAC    | `{VITE_API_URL}/rbac/permissions` |

There is **no extra `/api` segment** in resource paths. The host name already identifies the API; `/v1` is the API version prefix in `VITE_API_URL`. An older draft of this spec used `/api/rbac/...` — **use `/rbac/...` instead** so all features share one convention.

## Current frontend behavior

| Concern            | Temporary solution                                      | Location                                                |
| ------------------ | ------------------------------------------------------- | ------------------------------------------------------- |
| Permission storage | `localStorage` key `pokeslide:rbac-config`              | `src/features/rbac/storage/permissionConfig.storage.ts` |
| Defaults           | `PERMISSIONS` in code                                   | `src/config/permissions.ts`                             |
| Runtime checks     | Redux `permissionConfig` + `permission` slices          | `src/store/slices/permissionConfigSlice.ts`             |
| Audit trail        | Last 50 changes in `localStorage`                       | `StoredRbacData.auditLog`                               |
| Admin UI           | `/roles` — editable matrix                              | `src/pages/RolesPage/`                                  |
| Audit UI           | `/audit` — placeholder                                  | `src/pages/AuditLogPage/`                               |
| API client         | **Not implemented yet** — no `src/features/rbac/api.ts` | Migration steps below                                   |

---

## Backend API to implement

```
GET    /rbac/permissions          → load permission config
PUT    /rbac/permissions          → replace full config (admin only)
POST   /rbac/permissions/reset    → restore code defaults (admin only)
GET    /rbac/audit                → paginated audit log
```

All endpoints require authentication. Write endpoints and audit read require **Admin** role (or `MANAGE_USERS` once runtime checks use the saved matrix).

---

## Enums (allowlists)

Source of truth: `src/config/permissions.ts`.

### Roles

| Key                | Value              | Label            |
| ------------------ | ------------------ | ---------------- |
| `EMPLOYEE`         | `employee`         | Employee         |
| `PM`               | `pm`               | Project Manager  |
| `CREATIVE_MANAGER` | `creative_manager` | Creative Manager |
| `CREATIVE_HEAD`    | `creative_head`    | Creative Head    |
| `HEAD`             | `head`             | Department Head  |
| `ADMIN`            | `admin`            | Admin            |

Matrix column order (least → most privileged): `employee`, `pm`, `creative_manager`, `creative_head`, `head`, `admin`.

### Permission keys

| Key                    | Default granted roles                                      |
| ---------------------- | ---------------------------------------------------------- |
| `MANAGE_PROJECTS`      | `pm`, `creative_manager`, `creative_head`, `head`, `admin` |
| `EDIT_PROJECT`         | `pm`, `creative_manager`, `creative_head`, `head`, `admin` |
| `ASSIGN_TASK`          | `pm`, `creative_manager`, `creative_head`, `head`, `admin` |
| `REVIEW_CREATIVE_TASK` | `creative_head`                                            |
| `VIEW_ALL_TASKS`       | `pm`, `creative_manager`, `creative_head`, `head`, `admin` |
| `EVALUATE_TASK`        | `pm`, `creative_manager`, `creative_head`, `head`, `admin` |
| `VIEW_CAPACITY`        | `pm`, `creative_manager`, `creative_head`, `head`, `admin` |
| `VIEW_CAPACITY_FULL`   | `pm`, `creative_manager`, `creative_head`, `head`, `admin` |
| `VIEW_WORKLOAD`        | `pm`, `creative_manager`, `creative_head`, `head`, `admin` |
| `VIEW_PERFORMANCE`     | `pm`, `creative_manager`, `creative_head`, `head`, `admin` |
| `EDIT_KPI_SETTINGS`    | `pm`, `creative_manager`, `creative_head`, `head`, `admin` |
| `VIEW_QUALITY`         | `pm`, `creative_manager`, `creative_head`, `head`, `admin` |
| `REQUEST_OT`           | `pm`, `creative_manager`, `creative_head`, `head`, `admin` |
| `APPROVE_OT`           | `pm`, `creative_manager`, `creative_head`, `head`, `admin` |
| `EXPORT_REPORT`        | `pm`, `creative_manager`, `creative_head`, `head`, `admin` |
| `VIEW_USER`            | `pm`, `creative_manager`, `creative_head`, `head`, `admin` |
| `MANAGE_USERS`         | `pm`, `creative_manager`, `creative_head`, `head`, `admin` |
| `MANAGE_LEAVE`         | `pm`, `creative_manager`, `creative_head`, `head`, `admin` |
| `REACTIVATE_USER`      | `admin`                                                    |
| `MANAGE_TITLES`        | `pm`, `creative_manager`, `creative_head`, `head`, `admin` |
| `VIEW_AUDIT_LOG`       | `pm`, `creative_manager`, `creative_head`, `head`, `admin` |

Backend must reject unknown permission or role keys on write.

### Immutable grants

Cannot be removed on save (prevents admin lockout). Enforced in UI (`src/features/rbac/constants.ts`) and **must** be enforced server-side:

| Permission       | Role that must always be granted |
| ---------------- | -------------------------------- |
| `MANAGE_USERS`   | `admin`                          |
| `VIEW_AUDIT_LOG` | `admin`                          |

---

## Response models (align with frontend)

Source of truth: `src/features/rbac/types.ts`.

```typescript
type Role = 'employee' | 'pm' | 'creative_manager' | 'creative_head' | 'head' | 'admin';

type Permission =
  | 'MANAGE_PROJECTS'
  | 'EDIT_PROJECT'
  | 'ASSIGN_TASK'
  | 'REVIEW_CREATIVE_TASK'
  | 'VIEW_ALL_TASKS'
  | 'EVALUATE_TASK'
  | 'VIEW_CAPACITY'
  | 'VIEW_CAPACITY_FULL'
  | 'VIEW_WORKLOAD'
  | 'VIEW_PERFORMANCE'
  | 'EDIT_KPI_SETTINGS'
  | 'VIEW_QUALITY'
  | 'REQUEST_OT'
  | 'APPROVE_OT'
  | 'EXPORT_REPORT'
  | 'MANAGE_USERS'
  | 'MANAGE_TITLES'
  | 'VIEW_AUDIT_LOG';

/** Each permission key maps to roles that are granted. */
type PermissionConfigMap = Record<Permission, Role[]>;

interface PermissionChange {
  permission: Permission;
  role: Role;
  granted: boolean;
}

interface PermissionAuditEntry {
  id: string;
  timestamp: string; // ISO 8601
  actorId: string;
  actorName: string;
  summary: string;
  changes: PermissionChange[];
}

interface RbacConfigResponse {
  config: PermissionConfigMap;
  updatedAt: string; // ISO 8601
  source: 'default' | 'database';
}
```

---

## Endpoints

### `GET /rbac/permissions`

Returns the current permission matrix.

**Response:** `RbacConfigResponse`

- `source: 'database'` when a saved config exists; `'default'` when serving built-in defaults (no row in DB yet).
- Every permission key from the allowlist must be present in `config`, each with a (possibly empty) role array.

---

### `PUT /rbac/permissions`

Replaces the **entire** permission config. Used by **Save changes** on `/roles`.

The frontend sends the full matrix after local edits (not a partial diff). The server computes the diff against the previous config for the audit log.

**Access:** Admin only.

**Request body:**

```typescript
interface UpdateRbacPermissionsRequest {
  config: PermissionConfigMap;
}
```

**Server behavior:**

1. Validate all permission keys and role values against allowlists.
2. Apply `IMMUTABLE_GRANTS` (union `admin` onto `MANAGE_USERS` and `VIEW_AUDIT_LOG` even if omitted).
3. Persist config.
4. Append audit entry: `actorId` / `actorName` from JWT (ignore client-supplied actor fields if any).
5. Set `summary` e.g. `"12 permission change(s)"` from diff length.

**Response:** `RbacConfigResponse` with `source: 'database'` (HTTP 200).

**Errors:**

- `400` — invalid permission/role key, or malformed body.
- `403` — non-admin.

---

### `POST /rbac/permissions/reset`

Restores the built-in default matrix from `PERMISSIONS` in `src/config/permissions.ts`. Used by **Reset to defaults** on `/roles`.

**Access:** Admin only.

**Request body:** none (or empty `{}`).

**Server behavior:**

1. Replace stored config with code defaults (seed from the same table in **Permission keys** above).
2. Append audit entry describing reset.
3. Optionally delete custom config row or mark as default.

**Response:** `RbacConfigResponse` with `source: 'default'` or `'database'` (HTTP 200).

---

### `GET /rbac/audit`

Paginated audit log for `/audit`. Replaces reading `StoredRbacData.auditLog` from `localStorage`.

**Access:** Admin (`VIEW_AUDIT_LOG`).

#### Query parameters

| Param      | Type   | Required | Default | Description                               |
| ---------- | ------ | -------- | ------- | ----------------------------------------- |
| `page`     | number | No       | `1`     | 1-based page index                        |
| `pageSize` | number | No       | `20`    | Page size (max `100`)                     |
| `actorId`  | string | No       | —       | Filter by admin user id                   |
| `from`     | string | No       | —       | ISO 8601 — entries on or after this time  |
| `to`       | string | No       | —       | ISO 8601 — entries on or before this time |

Sort: **`timestamp` descending** (newest first).

**Response:**

```typescript
interface RbacAuditListResponse {
  items: PermissionAuditEntry[];
  total: number;
  page: number;
  pageSize: number;
}
```

Dev mock retains only the last **50** entries in `localStorage` (`RBAC_AUDIT_LOG_LIMIT`). Backend should persist without that cap; pagination replaces client-side truncation.

---

## Server-side requirements

- [ ] Authenticate all requests (JWT)
- [ ] Store config in DB (JSON column or `role_permission` join table)
- [ ] Enforce `IMMUTABLE_GRANTS` on every `PUT`
- [ ] Validate permission keys against the 18-key allowlist above
- [ ] Validate role keys against the 6-role allowlist above
- [ ] Record audit on `PUT` and `POST .../reset`: actor from JWT, timestamp, `changes[]` diff
- [ ] Admin-only middleware on write endpoints and `GET /rbac/audit`
- [ ] Optional: include effective permissions in JWT claims (short TTL) or fetch on each session

---

## Frontend migration steps (when API is ready)

1. Add `src/features/rbac/api.ts` (pattern: `src/features/titles/api.ts`) calling `/rbac/...` paths.
2. Add `env.useRbacApi` or use real API when `useAuthMock` is false.
3. **Update `permissionConfig.storage.ts`**:
   - `loadPermissionConfig()` → `GET /rbac/permissions` first; fall back to defaults on error.
   - `savePermissionConfig()` → `PUT /rbac/permissions` with `{ config }`; remove `localStorage.setItem` in production.
   - Keep `localStorage` as offline/dev fallback if desired.
4. **Hydrate on app load** — `PermissionConfigBootstrap` already dispatches `hydratePermissionConfig()`; point hydration at API.
5. **Login flow** — after JWT, fetch RBAC config before `syncUserPermissions()` (or include permissions in login response).
6. **Audit log page** — wire `AuditLogPage` to `GET /rbac/audit` instead of placeholder.
7. **Remove or gate localStorage** — on first API success, clear `pokeslide:rbac-config` from localStorage.

---

## Route guards note

`ProtectedRoute` in `router.tsx` still uses **hard-coded role lists** for some routes (e.g. Creative Head-only pages). When backend RBAC is live, consider aligning route guards with permission keys or a `canAccessRoute(role, route)` helper fed by the same config.

## localStorage key reference

```
Key:     pokeslide:rbac-config
Version: 1
Shape:   StoredRbacData (see src/features/rbac/types.ts)
```

## Related files

| File                                                    | Purpose                            |
| ------------------------------------------------------- | ---------------------------------- |
| `docs/BACKEND_API.md`                                   | Index of all backend API specs     |
| `src/config/permissions.ts`                             | Default permission map + role enum |
| `src/config/permissionModules.ts`                       | UI module grouping for matrix rows |
| `src/features/rbac/types.ts`                            | Request/response TypeScript types  |
| `src/features/rbac/constants.ts`                        | `IMMUTABLE_GRANTS`, storage keys   |
| `src/features/rbac/storage/permissionConfig.storage.ts` | Current local persistence          |
| `src/app/PermissionConfigBootstrap.tsx`                 | App init hydration                 |
