import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { departmentApi } from '../api';
import type { UpdateDepartmentRequest } from '../schemas/department.schema';
import { DEPARTMENT_QUERY_KEY } from './useDepartmentList';

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDepartmentRequest }) =>
      departmentApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEY });
      message.success('Department updated');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update department');
    },
  });
};
