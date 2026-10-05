import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { projectApi } from '../api';
import type { CreateProjectRequest } from '../schemas/project.schema';

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const user = useAppSelector((state) => state.auth.user);

  return useMutation({
    mutationFn: (payload: CreateProjectRequest) => projectApi.create(payload, user?.id),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.setQueryData(['projects', project.id], project);
      message.success('Project created successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to create project');
    },
  });
};
