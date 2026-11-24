import { describe, expect, it } from 'vitest';
import { ROLE_LABELS, ROLES } from '@/config/permissions';
import {
  formatAssignedByLabel,
  isCrossDepartmentAssigneeHandoff,
  resolveAssigneePlainLabel,
  resolveAssignedByDisplay,
} from './assigneeDisplay';

describe('isCrossDepartmentAssigneeHandoff', () => {
  it('is true while creative handoff awaits CH/CM', () => {
    expect(
      isCrossDepartmentAssigneeHandoff({
        department: 'creative',
        assignDirection: 'creative_department',
        pipelineStage: 'awaiting_ch',
        staff: [],
      }),
    ).toBe(true);
    expect(
      isCrossDepartmentAssigneeHandoff({
        department: 'creative',
        assignDirection: 'creative_department',
        pipelineStage: 'awaiting_cm',
        staff: [{ code: 'CM', name: 'Dev CM', userId: 'u-cm', role: ROLES.CREATIVE_MANAGER }],
        creativeManager: { code: 'CM', name: 'Dev CM', userId: 'u-cm' },
      }),
    ).toBe(true);
  });

  it('is false for same-dept project staff or after staff assign', () => {
    expect(
      isCrossDepartmentAssigneeHandoff({
        department: 'project',
        assignDirection: 'project_staff',
        staff: [{ code: 'E1', name: 'Emp', userId: 'u-e' }],
      }),
    ).toBe(false);
    expect(
      isCrossDepartmentAssigneeHandoff({
        department: 'creative',
        assignDirection: 'creative_department',
        pipelineStage: 'assigned_staff',
        staff: [{ code: 'E1', name: 'Creative Staff', userId: 'u-e' }],
      }),
    ).toBe(false);
  });
});

describe('resolveAssigneePlainLabel', () => {
  it('returns Creative for cross-dept handoff (any viewer)', () => {
    expect(
      resolveAssigneePlainLabel(ROLES.CREATIVE_HEAD, {
        department: 'creative',
        assignDirection: 'creative_department',
        pipelineStage: 'awaiting_ch',
        staff: [],
      }),
    ).toBe('Creative');
  });

  it('PM always sees Creative Department for creative-dept tasks, even after Staff assign', () => {
    expect(
      resolveAssigneePlainLabel(ROLES.PM, {
        department: 'creative',
        assignDirection: 'creative_department',
        pipelineStage: 'assigned_staff',
        staff: [
          { code: 'TV', name: 'THANH VINH', userId: 'u-tv' },
          { code: 'QN', name: 'QUÝ NGỌC', userId: 'u-qn' },
        ],
      }),
    ).toBe('Creative Department');
    expect(
      resolveAssigneePlainLabel(ROLES.PM, {
        department: 'creative_hcm',
        assignDirection: 'creative_department',
        pipelineStage: 'split',
        staff: [{ code: 'TV', name: 'THANH VINH', userId: 'u-tv' }],
      }),
    ).toBe('Creative Department');
  });

  it('PM still shows staff names for project-dept tasks', () => {
    expect(
      resolveAssigneePlainLabel(ROLES.PM, {
        department: 'project',
        assignDirection: 'project_staff',
        staff: [{ code: 'E1', name: 'Emp Project', userId: 'u-e' }],
      }),
    ).toBeNull();
  });

  it('non-PM still sees staff names after Creative Staff assign', () => {
    expect(
      resolveAssigneePlainLabel(ROLES.CREATIVE_MANAGER, {
        department: 'creative',
        assignDirection: 'creative_department',
        pipelineStage: 'assigned_staff',
        staff: [{ code: 'E1', name: 'Staff A', userId: 'u-e' }],
      }),
    ).toBeNull();
  });

  it('returns null so UI shows staff names for project-dept tasks', () => {
    expect(
      resolveAssigneePlainLabel(ROLES.PM, {
        department: 'project',
        assignDirection: 'project_staff',
        staff: [{ code: 'E1', name: 'Emp', userId: 'u-e' }],
      }),
    ).toBeNull();
  });
});

describe('resolveAssignedByDisplay', () => {
  it('shows project PM during cross-dept creative handoff', () => {
    expect(
      resolveAssignedByDisplay({
        department: 'creative',
        assignDirection: 'creative_department',
        pipelineStage: 'awaiting_ch',
        staff: [],
        projectManager: { code: 'PM', name: 'Anh Kiệt', userId: 'u-pm' },
        assignedBy: { userId: 'u-ch', name: 'Dev Creative Head', role: ROLES.CREATIVE_HEAD },
      }),
    ).toEqual({
      name: 'Anh Kiệt',
      userId: 'u-pm',
      roleLabel: ROLE_LABELS[ROLES.PM],
    });
  });

  it('PM always sees project PM as Assigned by for creative tasks after Staff assign', () => {
    expect(
      resolveAssignedByDisplay(
        {
          department: 'creative',
          assignDirection: 'creative_department',
          pipelineStage: 'assigned_staff',
          staff: [{ code: 'E1', name: 'QUÝ NGỌC', userId: 'u-qn' }],
          projectManager: { code: 'PM', name: 'Anh Kiệt', userId: 'u-pm' },
          assignedBy: { userId: 'u-ch', name: 'Dev Creative Head', role: ROLES.CREATIVE_HEAD },
        },
        ROLES.PM,
      ),
    ).toEqual({
      name: 'Anh Kiệt',
      userId: 'u-pm',
      roleLabel: ROLE_LABELS[ROLES.PM],
    });
  });

  it('non-PM sees last handoff actor after staff is assigned', () => {
    expect(
      resolveAssignedByDisplay(
        {
          department: 'creative',
          assignDirection: 'creative_department',
          pipelineStage: 'assigned_staff',
          staff: [{ code: 'E1', name: 'Staff A', userId: 'u-e' }],
          projectManager: { code: 'PM', name: 'Anh Kiệt', userId: 'u-pm' },
          assignedBy: { userId: 'u-cm', name: 'Dev CM', role: ROLES.CREATIVE_MANAGER },
        },
        ROLES.CREATIVE_MANAGER,
      ),
    ).toEqual({
      name: 'Dev CM',
      userId: 'u-cm',
      roleLabel: ROLE_LABELS[ROLES.CREATIVE_MANAGER],
    });
  });

  it('formats Assigned by label for Employee list / CSV', () => {
    expect(
      formatAssignedByLabel({
        department: 'creative',
        assignDirection: 'creative_department',
        pipelineStage: 'assigned_staff',
        staff: [{ code: 'E1', name: 'Staff A', userId: 'u-e' }],
        projectManager: { code: 'PM', name: 'Anh Kiệt', userId: 'u-pm' },
        assignedBy: { userId: 'u-cm', name: 'Dev CM', role: ROLES.CREATIVE_MANAGER },
      }),
    ).toBe(`Dev CM (${ROLE_LABELS[ROLES.CREATIVE_MANAGER]})`);
  });
});
