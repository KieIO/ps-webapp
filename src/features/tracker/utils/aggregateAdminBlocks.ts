import type { TrackerBlock, TrackerProject } from '../schemas/tracker.schema';

const BLOCK_TYPE_PRIORITY: Record<string, number> = {
  decline: 0,
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
 * Admin tracker view helper (mock parity with backend `aggregateTaskBlocksByNameAndDay`):
 * keep the project timeline bar, collapse same-day task blocks that share a task name
 * into one pill labeled `Name ×N`.
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
      continue;
    }
    grouped.set(key, {
      start: block.start,
      end: block.end,
      label,
      type: block.type,
      count: 1,
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
      label: item.count > 1 ? `${item.label} ×${item.count}` : item.label,
      type: item.type,
      band: (index % 2 === 0 ? 0 : 1) as 0 | 1,
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
