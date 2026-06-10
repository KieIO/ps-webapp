import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { titleApi } from '../api';
import type { CreateJobLevelRequest } from '../schemas/title.schema';

export const useCreateJobLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateJobLevelRequest) => titleApi.createJobLevel(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-levels'] });
      queryClient.invalidateQueries({ queryKey: ['job-titles'] });
      message.success('Job level created');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to create job level');
    },
  });
};
