import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { Role } from '@/config/permissions';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { invalidateProjectAndTaskQueries } from '@/shared/utils/queryInvalidation';
import { myTaskApi } from '../api';
import type { UpdateCreativePipelineRequest } from '../schemas/task.schema';

interface UpdateCreativePipelineVariables {
  id: string;
  payload: UpdateCreativePipelineRequest;
}

export const useUpdateCreativePipeline = () => {
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.auth.user?.id);
  const role = useAppSelector((state) => state.auth.user?.role) as Role | undefined;

  return useMutation({
    mutationFn: ({ id, payload }: UpdateCreativePipelineVariables) =>
      myTaskApi.updateCreativePipeline(id, payload, userId, role),
    onSuccess: (_task, variables) => {
      invalidateProjectAndTaskQueries(queryClient);
      message.success(
        variables.payload.staffUserId
          ? 'Đã cập nhật task và đổi Staff. Nhân viên mới có 15 phút để confirm.'
          : 'Đã cập nhật task Creative.',
      );
    },
    onError: (error: Error) => {
      message.error(error.message || 'Không thể cập nhật task Creative');
    },
  });
};
