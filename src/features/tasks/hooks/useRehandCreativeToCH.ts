import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { invalidateProjectAndTaskQueries } from '@/shared/utils/queryInvalidation';
import { myTaskApi } from '../api';

export const useRehandCreativeToCH = () => {
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useMutation({
    mutationFn: (id: string) => myTaskApi.rehandCreativeToCH(id, userId),
    onSuccess: () => {
      invalidateProjectAndTaskQueries(queryClient);
      message.success('Đã đưa task lại hàng chờ Creative Head.');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Không thể đưa task lại hàng chờ Creative Head');
    },
  });
};
