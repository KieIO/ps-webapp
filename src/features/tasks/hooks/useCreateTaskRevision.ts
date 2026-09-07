import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { myTaskApi } from '../api';
import type { CreateRevisionRequest } from '../schemas/task.schema';
import { taskRevisionsQueryKey } from './useTaskRevisions';

interface CreateTaskRevisionVariables {
  id: string;
  payload: CreateRevisionRequest;
}

export const useCreateTaskRevision = () => {
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useMutation({
    mutationFn: ({ id, payload }: CreateTaskRevisionVariables) =>
      myTaskApi.createRevision(id, payload, userId),
    onSuccess: (created, variables) => {
      queryClient.invalidateQueries({ queryKey: taskRevisionsQueryKey(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'my', 'history', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'my', 'detail', variables.id] });
      if (created.id) {
        queryClient.invalidateQueries({ queryKey: ['tasks', 'my', 'detail', created.id] });
      }
      message.success(`Đã tạo ${created.taskCode} (Revision #${created.revisionRound ?? 1})`);
    },
    onError: (error: Error) => {
      message.error(error.message || 'Không thể tạo revision');
    },
  });
};
