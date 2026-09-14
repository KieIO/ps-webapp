import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message, Modal } from 'antd';
import { ROUTES } from '@/config/constants';
import { useAppDispatch } from '@/shared/hooks/useAppDispatch';
import { logout } from '@/store/slices/authSlice';
import { settingsApi, type DatabaseResetMode } from '../api';

const CONFIRM_COPY: Record<DatabaseResetMode, { title: string; content: string; okText: string }> =
  {
    seed: {
      title: 'Reset database to demo seed data?',
      content:
        'This permanently deletes all application data and restores the full demo dataset (sample users, projects, tasks, and more). Other sessions will be signed out. This cannot be undone.',
      okText: 'Reset to seed data',
    },
    empty: {
      title: 'Reset database to empty bootstrap?',
      content:
        'This permanently deletes projects, tasks, clients, leave, and other operational data. It keeps reference catalogs (titles, departments, task scores) and one account per core role so you can sign in again. Other sessions will be signed out. This cannot be undone.',
      okText: 'Reset to empty',
    },
  };

export const useResetDatabase = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const confirmOpen = useRef(false);

  const mutation = useMutation({
    mutationFn: (mode: DatabaseResetMode) => settingsApi.resetDatabase(mode),
    onSuccess: () => {
      dispatch(logout());
      queryClient.clear();
      window.location.replace(ROUTES.LOGIN);
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to reset database');
    },
  });

  const confirmAndReset = (mode: DatabaseResetMode) => {
    if (confirmOpen.current || mutation.isPending) {
      return;
    }
    confirmOpen.current = true;
    const copy = CONFIRM_COPY[mode];
    Modal.confirm({
      title: copy.title,
      content: copy.content,
      okText: copy.okText,
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      centered: true,
      onOk: () => mutation.mutateAsync(mode),
      afterClose: () => {
        confirmOpen.current = false;
      },
    });
  };

  return { ...mutation, confirmAndReset };
};
