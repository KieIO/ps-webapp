import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api';

export const useUser = (id: string | undefined) =>
  useQuery({
    queryKey: ['users', id],
    queryFn: () => userApi.getById(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
