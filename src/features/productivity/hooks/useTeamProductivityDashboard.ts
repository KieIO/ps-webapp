import { useQuery } from '@tanstack/react-query';
import { productivityApi } from '../api';

export const useTeamProductivityDashboard = (
  period: { year: number; month: number },
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ['home', 'productivity', 'team', period],
    queryFn: () => productivityApi.getTeamDashboard(period),
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
  });
