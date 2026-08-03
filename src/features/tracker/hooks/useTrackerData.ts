import { useQuery } from '@tanstack/react-query';
import { ROLES } from '@/config/permissions';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { trackerApi } from '../api';

export const useTrackerData = () => {
  const role = useAppSelector((state) => state.auth.user?.role);
  const aggregateTaskNames = role === ROLES.ADMIN;

  return useQuery({
    // Include admin flag so mock role switches refetch; real API ignores the flag
    // but still benefits from a refetch if role changes in-session.
    queryKey: ['tracker', { aggregateTaskNames }],
    queryFn: () => trackerApi.getData({ aggregateTaskNames }),
    staleTime: 30_000,
  });
};
