import dayjs from 'dayjs';
import type { ProgressProps } from 'antd';
import type { MyTaskColumnKey } from '../constants';
import type { MyTask } from '../schemas/task.schema';
import { resolveProjectContextFromTask } from './taskProjectContext';

const isPastDate = (value: string): boolean => dayjs(value).isBefore(dayjs(), 'day');

/** Whether a date column should show the overdue indicator (Tracker-style red dot). */
export const isMyTaskDateAtRisk = (task: MyTask, columnKey: MyTaskColumnKey): boolean => {
  const ctx = resolveProjectContextFromTask(task);

  switch (columnKey) {
    case 'date':
      if (task.staffConfirmation === 'finished' || task.staffConfirmation === 'confirmed') {
        return false;
      }
      return isPastDate(task.date);
    case 'endDate':
      if (ctx.projectStatus === 'finish' || ctx.projectStatus === 'cancel') return false;
      if (!ctx.projectEndDate) return false;
      return isPastDate(ctx.projectEndDate);
    default:
      return false;
  }
};

export const getMyTaskCompletionProgressStatus = (task: MyTask): ProgressProps['status'] => {
  const ctx = resolveProjectContextFromTask(task);

  if (ctx.projectStatus === 'finish') return 'success';
  if (task.staffConfirmation === 'finished' || task.staffConfirmation === 'confirmed') {
    return 'success';
  }
  if (task.staffConfirmation === 'decline') return 'exception';
  return 'active';
};
