import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import type { Project } from '@/features/projects/schemas/project.schema';
import type { User } from '@/features/users/schemas/user.schema';
import { getWorkloadRowKind, selectWorkloadPeople } from './homeScope';
import { buildWorkloadOverviewRows } from './workloadOverview';

const users = [
  {
    id: 'pm-1',
    name: 'Le Minh Cuong',
    email: 'cuong@test.com',
    role: ROLES.PM,
    status: 'active',
    department: 'project',
    jobTitleId: null,
    joinedAt: '2023-01-01',
  },
  {
    id: 'pm-2',
    name: 'Dev PM',
    email: 'pm@test.com',
    role: ROLES.PM,
    status: 'active',
    department: 'project',
    jobTitleId: null,
    joinedAt: '2023-01-01',
  },
  {
    id: 'cm-1',
    name: 'Dev Creative Manager',
    email: 'cm@test.com',
    role: ROLES.CREATIVE_MANAGER,
    status: 'active',
    department: 'creative_hcm',
    jobTitleId: null,
    joinedAt: '2023-01-01',
  },
  {
    id: 'emp-1',
    name: 'Staff',
    email: 'staff@test.com',
    role: ROLES.EMPLOYEE,
    status: 'active',
    department: 'creative_hcm',
    jobTitleId: null,
    joinedAt: '2023-01-01',
  },
] as User[];

const projects = [
  {
    id: 'proj-1',
    name: 'Altevia',
    status: 'in_progress',
    department: 'project',
    pm: { code: 'CUONG', name: 'Le Minh Cuong', userId: 'pm-1' },
  },
] as Project[];

describe('getWorkloadRowKind', () => {
  it('groups Department Head and Admin by PM', () => {
    expect(getWorkloadRowKind(ROLES.HEAD)).toBe('pm');
    expect(getWorkloadRowKind(ROLES.ADMIN)).toBe('pm');
  });

  it('groups Creative Head by Creative Manager', () => {
    expect(getWorkloadRowKind(ROLES.CREATIVE_HEAD)).toBe('creative_manager');
  });
});

describe('selectWorkloadPeople', () => {
  it('returns PMs for Department Head', () => {
    const people = selectWorkloadPeople(ROLES.HEAD, users, projects);
    expect(people.map((person) => person.name)).toEqual(['Dev PM', 'Le Minh Cuong']);
  });

  it('returns Creative Managers for Creative Head', () => {
    const people = selectWorkloadPeople(ROLES.CREATIVE_HEAD, users, projects);
    expect(people).toHaveLength(1);
    expect(people[0]?.name).toBe('Dev Creative Manager');
    expect(people[0]?.id).toBe('cm-1');
  });
});

describe('buildWorkloadOverviewRows', () => {
  it('labels Department Head column as PM and maps project counts to PM', () => {
    const { personColumnLabel, rows, rowKind } = buildWorkloadOverviewRows({
      role: ROLES.HEAD,
      users,
      scopedProjects: projects,
      scopedTasks: [],
      capacityItems: [],
    });

    expect(rowKind).toBe('pm');
    expect(personColumnLabel).toBe('PM');
    const cuong = rows.find((row) => row.name === 'Le Minh Cuong');
    expect(cuong?.projectCount).toBe(1);
    const barePm = rows.find((row) => row.name === 'Dev PM');
    expect(barePm?.projectCount).toBe(0);
  });

  it('labels Creative Head column as CM', () => {
    const { personColumnLabel, rows, rowKind } = buildWorkloadOverviewRows({
      role: ROLES.CREATIVE_HEAD,
      users,
      scopedProjects: projects,
      scopedTasks: [],
      capacityItems: [],
    });

    expect(rowKind).toBe('creative_manager');
    expect(personColumnLabel).toBe('CM');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.name).toBe('Dev Creative Manager');
  });
});
