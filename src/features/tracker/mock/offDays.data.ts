import type { TrackerOffDay } from '../types';

/**
 * Mock leave markers — one entry per calendar day (matches live GET /tracker).
 * Spans come from leave_requests start/end, not "today" or inactive users.
 */
export const TRACKER_OFF_DAYS: TrackerOffDay[] = [
  {
    date: '2026-09-01',
    people: [{ id: 'usr-an', name: 'An' }],
    names: ['An'],
  },
  {
    date: '2026-09-02',
    people: [{ id: 'usr-an', name: 'An' }],
    names: ['An'],
  },
  {
    date: '2026-09-03',
    people: [
      { id: 'usr-an', name: 'An' },
      { id: 'usr-tri', name: 'Tri' },
    ],
    names: ['An', 'Tri'],
  },
  {
    date: '2026-09-04',
    people: [
      { id: 'usr-an', name: 'An' },
      { id: 'usr-tri', name: 'Tri' },
    ],
    names: ['An', 'Tri'],
  },
  {
    date: '2026-09-05',
    people: [{ id: 'usr-an', name: 'An' }],
    names: ['An'],
  },
  {
    date: '2026-09-20',
    people: [{ id: 'usr-loc', name: 'Loc' }],
    names: ['Loc'],
  },
];
