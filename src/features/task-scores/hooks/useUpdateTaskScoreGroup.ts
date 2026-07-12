import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { taskScoreApi } from '../api';
import type { UpdateTaskScoreGroupRequest } from '../schemas/taskScoreGroup.schema';

export const useUpdateTaskScoreGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskScoreGroupRequest }) =>
      taskScoreApi.updateGroup(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-score-groups'] });
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update group');
    },
  });
};
