import { useQuery } from '@tanstack/react-query';
import { productivityApi } from '../api';

export const useProductivityDashboard = (
  period: { year: number; month: number },
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ['home', 'productivity', period],
    queryFn: () => productivityApi.getDashboard(period),
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
  });
