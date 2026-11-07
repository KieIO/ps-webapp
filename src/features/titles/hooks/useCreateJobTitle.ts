import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { titleApi } from '../api';
import type { CreateJobTitleRequest } from '../schemas/title.schema';

export const useCreateJobTitle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateJobTitleRequest) => titleApi.createJobTitle(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-titles'] });
      message.success('Job title created');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Failed to create job title'));
    },
  });
};
