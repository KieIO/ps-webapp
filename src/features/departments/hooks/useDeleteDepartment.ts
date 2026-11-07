import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { departmentApi } from '../api';
import { DEPARTMENT_QUERY_KEY } from './useDepartmentList';

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => departmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEY });
      message.success('Department deleted');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Failed to delete department'));
    },
  });
};
