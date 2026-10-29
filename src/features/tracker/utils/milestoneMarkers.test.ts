import { describe, expect, it } from 'vitest';
import type { ProjectMilestone } from '@/features/projects/schemas/milestone.schema';
import {
  filterMilestonesInMonth,
  formatMilestoneNameNote,
  formatMilestoneQuantity,
  groupMilestonesByDate,
  isMilestoneGroupCompleted,
  isMilestoneGroupOutsideTimeline,
} from './milestoneMarkers';

const m = (
  overrides: Partial<ProjectMilestone> & Pick<ProjectMilestone, 'id' | 'deadlineDate'>,
): ProjectMilestone => ({
  name: 'Mốc',
  outsideTimeline: false,
  quantity: 10,
  unit: 'slides',
  note: '',
  completed: false,
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
    expect(
      formatMilestoneQuantity(
        m({ id: '4', deadlineDate: '2026-09-10', quantity: 100, unit: 'others' }),
      ),
    ).toBe('100 Others');
  });

  it('returns null when volume is empty', () => {
    expect(
      formatMilestoneQuantity(m({ id: '3', deadlineDate: '2026-09-10', quantity: null, unit: '' })),
    ).toBeNull();
  });
});

describe('formatMilestoneNameNote', () => {
  it('joins name and note for empty-volume quick view', () => {
    expect(
      formatMilestoneNameNote(
        m({
          id: '1',
          deadlineDate: '2026-09-10',
          name: 'Kickoff',
          note: 'Họp nội bộ',
          quantity: null,
          unit: '',
        }),
      ),
    ).toBe('Kickoff - Họp nội bộ');
  });

  it('returns name only when note is empty', () => {
    expect(
      formatMilestoneNameNote(
        m({
          id: '1',
          deadlineDate: '2026-09-10',
          name: 'Kickoff',
          note: '  ',
          quantity: null,
          unit: '',
        }),
      ),
    ).toBe('Kickoff');
  });
});

describe('isMilestoneGroupCompleted', () => {
  it('is green only when every milestone in the day group is completed', () => {
    expect(
      isMilestoneGroupCompleted([
        m({ id: '1', deadlineDate: '2026-09-10', completed: true }),
        m({ id: '2', deadlineDate: '2026-09-10', completed: true }),
      ]),
    ).toBe(true);
    expect(
      isMilestoneGroupCompleted([
        m({ id: '1', deadlineDate: '2026-09-10', completed: true }),
        m({ id: '2', deadlineDate: '2026-09-10', completed: false }),
      ]),
    ).toBe(false);
  });
});

describe('isMilestoneGroupOutsideTimeline', () => {
  it('is amber when every incomplete milestone is outside timeline', () => {
    expect(
      isMilestoneGroupOutsideTimeline([
        m({ id: '1', deadlineDate: '2026-09-10', outsideTimeline: true }),
        m({ id: '2', deadlineDate: '2026-09-10', outsideTimeline: true, completed: true }),
      ]),
    ).toBe(true);
    expect(
      isMilestoneGroupOutsideTimeline([
        m({ id: '1', deadlineDate: '2026-09-10', outsideTimeline: true }),
        m({ id: '2', deadlineDate: '2026-09-10', outsideTimeline: false }),
      ]),
    ).toBe(false);
  });
});
