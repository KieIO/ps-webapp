import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { invalidateProjectAndTaskQueries } from '@/shared/utils/queryInvalidation';
import { myTaskApi } from '../api';
import type { AssignCreativeHeadRequest } from '../schemas/task.schema';

interface AssignCreativeHeadVariables {
  id: string;
  payload: AssignCreativeHeadRequest;
}

export const useAssignCreativeHead = () => {
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useMutation({
    mutationFn: ({ id, payload }: AssignCreativeHeadVariables) =>
      myTaskApi.assignCreativeHead(id, payload, userId),
    onSuccess: () => {
      invalidateProjectAndTaskQueries(queryClient);
      message.success('Đã giao task cho Creative Manager.');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Không thể assign Creative Manager');
    },
  });
};
