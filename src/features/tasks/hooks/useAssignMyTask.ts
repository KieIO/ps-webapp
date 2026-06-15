import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { myTaskApi } from '../api';
import type { AssignMyTaskRequest } from '../schemas/task.schema';

interface AssignMyTaskVariables {
  id: string;
  payload: AssignMyTaskRequest;
}

export const useAssignMyTask = () => {
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useMutation({
    mutationFn: ({ id, payload }: AssignMyTaskVariables) =>
      myTaskApi.assign(id, payload, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'my', 'history'] });
      message.success('Task assigned successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to assign task');
    },
  });
};
