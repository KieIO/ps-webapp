import { useQuery } from '@tanstack/react-query';
import { homeApi } from '../api';

export const useOverallDashboard = (
  period: { year: number; month: number },
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ['home', 'overall', period],
    queryFn: () => homeApi.getOverallDashboard(period),
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
  });
