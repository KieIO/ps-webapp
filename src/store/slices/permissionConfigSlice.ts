import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PermissionAuditEntry, PermissionConfigMap } from '@/features/rbac/types';
import {
  clearPermissionConfigStorage,
  getDefaultPermissionConfig,
  loadPermissionConfig,
  savePermissionConfig,
} from '@/features/rbac/storage/permissionConfig.storage';

interface PermissionConfigState {
  config: PermissionConfigMap;
  source: 'default' | 'localStorage';
  updatedAt: string | null;
  auditLog: PermissionAuditEntry[];
}

const initialState: PermissionConfigState = {
  config: getDefaultPermissionConfig(),
  source: 'default',
  updatedAt: null,
  auditLog: [],
};

const permissionConfigSlice = createSlice({
  name: 'permissionConfig',
  initialState,
  reducers: {
    hydratePermissionConfig: (state) => {
      const loaded = loadPermissionConfig();
      state.config = loaded.config;
      state.source = loaded.source;
      state.updatedAt = loaded.updatedAt;
      state.auditLog = loaded.auditLog;
    },
    setPermissionConfig: (
      state,
      action: PayloadAction<{
        config: PermissionConfigMap;
        updatedAt: string;
        auditLog: PermissionAuditEntry[];
      }>,
    ) => {
      state.config = action.payload.config;
      state.source = 'localStorage';
      state.updatedAt = action.payload.updatedAt;
      state.auditLog = action.payload.auditLog;
    },
    resetPermissionConfig: (state) => {
      clearPermissionConfigStorage();
      state.config = getDefaultPermissionConfig();
      state.source = 'default';
      state.updatedAt = null;
      state.auditLog = [];
    },
  },
});

export const { hydratePermissionConfig, setPermissionConfig, resetPermissionConfig } =
  permissionConfigSlice.actions;

export const persistPermissionConfig = (
  config: PermissionConfigMap,
  auditEntry: Omit<PermissionAuditEntry, 'id' | 'timestamp'>,
) => {
  const stored = savePermissionConfig(config, auditEntry);
  return setPermissionConfig({
    config: stored.config,
    updatedAt: stored.updatedAt,
    auditLog: stored.auditLog,
  });
};

export default permissionConfigSlice.reducer;
