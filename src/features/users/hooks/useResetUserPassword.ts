import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { userApi } from '../api';

export const useResetUserPassword = () =>
  useMutation({
    mutationFn: ({ userId, password }: { userId: string; password?: string }) =>
      userApi.resetPassword(userId, password),
    onSuccess: () => {
      message.success('Password reset');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to reset password');
    },
  });
