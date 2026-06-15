import { describe, expect, it } from 'vitest';
import { normalizeTaskDateEnd, normalizeTaskDateStart, toTaskDateOnly } from './taskDates';
import dayjs from 'dayjs';

describe('taskDates', () => {
  it('serializes picker dates as calendar-only strings', () => {
    expect(toTaskDateOnly(dayjs('2026-06-13'))).toBe('2026-06-13');
  });

  it('normalizes start and end of the same UTC day', () => {
    expect(normalizeTaskDateStart('2026-06-13')).toBe('2026-06-13T00:00:00.000Z');
    expect(normalizeTaskDateEnd('2026-06-13T00:00:00.000Z')).toBe('2026-06-13T23:59:59.000Z');
  });
});
