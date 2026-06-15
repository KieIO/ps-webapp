import { useQuery } from '@tanstack/react-query';
import { capacityApi } from '../api';
import type { CapacityListFilters } from '../schemas/capacity.schema';

export const useCapacityList = (filters: CapacityListFilters) =>
  useQuery({
    queryKey: ['capacity', filters],
    queryFn: () => capacityApi.getList(filters),
    staleTime: 30_000,
  });
