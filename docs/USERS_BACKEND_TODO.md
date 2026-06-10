# Users — Backend API TODO

The **Users** pages (`/users`, `/users/:id`) are implemented on the frontend with **in-memory mock data** in development. Use this document when implementing the backend endpoints.

## API purpose

**Manage platform users** — admin-facing user registry with search/filter, invite (create), and profile/role editing.

This is **not** the same as:

| | Users (`/users`) | RBAC (`/roles`) | Auth / login |
|---|------------------|-----------------|--------------|
| **Purpose** | CRUD on user records (name, email, role, department, status) | Edit which roles have which permissions | Issue JWT, session, password/OAuth |
| **Audience** | Admin (`MANAGE_USERS`) | Admin (`MANAGE_USERS`) | All users |
| **v1 writes** | `POST /users`, `PATCH /users/:id` | `PUT /api/rbac/permissions` | Login endpoints (out of scope here) |

Changing a user's **role** on `/users/:id` updates their identity for permission checks. Effective permissions still come from the RBAC config ([RBAC_BACKEND_TODO.md](./RBAC_BACKEND_TODO.md)) — the backend should resolve `user.role` → permission grants on each request.

## Current frontend behavior

| Concern | Temporary solution | Location |
|---------|-------------------|----------|
| Data source | In-memory mock (10 sample users) | `src/features/users/mock/` |
| Mock toggle | `VITE_USE_USERS_MOCK` (default `true` in dev) | `src/config/env.ts` |
| API client | Calls real endpoints when mock is disabled | `src/features/users/api.ts` |
| Validation | Zod schemas at API boundary | `src/features/users/schemas/user.schema.ts` |
| UI routes | `/users` (list + invite), `/users/:id` (detail/edit) | `src/pages/UsersPage/`, `UserDetailPage/` |
| Access control | `MANAGE_USERS` (default: Admin only) | `src/config/permissions.ts`, `src/config/sidebar.ts` |

To test against a real API locally, set in `.env.local`:

```
VITE_USE_USERS_MOCK=false
```

---

## Backend API to implement

Base path assumes the same prefix as other v1 endpoints (e.g. `VITE_API_URL=https://api.pokeslide-internal.com/v1`).

```
GET    /users              → filtered user list
GET    /users/:id          → single user record (detail page)
POST   /users              → invite / create user
PATCH  /users/:id          → update user profile, role, status, department
```

All endpoints require **`MANAGE_USERS`** (Admin by default). There is **no delete** action in the v1 frontend.

---

## Response model (align with Zod schemas)

Source of truth: `src/features/users/schemas/user.schema.ts`.

### `User`

```typescript
interface User {
  id: string;
  name: string;
  email: string;                   // unique
  role:
    | 'employee'
    | 'pm'
    | 'creative_manager'
    | 'creative_head'
    | 'head'
    | 'admin';
  status: 'active' | 'inactive' | 'invited';
  department: 'project' | 'creative' | 'admin';
  joinedAt: string;                // ISO 8601 — set on create
  updatedAt?: string;              // ISO 8601 — set on update
}
```

### Role labels (UI only)

| `role` value | Display label |
|--------------|---------------|
| `employee` | Employee |
| `pm` | Project Manager |
| `creative_manager` | Creative Manager |
| `creative_head` | Creative Head |
| `head` | Department Head |
| `admin` | Admin |

### Status semantics

| `status` | Meaning | UI variant |
|----------|---------|------------|
| `active` | User can sign in and use the platform | Green pill |
| `inactive` | Account disabled; retain record | Grey pill |
| `invited` | Invite sent; not yet activated | Amber pill |

**Create flow:** the invite modal sends `CreateUserRequest` (no `status`). The server should set `status: 'invited'` and trigger the invite email/workflow. Mock behavior: `mockCreateUser` in `src/features/users/mock/users.mock.ts`.

**Update flow:** admins can change `status` (e.g. `invited` → `active` after first login, or `active` → `inactive` to offboard).

### Department labels (UI only)

| `department` | Display label |
|--------------|---------------|
| `project` | Project Department |
| `creative` | Creative Department |
| `admin` | Admin / HR |

---

### `GET /users`

Returns users for the **All users** table on `/users`.

#### Query parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `search` | string | No | Case-insensitive match against `name` or `email` |
| `role` | enum | No | One of the six `role` values above |
| `status` | enum | No | One of: `active`, `inactive`, `invited` |

Filters are combined with AND logic (same as `filterUsers` in `users.mock.ts`).

#### Response shape

```typescript
interface UserListResponse {
  items: User[];
  total: number;
}
```

Parsed with `UserListResponseSchema`.

#### Pagination note

The v1 frontend does **not** send `page` / `pageSize` query params. It loads the full filtered list and paginates in the Ant Design table client-side (`PAGINATION.DEFAULT_PAGE_SIZE`). For large orgs, backend may add optional pagination later — coordinate with frontend before changing the contract.

#### Table columns rendered in UI

| Column | Source field |
|--------|--------------|
| Name (link) | `name` → `/users/:id` |
| Email | `email` |
| Role | `role` (via `ROLE_LABELS`) |
| Department | `department` (via `DEPARTMENT_LABELS`) |
| Status | `status` (via `STATUS_LABELS`) |
| Joined | `joinedAt` (formatted `DD/MM/YYYY`) |
| View | navigates to `/users/:id` |

---

### `GET /users/:id`

Returns a single user for the detail page (`/users/:id`).

**Response:** `User` parsed with `UserSchema`.

**Errors:** `404` when user does not exist (frontend shows "User not found").

---

### `POST /users`

Creates a user and sends an invite. Used by the **Invite user** modal on `/users`.

**Permission:** `MANAGE_USERS`.

**Request body** — align with `CreateUserRequestSchema`:

```typescript
interface CreateUserRequest {
  name: string;                    // min 1 char
  email: string;                   // valid email
  role: User['role'];
  department: User['department'];
}
```

**Server-side rules:**

| Field | Rule |
|-------|------|
| `email` | Unique (case-insensitive). Return `409 Conflict` with a clear message if duplicate. |
| `status` | **Not in request** — server sets `invited` |
| `joinedAt` | Set to current timestamp |
| `id` | Server-generated |

**Invite workflow (recommended):**

1. Persist user with `status: 'invited'`.
2. Send invite email (magic link, SSO provisioning, or temp password — product decision).
3. On first successful login, transition `invited` → `active` (can be a separate auth callback, not called from this UI).

**Response:** created `User` (`201 Created`).

---

### `PATCH /users/:id`

Updates an existing user. Used by the **Save changes** form on `/users/:id`.

**Permission:** `MANAGE_USERS`.

**Request body** — align with `UpdateUserRequestSchema`:

```typescript
interface UpdateUserRequest {
  name: string;
  email: string;
  role: User['role'];
  status: User['status'];
  department: User['department'];
}
```

**Server-side rules:**

| Field | Rule |
|-------|------|
| `email` | Unique among other users (case-insensitive). Return `409` on duplicate. |
| `id`, `joinedAt` | Immutable — not in request body |
| `updatedAt` | Set to current timestamp on success |

**Role change side effects (recommended):**

- Invalidate or refresh the target user's session/JWT claims if they are logged in.
- Do **not** allow demoting the last active `admin` (return `409` or `422`).
- Optionally block self-demotion from `admin` if the actor is editing their own record.

**Response:** updated `User`.

---

## Out of scope for v1 Users API

The frontend `User` model does **not** include employee/staff codes (`PO.031`, etc.). Those appear on tasks and projects as separate `{ code, name }` pairs. A future `GET /users/staff-options` (or enriching `GET /tasks/my/staff-options` from the users table) may link `userId` to task assignees — see [MY_TASKS_BACKEND_TODO.md](./MY_TASKS_BACKEND_TODO.md).

Not implemented in v1 frontend:

- `DELETE /users/:id`
- Password reset / resend-invite buttons (backend may still support via auth service)
- Bulk import/export
- Avatar / profile photo

---

## Server-side requirements

- [ ] Authenticate all requests (JWT)
- [ ] Authorize with `MANAGE_USERS` on every endpoint
- [ ] Return ISO 8601 datetimes for `joinedAt` and `updatedAt`
- [ ] Validate enum values for `role`, `status`, `department`
- [ ] Enforce unique `email` on create and update
- [ ] Set `status: 'invited'` on create; never accept `status` on `POST /users`
- [ ] Support combined filters (`search` + `role` + `status`)
- [ ] Return `{ items, total }` where `total` matches filtered count
- [ ] Return structured error bodies the frontend can surface (`message` field) — hooks display `error.message` via Ant Design `message.error`
- [ ] Align `role` values with `ROLES` in `src/config/permissions.ts`
- [ ] Coordinate role changes with RBAC / session invalidation

### Suggested data model

| Field | Notes |
|-------|-------|
| `id` | UUID or prefixed string (`usr-…`) |
| `email` | Unique index, normalized lowercase |
| `role` | FK or enum aligned with RBAC roles |
| `department` | Org unit for reporting; independent of role |
| `status` | Lifecycle state; drives login eligibility |
| `joinedAt` | Account creation / invite timestamp |
| `updatedAt` | Last admin edit |

Optional future columns (not in v1 schema): `employeeCode`, `lastLoginAt`, `invitedBy`, `authProviderId`.

---

## Frontend migration steps (when API is ready)

1. Implement `GET /users`, `GET /users/:id`, `POST /users`, `PATCH /users/:id`.
2. Set `VITE_USE_USERS_MOCK=false` in staging/production env.
3. Verify `UserSchema` / `UserListResponseSchema` parsing passes on all responses.
4. Confirm duplicate-email errors return a human-readable `message` (mock throws `'A user with this email already exists'`).
5. Test invite flow: `POST` returns `status: 'invited'`; detail page can transition to `active` via `PATCH`.
6. Confirm `MANAGE_USERS` is enforced — non-admin users should not reach these routes (frontend guard + API).

---

## Related files

| File | Purpose |
|------|---------|
| `src/features/users/schemas/user.schema.ts` | **Source of truth** for request/response types |
| `src/features/users/api.ts` | Axios calls + mock toggle |
| `src/features/users/mock/users.mock.ts` | Reference filter and validation logic for backend parity |
| `src/features/users/constants.ts` | Role/status/department labels for UI |
| `src/features/users/components/` | List, filters, table, invite modal, detail form |
| `src/features/rbac/components/RoleAccessPreview/` | Live preview of permissions for selected role on detail page |
| `src/config/permissions.ts` | `ROLES`, `MANAGE_USERS` default grant |
| `docs/RBAC_BACKEND_TODO.md` | Permission config persistence (separate from user records) |
| `docs/BACKEND_API.md` | Index of all backend API specs |
