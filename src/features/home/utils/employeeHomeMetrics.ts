import dayjs from 'dayjs';
import type { MyTask } from '@/features/tasks/schemas/task.schema';
import { getTaskDeadline } from '@/features/tasks/utils/taskDetail';
import { isTaskActiveToday } from './homeMetrics';

const CLOSED_STATUSES = new Set(['cancelled']);

/** Tasks whose work window includes today — Employee Home "Task hôm nay". */
export const buildEmployeeTodayTasks = (tasks: MyTask[], today = dayjs()): MyTask[] => {
  const statusOrder: Record<string, number> = {
    not_updated: 0,
    confirmed: 1,
    decline: 2,
    finished: 3,
    cancelled: 4,
  };

  return tasks
    .filter(
      (task) => !CLOSED_STATUSES.has(task.staffConfirmation) && isTaskActiveToday(task, today),
    )
    .sort((a, b) => {
      const statusDiff =
        (statusOrder[a.staffConfirmation] ?? 99) - (statusOrder[b.staffConfirmation] ?? 99);
      if (statusDiff !== 0) return statusDiff;
      return (
        getTaskDeadline(a).localeCompare(getTaskDeadline(b)) || a.taskCode.localeCompare(b.taskCode)
      );
    });
};

/** Tasks that already have manager evaluation and/or note. */
export const buildEmployeeEvaluations = (tasks: MyTask[]): MyTask[] => {
  return tasks
    .filter((task) => {
      const evaluation = task.pmEvaluation?.trim();
      const note = task.pmNote?.trim();
      return Boolean(evaluation || note);
    })
    .sort((a, b) => {
      const aAt = a.updatedAt ?? '';
      const bAt = b.updatedAt ?? '';
      return bAt.localeCompare(aAt) || a.taskCode.localeCompare(b.taskCode);
    });
};

export const ON_TIME_RATE_TOOLTIP =
  'Tỉ lệ task đã hoàn thành trong tháng này mà ngày hoàn thành ≤ deadline. Chỉ tính task ở trạng thái Finished; task chưa hoàn thành không được tính vào mẫu số.';

export const REVISION_RATE_TOOLTIP =
  'Tỉ lệ task có quality review trong tháng này mà phải chỉnh sửa (RevisionCount > 0) trên tổng số task đã được review. Thấp hơn = tốt hơn. So sánh với tháng trước khi cả hai tháng đều có review.';
