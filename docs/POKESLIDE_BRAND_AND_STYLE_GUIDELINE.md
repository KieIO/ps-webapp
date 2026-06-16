# Pokeslide Internal Platform — Brand & Style Guideline

This document describes the design system, brand colors, typography, and styling conventions used across the **Pokeslide Internal Platform** — a unified system covering manager/admin surfaces (PM, Creative Manager, Creative Head, Department Head, Admin) and the Employee-facing App. All screens share a single design system to ensure visual and behavioral consistency.

> **Tech Stack:** React 19 + Ant Design 6
> **Scope:** Admin UI + Employee App (shared design system)
> **Theme:** Light only

---

## 1. Color Palette

### Primary Colors

| Token              | Hex       | Usage                                                                           |
| ------------------ | --------- | ------------------------------------------------------------------------------- |
| **Primary**        | `#2563EB` | Primary buttons, links, selected states, active menu items, progress indicators |
| **Primary light**  | `#3B82F6` | Icons, accents, hover states                                                    |
| **Primary subtle** | `#EFF6FF` | Highlighted rows, selected backgrounds, tag fills                               |

> **Rationale:** Blue conveys reliability and focus — appropriate for a productivity platform used daily by creative teams. Avoids the aggressive feel of pure black or overly "startup" feel of purple/teal.

### Neutral Colors

| Token             | Value     | Usage                                        |
| ----------------- | --------- | -------------------------------------------- |
| **Background**    | `#FFFFFF` | Main background, cards, sidebar, header      |
| **Surface**       | `#F8FAFC` | Page background, table stripe, subtle panels |
| **Text primary**  | `#0F172A` | Main headings, key labels                    |
| **Text body**     | `#334155` | Body text, descriptions                      |
| **Text muted**    | `#64748B` | Secondary labels, metadata, captions         |
| **Text disabled** | `#94A3B8` | Placeholder, disabled state text             |

### Status Colors

| Token              | Hex       | Usage                                          |
| ------------------ | --------- | ---------------------------------------------- |
| **Success**        | `#16A34A` | Task completed, on-track status, positive KPI  |
| **Warning**        | `#D97706` | Approaching deadline, capacity near limit      |
| **Error / Danger** | `#DC2626` | Overdue, failed submission, destructive action |
| **Info**           | `#0284C7` | Informational banners, neutral alerts          |

### Borders & Dividers

| Token              | Value     | Usage                                       |
| ------------------ | --------- | ------------------------------------------- |
| **Border default** | `#E2E8F0` | Input outlines, card borders, table borders |
| **Divider subtle** | `#F1F5F9` | List item separators, section dividers      |

### Special — Login Page

| Token              | Value                                               | Usage                                     |
| ------------------ | --------------------------------------------------- | ----------------------------------------- |
| **Login gradient** | `linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)` | Full-page background for the login screen |

> Dark navy-to-blue gradient — professional, calm, signals a serious internal tool.

---

## 2. CSS Variables (Design Tokens)

Define these in your global stylesheet:

```css
:root {
  /* Backgrounds */
  --color-bg: #ffffff;
  --color-surface: #f8fafc;

  /* Text */
  --color-text: #0f172a;
  --color-text-body: #334155;
  --color-text-muted: #64748b;
  --color-text-disabled: #94a3b8;

  /* Brand */
  --color-primary: #2563eb;
  --color-primary-light: #3b82f6;
  --color-primary-subtle: #eff6ff;

  /* Status */
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-error: #dc2626;
  --color-info: #0284c7;

  /* Borders */
  --color-border: #e2e8f0;
  --color-divider: #f1f5f9;
}
```

---

## 3. Typography

### Font Family

```css
font-family:
  'Inter',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  sans-serif;
```

> **Primary:** Inter (import via Google Fonts or self-host).
> **Fallback:** System font stack for reliability in all environments.

### Base Styles

| Property           | Value                    |
| ------------------ | ------------------------ |
| **Base font size** | `14px`                   |
| **Line height**    | `1.6`                    |
| **Color**          | `var(--color-text-body)` |

### Type Scale

| Element                | Font Size      | Font Weight | Notes                                      |
| ---------------------- | -------------- | ----------- | ------------------------------------------ |
| **Page title**         | `24px`         | `600`       | e.g. "Dashboard", "My Tasks", "Reports"    |
| **Section title**      | `18px`         | `600`       | Card headers, modal titles                 |
| **Subsection heading** | `16px`         | `500`       | Group labels within a form or table        |
| **Body**               | `14px`         | `400`       | Default paragraph and label text           |
| **Small / caption**    | `12px`         | `400`–`500` | Metadata, timestamps, tags                 |
| **Muted**              | same as parent | `400`       | Use `color: var(--color-text-muted)`       |
| **Logo / Brand**       | `18px`         | `700`       | Sidebar logo text; `letter-spacing: 0.3px` |

### Text Rules

- No uppercase buttons or labels
- Max line width for readable content: `680px`
- Line height for body text: `1.6`
- Line height for headings: `1.3`

---

## 4. Spacing & Layout

### Content Area

| Property               | Value                |
| ---------------------- | -------------------- |
| **Page padding**       | `24px`               |
| **Content max-width**  | `1440px`             |
| **Min content height** | `calc(100vh - 64px)` |

### Component Spacing

| Context                         | Value         |
| ------------------------------- | ------------- |
| **Page title margin bottom**    | `4px`         |
| **Page subtitle margin bottom** | `24px`        |
| **Section gap**                 | `24px`–`32px` |
| **Card internal padding**       | `24px`        |
| **Form field vertical gap**     | `16px`        |
| **Inline element gap**          | `8px`, `12px` |

### Layout Dimensions

| Element                       | Value    |
| ----------------------------- | -------- |
| **Sidebar width (expanded)**  | `240px`  |
| **Sidebar width (collapsed)** | `64px`   |
| **Sidebar logo area height**  | `64px`   |
| **Sidebar logo padding-left** | `20px`   |
| **Top header height**         | `64px`   |
| **Header padding**            | `0 24px` |

### Spacing Token Reference

Base unit: `4px`. Use multiples:

```
4px / 8px / 12px / 16px / 20px / 24px / 32px / 40px / 48px
```

---

## 5. Shadows

| Context                | Value                                                           |
| ---------------------- | --------------------------------------------------------------- |
| **Card / panel**       | `0 1px 4px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.06)` |
| **Login card**         | `0 8px 32px rgba(0, 0, 0, 0.16)`                                |
| **Header**             | `0 1px 3px rgba(0, 0, 0, 0.08)`                                 |
| **Dropdown / popover** | `0 4px 16px rgba(0, 0, 0, 0.12)`                                |

---

## 6. Borders & Radius

| Element                              | Value                             |
| ------------------------------------ | --------------------------------- |
| **Border width**                     | `1px`                             |
| **Border color**                     | `var(--color-border)` → `#E2E8F0` |
| **Border radius — inputs & buttons** | `6px`                             |
| **Border radius — cards & modals**   | `8px`                             |
| **Border radius — tags & pills**     | `4px` or `100px` (pill)           |

---

## 7. Login Page Specifics

- **Background:** `linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)`
- **Layout:** Centered vertically and horizontally with flexbox
- **Card max-width:** `420px`, full width on small screens
- **Card radius:** `12px`
- **Card shadow:** `0 8px 32px rgba(0, 0, 0, 0.16)`
- **Card title:** Center-aligned, `20px`, `font-weight: 600`
- **Logo:** Displayed above the card title, centered

---

## 8. UI Component Library — Ant Design 6

The Pokeslide platform uses **Ant Design 6** with a customized theme token set:

```javascript
// theme/antd.config.js
const pokeslideTheme = {
  token: {
    colorPrimary: '#2563EB',
    colorSuccess: '#16A34A',
    colorWarning: '#D97706',
    colorError: '#DC2626',
    colorInfo: '#0284C7',

    colorBgBase: '#FFFFFF',
    colorTextBase: '#0F172A',
    colorBorder: '#E2E8F0',

    borderRadius: 6,
    fontSize: 14,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

    boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
  },
};

export default pokeslideTheme;
```

Apply via `<ConfigProvider theme={pokeslideTheme}>` at the app root.

---

## 9. Status Pills / Tags

Used across task lists, project cards, and user management screens.

| Status          | Background | Text Color | Usage                 |
| --------------- | ---------- | ---------- | --------------------- |
| **Completed**   | `#DCFCE7`  | `#16A34A`  | Task/project done     |
| **In Progress** | `#DBEAFE`  | `#2563EB`  | Active work           |
| **Pending**     | `#FEF9C3`  | `#A16207`  | Waiting for action    |
| **Overdue**     | `#FEE2E2`  | `#DC2626`  | Past deadline         |
| **On Leave**    | `#F1F5F9`  | `#64748B`  | Employee availability |

Pills use `border-radius: 100px`, font size `12px`, padding `2px 10px`.

---

## 10. Key Screens — Layout Reference

### 10.1 Dashboard (manager-level roles)

- Card grid: 2–4 columns depending on viewport
- Summary metrics at top (KPI cards)
- Quick-action buttons per role

### 10.2 Task Management (Employee)

- Full-width table or kanban view
- Filter bar at top (status, assignee, deadline)
- Status pill per row

### 10.3 Capacity Dashboard (manager-level roles)

- Calendar-style or bar chart view
- Color-coded by capacity usage level
- Per-person and team aggregate views

### 10.4 Form Pages (any role)

- Centered column, max-width `700px`
- Step-by-step vertical layout
- Progress indicator optional

### 10.5 User Management (MANAGE_USERS)

- Search + filter bar
- Editable table rows
- Role badge and status pill per user

### 10.6 Reports & Export (roles with `EXPORT_REPORT`)

- Filter section at top
- Table or chart below
- Export button (top-right)

---

## 11. Implementation Checklist for Frontend Team

Use this when setting up a new screen or feature:

1. [ ] Apply `<ConfigProvider theme={pokeslideTheme}>` at app root with the Ant Design token config above.
2. [ ] Define all CSS variables in `:root` (Section 2).
3. [ ] Set base font (Inter) and base font-size `14px`, line-height `1.6` on `html`/`body`.
4. [ ] Page titles: `24px`, `font-weight: 600`, `color: var(--color-text)`.
5. [ ] Subtitles / descriptions: `color: var(--color-text-muted)`.
6. [ ] Use `var(--color-primary)` — `#2563EB` — for all primary actions, links, active states.
7. [ ] Use `var(--color-border)` — `#E2E8F0` — for all borders and input outlines.
8. [ ] Status pills: use the color table in Section 9, never arbitrary colors.
9. [ ] Login screen: use the navy-to-blue gradient background (Section 7).
10. [ ] Sidebar: expanded `240px`, collapsed `64px`, header `64px` height.
11. [ ] Cards: `border-radius: 8px`, padding `24px`, shadow per Section 5.
12. [ ] All spacing must use the 4px base token grid (Section 4).

---

## 12. Quick Reference — Copy-Paste Snippet

```scss
// ─── Design Tokens ───────────────────────────────────
:root {
  --color-bg: #ffffff;
  --color-surface: #f8fafc;
  --color-text: #0f172a;
  --color-text-body: #334155;
  --color-text-muted: #64748b;
  --color-text-disabled: #94a3b8;
  --color-primary: #2563eb;
  --color-primary-light: #3b82f6;
  --color-primary-subtle: #eff6ff;
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-error: #dc2626;
  --color-border: #e2e8f0;
  --color-divider: #f1f5f9;
}

// ─── Base Typography ─────────────────────────────────
html,
body {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-body);
  background-color: var(--color-surface);
}

// ─── Page Title ──────────────────────────────────────
.pageTitle {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 4px;
}

.pageSubtitle {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0 0 24px;
}

// ─── Card ────────────────────────────────────────────
.card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 24px;
  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.06),
    0 4px 16px rgba(0, 0, 0, 0.06);
}

// ─── Status Pill ─────────────────────────────────────
.statusPill {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
}

// ─── Login Background ────────────────────────────────
.loginBackground {
  background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

_Pokeslide Internal Platform — Design System v1.0 | Prepared by GoWare JSC | June 2026 | Internal use only_
