import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { titleApi } from '../api';
import type { CreateJobGroupRequest } from '../schemas/title.schema';

export const useCreateJobGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateJobGroupRequest) => titleApi.createJobGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-groups'] });
      queryClient.invalidateQueries({ queryKey: ['job-titles'] });
      message.success('Job group created');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to create job group');
    },
  });
};
