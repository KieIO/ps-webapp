import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { myTaskApi } from '../api';

/** Split children/siblings for Creative edit drawers (visible to oversight roles). */
export const useCreativeSplitChildren = (
  taskId: string | undefined,
  options?: { enabled?: boolean },
) => {
  const userId = useAppSelector((state) => state.auth.user?.id);
  const role = useAppSelector((state) => state.auth.user?.role);
  const enabled = Boolean(taskId && userId) && (options?.enabled ?? true);

  return useQuery({
    queryKey: ['tasks', 'my', 'split-children', taskId, userId, role],
    queryFn: () => myTaskApi.listSplitChildren(taskId!, userId, role),
    enabled,
    staleTime: 15_000,
  });
};
