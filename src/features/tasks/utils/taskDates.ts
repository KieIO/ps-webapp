import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { DATETIME_FORMAT } from '@/config/constants';

dayjs.extend(utc);

/** Calendar date from a date picker, sent as YYYY-MM-DD (parsed as UTC midnight on the backend). */
export const toTaskDateOnly = (date: Dayjs): string => date.format('YYYY-MM-DD');

/**
 * Deadline datetime from a date+time picker.
 * Stores the picker wall-clock as UTC (matches formatTaskDateTime / existing day-boundary semantics).
 */
export const toTaskDeadline = (date: Dayjs): string =>
  `${date.format('YYYY-MM-DD')}T${date.format('HH:mm:ss')}Z`;

/** Parse a stored UTC wall-clock deadline into a Dayjs value for Ant Design DatePicker. */
export const fromTaskDeadline = (value: string): Dayjs =>
  dayjs(dayjs.utc(value).format('YYYY-MM-DDTHH:mm:ss'));

/** Default create-task deadline: now (minute precision). */
export const defaultTaskDeadline = (): Dayjs => dayjs().second(0).millisecond(0);

/** True when `current` calendar day is outside inclusive project [startDate, endDate]. */
export const isOutsideProjectDateRange = (
  current: Dayjs | null | undefined,
  startDate?: string | null,
  endDate?: string | null,
): boolean => {
  if (!current?.isValid()) return false;
  const start = startDate ? dayjs(startDate) : null;
  const end = endDate ? dayjs(endDate) : null;
  if (start?.isValid() && current.isBefore(start, 'day')) return true;
  if (end?.isValid() && current.isAfter(end, 'day')) return true;
  return false;
};

/** Clamp deadline to project range (keep time-of-day; fallback end-of-start-day noon-ish via start). */
export const clampDeadlineToProjectRange = (
  deadline: Dayjs,
  startDate?: string | null,
  endDate?: string | null,
): Dayjs => {
  if (!deadline.isValid()) return deadline;
  const start = startDate ? dayjs(startDate) : null;
  const end = endDate ? dayjs(endDate) : null;
  if (start?.isValid() && deadline.isBefore(start, 'day')) {
    return deadline.year(start.year()).month(start.month()).date(start.date());
  }
  if (end?.isValid() && deadline.isAfter(end, 'day')) {
    return deadline.year(end.year()).month(end.month()).date(end.date());
  }
  return deadline;
};

/** UTC start-of-day ISO for an existing task date string. */
export const normalizeTaskDateStart = (value: string): string =>
  `${value.slice(0, 10)}T00:00:00.000Z`;

/** UTC end-of-day ISO for the same calendar date (23:59:59). */
export const normalizeTaskDateEnd = (value: string): string =>
  `${value.slice(0, 10)}T23:59:59.000Z`;

/** Format a task UTC timestamp without shifting to local time. */
export const formatTaskDateTime = (value: string): string =>
  dayjs.utc(value).format(DATETIME_FORMAT);

/**
 * Calendar day (YYYY-MM-DD) from a stored UTC wall-clock deadline.
 * Must use UTC so e.g. `…T17:08:00Z` stays on the same day as UI (not local +7 → next day).
 */
export const calendarDateFromTaskDeadline = (value: string): string | null => {
  const parsed = dayjs.utc(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
};
