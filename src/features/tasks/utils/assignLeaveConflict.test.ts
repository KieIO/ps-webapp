import { describe, expect, it } from 'vitest';
import {
  calendarDateKey,
  findLeaveOverlappingWindow,
  formatLeaveRangeLabel,
  rangesOverlap,
} from './assignLeaveConflict';

describe('assignLeaveConflict', () => {
  it('parses calendar date keys', () => {
    expect(calendarDateKey('2026-11-07')).toBe('2026-11-07');
    expect(calendarDateKey('2026-11-07T16:02:00Z')).toBe('2026-11-07');
    expect(calendarDateKey('bad')).toBeNull();
  });

  it('detects range overlap', () => {
    expect(rangesOverlap('2026-11-07', '2026-11-07', '2026-11-03', '2026-11-11')).toBe(true);
    expect(rangesOverlap('2026-11-12', '2026-11-12', '2026-11-03', '2026-11-11')).toBe(false);
  });

  it('finds leave inside today→deadline window (case 3→11, leave 7)', () => {
    const hit = findLeaveOverlappingWindow(
      [
        {
          startDate: '2026-11-07',
          endDate: '2026-11-07',
          status: 'scheduled',
        },
      ],
      '2026-11-03',
      '2026-11-11',
    );
    expect(hit).toEqual({
      startDate: '2026-11-07',
      endDate: '2026-11-07',
      status: 'scheduled',
    });
    expect(formatLeaveRangeLabel(hit!)).toBe('2026-11-07');
  });

  it('ignores ended/cancelled and leave fully after deadline', () => {
    expect(
      findLeaveOverlappingWindow(
        [{ startDate: '2026-11-07', endDate: '2026-11-07', status: 'ended' }],
        '2026-11-03',
        '2026-11-11',
      ),
    ).toBeNull();
    expect(
      findLeaveOverlappingWindow(
        [{ startDate: '2026-11-12', endDate: '2026-11-13', status: 'scheduled' }],
        '2026-11-03',
        '2026-11-11',
      ),
    ).toBeNull();
  });
});
