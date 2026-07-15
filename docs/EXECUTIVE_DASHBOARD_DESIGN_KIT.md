# Portable Executive Dashboard Design Kit

**Version:** 1.0  
**Purpose:** Reproduce the same calm, data-first dashboard design language across unrelated projects  
**Scope:** Visual language, layout, component recipes, responsive behavior, interaction states, and accessibility  
**Not included:** Product metrics, authorization, API contracts, business terminology, or framework-specific architecture

This document is intentionally portable. Copy it into another project and provide it to a designer,
developer, or AI agent as the visual source of truth.

## 1. Design intent

The dashboard should feel:

- Professional and operational, not promotional.
- Dense enough for leadership scanning without feeling cramped.
- Calm: mostly white and slate neutrals with restrained categorical color.
- Data-first: numbers and trends lead; decoration supports hierarchy only.
- Trustworthy: zero, unavailable, loading, and error states are never conflated.

The first viewport should follow this reading flow:

1. Reporting title and period.
2. Three primary category/health metrics.
3. Four supporting metrics.
4. Two trend charts.
5. Activity, alerts, or notifications.

## 2. Portable design tokens

Use these values directly or map them to the host project's token system.

```css
:root {
  /* Surfaces */
  --dash-bg: #ffffff;
  --dash-surface: #f8fafc;

  /* Text */
  --dash-text: #0f172a;
  --dash-text-body: #334155;
  --dash-text-muted: #64748b;
  --dash-text-disabled: #94a3b8;

  /* Structure */
  --dash-border: #e2e8f0;
  --dash-divider: #f1f5f9;

  /* Brand and data series */
  --dash-primary: #2563eb;
  --dash-primary-subtle: #eff6ff;
  --dash-company: #0f766e;
  --dash-company-tint: #f0fdfa;
  --dash-series-a: #2563eb;
  --dash-series-a-tint: #eff6ff;
  --dash-series-b: #7c3aed;
  --dash-series-b-tint: #f5f3ff;

  /* Semantic states */
  --dash-success: #16a34a;
  --dash-warning: #d97706;
  --dash-danger: #dc2626;
  --dash-info: #0284c7;

  /* Geometry */
  --dash-radius-control: 6px;
  --dash-radius-panel: 8px;
  --dash-radius-kpi: 10px;
  --dash-gap: 16px;
  --dash-section-gap: 20px;

  /* Elevation */
  --dash-shadow-kpi: 0 1px 3px rgb(15 23 42 / 5%);
  --dash-shadow-panel: 0 1px 4px rgb(0 0 0 / 6%), 0 4px 16px rgb(0 0 0 / 6%);
}
```

### Color semantics

| Token           | Meaning                                                |
| --------------- | ------------------------------------------------------ |
| Company teal    | Aggregate or organization-wide series                  |
| Series A blue   | First department, team, product, or comparison series  |
| Series B purple | Second department, team, product, or comparison series |
| Red             | Error or explicit threshold only                       |
| Green           | Confirmed success only                                 |

Categorical colors must not be interpreted as success or failure. Do not introduce new colors when
the same series appears in another component.

## 3. Typography

Preferred font:

```css
font-family:
  Inter,
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  sans-serif;
```

| Element                  | Size      | Weight | Line height |
| ------------------------ | --------- | ------ | ----------- |
| Page title               | `24px`    | `600`  | `1.3`       |
| Panel title              | `18px`    | `600`  | `1.3`       |
| Primary metric value     | `34px`    | `700`  | `1`         |
| Supporting metric value  | `27px`    | `700`  | `1.15`      |
| Unavailable metric value | `19px`    | `600`  | `1.25`      |
| KPI label                | `13px`    | `600`  | `1.35`      |
| Body / panel subtitle    | `14px`    | `400`  | `1.5`       |
| KPI hint                 | `12px`    | `400`  | `1.45`      |
| Chart axis / legend      | `11–12px` | `400`  | `1.3`       |

Rules:

- Numbers are the strongest visual anchor.
- Labels identify the metric; hints explain its basis.
- Use negative letter spacing only on large numeric values.
- Do not shrink essential copy to solve layout problems; allow wrapping or reflow the grid.

## 4. Spacing and page shell

Use a 4px spacing system:

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48px`

Recommended shell:

- Maximum content width: `1440px`.
- Content alignment: left-aligned, not centered as a narrow column.
- Desktop page padding: `24px`.
- Dashboard section gap: `20px`.
- Card grid gap: `16px`.
- Bottom page padding: at least `24px`.
- Header-to-content spacing: `24px`.

Avoid combining a parent `gap` with large child margins. One layout owner should control spacing
between regions.

## 5. Page composition

```text
┌──────────────────────────────────────────────────────────────┐
│ Page title + subtitle                          Period picker │
├──────────────────────────────────────────────────────────────┤
│ Primary metric │ Primary metric │ Primary metric             │
├──────────────────────────────────────────────────────────────┤
│ Stat │ Stat │ Stat │ Stat                                     │
├──────────────────────────────────────────────────────────────┤
│ Trend chart A                 │ Trend chart B                 │
├──────────────────────────────────────────────────────────────┤
│ Activity / alerts / notifications                            │
└──────────────────────────────────────────────────────────────┘
```

Recommended hierarchy:

- Row 1: broad health/category metrics.
- Row 2: output, quality, timing, or cost metrics.
- Row 3: trends and comparisons.
- Final row: recent activity or system communication.

Do not reorder these regions solely to fill empty space. Preserve the scanning narrative.

## 6. Component recipes

### 6.1 Page header

Structure:

- Left: title and one-line subtitle.
- Right: reporting-period control and optional secondary action.

Recipe:

```css
.dashboardHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.dashboardTitle {
  margin: 0 0 4px;
  color: var(--dash-text);
  font-size: 24px;
  font-weight: 600;
  line-height: 1.3;
}

.dashboardSubtitle {
  margin: 0;
  color: var(--dash-text-muted);
  font-size: 14px;
}
```

On narrow screens, actions move below the title and the period control fits the available width.

### 6.2 Primary tinted metric card

Use for three organization/category metrics at the top.

Anatomy:

1. Label.
2. Large value.
3. Outlined icon in a tinted container.
4. Short hint.
5. Compact period indicators or mini-bars.

Base recipe:

```css
.primaryMetricCard {
  --card-accent: var(--dash-series-a);
  --card-tint: var(--dash-series-a-tint);

  min-width: 0;
  padding: 20px;
  border: 1px solid color-mix(in srgb, var(--card-accent) 20%, var(--dash-border));
  border-radius: var(--dash-radius-kpi);
  background: linear-gradient(135deg, var(--card-tint), #fff 78%);
  box-shadow: var(--dash-shadow-kpi);
}
```

Gradient:

- Direction: `135deg`, top-left to bottom-right.
- Start: the series tint.
- Fade to white by `78%`.
- Keep saturation low; the metric must dominate the card.

Series variants:

```css
.companyMetric {
  --card-accent: var(--dash-company);
  --card-tint: var(--dash-company-tint);
}

.seriesAMetric {
  --card-accent: var(--dash-series-a);
  --card-tint: var(--dash-series-a-tint);
}

.seriesBMetric {
  --card-accent: var(--dash-series-b);
  --card-tint: var(--dash-series-b-tint);
}
```

Icon:

```css
.metricIcon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  color: var(--card-accent);
  border-radius: 9px;
  background: color-mix(in srgb, var(--card-accent) 10%, white);
}
```

Mini-bars:

```css
.miniBars {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(36px, 1fr));
  gap: 8px;
  margin-top: 18px;
}

.miniBarTrack {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--card-accent) 10%, white);
}

.miniBarFill {
  height: 100%;
  border-radius: inherit;
  background: var(--card-accent);
}
```

Cap visual width at 100%, but preserve the uncapped value in text or tooltip.

### 6.3 Supporting statistic card

Use for the second KPI row.

```css
.statCard {
  min-width: 0;
  padding: 18px;
  border: 1px solid var(--dash-border);
  border-radius: var(--dash-radius-kpi);
  background: var(--dash-bg);
  box-shadow: var(--dash-shadow-kpi);
}

.statValue {
  margin-top: 16px;
  color: var(--dash-text);
  font-size: 27px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.6px;
}

.statUnavailable {
  color: var(--dash-text-muted);
  font-size: 19px;
  font-weight: 600;
}
```

Use one outlined icon, `18px`, in a `34×34px` primary-subtle container. Icons support recognition;
they are not controls.

### 6.4 Standard panel

Use for charts, activity, alerts, and notifications.

```css
.dashboardPanel {
  min-width: 0;
  padding: 24px;
  border: 1px solid var(--dash-border);
  border-radius: var(--dash-radius-panel);
  background: var(--dash-bg);
  box-shadow: var(--dash-shadow-panel);
}

.panelHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
```

Header anatomy:

- Title at `18px/600`.
- Optional subtitle at `14px`, muted, `4px` below title.
- Optional action aligned right.

### 6.5 Activity or notification panel

- Full-width below charts.
- Show unread count or scope in subtitle.
- Keep row density medium.
- Recommended scroll-body maximum height: `380px`.
- Separate rows with subtle dividers.
- Use relative timestamp or a consistent locale date.
- Mark unread state with both visual weight and a non-color cue.
- Empty, loading, and error states remain inside the panel.

## 7. Chart recipes

### 7.1 Shared chart language

- Plot height: approximately `290px`.
- Card background: solid white.
- Horizontal grid only.
- Grid: `#E2E8F0`, dash `3 3`.
- Axis and legend: `11–12px`, `#64748B`.
- X-axis baseline: `#E2E8F0`.
- Hide Y-axis line and tick lines.
- Legend below plot and allowed to wrap.
- Tooltip shows exact value, unit, series name, and period.
- Disable decorative animation for stable operational reading.
- Never rely on color alone; retain labels and legend.

### 7.2 Workload or magnitude trend

Use a monotone area chart when the value represents magnitude, utilization, or pressure.

Series A:

```text
Stroke: #2563EB, 2.25px
Area gradient 5%: #2563EB at opacity .20
Area gradient 95%: #2563EB at opacity 0
```

Series B:

```text
Stroke: #7C3AED, 2.25px
Area gradient 5%: #7C3AED at opacity .18
Area gradient 95%: #7C3AED at opacity 0
```

The area fades to transparency, not white, so grid lines remain visible.

Optional threshold:

```text
Stroke: #DC2626
Dash: 5 5
Label size: 10px
```

The Y-axis starts at zero and may extend past 100% when the metric can exceed capacity.

### 7.3 Rate or productivity trend

Use a monotone line chart when comparing rates.

- Fixed Y-domain: `0–100%`.
- No area fill.
- Series A: `#2563EB`.
- Series B: `#7C3AED`.
- Line width: `2.5px`.
- Point radius: `3px`.
- Active point radius: `5px`.

Area and line charts intentionally look different:

- Area communicates magnitude and pressure.
- Line communicates rate comparison.

### 7.4 Sparse and unavailable chart states

- A flat zero line is valid only when zero is a computed result.
- Unavailable data uses a clear panel-level empty state, not a fabricated zero line.
- Missing periods are not interpolated unless the product explicitly defines interpolation.
- Tooltip or accessible summary must expose denominators for percentage metrics.

## 8. Responsive layout

Recommended grid:

| Width         | Primary metrics | Supporting metrics | Trend panels |
| ------------- | --------------- | ------------------ | ------------ |
| `>1180px`     | 3 columns       | 4 columns          | 2 columns    |
| `1081–1180px` | 3 columns       | 2 columns          | 2 columns    |
| `881–1080px`  | 3 columns       | 2 columns          | 1 column     |
| `561–880px`   | 1 column        | 2 columns          | 1 column     |
| `≤560px`      | 1 column        | 1 column           | 1 column     |

Rules:

- Grid gap remains `16px`.
- DOM order matches reading order.
- Cards use `min-width: 0`.
- Header actions stack below the title at `≤560px`.
- Period control becomes full-width when needed.
- At `≤600px`, the chart plot may use `-8px` inline margin to recover width.
- Support at least `320px` viewport and 200% text zoom without horizontal page scrolling.
- Long unavailable text wraps instead of shrinking.
- Legends wrap without covering the plot.

## 9. State model

### Loading

- Keep page title and selected period visible.
- Use skeletons shaped like KPI and chart regions.
- During period changes, prefer retaining prior content with a clear refreshing indicator.
- Do not replace the entire application shell with a spinner.

### Error

- Show an inline alert above dashboard content.
- Include a short message and retry action.
- Never replace failed data with hardcoded business values.
- Independent panels should continue working when their own data source succeeds.

### Zero

- Show numeric zero when calculation succeeded and zero is meaningful.
- Keep the normal typography and unit.

### Unavailable

- Show `No data` or localized equivalent.
- Use muted `19px/600` styling.
- Include one short reason.
- Do not display `0` when no valid denominator or source record exists.

### Empty activity

- Keep the panel and its title visible.
- Use a concise empty message.
- Add an action only when the user can resolve the empty state.

## 10. Data presentation rules

Although this kit defines no business logic, every implementation must follow:

- Display unit in the label, value, or hint.
- Label estimated values explicitly.
- Percentages expose numerator/denominator when available.
- Use locale-aware number grouping.
- Distinguish zero, unavailable, loading, and error.
- Card and related chart use the same period and definition.
- Never generate fake trend points for visual balance.

## 11. Accessibility

- All controls are keyboard accessible with visible focus.
- Period selector has an accessible name.
- Decorative icons are hidden from assistive technology.
- Color is never the only series identifier.
- Text and controls meet WCAG AA contrast.
- Respect `prefers-reduced-motion`.
- Layout remains usable at 200% text zoom.

Charts and mini-bars need a nonvisual equivalent:

- Visually hidden summary, or
- Accessible data table, or
- Keyboard-accessible “View data” disclosure.

Pointer-only tooltips are not an accessible equivalent.

## 12. Framework adaptation

This kit is framework-neutral. Equivalent implementations may use:

- React, Vue, Svelte, Angular, or server-rendered templates.
- CSS Modules, CSS-in-JS, utility CSS, or plain stylesheets.
- Recharts, Chart.js, ECharts, D3, or another accessible chart library.
- Any component library that can reproduce the tokens and behavior.

Preserve outcomes, not library mechanics:

- Same hierarchy and responsive reflow.
- Same categorical color identity.
- Same restrained gradients and elevation.
- Same data-state semantics.
- Same accessible interaction.

When the host project already has a design system:

1. Map this kit to existing semantic tokens.
2. Reuse shared page header, panel, alert, skeleton, and date controls.
3. Document intentional visual differences.
4. Do not create duplicate global primitives solely for one dashboard.

## 13. Implementation checklist

### Visual

- [ ] Three top metrics use teal, blue, and purple identity.
- [ ] Capacity gradient fades to white by 78%.
- [ ] Supporting cards remain white and visually quieter.
- [ ] Magnitude chart uses translucent area fills.
- [ ] Rate chart uses lines without fills.
- [ ] Borders and shadows remain subtle.

### Layout

- [ ] Page follows header → primary metrics → secondary metrics → trends → activity.
- [ ] Responsive behavior matches Section 8.
- [ ] No horizontal overflow at 320px or 200% zoom.
- [ ] Header period control stacks cleanly on mobile.

### Data states

- [ ] Zero, unavailable, loading, and error are distinct.
- [ ] No hardcoded business values or fake points.
- [ ] Units and estimated values are labelled.
- [ ] Percentage denominators are discoverable.

### Accessibility

- [ ] Keyboard and focus behavior work.
- [ ] Charts have a textual or tabular equivalent.
- [ ] Series meaning is not color-only.
- [ ] Reduced-motion preference is respected.

### Quality

- [ ] Test desktop, tablet, mobile, sparse data, all-zero data, unavailable data, and API error.
- [ ] Capture a visual-regression reference at a documented viewport and fixture.
- [ ] Record any host-design-system deviations.

## 14. Recommended prompt for another project

```text
Implement the dashboard using
@docs/EXECUTIVE_DASHBOARD_DESIGN_KIT.md as the visual and interaction source of truth.

Adapt component/library mechanics to this project, but preserve the design tokens,
information hierarchy, card recipes, chart language, responsive behavior,
data-state semantics, and accessibility requirements.

Do not copy business logic, labels, roles, or API assumptions from another product.
```

For consistent visual comparison, attach a reference screenshot and specify:

- Viewport width and height.
- Browser zoom.
- Data fixture.
- Font availability.
- Light/dark theme.

The document alone defines the system; the screenshot validates visual fidelity.
