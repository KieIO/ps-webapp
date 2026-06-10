import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { taskScoreApi } from '../api';

export const useDeleteTaskScoreGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskScoreApi.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-score-groups'] });
      message.success('Group deleted');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to delete group');
    },
  });
};
