import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { myTaskApi } from '../api';
import type { SpawnEvaluationRemainderRequest } from '../schemas/task.schema';

interface SpawnEvaluationRemainderVariables {
  id: string;
  payload: SpawnEvaluationRemainderRequest;
}

export const useSpawnEvaluationRemainder = () => {
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useMutation({
    mutationFn: ({ id, payload }: SpawnEvaluationRemainderVariables) =>
      myTaskApi.spawnEvaluationRemainder(id, payload, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'my', 'history'] });
      message.success('Đã tạo task phần còn lại');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Không thể tạo task phần còn lại');
    },
  });
};
