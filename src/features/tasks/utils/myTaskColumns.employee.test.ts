import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import { getMyTaskColumnKeysForRole } from './myTaskColumns';

describe('Employee Project Tasks columns', () => {
  it('uses Assigned by instead of PM Name', () => {
    const keys = getMyTaskColumnKeysForRole(ROLES.EMPLOYEE);
    expect(keys).toContain('assignedBy');
    expect(keys).not.toContain('projectManager');
  });

  it('keeps PM Name for PM / CM', () => {
    expect(getMyTaskColumnKeysForRole(ROLES.PM)).toContain('projectManager');
    expect(getMyTaskColumnKeysForRole(ROLES.PM)).not.toContain('assignedBy');
    expect(getMyTaskColumnKeysForRole(ROLES.CREATIVE_MANAGER)).toContain('projectManager');
  });
});
