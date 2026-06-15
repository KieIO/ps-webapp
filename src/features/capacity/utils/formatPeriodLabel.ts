import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';

export type PeriodLabelInput =
  | { mode: 'date'; date: string }
  | { mode: 'month'; year: number; month: number }
  | { mode: 'range'; startDate: string; endDate: string };

export function formatPeriodLabel(input: PeriodLabelInput): string {
  if (input.mode === 'date') {
    return dayjs(input.date).format(DATE_FORMAT);
  }

  if (input.mode === 'month') {
    return dayjs().year(input.year).month(input.month - 1).format('MMMM YYYY');
  }

  const start = dayjs(input.startDate);
  const end = dayjs(input.endDate);
  if (start.isSame(end, 'day')) {
    return start.format(DATE_FORMAT);
  }

  return `${start.format(DATE_FORMAT)} – ${end.format(DATE_FORMAT)}`;
}
