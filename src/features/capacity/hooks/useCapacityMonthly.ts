import { useQuery } from '@tanstack/react-query';
import { capacityApi } from '../api';
import type { CapacityMonthlyFilters } from '../schemas/capacityMonthly.schema';

export function useCapacityMonthly(filters: CapacityMonthlyFilters) {
  return useQuery({
    queryKey: ['capacity', 'monthly', filters],
    queryFn: () => capacityApi.getMonthly(filters),
    staleTime: 30_000,
  });
}
