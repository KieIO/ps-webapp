import dayjs, { type Dayjs } from 'dayjs';
import type { CreateOvertimeRequest } from '../schemas/overtime.schema';

const hourRange = (start: number, end: number): number[] => {
  const result: number[] = [];
  for (let i = start; i < end; i += 1) result.push(i);
  return result;
};

/** When OT date is today, block hours/minutes before the current clock time. */
export const disabledTimeFromNow = (otDate: Dayjs | undefined) => {
  if (!otDate?.isSame(dayjs(), 'day')) {
    return () => ({});
  }

  return () => {
    const now = dayjs();
    const hour = now.hour();
    const minute = now.minute();
    return {
      disabledHours: () => hourRange(0, hour),
      disabledMinutes: (selectedHour: number) => {
        if (selectedHour > hour) return [];
        if (selectedHour < hour) return hourRange(0, 60);
        return hourRange(0, minute);
      },
    };
  };
};

/** Exact window length in hours, 2 decimals — never round up past the window. */
export const hoursFromTimeRange = (
  timeRange: [Dayjs, Dayjs] | null | undefined,
): number | undefined => {
  if (!timeRange?.[0] || !timeRange?.[1]) return undefined;
  const minutes = timeRange[1].diff(timeRange[0], 'minute');
  if (minutes <= 0) return undefined;
  return Math.floor((minutes / 60) * 100) / 100;
};

export const uniqueReasonCategories = (values: string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((item) => item.trim()).filter(Boolean)));

export const parseOtHHMM = (value: string, base: Dayjs): Dayjs => {
  const [hourText, minuteText] = value.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  return base
    .hour(Number.isFinite(hour) ? hour : 0)
    .minute(Number.isFinite(minute) ? minute : 0)
    .second(0);
};

export const shouldClearPastTimeRange = (
  otDate: Dayjs | null,
  timeRange: [Dayjs, Dayjs] | undefined,
  now = dayjs(),
): boolean => {
  if (!otDate?.isSame(now, 'day') || !timeRange?.[0]) return false;
  const startToday = otDate.hour(timeRange[0].hour()).minute(timeRange[0].minute()).second(0);
  return startToday.isBefore(now, 'minute');
};

export const otTimeRangePastError = (
  otDate: Dayjs | undefined,
  value: [Dayjs, Dayjs] | undefined,
  now = dayjs(),
): string | null => {
  if (!value?.[0] || !otDate?.isSame(now, 'day')) return null;
  const start = otDate.hour(value[0].hour()).minute(value[0].minute()).second(0);
  if (start.isBefore(now, 'minute')) {
    return 'Khung giờ phải từ thời điểm hiện tại trở đi';
  }
  return null;
};

export const otTimeRangePastRule = (otDate: Dayjs | undefined) => ({
  validator: async (_: unknown, value: [Dayjs, Dayjs] | undefined) => {
    const error = otTimeRangePastError(otDate, value);
    if (error) throw new Error(error);
  },
});

export const buildOvertimeWriteFields = (values: {
  projectId: string;
  assigneeId: string;
  otDate: Dayjs;
  timeRange: [Dayjs, Dayjs];
  reasonCategories?: string[];
  reason: string;
}): CreateOvertimeRequest | null => {
  const estimatedHours = hoursFromTimeRange(values.timeRange);
  if (estimatedHours == null || estimatedHours <= 0) return null;

  const reasonCategories = uniqueReasonCategories(values.reasonCategories);
  if (reasonCategories.length === 0) return null;

  return {
    projectId: values.projectId,
    assigneeId: values.assigneeId,
    otDate: values.otDate.format('YYYY-MM-DD'),
    startTime: values.timeRange[0].format('HH:mm'),
    endTime: values.timeRange[1].format('HH:mm'),
    estimatedHours,
    reasonCategories,
    reason: values.reason.trim(),
  };
};
