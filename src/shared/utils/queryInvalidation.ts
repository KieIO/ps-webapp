import type { QueryClient } from '@tanstack/react-query';

/** Keep project registry and task lists in sync after cross-domain writes. */
export const invalidateProjectAndTaskQueries = (queryClient: QueryClient): void => {
  queryClient.invalidateQueries({ queryKey: ['projects'] });
  queryClient.invalidateQueries({ queryKey: ['tasks', 'my'] });
  queryClient.invalidateQueries({ queryKey: ['tasks', 'project'] });
};
