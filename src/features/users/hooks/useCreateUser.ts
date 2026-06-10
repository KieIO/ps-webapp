import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { userApi } from '../api';
import type { CreateUserRequest } from '../schemas/user.schema';

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserRequest) => userApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('User invited successfully');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to invite user');
    },
  });
};
