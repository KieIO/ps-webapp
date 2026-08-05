import dayjs from 'dayjs';
import {
  TRACKER_DAY_WIDTH,
  TRACKER_RANGE_END,
  TRACKER_RANGE_START,
  TRACKER_TODAY,
} from '../constants';
import type { CalendarDay, CalendarMonth } from '../types';

const MONTH_LABELS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const;

export const buildCalendarDays = (
  start = TRACKER_RANGE_START,
  end = TRACKER_RANGE_END,
  today = TRACKER_TODAY,
): CalendarDay[] => {
  const days: CalendarDay[] = [];
  let cursor = dayjs(start).startOf('day');
  const last = dayjs(end).startOf('day');

  while (cursor.isBefore(last) || cursor.isSame(last, 'day')) {
    const dayOfWeek = cursor.day();

    days.push({
      key: cursor.format('YYYY-MM-DD'),
      date: cursor.format('YYYY-MM-DD'),
      dayOfMonth: cursor.date(),
      dayOfWeek,
      monthKey: cursor.format('YYYY-MM'),
      monthLabel: MONTH_LABELS[cursor.month()] ?? cursor.format('MMM').toUpperCase(),
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isToday: cursor.format('YYYY-MM-DD') === today,
    });

    cursor = cursor.add(1, 'day');
  }

  return days;
};

export const buildCalendarMonths = (days: CalendarDay[]): CalendarMonth[] => {
  const months: CalendarMonth[] = [];

  days.forEach((day) => {
    const existing = months.find((month) => month.key === day.monthKey);
    if (existing) {
      existing.dayCount += 1;
      return;
    }

    months.push({
      key: day.monthKey,
      label: day.monthLabel,
      year: dayjs(day.date).year(),
      dayCount: 1,
    });
  });

  return months;
};

export const getFittedDayWidth = (
  dayCount: number,
  availableWidth: number,
  minDayWidth = TRACKER_DAY_WIDTH,
): number => {
  if (dayCount <= 0) return minDayWidth;
  return Math.max(minDayWidth, availableWidth / dayCount);
};

/** Day zoom: keep fit-to-panel, or enforce a wider day column (may require horizontal scroll). */
export const getAdminZoomDayWidth = (
  dayCount: number,
  availableWidth: number,
  zoomWidth: number | null,
): number => {
  const fitted = getFittedDayWidth(dayCount, availableWidth);
  if (zoomWidth == null) return fitted;
  return Math.max(fitted, zoomWidth);
};

export const getCalendarWidth = (dayCount: number, dayWidth = TRACKER_DAY_WIDTH): number =>
  dayCount * dayWidth;

export const getDayIndex = (days: CalendarDay[], date: string): number =>
  days.findIndex((day) => day.date === date);

export const getMonthScrollLeft = (
  days: CalendarDay[],
  monthKey: string,
  dayWidth = TRACKER_DAY_WIDTH,
): number => {
  const index = days.findIndex((day) => day.monthKey === monthKey);
  return index >= 0 ? index * dayWidth : 0;
};

export const getInitialScrollDayIndex = (
  days: CalendarDay[],
  today: string,
  lookbackDays: number,
): number => {
  const todayIndex = getDayIndex(days, today);
  if (todayIndex < 0) return 0;
  return Math.max(0, todayIndex - lookbackDays);
};

export const getInitialScrollLeft = (
  days: CalendarDay[],
  today: string,
  lookbackDays: number,
  dayWidth = TRACKER_DAY_WIDTH,
): number => getInitialScrollDayIndex(days, today, lookbackDays) * dayWidth;

export const getBlockPosition = (
  days: CalendarDay[],
  start: string,
  end: string,
  dayWidth = TRACKER_DAY_WIDTH,
): { left: number; width: number } | null => {
  if (days.length === 0) {
    return null;
  }

  const startDate = dayjs(start).startOf('day');
  const endDate = dayjs(end).startOf('day');
  const visibleStart = dayjs(days[0].date).startOf('day');
  const visibleEnd = dayjs(days[days.length - 1].date).startOf('day');

  if (endDate.isBefore(visibleStart, 'day') || startDate.isAfter(visibleEnd, 'day')) {
    return null;
  }

  const clampedStart = startDate.isBefore(visibleStart, 'day') ? visibleStart : startDate;
  const clampedEnd = endDate.isAfter(visibleEnd, 'day') ? visibleEnd : endDate;
  const startIndex = getDayIndex(days, clampedStart.format('YYYY-MM-DD'));
  const endIndex = getDayIndex(days, clampedEnd.format('YYYY-MM-DD'));

  if (startIndex < 0 || endIndex < 0 || endIndex < startIndex) {
    return null;
  }

  const span = endIndex - startIndex + 1;

  return {
    left: startIndex * dayWidth + 1,
    width: span * dayWidth - 2,
  };
};

export const formatRangeSubtitle = (start: string, end: string): string => {
  const startLabel = dayjs(start);
  const endLabel = dayjs(end);
  const startQuarter = Math.ceil((startLabel.month() + 1) / 3);
  const endQuarter = Math.ceil((endLabel.month() + 1) / 3);
  return `Q${startQuarter} – Q${endQuarter} ${endLabel.year()}`;
};
