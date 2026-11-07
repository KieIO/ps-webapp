import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { getApiErrorMessage } from '@/shared/api/apiError';
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
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Failed to create job level'));
    },
  });
};
