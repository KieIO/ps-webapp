import { useQuery } from '@tanstack/react-query';
import { titleApi } from '../api';
import type { JobTitleListFilters } from '../schemas/title.schema';

export const useJobTitleList = (filters: JobTitleListFilters) =>
  useQuery({
    queryKey: ['job-titles', filters],
    queryFn: () => titleApi.getJobTitles(filters),
    staleTime: 30_000,
  });
