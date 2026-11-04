import { describe, expect, it } from 'vitest';
import {
  buildLeaveChipByUserId,
  calendarDateKey,
  findLeaveOverlappingWindow,
  formatLeaveChipLabel,
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

  it('formats leave chip for assign picker', () => {
    expect(
      formatLeaveChipLabel({
        startDate: '2026-11-06',
        endDate: '2026-11-06',
        status: 'scheduled',
      }),
    ).toBe('Nghỉ 06/11');
    expect(
      formatLeaveChipLabel({
        startDate: '2026-11-06',
        endDate: '2026-11-08',
        status: 'scheduled',
      }),
    ).toBe('Nghỉ 06/11–08/11');
  });

  it('builds leave chips by user for today→deadline window', () => {
    const map = buildLeaveChipByUserId(
      [
        {
          userId: 'u1',
          startDate: '2026-11-06',
          endDate: '2026-11-06',
          status: 'scheduled',
        },
        {
          userId: 'u2',
          startDate: '2026-11-12',
          endDate: '2026-11-12',
          status: 'scheduled',
        },
      ],
      '2026-11-04',
      '2026-11-07',
    );
    expect(map.get('u1')).toBe('Nghỉ 06/11');
    expect(map.has('u2')).toBe(false);
  });
});
