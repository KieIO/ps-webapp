import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message, Modal } from 'antd';
import { ROUTES } from '@/config/constants';
import { useAppDispatch } from '@/shared/hooks/useAppDispatch';
import { logout } from '@/store/slices/authSlice';
import { settingsApi } from '../api';

export const useImportDatabase = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const confirmOpen = useRef(false);

  const mutation = useMutation({
    mutationFn: (file: File) => settingsApi.importDatabase(file),
    onSuccess: () => {
      dispatch(logout());
      queryClient.clear();
      window.location.replace(ROUTES.LOGIN);
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to import database');
    },
  });

  const confirmAndImport = (file: File) => {
    if (confirmOpen.current || mutation.isPending) {
      return;
    }
    if (!file.name.toLowerCase().endsWith('.zip')) {
      message.error('Backup file must be a .zip archive from Export database.');
      return;
    }
    confirmOpen.current = true;
    Modal.confirm({
      title: 'Import database and replace all data?',
      content: `This permanently deletes the current database and restores "${file.name}". Everyone will be signed out. This cannot be undone.`,
      okText: 'Import and replace',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      centered: true,
      onOk: () => mutation.mutateAsync(file),
      afterClose: () => {
        confirmOpen.current = false;
      },
    });
  };

  const openFilePicker = () => {
    if (mutation.isPending || confirmOpen.current) {
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip,application/zip';
    input.style.display = 'none';
    input.addEventListener('change', () => {
      const file = input.files?.[0] ?? null;
      input.remove();
      if (!file) return;
      confirmAndImport(file);
    });
    document.body.appendChild(input);
    input.click();
  };

  return { ...mutation, openFilePicker };
};
