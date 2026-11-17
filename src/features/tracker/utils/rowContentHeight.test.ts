import { describe, expect, it } from 'vitest';
import { TRACKER_ROW_HEIGHT } from '../constants';
import type { TrackerProject } from '../schemas/tracker.schema';
import { estimateTrackerLeftRowHeight, mergeProjectRowLayout } from './rowContentHeight';

const baseProject = (overrides: Partial<TrackerProject> = {}): TrackerProject => ({
  id: 'p1',
  name: 'Short',
  pm: 'PM',
  cm: [],
  team: [],
  totalSlides: 10,
  urgency: 'green',
  blocks: [],
  ...overrides,
});

describe('estimateTrackerLeftRowHeight', () => {
  it('stays at the base row height for short labels without Sales', () => {
    expect(estimateTrackerLeftRowHeight(baseProject())).toBe(TRACKER_ROW_HEIGHT);
  });

  it('adds Sales line height on top of wrapped project names', () => {
    const longName = 'Very Long Project Name That Wraps Across Multiple Tracker Label Lines';
    const withoutSales = estimateTrackerLeftRowHeight(baseProject({ name: longName }));
    const withSales = estimateTrackerLeftRowHeight(
      baseProject({ name: longName, salesName: 'Lan Nguyen' }),
    );
    expect(withoutSales).toBeGreaterThan(TRACKER_ROW_HEIGHT);
    expect(withSales).toBeGreaterThan(withoutSales);
  });

  it('ignores blank Sales the same as missing Sales', () => {
    expect(estimateTrackerLeftRowHeight(baseProject({ salesName: '   ' }))).toBe(
      estimateTrackerLeftRowHeight(baseProject()),
    );
  });
});

describe('mergeProjectRowLayout', () => {
  it('keeps the taller of block lanes and left-label estimate', () => {
    const project = baseProject({ salesName: 'Lan' });
    const leftHeight = estimateTrackerLeftRowHeight(project);
    const mergedShortBlocks = mergeProjectRowLayout(
      { blocks: [], rowHeight: TRACKER_ROW_HEIGHT, laneCount: 0 },
      project,
    );
    expect(mergedShortBlocks.rowHeight).toBe(leftHeight);

    const mergedTallBlocks = mergeProjectRowLayout(
      { blocks: [], rowHeight: leftHeight + 40, laneCount: 3 },
      project,
    );
    expect(mergedTallBlocks.rowHeight).toBe(leftHeight + 40);
  });
});
