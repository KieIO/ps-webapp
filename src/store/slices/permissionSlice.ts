import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { PERMISSIONS, type Permission, type Role } from '@/config/permissions';

type PermissionState = Record<Permission, boolean>;

const createEmptyPermissions = (): PermissionState =>
  Object.keys(PERMISSIONS).reduce((acc, key) => {
    acc[key as Permission] = false;
    return acc;
  }, {} as PermissionState);

const derivePermissions = (role: Role): PermissionState => {
  const result = createEmptyPermissions();
  (Object.entries(PERMISSIONS) as [Permission, readonly Role[]][]).forEach(
    ([permission, roles]) => {
      result[permission] = roles.includes(role);
    },
  );
  return result;
};

interface PermissionSliceState {
  permissions: PermissionState;
}

const initialState: PermissionSliceState = {
  permissions: createEmptyPermissions(),
};

const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {
    setRolePermissions: (state, action: PayloadAction<Role>) => {
      state.permissions = derivePermissions(action.payload);
    },
    clearPermissions: (state) => {
      state.permissions = createEmptyPermissions();
    },
  },
});

export const { setRolePermissions, clearPermissions } = permissionSlice.actions;
export default permissionSlice.reducer;
