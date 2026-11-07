import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { titleApi } from '../api';
import type { UpdateJobTitleCapacityRequest } from '../schemas/title.schema';

interface UpdateJobTitleCapacityVariables {
  id: string;
  payload: UpdateJobTitleCapacityRequest;
}

export const useUpdateJobTitleCapacity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateJobTitleCapacityVariables) =>
      titleApi.updateJobTitleCapacity(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-titles'] });
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Failed to update capacity'));
    },
  });
};
