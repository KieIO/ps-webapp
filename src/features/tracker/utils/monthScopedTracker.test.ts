import { describe, expect, it } from 'vitest';
import type { TrackerBlock, TrackerProject } from '../schemas/tracker.schema';
import {
  filterTrackerBlocksForMonth,
  sumMonthTaskQuantity,
  withMonthScopedTrackerMetrics,
} from './monthScopedTracker';

const block = (
  partial: Pick<TrackerBlock, 'start' | 'end' | 'label'> & Partial<TrackerBlock>,
): TrackerBlock => ({
  type: 'pending',
  ...partial,
});

describe('monthScopedTracker', () => {
  const projectName = 'Altevia';

  it('keeps project bar and August task blocks only', () => {
    const blocks = [
      block({ start: '2026-05-01', end: '2026-12-31', label: projectName }),
      block({ start: '2026-07-31', end: '2026-07-31', label: 'Slides', quantity: 10 }),
      block({ start: '2026-08-03', end: '2026-08-03', label: '122 Slides', quantity: 122 }),
      block({ start: '2026-09-01', end: '2026-09-01', label: 'DA', quantity: 5 }),
    ];

    const filtered = filterTrackerBlocksForMonth(blocks, projectName, '2026-08-01', '2026-08-31');
    expect(filtered.map((entry) => entry.label)).toEqual([projectName, '122 Slides']);
  });

  it('sums task quantity for the selected month only', () => {
    const blocks = [
      block({ start: '2026-05-01', end: '2026-12-31', label: projectName }),
      block({ start: '2026-07-15', end: '2026-07-15', label: 'Slides', quantity: 1000 }),
      block({ start: '2026-08-03', end: '2026-08-03', label: 'Slides', quantity: 105 }),
      block({ start: '2026-08-05', end: '2026-08-05', label: 'Edit Feedback', quantity: 4 }),
    ];

    expect(sumMonthTaskQuantity(blocks, projectName, '2026-08-01', '2026-08-31')).toBe(109);
  });

  it('rewrites totalSlides from month scope', () => {
    const project: TrackerProject = {
      id: 'p1',
      name: projectName,
      pm: 'PM',
      cm: [],
      team: [],
      totalSlides: 9999,
      highlightSlides: true,
      urgency: 'green',
      blocks: [
        block({ start: '2026-05-01', end: '2026-12-31', label: projectName }),
        block({ start: '2026-08-03', end: '2026-08-03', label: 'Slides', quantity: 50 }),
      ],
    };

    const scoped = withMonthScopedTrackerMetrics(project, '2026-08-01', '2026-08-31');
    expect(scoped.totalSlides).toBe(50);
    expect(scoped.highlightSlides).toBe(true);
    expect(scoped.blocks).toHaveLength(2);
  });

  it('does not fall back to all-time total when the month has no quantities', () => {
    const project: TrackerProject = {
      id: 'p1',
      name: projectName,
      pm: 'PM',
      cm: [],
      team: [],
      totalSlides: 9999,
      highlightSlides: true,
      urgency: 'green',
      blocks: [
        block({ start: '2026-05-01', end: '2026-12-31', label: projectName }),
        block({ start: '2026-07-03', end: '2026-07-03', label: 'Slides' }),
      ],
    };

    const scoped = withMonthScopedTrackerMetrics(project, '2026-08-01', '2026-08-31');
    expect(scoped.totalSlides).toBe(0);
    expect(scoped.highlightSlides).toBe(false);
    expect(scoped.blocks.map((entry) => entry.label)).toEqual([projectName]);
  });

  it('attributes spanning-block quantity to the start month only', () => {
    const blocks = [
      block({ start: '2026-08-31', end: '2026-09-02', label: 'Slides', quantity: 40 }),
    ];

    expect(sumMonthTaskQuantity(blocks, projectName, '2026-08-01', '2026-08-31')).toBe(40);
    expect(sumMonthTaskQuantity(blocks, projectName, '2026-09-01', '2026-09-30')).toBe(0);
    expect(
      filterTrackerBlocksForMonth(blocks, projectName, '2026-09-01', '2026-09-30').map(
        (entry) => entry.label,
      ),
    ).toEqual(['Slides']);

    const project: TrackerProject = {
      id: 'p1',
      name: projectName,
      pm: 'PM',
      cm: [],
      team: [],
      totalSlides: 40,
      highlightSlides: false,
      urgency: 'green',
      blocks,
    };
    const september = withMonthScopedTrackerMetrics(project, '2026-09-01', '2026-09-30');
    expect(september.totalSlides).toBe(0);
    expect(september.blocks.map((entry) => entry.label)).toEqual(['Slides']);
  });
});
