import { useQuery } from '@tanstack/react-query';
import { titleApi } from '../api';

export const useJobLevelList = () =>
  useQuery({
    queryKey: ['job-levels'],
    queryFn: () => titleApi.getJobLevels(),
    staleTime: 30_000,
  });
