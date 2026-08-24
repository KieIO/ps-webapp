import { useMemo } from 'react';
import { useCapacityList } from '@/features/capacity/hooks/useCapacityList';
import type { MyTask } from '../schemas/task.schema';
import {
  buildCapacityByUserId,
  formatAssignCapacityPeriodNote,
  resolveAssignCapacityDate,
  type AssignCapacityDate,
} from '../utils/assignCapacity';

/**
 * Loads real capacity for the assign picker on the task deadline day
 * (creativeDeadline → deadline → today).
 */
export const useAssignPickerCapacity = (task: MyTask | null, enabled: boolean) => {
  const period: AssignCapacityDate = useMemo(() => resolveAssignCapacityDate(task), [task]);

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
