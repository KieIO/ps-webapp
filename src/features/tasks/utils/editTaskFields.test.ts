import { describe, expect, it } from 'vitest';
import { requiresStaffOnGenericEdit } from './editTaskFields';

describe('requiresStaffOnGenericEdit', () => {
  it('requires staff for normal project tasks', () => {
    expect(requiresStaffOnGenericEdit({ taskCategory: 'project', department: 'project' })).toBe(
      true,
    );
  });

  it('does not require staff for creative department / handoff tasks', () => {
    expect(requiresStaffOnGenericEdit({ taskCategory: 'project', department: 'creative' })).toBe(
      false,
    );
    expect(
      requiresStaffOnGenericEdit({
        taskCategory: 'project',
        assignDirection: 'creative_department',
      }),
    ).toBe(false);
    expect(requiresStaffOnGenericEdit({ taskCategory: 'project', workflowKind: 'creative' })).toBe(
      false,
    );
  });

  it('does not require staff for non-project tasks', () => {
    expect(requiresStaffOnGenericEdit({ taskCategory: 'non_project' })).toBe(false);
  });
});
