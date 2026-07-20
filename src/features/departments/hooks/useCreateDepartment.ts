import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { departmentApi } from '../api';
import type { CreateDepartmentRequest } from '../schemas/department.schema';
import { DEPARTMENT_QUERY_KEY } from './useDepartmentList';

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDepartmentRequest) => departmentApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEY });
      message.success('Department created');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to create department');
    },
  });
};
