import { useQuery } from '@tanstack/react-query';
import { trackerApi } from '../api';

export const useTrackerData = () =>
  useQuery({
    queryKey: ['tracker'],
    queryFn: () => trackerApi.getData(),
    staleTime: 30_000,
  });
