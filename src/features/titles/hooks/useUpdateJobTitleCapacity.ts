import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
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
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update capacity');
    },
  });
};
