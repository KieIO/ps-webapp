import { useMemo } from 'react';
import { ROLES } from '@/config/permissions';
import { usePermission } from '@/shared/hooks/usePermission';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import {
  getMyTaskColumnDefsForRole,
  getMyTaskColumnKeysForRole,
  type MyTaskColumnDef,
} from '../utils/myTaskColumns';
import type { MyTaskColumnKey } from '../constants';

export const useMyTaskColumns = (): {
  columnKeys: MyTaskColumnKey[];
  columnDefs: MyTaskColumnDef[];
} => {
  const { role } = usePermission();
  const department = useAppSelector((state) => state.auth.user?.department);

  return useMemo(() => {
    const effectiveRole = role ?? ROLES.EMPLOYEE;
    return {
      columnKeys: getMyTaskColumnKeysForRole(effectiveRole, department),
      columnDefs: getMyTaskColumnDefsForRole(effectiveRole, department),
    };
  }, [role, department]);
};
