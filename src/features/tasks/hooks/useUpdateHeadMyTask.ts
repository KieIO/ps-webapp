import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { invalidateProjectAndTaskQueries } from '@/shared/utils/queryInvalidation';
import { myTaskApi } from '../api';
import type { UpdateHeadMyTaskRequest } from '../schemas/task.schema';

interface UpdateHeadMyTaskVariables {
  id: string;
  payload: UpdateHeadMyTaskRequest;
}

export const useUpdateHeadMyTask = () => {
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useMutation({
    mutationFn: ({ id, payload }: UpdateHeadMyTaskVariables) =>
      myTaskApi.updateHeadContext(id, payload, userId),
    onSuccess: () => {
      invalidateProjectAndTaskQueries(queryClient);
      message.success('Task updated successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update task');
    },
  });
};
