import { useQuery } from '@tanstack/react-query';
import { employeePerformanceApi } from '../api';

export const useEmployeePerformanceDetail = (
  userId: string,
  period: { year: number; month: number },
) =>
  useQuery({
    queryKey: ['home', 'productivity', 'employee', userId, period],
    queryFn: () => employeePerformanceApi.getDetail(userId, period),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
