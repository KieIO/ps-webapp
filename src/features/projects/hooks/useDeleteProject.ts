import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { invalidateProjectAndTaskQueries } from '@/shared/utils/queryInvalidation';
import { projectApi } from '../api';

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useMutation({
    mutationFn: (id: string) => projectApi.delete(id, userId),
    onSuccess: () => {
      invalidateProjectAndTaskQueries(queryClient);
      message.success('Project deleted successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to delete project');
    },
  });
};
