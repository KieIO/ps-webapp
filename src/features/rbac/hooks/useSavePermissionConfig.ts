import { useMutation } from '@tanstack/react-query';
import { message, Modal } from 'antd';
import { useAppDispatch } from '@/shared/hooks/useAppDispatch';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import {
  persistPermissionConfig,
  resetPermissionConfig,
} from '@/store/slices/permissionConfigSlice';
import {
  configsAreEqual,
  diffPermissionConfigs,
  getDefaultPermissionConfig,
} from '../storage/permissionConfig.storage';
import { syncUserPermissions } from '../thunks/syncPermissions';
import type { PermissionConfigMap } from '../types';

export const useSavePermissionConfig = () => {
  const dispatch = useAppDispatch();
  const savedConfig = useAppSelector((state) => state.permissionConfig.config);
  const actor = useAppSelector((state) => state.auth.user);

  return useMutation({
    mutationFn: async (draftConfig: PermissionConfigMap) => {
      if (configsAreEqual(savedConfig, draftConfig)) {
        throw new Error('No changes to save');
      }

      const changes = diffPermissionConfigs(savedConfig, draftConfig);
      const confirmed = await new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: 'Save permission changes?',
          content:
            'These changes apply to every user assigned to the affected roles. Permissions are stored in this browser’s localStorage until the backend API is available.',
          okText: 'Save changes',
          cancelText: 'Cancel',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });

      if (!confirmed) {
        throw new Error('Save cancelled');
      }

      return { draftConfig, changes };
    },
    onSuccess: ({ draftConfig, changes }) => {
      dispatch(
        persistPermissionConfig(draftConfig, {
          actorId: actor?.id ?? 'unknown',
          actorName: actor?.name ?? 'Unknown admin',
          summary: `${changes.length} permission change(s)`,
          changes,
        }),
      );
      dispatch(syncUserPermissions());
      message.success('Permission changes saved to localStorage');
    },
    onError: (error: Error) => {
      if (error.message !== 'Save cancelled' && error.message !== 'No changes to save') {
        message.error(error.message || 'Failed to save permissions');
      }
    },
  });
};

export const useResetPermissionConfig = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async () => {
      const confirmed = await new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: 'Reset to default permissions?',
          content:
            'This removes local overrides from localStorage and restores the built-in defaults from code.',
          okText: 'Reset defaults',
          okButtonProps: { danger: true },
          cancelText: 'Cancel',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });

      if (!confirmed) {
        throw new Error('Reset cancelled');
      }
    },
    onSuccess: () => {
      dispatch(resetPermissionConfig());
      dispatch(syncUserPermissions());
      message.success('Permissions reset to defaults');
    },
    onError: (error: Error) => {
      if (error.message !== 'Reset cancelled') {
        message.error(error.message || 'Failed to reset permissions');
      }
    },
  });
};

export const usePermissionDraft = () => {
  const savedConfig = useAppSelector((state) => state.permissionConfig.config);
  const defaults = getDefaultPermissionConfig();

  return {
    savedConfig,
    defaults,
    isCustom: !configsAreEqual(savedConfig, defaults),
    source: useAppSelector((state) => state.permissionConfig.source),
    updatedAt: useAppSelector((state) => state.permissionConfig.updatedAt),
  };
};
