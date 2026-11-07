import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { taskScoreApi } from '../api';
import type { UpdateTaskScoreRequest } from '../schemas/taskScore.schema';

interface UpdateTaskScoreVariables {
  id: string;
  payload: UpdateTaskScoreRequest;
}

export const useUpdateTaskScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateTaskScoreVariables) => taskScoreApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-scores'] });
      message.success('Task updated');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Failed to update task'));
    },
  });
};
