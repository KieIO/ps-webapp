import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { invalidateProjectAndTaskQueries } from '@/shared/utils/queryInvalidation';
import { projectApi } from '../api';
import type { ProjectMilestoneInput } from '../schemas/milestone.schema';

interface ReplaceMilestonesVariables {
  projectId: string;
  milestones: ProjectMilestoneInput[];
  successMessage?: string;
}

export const useReplaceProjectMilestones = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, milestones }: ReplaceMilestonesVariables) =>
      projectApi.replaceMilestones(projectId, milestones),
    onSuccess: (project, variables) => {
      invalidateProjectAndTaskQueries(queryClient);
      queryClient.setQueryData(['projects', project.id], project);
      message.success(variables.successMessage ?? 'Đã cập nhật mốc bàn giao');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Không thể cập nhật mốc bàn giao');
    },
  });
};
