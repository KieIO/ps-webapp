import { useQuery } from '@tanstack/react-query';
import { myTaskApi } from '../api';
import type { TaskCategory } from '../schemas/task.schema';

export const useCreateTaskProjectOptions = (taskCategory: TaskCategory) =>
  useQuery({
    queryKey: ['tasks', 'my', 'all-project-options', taskCategory],
    queryFn: () => myTaskApi.getProjectOptions({ taskCategory, scope: 'all' }),
    staleTime: 60_000,
  });

export const useCreateTaskPmOptions = () =>
  useQuery({
    queryKey: ['tasks', 'my', 'pm-options'],
    queryFn: () => myTaskApi.getPmOptions(),
    staleTime: 60_000,
  });

export const useCreateTaskStaffOptions = () =>
  useQuery({
    queryKey: ['tasks', 'my', 'staff-options'],
    queryFn: () => myTaskApi.getStaffOptions(),
    staleTime: 60_000,
  });

export const useProjectStaffOptions = (projectName?: string) =>
  useQuery({
    queryKey: ['tasks', 'my', 'project-staff-options', projectName],
    queryFn: () => myTaskApi.getProjectStaffOptions(projectName!),
    enabled: Boolean(projectName),
    staleTime: 60_000,
  });
