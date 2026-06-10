import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { myTaskApi } from '../api';
import type { TaskConfirmationStatus } from '../schemas/task.schema';

interface UpdateMyTaskStatusVariables {
  id: string;
  staffConfirmation: TaskConfirmationStatus;
  staffNote: string;
}

export const useUpdateMyTaskStatus = () => {
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useMutation({
    mutationFn: ({ id, staffConfirmation, staffNote }: UpdateMyTaskStatusVariables) =>
      myTaskApi.updateStatus(id, { staffConfirmation, staffNote }, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'my'] });
      message.success('Task status updated');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update task status');
    },
  });
};
