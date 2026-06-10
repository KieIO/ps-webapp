# Project Tracker — Backend API TODO

The **Project Tracker** page (`/tracker`) is a **calendar timeline view** for Head / Admin to monitor project schedules, urgency, team off-days, and timeline blocks. The frontend uses **in-memory mock data** in development.

> **Note:** The legacy table-based tracker (`features/tracker/`, `GET /tracker` list + summary) was removed. This spec describes the **current** calendar tracker only.

## API purpose

**Operational monitoring** — calendar-style view with per-project timeline blocks, urgency indicators, team members, slide counts, and org off-days.

This is **not** the same as `GET /projects` (see [PROJECTS_BACKEND_TODO.md](./PROJECTS_BACKEND_TODO.md)). The Projects API is the **master registry** (evaluation levels, brief, department head, etc.). The Tracker API is a **read-only operational view** optimized for the calendar UI.

| | Project Tracker (`GET /tracker`) | Projects (`GET /projects`) |
|---|----------------------------------|----------------------------|
| **Purpose** | Calendar monitoring — blocks, urgency, off-days | List / edit project records (registry) |
| **Audience** | Head, Admin (`VIEW_CAPACITY_FULL`) | PM and above (`MANAGE_PROJECTS`) |
| **UI** | Timeline calendar at `/tracker` | Table at `/projects` |
| **Writes** | None in v1 (read-only) | `POST` / `PATCH` / `DELETE` |

## Current frontend behavior

| Concern | Temporary solution | Location |
|---------|-------------------|----------|
| Data source | In-memory mock | `src/features/tracker/mock/` |
| Mock toggle | `VITE_USE_TRACKER_MOCK` (default `true` in dev) | `src/config/env.ts` |
| API client | Calls real endpoint when mock is disabled | `src/features/tracker/api.ts` |
| Validation | Zod schemas at API boundary | `src/features/tracker/schemas/tracker.schema.ts` |
| UI route | `/tracker` (flush layout) | `src/pages/ProjectTrackerPage/` |
| Legacy redirect | `/v2/tracker` → `/tracker` | `src/app/router.tsx` |
| Access control | `VIEW_CAPACITY_FULL` (default: Head, Admin) | `src/config/permissions.ts` |

To test against a real API locally:

```
VITE_USE_TRACKER_MOCK=false
```

---

## Backend API to implement

```
GET /tracker → calendar tracker data (projects + off-days)
```

Requires **`VIEW_CAPACITY_FULL`**. Read-only in v1.

> **Backend note:** Implement as a dedicated query that assembles calendar rows — not an alias of `GET /projects`. The response shape is defined below.

### Response shape

Align with `TrackerResponseSchema` in `src/features/tracker/schemas/tracker.schema.ts`:

```typescript
interface TrackerResponse {
  projects: TrackerProject[];
  offDays: TrackerOffDay[];
}

interface TrackerProject {
  id: string;
  name: string;
  pm: string;                      // display name
  team: string[];                  // team member display names
  totalSlides: number;
  highlightSlides?: boolean;         // highlight count when urgent / large
  urgency: 'red' | 'orange' | 'green' | 'gray';
  blocks: TrackerBlock[];
}

interface TrackerBlock {
  start: string;                   // YYYY-MM-DD inclusive
  end: string;                     // YYYY-MM-DD inclusive
  label: string;
  type: 'active' | 'pending' | 'completed';
  band?: 0 | 1;                    // 0 = top band, 1 = bottom band
}

interface TrackerOffDay {
  date: string;                    // YYYY-MM-DD
  names: string[];                 // staff on leave
}
```

### UI mapping

| UI element | Source |
|------------|--------|
| Project rows | `projects[]` |
| PM / team / slides columns | `pm`, `team`, `totalSlides` |
| Urgency dot color | `urgency` |
| Timeline bars | `blocks[]` |
| Off-day row | `offDays[]` |
| CSV export | Client-side from loaded `projects` |

---

## Server-side requirements

- [ ] Authenticate all requests (JWT)
- [ ] Authorize with `VIEW_CAPACITY_FULL`
- [ ] Return dates as `YYYY-MM-DD` for block/off-day fields (ISO dates acceptable if consistent)
- [ ] Sort `projects` in a stable order (e.g. by name or urgency)
- [ ] Do not expose project registry-only fields (`volume`, `nature`, `brief`, etc.) on this endpoint

---

## Frontend migration steps (when API is ready)

1. Implement `GET /tracker` matching `TrackerResponseSchema`.
2. Set `VITE_USE_TRACKER_MOCK=false` in staging/production env.
3. Verify Zod parsing passes in `trackerApi.getData()`.
4. Remove mock folder when no longer needed for local dev.

---

## Related files

| File | Purpose |
|------|---------|
| `src/features/tracker/schemas/tracker.schema.ts` | **Source of truth** for response types |
| `src/features/tracker/api.ts` | Axios calls + mock toggle |
| `src/features/tracker/mock/` | Reference fixtures |
| `src/features/tracker/components/ProjectTrackerView/` | Calendar UI |
| `docs/BACKEND_API.md` | Index of all backend API specs |
