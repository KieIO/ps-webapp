import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { settingsApi } from '../api';

export const useExportDatabase = () => {
  return useMutation({
    mutationFn: () => settingsApi.exportDatabase(),
    onSuccess: () => {
      message.success('Database export downloaded.');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to export database');
    },
  });
};
