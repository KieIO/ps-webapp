import { describe, expect, it } from 'vitest';
import type { ProjectMilestone } from '@/features/projects/schemas/milestone.schema';
import {
  filterMilestonesInMonth,
  formatMilestoneQuantity,
  groupMilestonesByDate,
} from './milestoneMarkers';

const m = (
  overrides: Partial<ProjectMilestone> & Pick<ProjectMilestone, 'id' | 'deadlineDate'>,
): ProjectMilestone => ({
  name: 'Mốc',
  quantity: 10,
  unit: 'slides',
  note: '',
  ...overrides,
});

describe('groupMilestonesByDate', () => {
  it('merges only same calendar day', () => {
    const groups = groupMilestonesByDate([
      m({ id: '1', deadlineDate: '2026-09-10', name: 'A' }),
      m({ id: '2', deadlineDate: '2026-09-10T15:00:00.000Z', name: 'B' }),
      m({ id: '3', deadlineDate: '2026-09-11', name: 'C' }),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0]?.dateKey).toBe('2026-09-10');
    expect(groups[0]?.milestones).toHaveLength(2);
    expect(groups[1]?.milestones).toHaveLength(1);
  });
});

describe('filterMilestonesInMonth', () => {
  it('keeps deadlines in the selected month only', () => {
    const result = filterMilestonesInMonth(
      [m({ id: '1', deadlineDate: '2026-09-10' }), m({ id: '2', deadlineDate: '2026-10-01' })],
      { year: 2026, month: 9 },
    );
    expect(result.map((item) => item.id)).toEqual(['1']);
  });
});

describe('formatMilestoneQuantity', () => {
  it('formats slides and DA labels', () => {
    expect(formatMilestoneQuantity(m({ id: '1', deadlineDate: '2026-09-10', quantity: 12 }))).toBe(
      '12 Slides',
    );
    expect(
      formatMilestoneQuantity(m({ id: '2', deadlineDate: '2026-09-10', quantity: 3, unit: 'da' })),
    ).toBe('3 DA');
  });
});
