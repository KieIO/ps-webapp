import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message, Modal } from 'antd';
import { ROUTES } from '@/config/constants';
import { useAppDispatch } from '@/shared/hooks/useAppDispatch';
import { logout } from '@/store/slices/authSlice';
import { settingsApi } from '../api';

export const useResetDatabase = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const confirmOpen = useRef(false);

  const mutation = useMutation({
    mutationFn: () => settingsApi.resetDatabase(),
    onSuccess: () => {
      dispatch(logout());
      queryClient.clear();
      window.location.replace(ROUTES.LOGIN);
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to reset database');
    },
  });

  const confirmAndReset = () => {
    if (confirmOpen.current || mutation.isPending) {
      return;
    }
    confirmOpen.current = true;
    Modal.confirm({
      title: 'Reset database to initial seed data?',
      content:
        'This permanently deletes all application data (users, projects, tasks, clients, leave, and more) and restores the initial dev seed dataset. Other sessions will be signed out. This cannot be undone.',
      okText: 'Reset database',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      centered: true,
      onOk: () => mutation.mutateAsync(),
      afterClose: () => {
        confirmOpen.current = false;
      },
    });
  };

  return { ...mutation, confirmAndReset };
};
