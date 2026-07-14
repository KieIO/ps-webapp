import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { invalidateProjectAndTaskQueries } from '@/shared/utils/queryInvalidation';
import { projectApi } from '../api';

export const useArchiveProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectApi.archive(id),
    onSuccess: () => {
      invalidateProjectAndTaskQueries(queryClient);
      message.success('Đã lưu trữ dự án');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Không thể lưu trữ dự án');
    },
  });
};

export const useUnarchiveProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectApi.unarchive(id),
    onSuccess: () => {
      invalidateProjectAndTaskQueries(queryClient);
      message.success('Đã khôi phục dự án');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Không thể khôi phục dự án');
    },
  });
};
