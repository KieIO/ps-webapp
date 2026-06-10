import { useMemo } from 'react';
import { ROLES } from '@/config/permissions';
import { usePermission } from '@/shared/hooks/usePermission';
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

  return useMemo(() => {
    const effectiveRole = role ?? ROLES.EMPLOYEE;
    return {
      columnKeys: getMyTaskColumnKeysForRole(effectiveRole),
      columnDefs: getMyTaskColumnDefsForRole(effectiveRole),
    };
  }, [role]);
};
