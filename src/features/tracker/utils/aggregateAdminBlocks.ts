import type { TrackerBlock, TrackerProject } from '../schemas/tracker.schema';

const BLOCK_TYPE_PRIORITY: Record<string, number> = {
  decline: 0,
  cancelled: 0,
  pending: 1,
  active: 2,
  completed: 3,
};

const pickDominantType = (current: string, next: string): string => {
  const curRank = BLOCK_TYPE_PRIORITY[current];
  const nextRank = BLOCK_TYPE_PRIORITY[next];
  if (curRank === undefined) return next;
  if (nextRank === undefined) return current;
  return nextRank < curRank ? next : current;
};

/**
 * Keep in sync with `formatQuantityTaskLabel` in ps-be/internal/service/tracker_service.go.
 * Prefer "122 Slides" (total qty) over "Slides ×4" (task count).
 */
export const formatQuantityTaskLabel = (
  baseLabel: string,
  quantity: number,
  count: number,
): string => {
  if (quantity > 0) {
    const rounded = Math.round(quantity);
    if (Math.abs(quantity - rounded) < 1e-9) {
      return `${rounded} ${baseLabel}`;
    }
    return `${quantity} ${baseLabel}`;
  }
  if (count > 1) {
    return `${baseLabel} ×${count}`;
  }
  return baseLabel;
};

/**
 * Inverse of `formatQuantityTaskLabel` for navigation filters.
 * "122 Slides" / "Slides ×4" → "Slides"; plain labels (including "110 Review") pass through.
 * Only strips a leading number when it matches the known aggregated quantity.
 */
export const parseTrackerTaskBaseLabel = (displayLabel: string, quantity?: number): string => {
  const label = displayLabel.trim();
  if (!label) return label;

  const countSuffix = label.match(/^(.+?)\s×\d+$/u);
  if (countSuffix?.[1]) return countSuffix[1].trim();

  if (quantity != null && quantity > 0) {
    const rounded = Math.round(quantity);
    const qtyStr = Math.abs(quantity - rounded) < 1e-9 ? String(rounded) : String(quantity);
    const prefix = `${qtyStr} `;
    if (label.startsWith(prefix)) {
      return label.slice(prefix.length).trim();
    }
  }

  return label;
};

/** Map tracker task name → Project Tasks output filter (month requires a metric). */
export const inferOutputMetricFromTaskName = (
  taskName: string,
): 'project_slides' | 'creative_da' => {
  const normalized = taskName.trim().toLowerCase().replace(/\s+/g, ' ');
  if (/^(da|edit da|rework da)(\b|$)/u.test(normalized)) {
    return 'creative_da';
  }
  return 'project_slides';
};

/**
 * Admin tracker view helper (mock parity with backend `aggregateTaskBlocksByNameAndDay`):
 * keep the project timeline bar, collapse same-day task blocks that share a task name
 * into one pill labeled with total quantity (e.g. `122 Slides`).
 *
 * Real API responses are already aggregated for admin — only the mock layer should call this.
 */
export const aggregateAdminTrackerBlocks = (project: TrackerProject): TrackerBlock[] => {
  const projectBars: TrackerBlock[] = [];
  const taskBlocks: TrackerBlock[] = [];

  for (const block of project.blocks) {
    if (block.label === project.name) {
      projectBars.push(block);
      continue;
    }
    taskBlocks.push(block);
  }

  const grouped = new Map<
    string,
    {
      start: string;
      end: string;
      label: string;
      type: TrackerBlock['type'];
      count: number;
      quantity: number;
      band?: 0 | 1;
    }
  >();

  for (const block of taskBlocks) {
    const label = block.label.trim() || '—';
    const key = `${block.start}|${block.end}|${label.toLowerCase()}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.count += 1;
      existing.type = pickDominantType(existing.type, block.type) as TrackerBlock['type'];
      existing.quantity += block.quantity ?? 0;
      continue;
    }
    grouped.set(key, {
      start: block.start,
      end: block.end,
      label,
      type: block.type,
      count: 1,
      quantity: block.quantity ?? 0,
      band: block.band,
    });
  }

  const aggregated = Array.from(grouped.values())
    .sort((a, b) => {
      if (a.start !== b.start) return a.start.localeCompare(b.start);
      return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
    })
    .map((item, index) => ({
      start: item.start,
      end: item.end,
      label: formatQuantityTaskLabel(item.label, item.quantity, item.count),
      type: item.type,
      band: (index % 2 === 0 ? 0 : 1) as 0 | 1,
      quantity: item.quantity,
    }));

  return [...projectBars, ...aggregated];
};

export const withAdminAggregatedBlocks = (
  projects: TrackerProject[],
  isAdmin: boolean,
): TrackerProject[] => {
  if (!isAdmin) return projects;
  return projects.map((project) => ({
    ...project,
    blocks: aggregateAdminTrackerBlocks(project),
  }));
};
