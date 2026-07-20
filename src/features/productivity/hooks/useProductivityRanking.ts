import { useQuery } from '@tanstack/react-query';
import { productivityApi, type RankingDepartment } from '../api';

export const useProductivityRanking = (
  period: { year: number; month: number },
  options?: { enabled?: boolean; department?: RankingDepartment },
) =>
  useQuery({
    queryKey: ['home', 'productivity', 'ranking', period, options?.department ?? 'all'],
    queryFn: () => productivityApi.getRanking(period, options?.department ?? 'all'),
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
  });
