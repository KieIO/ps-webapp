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
 * Loads real capacity for the assign picker on the task deadline day
 * (optional form override → creativeDeadline → deadline → today).
 */
export const useAssignPickerCapacity = (
  task: MyTask | null,
  enabled: boolean,
  /** ISO creative/PM deadline from the open form — preferred over persisted task dates. */
  deadlineOverrideIso?: string | null,
) => {
  const period: AssignCapacityDate = useMemo(() => {
    if (deadlineOverrideIso) {
      const date = calendarDateFromTaskDeadline(deadlineOverrideIso);
      if (date) {
        return { date, source: 'creative_deadline' };
      }
    }
    return resolveAssignCapacityDate(task);
  }, [task, deadlineOverrideIso]);

  const query = useCapacityList(
    { mode: 'date', date: period.date },
    { enabled: enabled && Boolean(task) },
  );

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
