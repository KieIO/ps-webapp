import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import { isCreateTaskPmLockedToSelf, pmOptionsForCreateTask } from './createTaskPmOptions';

const options = [
  { code: 'ANH.KIET', name: 'Anh Kiet', userId: 'pm-kiet' },
  { code: 'DEV.PM', name: 'Dev PM', userId: 'dev-pm' },
];

describe('pmOptionsForCreateTask', () => {
  it('keeps every PM for admin', () => {
    expect(pmOptionsForCreateTask(options, { id: 'dev-admin', role: ROLES.ADMIN })).toEqual(
      options,
    );
    expect(isCreateTaskPmLockedToSelf(ROLES.ADMIN)).toBe(false);
  });

  it('returns only the signed-in PM', () => {
    expect(
      pmOptionsForCreateTask(options, { id: 'dev-pm', name: 'Someone', role: ROLES.PM }),
    ).toEqual([{ code: 'DEV.PM', name: 'Dev PM', userId: 'dev-pm' }]);
  });

  it('matches the signed-in PM by name when the option has no user id', () => {
    expect(
      pmOptionsForCreateTask([{ code: 'DEV.PM', name: 'Dev PM' }], {
        id: 'dev-pm',
        name: 'Dev PM',
        role: ROLES.PM,
      }),
    ).toEqual([{ code: 'DEV.PM', name: 'Dev PM', userId: 'dev-pm' }]);
  });
});
