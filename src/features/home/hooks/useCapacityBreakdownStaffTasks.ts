import { useQuery } from '@tanstack/react-query';
import { homeApi } from '../api';

export const useCapacityBreakdownStaffTasks = (
  period: { year: number; month: number },
  userId: string | null,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ['home', 'overall', 'capacity-breakdown', 'tasks', period, userId],
    queryFn: () =>
      homeApi.getCapacityBreakdownStaffTasks({
        year: period.year,
        month: period.month,
        userId: userId!,
      }),
    enabled: (options?.enabled ?? true) && !!userId,
    staleTime: 60_000,
  });
