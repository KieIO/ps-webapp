import type { TrackerBlock, TrackerProject } from '../schemas/tracker.schema';

const slidesHighlightThreshold = 50;

/** Inclusive YYYY-MM-DD range overlap. */
export const blockOverlapsDateRange = (
  block: Pick<TrackerBlock, 'start' | 'end'>,
  rangeStart: string,
  rangeEnd: string,
): boolean => block.start <= rangeEnd && block.end >= rangeStart;

export const isProjectTimelineBar = (
  block: Pick<TrackerBlock, 'label'>,
  projectName: string,
): boolean => block.label === projectName;

/**
 * Keep the project span bar plus task blocks that overlap the selected month.
 * Aggregation labels like "Slides ×4" are already same-day — filtering by month
 * scopes them to the month picker.
 */
export const filterTrackerBlocksForMonth = (
  blocks: TrackerBlock[],
  projectName: string,
  monthStart: string,
  monthEnd: string,
): TrackerBlock[] =>
  blocks.filter(
    (block) =>
      isProjectTimelineBar(block, projectName) ||
      blockOverlapsDateRange(block, monthStart, monthEnd),
  );

/**
 * Sum task quantities whose work day (`start`) falls in the month.
 * Kept for diagnostics / tests — the Total column uses project-wide totalSlides.
 */
export const sumMonthTaskQuantity = (
  blocks: TrackerBlock[],
  projectName: string,
  monthStart: string,
  monthEnd: string,
): number => {
  let total = 0;
  for (const block of blocks) {
    if (isProjectTimelineBar(block, projectName)) continue;
    if (block.start < monthStart || block.start > monthEnd) continue;
    total += block.quantity ?? 0;
  }
  return Math.round(total);
};

/**
 * Month picker only filters which task blocks render on the timeline.
 * Total / highlight stay project-wide (API totalSlides), not recomputed per month.
 */
export const withMonthScopedTrackerMetrics = (
  project: TrackerProject,
  monthStart: string,
  monthEnd: string,
): TrackerProject => {
  const blocks = filterTrackerBlocksForMonth(project.blocks, project.name, monthStart, monthEnd);
  const totalSlides = Math.round(project.totalSlides);
  return {
    ...project,
    blocks,
    totalSlides,
    highlightSlides:
      project.urgency === 'red' ||
      project.urgency === 'orange' ||
      project.highlightSlides ||
      totalSlides >= slidesHighlightThreshold,
  };
};
