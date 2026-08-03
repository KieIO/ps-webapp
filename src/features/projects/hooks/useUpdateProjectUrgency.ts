import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { invalidateProjectAndTaskQueries } from '@/shared/utils/queryInvalidation';
import { projectApi } from '../api';
import type { ProjectUrgency } from '../schemas/project.schema';

interface UpdateProjectUrgencyVariables {
  id: string;
  urgency: ProjectUrgency;
}

export const useUpdateProjectUrgency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, urgency }: UpdateProjectUrgencyVariables) =>
      projectApi.updateUrgency(id, urgency),
    onSuccess: (project) => {
      // invalidateProjectAndTaskQueries already includes ['tracker']
      invalidateProjectAndTaskQueries(queryClient);
      queryClient.setQueryData(['projects', project.id], project);
      message.success('Đã cập nhật mức ưu tiên');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Không thể cập nhật mức ưu tiên');
    },
  });
};
