import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api';
import type { UserListFilters } from '../schemas/user.schema';

export const useUserList = (filters: UserListFilters, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['users', filters],
    queryFn: () => userApi.getList(filters),
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  });
