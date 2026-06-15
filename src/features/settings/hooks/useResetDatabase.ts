import { useMutation } from '@tanstack/react-query';
import { message, Modal } from 'antd';
import { ROUTES } from '@/config/constants';
import { useAppDispatch } from '@/shared/hooks/useAppDispatch';
import { logout } from '@/store/slices/authSlice';
import { settingsApi } from '../api';

export const useResetDatabase = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async () => {
      const confirmed = await new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: 'Reset database to initial seed data?',
          content:
            'This permanently deletes all current data (users, projects, tasks, and more) and restores the initial dev seed dataset. This action cannot be undone.',
          okText: 'Reset database',
          okButtonProps: { danger: true },
          cancelText: 'Cancel',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });

      if (!confirmed) {
        throw new Error('Reset cancelled');
      }

      return settingsApi.resetDatabase();
    },
    onSuccess: (result) => {
      dispatch(logout());
      message.success(result.message || 'Database reset to initial seed data');
      window.location.replace(ROUTES.LOGIN);
    },
    onError: (error: Error) => {
      if (error.message !== 'Reset cancelled') {
        message.error(error.message || 'Failed to reset database');
      }
    },
  });
};
