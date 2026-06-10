import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { projectApi } from '../api';
import type { CreateProjectRequest } from '../schemas/project.schema';

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectRequest) => projectApi.create(payload),
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
