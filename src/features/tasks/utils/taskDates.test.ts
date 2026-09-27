import { describe, expect, it } from 'vitest';
import {
  calendarDateFromTaskDeadline,
  defaultTaskDeadline,
  formatTaskDateTime,
  fromTaskDeadline,
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
});
