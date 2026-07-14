import { QueryClient } from '@tanstack/react-query';

/** App-wide QueryClient — also cleared on logout / 401. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30_000 },
  },
});
