import type { Permission } from '@/config/permissions';
import type { Role } from '@/config/permissions';
import { useAppSelector } from './useAppSelector';

export const usePermission = () => {
  const role = useAppSelector((state) => state.auth.user?.role) as Role | undefined;
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const permissions = useAppSelector((state) => state.permission.permissions);

  const can = (permission: Permission): boolean => {
    if (!role) return false;
    return permissions[permission];
  };

  return { can, role, isAuthenticated };
};
