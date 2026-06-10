import { useQuery } from '@tanstack/react-query';
import { titleApi } from '../api';

export const useJobGroupList = () =>
  useQuery({
    queryKey: ['job-groups'],
    queryFn: () => titleApi.getJobGroups(),
    staleTime: 30_000,
  });
