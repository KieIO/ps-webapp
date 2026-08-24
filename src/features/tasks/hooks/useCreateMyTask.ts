import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { invalidateProjectAndTaskQueries } from '@/shared/utils/queryInvalidation';
import { myTaskApi } from '../api';
import type { CreateMyTaskRequest } from '../schemas/task.schema';

export const useCreateMyTask = () => {
  const queryClient = useQueryClient();
  const user = useAppSelector((state) => state.auth.user);

  return useMutation({
    mutationFn: (payload: CreateMyTaskRequest) => myTaskApi.create(payload, user?.id, user?.name),
    onSuccess: (_created, payload) => {
      invalidateProjectAndTaskQueries(queryClient);
      const handedToCreative =
        payload.workflowKind === 'creative' || payload.assignDirection === 'creative_department';
      message.success(
        handedToCreative
          ? 'Đã chuyển task sang Creative Department.'
          : payload.assignDirection === 'project_staff'
            ? 'Đã giao task. Nhân viên có 15 phút để confirm.'
            : 'Task created successfully',
      );
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to create task');
    },
  });
};
