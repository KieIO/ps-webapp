import type { Dayjs } from 'dayjs';

/** Calendar date from a date picker, sent as YYYY-MM-DD (parsed as UTC midnight on the backend). */
export const toTaskDateOnly = (date: Dayjs): string => date.format('YYYY-MM-DD');

/** UTC start-of-day ISO for an existing task date string. */
export const normalizeTaskDateStart = (value: string): string =>
  `${value.slice(0, 10)}T00:00:00.000Z`;

/** UTC end-of-day ISO for the same calendar date (23:59:59). */
export const normalizeTaskDateEnd = (value: string): string =>
  `${value.slice(0, 10)}T23:59:59.000Z`;
