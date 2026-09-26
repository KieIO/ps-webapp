import type { TrackerOffDay } from '../types';

/**
 * Mock leave markers — one entry per calendar day (matches live GET /tracker).
 * Spans come from leave_requests start/end, not "today" or inactive users.
 */
export const TRACKER_OFF_DAYS: TrackerOffDay[] = [
  { date: '2026-09-01', names: ['An'] },
  { date: '2026-09-02', names: ['An'] },
  { date: '2026-09-03', names: ['An', 'Tri'] },
  { date: '2026-09-04', names: ['An', 'Tri'] },
  { date: '2026-09-05', names: ['An'] },
  { date: '2026-09-20', names: ['Loc'] },
];
