import type { TrackerOffDay } from '../types';

/** Employee off-days keyed by calendar date (absIdx from May 1 in Figma reference) */
export const TRACKER_OFF_DAYS: TrackerOffDay[] = [
  { date: '2026-05-06', names: ['Tri'] },
  { date: '2026-05-07', names: ['Kiet'] },
  { date: '2026-05-09', names: ['Thong', 'Van Anh'] },
  { date: '2026-05-13', names: ['Tu'] },
  { date: '2026-05-20', names: ['Loc'] },
  { date: '2026-05-27', names: ['Tri', 'An'] },
];
