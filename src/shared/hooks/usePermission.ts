import { PERMISSIONS, type Permission } from '@/config/permissions';
import type { Role } from '@/config/permissions';
import { useAppSelector } from './useAppSelector';

export const usePermission = () => {
  const role = useAppSelector((state) => state.auth.user?.role) as Role | undefined;
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const can = (permission: Permission): boolean => {
    if (!role) return false;
    return (PERMISSIONS[permission] as readonly Role[]).includes(role);
  };

  return { can, role, isAuthenticated };
};
