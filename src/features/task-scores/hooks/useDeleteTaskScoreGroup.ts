import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { taskScoreApi } from '../api';

export const useDeleteTaskScoreGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskScoreApi.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-score-groups'] });
      message.success('Group deleted');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Failed to delete group'));
    },
  });
};
