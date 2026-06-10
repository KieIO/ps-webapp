import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { userApi } from '../api';
import type { UpdateUserRequest } from '../schemas/user.schema';

interface UpdateUserVariables {
  id: string;
  payload: UpdateUserRequest;
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateUserVariables) => userApi.update(id, payload),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.setQueryData(['users', user.id], user);
      message.success('User updated successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update user');
    },
  });
};
