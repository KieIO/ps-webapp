import { useQuery } from '@tanstack/react-query';
import { projectApi } from '../api';
import type { ProjectListFilters } from '../schemas/project.schema';

export const useProjectList = (filters: ProjectListFilters, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectApi.getList(filters),
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  });

export const useProject = (id: string) =>
  useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectApi.getById(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

export const useProjectPmOptions = () =>
  useQuery({
    queryKey: ['projects', 'pm-options'],
    queryFn: () => projectApi.getPmOptions(),
    staleTime: 60_000,
  });

export const useProjectHeadNameOptions = () =>
  useQuery({
    queryKey: ['projects', 'head-name-options'],
    queryFn: () => projectApi.getHeadNameOptions(),
    staleTime: 60_000,
  });

export const useProjectHeadOptions = () =>
  useQuery({
    queryKey: ['projects', 'head-options'],
    queryFn: () => projectApi.getHeadOptions(),
    staleTime: 60_000,
  });
