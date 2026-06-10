import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { myTaskApi } from '../api';
import type { UpdateMyTaskPmEvaluationRequest } from '../schemas/task.schema';

interface UpdateMyTaskPmEvaluationVariables {
  id: string;
  payload: UpdateMyTaskPmEvaluationRequest;
}

export const useUpdateMyTaskPmEvaluation = () => {
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useMutation({
    mutationFn: ({ id, payload }: UpdateMyTaskPmEvaluationVariables) =>
      myTaskApi.updatePmEvaluation(id, payload, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'my'] });
      message.success('Task evaluation saved');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to save task evaluation');
    },
  });
};
