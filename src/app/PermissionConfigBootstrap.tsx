import { useEffect, type ReactNode } from 'react';
import { useAppDispatch } from '@/shared/hooks/useAppDispatch';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { getMatrixCoverageReport } from '@/config/rbacCoverage';
import { syncUserPermissions } from '@/features/rbac/thunks/syncPermissions';
import { hydratePermissionConfig } from '@/store/slices/permissionConfigSlice';

interface PermissionConfigBootstrapProps {
  children: ReactNode;
}

export function PermissionConfigBootstrap({ children }: PermissionConfigBootstrapProps) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const role = useAppSelector((state) => state.auth.user?.role);
  const config = useAppSelector((state) => state.permissionConfig.config);

  useEffect(() => {
    dispatch(hydratePermissionConfig());
  }, [dispatch]);

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return;
    }

    const { uncovered, unknown } = getMatrixCoverageReport();
    if (uncovered.length > 0) {
      console.warn('[RBAC] Permissions missing from matrix:', uncovered);
    }
    if (unknown.length > 0) {
      console.warn('[RBAC] Unknown permission keys in matrix:', unknown);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && role) {
      dispatch(syncUserPermissions(role));
    }
  }, [dispatch, isAuthenticated, role, config]);

  return children;
}
