import { useMemo } from 'react';
import { useCapacityList } from '@/features/capacity/hooks/useCapacityList';
import type { MyTask } from '../schemas/task.schema';
import {
  buildCapacityByUserId,
  formatAssignCapacityPeriodNote,
  resolveAssignCapacityDate,
  type AssignCapacityDate,
} from '../utils/assignCapacity';
import { calendarDateFromTaskDeadline } from '../utils/taskDates';

/**
 * Loads real capacity for staff assign pickers on the deadline day
 * (optional form override → task creativeDeadline/deadline → today).
 * Works for create flows when `task` is null (uses override or today).
 */
export const useAssignPickerCapacity = (
  task: Pick<MyTask, 'creativeDeadline' | 'deadline'> | null,
  enabled: boolean,
  /** ISO creative/PM deadline from the open form — preferred over persisted task dates. */
  deadlineOverrideIso?: string | null,
) => {
  const period: AssignCapacityDate = useMemo(() => {
    if (deadlineOverrideIso) {
      const date = calendarDateFromTaskDeadline(deadlineOverrideIso);
      if (date) {
        // Label from the override day itself — not "has any creativeDeadline on task"
        // (PM deadline override must not read as creative when task already has one).
        const creativeDate = task?.creativeDeadline
          ? calendarDateFromTaskDeadline(task.creativeDeadline)
          : null;
        return {
          date,
          source: creativeDate && creativeDate === date ? 'creative_deadline' : 'deadline',
        };
      }
    }
    return resolveAssignCapacityDate(task);
  }, [task, deadlineOverrideIso]);

  const query = useCapacityList({ mode: 'date', date: period.date }, { enabled });

  const capacityByUserId = useMemo(
    () => buildCapacityByUserId(query.data?.items),
    [query.data?.items],
  );

  const periodNote = useMemo(() => formatAssignCapacityPeriodNote(period), [period]);

  return {
    period,
    periodNote,
    capacityByUserId,
    isLoading: query.isLoading,
    isError: query.isError,
    isReady: !query.isLoading && !query.isError && capacityByUserId.size > 0,
  };
};
