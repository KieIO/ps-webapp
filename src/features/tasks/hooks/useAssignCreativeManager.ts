import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { invalidateProjectAndTaskQueries } from '@/shared/utils/queryInvalidation';
import { myTaskApi } from '../api';
import type { AssignCreativeManagerRequest } from '../schemas/task.schema';

interface AssignCreativeManagerVariables {
  id: string;
  payload: AssignCreativeManagerRequest;
}

export const useAssignCreativeManager = () => {
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useMutation({
    mutationFn: ({ id, payload }: AssignCreativeManagerVariables) =>
      myTaskApi.assignCreativeManager(id, payload, userId),
    onSuccess: (_task, variables) => {
      invalidateProjectAndTaskQueries(queryClient);
      message.success(
        variables.payload.mode === 'split'
          ? 'Đã chia và giao các task nhỏ cho Staff.'
          : 'Đã giao task cho Staff. Nhân viên có 15 phút để confirm.',
      );
    },
    onError: (error: Error) => {
      message.error(error.message || 'Không thể giao task cho Staff');
    },
  });
};
