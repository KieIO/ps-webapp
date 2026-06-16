─────────────────────────────────
UI/UX DESIGN GUIDELINE DOCUMENT
For Pokeslide Internal Platform
(Admin UI + Employee App — Shared Design System)
─────────────────────────────────

1. Design Principles

1.1 Productive and Focused
• The interface must help users complete tasks quickly and without distraction
• Avoid decorative elements, excessive color, and visual noise
• Every screen should feel organized, scannable, and action-oriented

1.2 Role-Aware Clarity
• Different roles (Employee, PM, Creative Manager, Creative Head, Department Head, Admin) have different needs — but the same visual language
• Prioritize the most-used actions per role; hide or de-emphasize secondary actions
• Forms, tables, and status indicators are the primary interaction patterns

1.3 Consistency
• All components follow a single spacing system, typography scale, and semantic color tokens
• Interactions behave identically across Admin UI and Employee App
• Status colors, labels, and icons must have the same meaning everywhere

1.4 Accessibility First
• Minimum contrast: WCAG AA
• Keyboard navigation: required across all interactive elements
• Focus states must be visible and consistent

───────────────────────────────── 2. Color Guidelines (Light Theme)

2.1 Semantic Colors
These must be used instead of arbitrary hex values.
Define them as Ant Design ConfigProvider tokens (see Section 15).

Primary
Hex: #2563EB
Alt: #3B82F6
Usage: primary buttons, links, active menu items, selected states, progress bars

Secondary
Hex: #64748B
Usage: secondary buttons, supporting UI, muted labels

Success
Hex: #16A34A
Usage: task completed, on-track status, positive KPI indicators

Warning
Hex: #D97706
Usage: approaching deadline, capacity near limit, alerts requiring attention

Error / Danger
Hex: #DC2626
Usage: overdue tasks, form errors, destructive actions

Info
Hex: #0284C7
Usage: informational banners, neutral system alerts

2.2 Neutral (Text & Backgrounds)

Text primary: #0F172A → headings, key labels
Text body: #334155 → default body text, descriptions
Text muted: #64748B → metadata, captions, secondary labels
Text disabled: #94A3B8 → placeholder, disabled state

Background: #F8FAFC → page background
Surface: #FFFFFF → cards, panels, sidebar, header
Table row alt: #F8FAFC → alternating row (even rows)
Table row base: #FFFFFF → alternating row (odd rows)

2.3 Border & Divider

Border: #E2E8F0 → inputs, card outlines, table borders
Divider: #F1F5F9 → list separators, section dividers

2.4 Status Pill Colors

Completed bg: #DCFCE7 text: #16A34A
In Progress bg: #DBEAFE text: #2563EB
Pending bg: #FEF9C3 text: #A16207
Overdue bg: #FEE2E2 text: #DC2626
On Leave bg: #F1F5F9 text: #64748B

───────────────────────────────── 3. Typography

Font Family
• Primary: Inter (import via Google Fonts or self-host)
• Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

Scale
• Page title: 24px, semibold (600)
• Section title: 18px, semibold (600)
• Subsection: 16px, medium (500)
• Body text: 14px, regular (400)
• Caption / meta: 12px, regular (400)–medium (500)
• Logo / brand: 18px, bold (700), letter-spacing: 0.3px

Text Rules
• No uppercase buttons or labels
• Max readable line width: 680px
• Line height — body: 1.6 / headings: 1.3
• Muted text: always use color token, never reduce font size below 12px

───────────────────────────────── 4. Spacing & Layout

4.1 Spacing System
Base unit: 4px. All spacing must use multiples of 4.
Token set: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48px

Rules
• Vertical spacing between form fields: 16px
• Section spacing: 24–32px
• Card internal padding: 24px
• Dashboard gutters: 24–32px
• Table cell padding: 12–16px
• Inline element gap: 8–12px

4.2 Layout Dimensions

Max content width: 1440px
Form content width: 680–780px (centered column)
Sidebar — expanded: 240px
Sidebar — collapsed: 64px
Top header height: 64px
Header padding: 0 24px

4.3 Component Density
Medium → balanced breathing room, optimized for frequent daily use

• Input height: 40px
• Button height: 40px
• Table row height: 44–48px
• Tag / pill height: 22–24px

───────────────────────────────── 5. Navigation

Sidebar (Primary Navigation)
• Expanded width: 240px / Collapsed: 64px
• Background: #FFFFFF with 1px right border #E2E8F0
• Logo area height: 64px
• Support collapse toggle at bottom

Top Header Bar
• Height: 64px
• Background: #FFFFFF
• Bottom shadow: 0 1px 3px rgba(0,0,0,0.08)
• Contains: page breadcrumb (left), user avatar + notifications (right)

Navigation Principles
• Use Ant Design Menu component with accessible primitives
• Max 2 levels of navigation depth
• Group items by role context (My Work / Team / Management / Admin)

Active States
• Left sidebar: primary color background pill + primary text
• Top tabs (if used): primary color underline, 2px
• Must be clearly distinguishable from hover state

───────────────────────────────── 6. Cards & Panels

Card Structure
• Title (16–18px, medium weight)
• Optional subtitle or meta (14px, text muted)
• Main content area
• Action(s) — aligned right (header) or bottom (footer)
• Consistent padding: 24px

Visual Style
• Background: #FFFFFF
• Border: 1px solid #E2E8F0
• Border radius: 8px
• Shadow: 0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)

KPI / Summary Cards (Dashboard)
• Larger number display (28–32px, semibold)
• Icon or trend indicator
• Compact height: ~100–120px

───────────────────────────────── 7. Forms (High Priority Component)

7.1 General Rules
• Vertical, step-by-step structure — one logical group per section
• Each field clearly labeled above the input
• Required fields marked with asterisk (\*)
• Helper text appears below the field, not above
• Section titles group related fields visually

7.2 Field Types Supported
• Text input
• Number input
• Radio group
• Checkbox / Checkbox group
• Date picker (single & range)
• Textarea
• Select / Autocomplete
• File upload (for attachments)
• Time input (for logging work hours)

7.3 Interaction Rules
• Error message appears immediately below the field
• Error color: #DC2626
• Focus ring: 2px, #2563EB (primary)
• Field width: full-width within the form column (680–780px)
• Disabled fields: background #F1F5F9, text #94A3B8

7.4 Field Grouping Examples (Pokeslide-specific)

Task Logging Form:
Project (select)
Task name (text input)
Work type (radio: Project / Non-project)
Hours spent (number input)
Date (date picker)
Notes (textarea, optional)

Review / Evaluation Form:
Reviewer (auto-filled)
Reviewee (select)
Quality score (radio group 1–5)
Productivity score (radio group 1–5)
Comments (textarea)

7.5 Submit Buttons
• Primary action: left-aligned or centered within the form column
• Button height: 40px (md size)
• Use "Save" for drafts, "Submit" for final actions
• Always include a Cancel or Back option

───────────────────────────────── 8. Tables & Data Visualization

8.1 Table Style
• Row height: 44–48px
• Alternating row background: #FFFFFF / #F8FAFC
• Sticky header
• Header: semibold, 13–14px, text color #0F172A
• Sort icon: right-aligned, visible on hover (always visible on active column)
• Border: 1px #E2E8F0 (horizontal lines only; avoid vertical grid lines)

8.2 Data Density
Medium — not compact. Users review task lists and performance data regularly;
cramped layouts cause errors and fatigue.

8.3 Interactions
• Row hover: background #EFF6FF (primary subtle)
• Clickable rows: show pointer cursor
• Status column: always use StatusPill component (see Section 2.4)
• Date format: DD/MM/YYYY
• Empty state: centered illustration + descriptive message + primary action button

8.4 Pokeslide-specific Columns (reference)

Task Table: Task name / Project / Assignee / Status / Due date / Hours / Actions
Project Table: Project code / Client / PM / Status / V1 deadline / Capacity / Actions
User Table: Name / Role / Department / Status / Last active / Actions
Report Table: Period / Employee / Productivity % / Quality score / KPI / Actions

───────────────────────────────── 9. Buttons

Ant Design Variants

Primary (type="primary")
• Background: #2563EB
• Hover: #1D4ED8 (slightly darker)
• Disabled: background #E2E8F0, text #94A3B8

Secondary (default)
• Background: #FFFFFF
• Border: 1px #E2E8F0
• Hover: background #F8FAFC

Danger (danger={true})
• Background: #DC2626
• Hover: #B91C1C

Text / Link buttons
• No border, no background
• Use for low-priority inline actions only

Size
• Default: 40px height (Ant Design "middle")
• Icon-only buttons: 32–36px
• Never use "small" (32px) for primary actions

───────────────────────────────── 10. Icons

Icon Style
• Use Ant Design Icons (outlined variant) as the default set
• Supplement with Lucide Icons (outlined) when Ant Design lacks coverage
• Never mix outlined and filled styles within the same screen
• Consistent stroke width across all icons

Usage
• Navigation icons: 16–18px
• Action buttons: 14–16px
• Status indicators: 14px
• Empty state illustrations: 48–64px (use simple SVG, not photos)

Meaning must be consistent:
• Clock icon → time / duration
• User icon → assignee / person
• Chart icon → performance / KPI
• Check icon → completed / approved
• Warning triangle → overdue / at risk

───────────────────────────────── 11. Feedback & Alerts

Use Ant Design's Alert and notification components.
Severity categories: info / success / warning / error

Inline Alerts (Banner)
• Appear above the relevant content area
• Padding: 12px 16px
• Use muted backgrounds matching status token (not full-saturation colors)
• Include an icon + message + optional action link

Toast Notifications (Ant Design message / notification)
• Duration: 3–4 seconds
• Position: top-right
• Use for: save success, submit confirmation, background task completion
• Keep message short: ≤ 2 lines

Confirmation Dialogs (Ant Design Modal / Popconfirm)
• Use Popconfirm for simple destructive actions (delete, revoke)
• Use Modal for actions requiring additional input before confirming

───────────────────────────────── 12. Interaction & Motion Guidelines

Motion
• Subtle transitions appropriate for a productivity tool — not a marketing site
• Duration: 150–200ms
• Easing: ease-out for entering elements, ease-in for exiting
• No bouncy, elastic, or decorative animations

Hover / Active States
• Buttons: background shifts 1 shade darker (#2563EB → #1D4ED8)
• Table rows: background #EFF6FF
• Menu items: background #F1F5F9 (hover), #DBEAFE + primary text (active)
• Must always be visually distinguishable

Focus States
• 2px solid outline, color: #2563EB (primary)
• Offset: 2px from element edge
• Required on all interactive elements — inputs, buttons, links, menu items

───────────────────────────────── 13. Page Templates

13.1 Dashboard (manager-level roles)
• KPI card row at top (2–4 cards)
• Secondary content: chart or summary table below
• Quick-action buttons per role (e.g. "Log Time", "Review Task", "Export Report")
• Card grid: 2–4 columns depending on viewport

13.2 Task / Work Logging (Employee)
• My Tasks table — full width
• Filter bar at top: status / project / date range
• "Log Time" primary button — top right
• Empty state when no tasks assigned

13.3 Form Page (any role)
• Centered content column, max-width 680–780px
• Page title + short description at top
• Section headings group related fields
• Progress steps optional (for multi-step forms)
• Sticky footer with Submit / Cancel on long forms

13.4 Capacity Dashboard (Head)
• Date range selector at top
• Per-person capacity bar or calendar heatmap
• Team aggregate summary
• Exportable view

13.5 Submission / Review Page (PM / Head)
• Filter controls at top (date, employee, status)
• Table below with sortable columns
• Row-level actions: View / Approve / Return
• Export button — top right

13.6 User Management (Admin)
• Search bar + role/status filter
• Editable table rows
• StatusPill per user (Active / Inactive / On Leave)
• Invite user button — top right

───────────────────────────────── 14. Design Dos & Don'ts

Do
• Keep every screen minimal and purposeful
• Use consistent spacing from the 4px token grid
• Use semantic color tokens — never hardcode hex values outside the token file
• Follow the typography hierarchy strictly
• Always show empty states with a clear next action
• Use StatusPill for every status indicator — never plain text alone

Don't
• Add decorative borders, dividers, or background patterns not in the system
• Overuse colors — status colors are reserved for status only
• Mix outlined and filled icons on the same screen
• Use compact table density — it causes errors in daily review workflows
• Show raw timestamps — always format as DD/MM/YYYY or relative ("2 days ago")
• Use modal dialogs for navigation — modals are for actions only

───────────────────────────────── 15. Implementation Notes for Frontend Team (React 19 + Ant Design 6)

Ant Design Theme Setup
Apply the Pokeslide token config via ConfigProvider at the app root:

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
}
};

  <ConfigProvider theme={pokeslideTheme}>
    <App />
  </ConfigProvider>

CSS Variables
Define in global stylesheet for use outside Ant Design components:

:root {
--color-bg: #F8FAFC;
--color-surface: #FFFFFF;
--color-text: #0F172A;
--color-text-body: #334155;
--color-text-muted: #64748B;
--color-text-disabled: #94A3B8;
--color-primary: #2563EB;
--color-primary-light: #3B82F6;
--color-primary-subtle: #EFF6FF;
--color-success: #16A34A;
--color-warning: #D97706;
--color-error: #DC2626;
--color-border: #E2E8F0;
--color-divider: #F1F5F9;
}

Rules
• All components must use Ant Design variants or CSS variables — no inline hex values
• Use Ant Design Form components for all form fields (built-in accessibility)
• Spacing must use the 4px token grid — no arbitrary pixel values
• Icons: Ant Design Icons (outlined) by default; Lucide as supplement only

Reusable Components to Build
• PageHeader — title + subtitle + breadcrumb + right-side actions
• KPICard — metric display card for dashboards
• CardWrapper — standard card with consistent border/shadow/padding
• FormFieldWrapper — label + input + helper text + error state
• TableWrapper — table with sticky header, empty state, loading state
• FilterSection — search input + filter selects + reset button
• StatusPill — colored pill using Section 2.4 token map
• SidebarLayout — expandable/collapsible sidebar + header shell

─────────────────────────────────
Pokeslide Internal Platform — Design Guideline v1.0
Prepared by GoWare JSC | June 2026 | Internal use only
─────────────────────────────────
