import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
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
    onError: (error: Error) => {
      message.error(error.message || 'Failed to delete department');
    },
  });
};
