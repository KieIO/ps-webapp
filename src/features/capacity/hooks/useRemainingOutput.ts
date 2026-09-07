import { useQuery } from '@tanstack/react-query';
import { capacityApi } from '../api';
import type { RemainingOutputFilters } from '../schemas/remainingOutput.schema';

export const useRemainingOutput = (
  filters: RemainingOutputFilters,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ['capacity', 'remaining-output', filters],
    queryFn: () => capacityApi.getRemainingOutput(filters),
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  });
