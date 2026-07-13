import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { invalidateProjectAndTaskQueries } from '@/shared/utils/queryInvalidation';
import { projectApi } from '../api';
import type { UpdateProjectRequest } from '../schemas/project.schema';

interface UpdateProjectVariables {
  id: string;
  payload: UpdateProjectRequest;
  successMessage?: string;
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateProjectVariables) => projectApi.update(id, payload),
    onSuccess: (project, variables) => {
      invalidateProjectAndTaskQueries(queryClient);
      queryClient.setQueryData(['projects', project.id], project);
      message.success(variables.successMessage ?? 'Project updated successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update project');
    },
  });
};
