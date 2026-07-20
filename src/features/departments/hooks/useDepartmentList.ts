import { useQuery } from '@tanstack/react-query';
import { departmentApi } from '../api';

export const DEPARTMENT_QUERY_KEY = ['departments'] as const;

export const useDepartmentList = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: DEPARTMENT_QUERY_KEY,
    queryFn: () => departmentApi.getList(),
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
  });
