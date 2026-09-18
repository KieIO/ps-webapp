import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { userApi } from '../api';
import type { UpdateUserRequest, User } from '../schemas/user.schema';

interface UpdateUserVariables {
  id: string;
  payload: UpdateUserRequest;
}

interface UseUpdateUserOptions {
  /** When true, skip the default success toast so the caller can show a custom one. */
  silentSuccess?: boolean;
}

export const useUpdateUser = (options?: UseUpdateUserOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateUserVariables) => userApi.update(id, payload),
    onSuccess: (user: User) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.setQueryData(['users', user.id], user);
      if (!options?.silentSuccess) {
        message.success('User updated successfully');
      }
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update user');
    },
  });
};
