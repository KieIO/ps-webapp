import { useQuery } from '@tanstack/react-query';
import { homeApi } from '../api';
import type { CapacityBreakdownScope } from '../schemas/capacityBreakdown.schema';

export const useCapacityBreakdown = (
  period: { year: number; month: number },
  scope: CapacityBreakdownScope | null,
  page: number,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ['home', 'overall', 'capacity-breakdown', period, scope, page],
    queryFn: () =>
      homeApi.getCapacityBreakdown({
        year: period.year,
        month: period.month,
        scope: scope!,
        page,
        pageSize: 20,
      }),
    enabled: (options?.enabled ?? true) && scope != null,
    staleTime: 60_000,
  });
