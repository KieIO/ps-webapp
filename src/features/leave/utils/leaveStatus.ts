import dayjs, { type Dayjs } from 'dayjs';
import type { LeaveRecord } from '../schemas/leave.schema';

/** Mirrors BE resolveLeaveStatusOnCreate — used for confirm copy before save. */
export const resolveLeaveStatusOnCreate = (
  startDate: string,
  endDate: string,
  today = dayjs(),
): 'scheduled' | 'active' | 'ended' => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  if (end.isBefore(today, 'day')) return 'ended';
  if (start.isAfter(today, 'day')) return 'scheduled';
  return 'active';
};

export const isOpenLeave = (leave: Pick<LeaveRecord, 'status'>): boolean =>
  leave.status === 'active' || leave.status === 'scheduled';

export const leaveStatusLabel = (status: LeaveRecord['status']): string => {
  switch (status) {
    case 'scheduled':
      return 'Scheduled';
    case 'active':
      return 'On leave';
    case 'ended':
      return 'Ended';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

/** Inclusive calendar-day check (local dayjs, matches picker). */
export const isDayWithinLeaveRange = (day: Dayjs, startDate: string, endDate: string): boolean => {
  const d = day.startOf('day');
  const start = dayjs(startDate).startOf('day');
  const end = dayjs(endDate).startOf('day');
  return !d.isBefore(start, 'day') && !d.isAfter(end, 'day');
};

export const isDayBookedByOpenLeaves = (
  day: Dayjs,
  leaves: Array<Pick<LeaveRecord, 'startDate' | 'endDate'>>,
): boolean => leaves.some((leave) => isDayWithinLeaveRange(day, leave.startDate, leave.endDate));

/** True when [start, end] overlaps any open leave (inclusive). */
export const rangeOverlapsOpenLeaves = (
  start: Dayjs,
  end: Dayjs,
  leaves: Array<Pick<LeaveRecord, 'startDate' | 'endDate'>>,
): boolean => {
  const rangeStart = start.startOf('day');
  const rangeEnd = end.startOf('day');
  return leaves.some((leave) => {
    const leaveStart = dayjs(leave.startDate).startOf('day');
    const leaveEnd = dayjs(leave.endDate).startOf('day');
    return !rangeEnd.isBefore(leaveStart, 'day') && !rangeStart.isAfter(leaveEnd, 'day');
  });
};
