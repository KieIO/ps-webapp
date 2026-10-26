import { describe, expect, it } from 'vitest';
import {
  assertCreativeDeadlineNotAfterPm,
  calendarDateFromTaskDeadline,
  clampDeadlineToProjectRange,
  creativeDeadlineDisabledTime,
  defaultTaskDeadline,
  formatTaskDateTime,
  fromTaskDeadline,
  isCreativeDeadlineAfterPmDeadline,
  isCreativeDeadlineDayAfterPm,
  isCreativeDeadlineIsoAfterPm,
  isOutsideProjectDateRange,
  normalizeTaskDateEnd,
  normalizeTaskDateStart,
  toTaskDateOnly,
  toTaskDeadline,
} from './taskDates';
import dayjs from 'dayjs';

describe('taskDates', () => {
  it('serializes picker dates as calendar-only strings', () => {
    expect(toTaskDateOnly(dayjs('2026-06-13'))).toBe('2026-06-13');
  });

  it('serializes picker datetimes as UTC wall-clock ISO', () => {
    expect(toTaskDeadline(dayjs('2026-06-13T18:30:00'))).toBe('2026-06-13T18:30:00Z');
  });

  it('rejects a creative deadline later than the PM deadline', () => {
    const pm = dayjs('2026-10-28T17:22:00');
    const later = dayjs('2026-10-30T17:22:00');
    const same = dayjs('2026-10-28T17:22:00');
    expect(isCreativeDeadlineAfterPmDeadline(later, pm)).toBe(true);
    expect(isCreativeDeadlineAfterPmDeadline(same, pm)).toBe(false);
    expect(isCreativeDeadlineDayAfterPm(later, pm)).toBe(true);
    expect(isCreativeDeadlineDayAfterPm(same, pm)).toBe(false);
    expect(creativeDeadlineDisabledTime(same, pm).disabledHours?.()).toEqual([
      18, 19, 20, 21, 22, 23,
    ]);
    expect(creativeDeadlineDisabledTime(same, pm).disabledMinutes?.(17)).toEqual(
      Array.from({ length: 37 }, (_, index) => 23 + index),
    );
    expect(creativeDeadlineDisabledTime(later, pm).disabledHours).toBeUndefined();
    expect(isCreativeDeadlineIsoAfterPm('2026-10-30T17:22:00Z', '2026-10-28T17:22:00Z')).toBe(true);
    expect(isCreativeDeadlineIsoAfterPm('2026-10-28T17:22:00Z', '2026-10-28T17:22:00Z')).toBe(
      false,
    );
    expect(() =>
      assertCreativeDeadlineNotAfterPm('2026-10-30T17:22:00Z', '2026-10-28T17:22:00Z'),
    ).toThrow(/không được sau deadline PM/);
  });

  it('loads stored deadlines into picker wall-clock values', () => {
    expect(fromTaskDeadline('2026-06-13T18:30:00Z').format('YYYY-MM-DD HH:mm')).toBe(
      '2026-06-13 18:30',
    );
  });

  it('defaults create deadline to the current time (minute precision)', () => {
    const before = dayjs().second(0).millisecond(0);
    const value = defaultTaskDeadline();
    const after = dayjs().second(0).millisecond(0);
    expect(value.isSame(before) || value.isAfter(before)).toBe(true);
    expect(value.isSame(after) || value.isBefore(after)).toBe(true);
    expect(value.second()).toBe(0);
  });

  it('normalizes start and end of the same UTC day', () => {
    expect(normalizeTaskDateStart('2026-06-13')).toBe('2026-06-13T00:00:00.000Z');
    expect(normalizeTaskDateEnd('2026-06-13T00:00:00.000Z')).toBe('2026-06-13T23:59:59.000Z');
  });

  it('formats UTC day boundaries without local timezone shift', () => {
    expect(formatTaskDateTime('2026-06-13T00:00:00.000Z')).toBe('13/06/2026 00:00:00');
    expect(formatTaskDateTime('2026-06-13T23:59:59.000Z')).toBe('13/06/2026 23:59:59');
  });

  it('extracts calendar date from UTC wall-clock deadlines without local shift', () => {
    expect(calendarDateFromTaskDeadline('2026-09-25T17:08:00Z')).toBe('2026-09-25');
    expect(calendarDateFromTaskDeadline('2026-09-25T00:00:00.000Z')).toBe('2026-09-25');
    expect(calendarDateFromTaskDeadline('not-a-date')).toBeNull();
  });

  it('disables dates outside inclusive project start/end', () => {
    expect(isOutsideProjectDateRange(dayjs('2026-10-19'), '2026-10-20', '2026-11-03')).toBe(true);
    expect(isOutsideProjectDateRange(dayjs('2026-10-20'), '2026-10-20', '2026-11-03')).toBe(false);
    expect(isOutsideProjectDateRange(dayjs('2026-11-03'), '2026-10-20', '2026-11-03')).toBe(false);
    expect(isOutsideProjectDateRange(dayjs('2026-11-04'), '2026-10-20', '2026-11-03')).toBe(true);
    expect(isOutsideProjectDateRange(dayjs('2026-10-01'), null, null)).toBe(false);
  });

  it('clamps deadline calendar day into project range while keeping time', () => {
    const before = dayjs('2026-10-15T23:53:00');
    const clampedStart = clampDeadlineToProjectRange(before, '2026-10-20', '2026-11-03');
    expect(clampedStart.format('YYYY-MM-DD HH:mm')).toBe('2026-10-20 23:53');

    const after = dayjs('2026-11-10T09:00:00');
    const clampedEnd = clampDeadlineToProjectRange(after, '2026-10-20', '2026-11-03');
    expect(clampedEnd.format('YYYY-MM-DD HH:mm')).toBe('2026-11-03 09:00');
  });
});
