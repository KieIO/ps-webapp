import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { myTaskApi } from '../api';
import type { UpdateMyTaskRequest } from '../schemas/task.schema';

interface UpdateMyTaskVariables {
  id: string;
  payload: UpdateMyTaskRequest;
}

export const useUpdateMyTask = () => {
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useMutation({
    mutationFn: ({ id, payload }: UpdateMyTaskVariables) =>
      myTaskApi.update(id, payload, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'my'] });
      message.success('Task updated successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update task');
    },
  });
};
