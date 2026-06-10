export type { TrackerBlock, TrackerOffDay, TrackerProject, TrackerUrgency } from './schemas/tracker.schema';

export interface CalendarDay {
  key: string;
  date: string;
  dayOfMonth: number;
  /** 0 = Sunday … 6 = Saturday */
  dayOfWeek: number;
  monthKey: string;
  monthLabel: string;
  isWeekend: boolean;
  isToday: boolean;
}

export interface CalendarMonth {
  key: string;
  label: string;
  year: number;
  dayCount: number;
}
