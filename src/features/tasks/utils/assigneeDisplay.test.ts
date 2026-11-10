import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import { PM_CREATIVE_ASSIGNEE_LABEL, resolveAssigneePlainLabel } from './assigneeDisplay';

describe('resolveAssigneePlainLabel', () => {
  it('returns Creative Department for PM on creative tasks', () => {
    expect(
      resolveAssigneePlainLabel(ROLES.PM, {
        department: 'creative',
        assignDirection: 'creative_department',
      }),
    ).toBe(PM_CREATIVE_ASSIGNEE_LABEL);
  });

  it('returns null for PM on project-staff tasks and for other roles', () => {
    expect(
      resolveAssigneePlainLabel(ROLES.PM, {
        department: 'project',
        assignDirection: 'project_staff',
      }),
    ).toBeNull();
    expect(
      resolveAssigneePlainLabel(ROLES.CREATIVE_HEAD, {
        department: 'creative',
        assignDirection: 'creative_department',
      }),
    ).toBeNull();
    expect(
      resolveAssigneePlainLabel(ROLES.ADMIN, {
        department: 'creative',
      }),
    ).toBeNull();
  });
});
