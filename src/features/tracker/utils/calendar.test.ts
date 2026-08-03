import { describe, expect, it } from 'vitest';
import {
  TRACKER_INITIAL_LOOKBACK_DAYS,
  TRACKER_RANGE_END,
  TRACKER_RANGE_START,
} from '../constants';
import {
  buildCalendarDays,
  getBlockPosition,
  getAdminZoomDayWidth,
  getFittedDayWidth,
  getInitialScrollDayIndex,
  getInitialScrollLeft,
} from './calendar';

describe('calendar initial scroll', () => {
  const days = buildCalendarDays(TRACKER_RANGE_START, TRACKER_RANGE_END, '2026-07-08');

  it('anchors two days before today', () => {
    const todayIndex = days.findIndex((day) => day.date === '2026-07-08');
    expect(todayIndex).toBeGreaterThanOrEqual(TRACKER_INITIAL_LOOKBACK_DAYS);

    expect(getInitialScrollDayIndex(days, '2026-07-08', TRACKER_INITIAL_LOOKBACK_DAYS)).toBe(
      todayIndex - TRACKER_INITIAL_LOOKBACK_DAYS,
    );
    expect(getInitialScrollLeft(days, '2026-07-08', TRACKER_INITIAL_LOOKBACK_DAYS)).toBe(
      (todayIndex - TRACKER_INITIAL_LOOKBACK_DAYS) * 28,
    );
  });

  it('clamps lookback when today is near range start', () => {
    expect(getInitialScrollDayIndex(days, '2026-05-01', TRACKER_INITIAL_LOOKBACK_DAYS)).toBe(0);
  });

  it('clips block to visible month range', () => {
    const julyDays = buildCalendarDays('2026-07-01', '2026-07-31', '2026-07-08');
    const clippedAtStart = getBlockPosition(julyDays, '2026-06-25', '2026-07-05');
    const clippedAtEnd = getBlockPosition(julyDays, '2026-07-28', '2026-08-03');

    expect(clippedAtStart).toEqual({ left: 1, width: 5 * 28 - 2 });
    expect(clippedAtEnd).toEqual({ left: 27 * 28 + 1, width: 4 * 28 - 2 });
  });

  it('expands day width to fill available panel width', () => {
    expect(getFittedDayWidth(31, 1240)).toBeCloseTo(1240 / 31);
    expect(getFittedDayWidth(31, 400)).toBe(28);
  });

  it('applies admin zoom as a minimum day width', () => {
    expect(getAdminZoomDayWidth(31, 1240, null)).toBeCloseTo(1240 / 31);
    expect(getAdminZoomDayWidth(31, 400, 52)).toBe(52);
    expect(getAdminZoomDayWidth(31, 1860, 52)).toBeCloseTo(1860 / 31);
  });
});
