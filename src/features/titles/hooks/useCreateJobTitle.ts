import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
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
    onError: (error: Error) => {
      message.error(error.message || 'Failed to create job title');
    },
  });
};
