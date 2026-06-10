import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserPermissionState } from '@/features/rbac/utils/permissionDerivation';
import { createEmptyUserPermissions } from '@/features/rbac/utils/permissionDerivation';

interface PermissionSliceState {
  permissions: UserPermissionState;
}

const initialState: PermissionSliceState = {
  permissions: createEmptyUserPermissions(),
};

const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {
    setRolePermissions: (state, action: PayloadAction<UserPermissionState>) => {
      state.permissions = action.payload;
    },
    clearPermissions: (state) => {
      state.permissions = createEmptyUserPermissions();
    },
  },
});

export const { setRolePermissions, clearPermissions } = permissionSlice.actions;
export default permissionSlice.reducer;
