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

export const getCalendarWidth = (dayCount: number): number => dayCount * TRACKER_DAY_WIDTH;

export const getDayIndex = (days: CalendarDay[], date: string): number =>
  days.findIndex((day) => day.date === date);

export const getMonthScrollLeft = (days: CalendarDay[], monthKey: string): number => {
  const index = days.findIndex((day) => day.monthKey === monthKey);
  return index >= 0 ? index * TRACKER_DAY_WIDTH : 0;
};

export const getBlockPosition = (
  days: CalendarDay[],
  start: string,
  end: string,
): { left: number; width: number } | null => {
  const startIndex = getDayIndex(days, start);
  const endIndex = getDayIndex(days, end);

  if (startIndex < 0 || endIndex < 0) {
    return null;
  }

  const span = endIndex - startIndex + 1;

  return {
    left: startIndex * TRACKER_DAY_WIDTH + 1,
    width: span * TRACKER_DAY_WIDTH - 2,
  };
};

export const formatRangeSubtitle = (start: string, end: string): string => {
  const startLabel = dayjs(start);
  const endLabel = dayjs(end);
  const startQuarter = Math.ceil((startLabel.month() + 1) / 3);
  const endQuarter = Math.ceil((endLabel.month() + 1) / 3);
  return `Q${startQuarter} – Q${endQuarter} ${endLabel.year()}`;
};
