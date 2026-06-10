import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { titleApi } from '../api';

export const useDeleteJobGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => titleApi.deleteJobGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-groups'] });
      queryClient.invalidateQueries({ queryKey: ['job-titles'] });
      message.success('Job group deleted');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to delete job group');
    },
  });
};
