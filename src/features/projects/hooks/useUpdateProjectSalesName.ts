import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { invalidateProjectAndTaskQueries } from '@/shared/utils/queryInvalidation';
import { projectApi } from '../api';

interface UpdateProjectSalesNameVariables {
  id: string;
  salesName: string;
}

export const useUpdateProjectSalesName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, salesName }: UpdateProjectSalesNameVariables) =>
      projectApi.updateSalesName(id, salesName),
    onSuccess: (project) => {
      invalidateProjectAndTaskQueries(queryClient);
      queryClient.setQueryData(['projects', project.id], project);
      message.success('Đã cập nhật Sales');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Không thể cập nhật Sales');
    },
  });
};
