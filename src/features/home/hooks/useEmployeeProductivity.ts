import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { homeApi } from '../api';
import { isEmployeeHomeRole } from '../utils/homeScope';

export const employeeProductivityQueryKey = (userId: string | undefined) =>
  ['home', 'employee', 'productivity', userId] as const;

export const useEmployeeProductivity = (options?: { enabled?: boolean }) => {
  const user = useAppSelector((state) => state.auth.user);
  const enabled = Boolean(user?.id) && isEmployeeHomeRole(user?.role) && (options?.enabled ?? true);

  return useQuery({
    queryKey: employeeProductivityQueryKey(user?.id),
    queryFn: () => homeApi.getEmployeeProductivity(),
    enabled,
    staleTime: 60_000,
  });
};
