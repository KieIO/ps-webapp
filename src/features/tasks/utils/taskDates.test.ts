import { describe, expect, it } from 'vitest';
import {
  formatTaskDateTime,
  normalizeTaskDateEnd,
  normalizeTaskDateStart,
  toTaskDateOnly,
} from './taskDates';
import dayjs from 'dayjs';

describe('taskDates', () => {
  it('serializes picker dates as calendar-only strings', () => {
    expect(toTaskDateOnly(dayjs('2026-06-13'))).toBe('2026-06-13');
  });

  it('normalizes start and end of the same UTC day', () => {
    expect(normalizeTaskDateStart('2026-06-13')).toBe('2026-06-13T00:00:00.000Z');
    expect(normalizeTaskDateEnd('2026-06-13T00:00:00.000Z')).toBe('2026-06-13T23:59:59.000Z');
  });

  it('formats UTC day boundaries without local timezone shift', () => {
    expect(formatTaskDateTime('2026-06-13T00:00:00.000Z')).toBe('13/06/2026 00:00:00');
    expect(formatTaskDateTime('2026-06-13T23:59:59.000Z')).toBe('13/06/2026 23:59:59');
  });
});
