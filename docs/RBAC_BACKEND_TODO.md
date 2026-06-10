# RBAC Backend — TODO

The permission matrix is **editable in the UI** but persists to **`localStorage`** only. Use this checklist when the backend is ready.

## Current frontend behavior

| Concern | Temporary solution | Location |
|---------|-------------------|----------|
| Permission storage | `localStorage` key `pokeslide:rbac-config` | `src/features/rbac/storage/permissionConfig.storage.ts` |
| Defaults | `PERMISSIONS` in code | `src/config/permissions.ts` |
| Runtime checks | Redux `permissionConfig` + `permission` slices | `src/store/slices/permissionConfigSlice.ts` |
| Audit trail | Last 50 changes in `localStorage` | `StoredRbacData.auditLog` |
| Admin UI | `/roles` — editable matrix | `src/pages/RolesPage/` |

## Backend API to implement

```
GET    /api/rbac/permissions          → PermissionConfigMap (all roles)
PUT    /api/rbac/permissions          → replace full config (admin only)
POST   /api/rbac/permissions/reset    → restore code defaults (admin only)
GET    /api/rbac/audit                → paginated audit log
```

### Response shape (align with frontend)

```typescript
// Same as src/features/rbac/types.ts
interface PermissionConfigMap {
  MANAGE_PROJECTS: Role[];
  ASSIGN_TASK: Role[];
  // ... all keys from PERMISSIONS
}

interface RbacConfigResponse {
  config: PermissionConfigMap;
  updatedAt: string;
  source: 'default' | 'database';
}
```

## Frontend migration steps

1. **Add `env.useRbacApi`** (or use real API when `useAuthMock` is false).
2. **Update `permissionConfig.storage.ts`**:
   - `loadPermissionConfig()` → fetch `GET /api/rbac/permissions` first; fall back to defaults on error.
   - `savePermissionConfig()` → `PUT /api/rbac/permissions`; remove `localStorage.setItem` in production.
   - Keep `localStorage` as offline/dev fallback if desired.
3. **Hydrate on app load** — `PermissionConfigBootstrap` already dispatches `hydratePermissionConfig()`; point hydration at API.
4. **Login flow** — after JWT, fetch RBAC config before `syncUserPermissions()` (or include permissions in login response).
5. **Audit log page** — wire `AuditLogPage` to `GET /api/rbac/audit` instead of placeholder.
6. **Remove or gate localStorage** — add migration: on first API success, clear `pokeslide:rbac-config` from localStorage.

## Server-side requirements

- [ ] Store config in DB (JSON column or `role_permission` join table)
- [ ] Enforce `IMMUTABLE_GRANTS` server-side (`MANAGE_USERS`, `VIEW_AUDIT_LOG` always include `admin`)
- [ ] Validate permission keys against an allowlist (same keys as `PERMISSIONS`)
- [ ] Validate role keys against `ROLES` enum
- [ ] Record audit: actor user id, timestamp, diff of changes
- [ ] Admin-only middleware on write endpoints
- [ ] Optional: include effective permissions in JWT claims (short TTL) or fetch on each session

## Route guards note

`ProtectedRoute` in `router.tsx` still uses **hard-coded role lists** for some routes (e.g. Creative Head-only pages). When backend RBAC is live, consider aligning route guards with permission keys or a `canAccessRoute(role, route)` helper fed by the same config.

## localStorage key reference

```
Key:     pokeslide:rbac-config
Version: 1
Shape:   StoredRbacData (see src/features/rbac/types.ts)
```

## Related files

- `docs/BACKEND_API.md` — index of all backend API specs
- `src/config/permissions.ts` — default permission map
- `src/config/permissionModules.ts` — UI module grouping
- `src/features/rbac/` — RBAC feature module
- `src/app/PermissionConfigBootstrap.tsx` — app init hydration
