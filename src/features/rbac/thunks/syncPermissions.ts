import type { AppDispatch, RootState } from '@/store/store';
import { setRolePermissions } from '@/store/slices/permissionSlice';
import { deriveUserPermissions } from '../utils/permissionDerivation';
import type { Role } from '@/config/permissions';

export const syncUserPermissions =
  (role?: Role) => (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const effectiveRole = role ?? state.auth.user?.role;
    if (!effectiveRole) {
      return;
    }

    const permissions = deriveUserPermissions(effectiveRole, state.permissionConfig.config);
    dispatch(setRolePermissions(permissions));
  };
