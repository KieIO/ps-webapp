import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import {
  buildOvertimeWriteFields,
  hoursFromTimeRange,
  otTimeRangePastError,
  parseOtHHMM,
  shouldClearPastTimeRange,
  uniqueReasonCategories,
} from './otForm';

describe('hoursFromTimeRange', () => {
  it('floors to 2 decimals and ignores empty ranges', () => {
    const start = dayjs('2026-09-07T18:00:00');
    expect(hoursFromTimeRange([start, start.add(15, 'minute')])).toBe(0.25);
    expect(hoursFromTimeRange([start, start])).toBeUndefined();
    expect(hoursFromTimeRange(null)).toBeUndefined();
  });
});

describe('uniqueReasonCategories', () => {
  it('trims, drops blanks, and de-dupes', () => {
    expect(uniqueReasonCategories([' urgent ', '', 'urgent', 'holidays'])).toEqual([
      'urgent',
      'holidays',
    ]);
  });
});

describe('parseOtHHMM', () => {
  it('applies clock time onto the OT date', () => {
    const base = dayjs('2026-09-07');
    const parsed = parseOtHHMM('09:30', base);
    expect(parsed.format('YYYY-MM-DD HH:mm')).toBe('2026-09-07 09:30');
  });
});

describe('shouldClearPastTimeRange / otTimeRangePastError', () => {
  const now = dayjs('2026-09-07T10:00:00');
  const today = now.startOf('day');
  const pastRange: [dayjs.Dayjs, dayjs.Dayjs] = [today.hour(9).minute(0), today.hour(11).minute(0)];
  const futureRange: [dayjs.Dayjs, dayjs.Dayjs] = [
    today.hour(11).minute(0),
    today.hour(13).minute(0),
  ];

  it('clears only when the OT date is today and start is already past', () => {
    expect(shouldClearPastTimeRange(today, pastRange, now)).toBe(true);
    expect(shouldClearPastTimeRange(today, futureRange, now)).toBe(false);
    expect(shouldClearPastTimeRange(today.add(1, 'day'), pastRange, now)).toBe(false);
  });

  it('validates the same past-start rule', () => {
    expect(otTimeRangePastError(today, pastRange, now)).toMatch(/thời điểm hiện tại/);
    expect(otTimeRangePastError(today, futureRange, now)).toBeNull();
  });
});

describe('buildOvertimeWriteFields', () => {
  it('returns null when hours or reasons are missing', () => {
    const start = dayjs('2026-09-07T18:00:00');
    expect(
      buildOvertimeWriteFields({
        projectId: 'p1',
        assigneeId: 'u1',
        otDate: start,
        timeRange: [start, start],
        reasonCategories: ['urgent'],
        reason: 'need extra time',
      }),
    ).toBeNull();
  });

  it('builds the shared create/update payload', () => {
    const start = dayjs('2026-09-07T18:00:00');
    expect(
      buildOvertimeWriteFields({
        projectId: 'p1',
        assigneeId: 'u1',
        otDate: start,
        timeRange: [start, start.add(90, 'minute')],
        reasonCategories: [' urgent ', 'urgent'],
        reason: '  need extra time  ',
      }),
    ).toEqual({
      projectId: 'p1',
      assigneeId: 'u1',
      otDate: '2026-09-07',
      startTime: '18:00',
      endTime: '19:30',
      estimatedHours: 1.5,
      reasonCategories: ['urgent'],
      reason: 'need extra time',
    });
  });
});
