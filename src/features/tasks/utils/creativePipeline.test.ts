import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import type { CreateMyTaskRequest, MyTask, TaskAssignee } from '../schemas/task.schema';
import {
  canChangeCreativeLevelRole,
  canEditCreativePipelineTask,
  canReassignCreativeStaff,
  countActionableQueueItems,
  filterCreativeManagers,
  filterCreativeQueue,
  filterCreativeStaff,
  isCreativeLevelLockedByStaffConfirm,
  needsChBrief,
  pipelineAssigneeLabel,
  resolveCreateBriefOwner,
  resolveCreatePipelineStage,
  resolveCreativeAssignMode,
  getCreativeSplitSubtasks,
  resolveWholeAssignStaff,
  resolveCreativeDetailPipelineAction,
} from './creativePipeline';

const assignee = (overrides: Partial<TaskAssignee>): TaskAssignee => ({
  code: 'PO.001',
  name: 'Person',
  ...overrides,
});

const task = (overrides: Partial<MyTask>): MyTask =>
  ({
    id: 't1',
    taskCategory: 'project',
    taskCode: 'T-1',
    projectName: 'CRM',
    projectManager: { code: 'PM', name: 'Long' },
    taskName: 'Banner',
    level: 2,
    quantity: 1,
    date: '2026-05-14T00:00:00.000Z',
    description: 'Brief',
    staff: [],
    department: 'creative',
    designThinking: 2,
    technical: 2,
    contentProcessing: 2,
    additionalFactors: '',
    pmEvaluation: '',
    pmNote: '',
    staffConfirmation: 'not_updated',
    staffNote: '',
    urgency: 'auto',
    ...overrides,
  }) as MyTask;

const payload = (overrides: Partial<CreateMyTaskRequest> = {}): CreateMyTaskRequest =>
  ({
    taskCategory: 'project',
    projectName: 'CRM',
    projectManager: { code: 'PM', name: 'Long' },
    taskName: 'Banner',
    level: 2,
    quantity: 1,
    date: '2026-05-14T00:00:00.000Z',
    description: 'Brief',
    department: 'creative',
    designThinking: 2,
    technical: 2,
    contentProcessing: 2,
    additionalFactors: '',
    staff: [],
    staffConfirmation: 'not_updated',
    staffNote: '',
    urgency: 'auto',
    workflowKind: 'project',
    assignDirection: 'creative_department',
    ...overrides,
  }) as CreateMyTaskRequest;

describe('creativePipeline helpers', () => {
  it('sets awaiting_ch and PM brief owner on project handoff', () => {
    const created = payload();
    expect(resolveCreatePipelineStage(created)).toBe('awaiting_ch');
    expect(resolveCreateBriefOwner(created)).toBe('pm');
  });

  it('sets CH as brief owner on creative workflow', () => {
    const created = payload({ workflowKind: 'creative', description: '' });
    expect(resolveCreatePipelineStage(created)).toBe('awaiting_ch');
    expect(resolveCreateBriefOwner(created)).toBe('ch');
  });

  it('flags creative-origin tasks without a brief', () => {
    expect(needsChBrief(task({ briefOwner: 'ch', description: '  ' }))).toBe(true);
    expect(needsChBrief(task({ briefOwner: 'pm', description: 'Filled' }))).toBe(false);
  });

  it('CH board lists full pipeline including assigned and split; excludes subtasks', () => {
    const items = [
      task({ id: 'a', pipelineStage: 'awaiting_ch', date: '2026-05-16T00:00:00.000Z' }),
      task({
        id: 'b',
        pipelineStage: 'awaiting_cm',
        date: '2026-05-15T00:00:00.000Z',
        staff: [assignee({ userId: 'dev-cm' })],
      }),
      task({ id: 'c', pipelineStage: 'assigned_staff', date: '2026-05-14T00:00:00.000Z' }),
      task({ id: 's', pipelineStage: 'split', date: '2026-05-13T00:00:00.000Z' }),
      task({ id: 'd', pipelineStage: 'awaiting_ch', parentTaskId: 'a' }),
      task({ id: 'proj', department: 'project', pipelineStage: 'awaiting_ch' }),
      task({ id: 'np', taskCategory: 'non_project', pipelineStage: 'awaiting_ch' }),
    ];
    expect(
      filterCreativeQueue(items, 'ch', 'dev-creative_head', ROLES.CREATIVE_HEAD).map(
        (item) => item.id,
      ),
    ).toEqual(['a', 'b', 'c', 's']);
  });

  it('sorts queue with actionable first then most recently updated', () => {
    const items = [
      task({
        id: 'old-assigned',
        pipelineStage: 'assigned_staff',
        date: '2026-05-20T00:00:00.000Z',
        updatedAt: '2026-03-01T00:00:00.000Z',
      }),
      task({
        id: 'fresh-split',
        pipelineStage: 'split',
        date: '2026-05-10T00:00:00.000Z',
        updatedAt: '2026-08-25T12:00:00.000Z',
      }),
      task({
        id: 'await-ch',
        pipelineStage: 'awaiting_ch',
        date: '2026-05-01T00:00:00.000Z',
        updatedAt: '2026-05-01T00:00:00.000Z',
      }),
      task({
        id: 'recent-assigned',
        pipelineStage: 'assigned_staff',
        date: '2026-05-05T00:00:00.000Z',
        updatedAt: '2026-08-25T11:00:00.000Z',
      }),
    ];
    expect(
      filterCreativeQueue(items, 'ch', 'dev-ch', ROLES.CREATIVE_HEAD).map((item) => item.id),
    ).toEqual(['await-ch', 'fresh-split', 'recent-assigned', 'old-assigned']);
  });

  it('infers awaiting_ch from creative department + empty staff (live API)', () => {
    const items = [
      task({
        id: 'live',
        department: 'creative',
        staff: [],
        description: 'Brief from PM',
        pipelineStage: undefined,
      }),
    ];
    expect(
      filterCreativeQueue(items, 'ch', 'dev-creative_head', ROLES.CREATIVE_HEAD).map(
        (item) => item.id,
      ),
    ).toEqual(['live']);
    expect(needsChBrief(items[0])).toBe(false);
  });

  it('CM board shows own awaiting_cm, assigned_staff, and split only', () => {
    const cm = 'dev-creative_manager';
    const items = [
      task({
        id: 'await-mine',
        pipelineStage: 'awaiting_cm',
        staff: [assignee({ userId: cm })],
      }),
      task({
        id: 'await-other',
        pipelineStage: 'awaiting_cm',
        staff: [assignee({ userId: 'usr-cm-yen' })],
      }),
      task({
        id: 'done-mine',
        pipelineStage: 'assigned_staff',
        creativeManager: assignee({ userId: cm, name: 'Me' }),
        staff: [assignee({ userId: 'staff-1' })],
      }),
      task({
        id: 'done-other',
        pipelineStage: 'assigned_staff',
        creativeManager: assignee({ userId: 'usr-cm-yen', name: 'Other' }),
        staff: [assignee({ userId: 'staff-2' })],
      }),
      task({
        id: 'split-mine',
        pipelineStage: 'split',
        creativeManager: assignee({ userId: cm, name: 'Me' }),
        staff: [assignee({ userId: cm })],
      }),
      task({ id: 'still-ch', pipelineStage: 'awaiting_ch' }),
    ];
    expect(
      filterCreativeQueue(items, 'cm', cm, ROLES.CREATIVE_MANAGER).map((item) => item.id),
    ).toEqual(['await-mine', 'done-mine', 'split-mine']);
  });

  it('Admin CM view sees all post-CH pipeline tasks', () => {
    const items = [
      task({ id: 'ch', pipelineStage: 'awaiting_ch' }),
      task({
        id: 'cm1',
        pipelineStage: 'awaiting_cm',
        staff: [assignee({ userId: 'cm-a' })],
      }),
      task({
        id: 'cm2',
        pipelineStage: 'assigned_staff',
        creativeManager: assignee({ userId: 'cm-b' }),
        staff: [assignee({ userId: 'staff' })],
      }),
    ];
    expect(filterCreativeQueue(items, 'cm', 'admin', ROLES.ADMIN).map((item) => item.id)).toEqual([
      'cm1',
      'cm2',
    ]);
  });

  it('CM with missing userId sees an empty board', () => {
    const items = [
      task({
        id: 'mine',
        pipelineStage: 'awaiting_cm',
        staff: [assignee({ userId: 'dev-creative_manager' })],
      }),
    ];
    expect(filterCreativeQueue(items, 'cm', undefined, ROLES.CREATIVE_MANAGER)).toEqual([]);
  });

  it('counts only actionable items (banner), not full board size', () => {
    const items = [
      task({ id: 'a', pipelineStage: 'awaiting_ch' }),
      task({ id: 'b', pipelineStage: 'awaiting_cm' }),
      task({ id: 'c', pipelineStage: 'assigned_staff' }),
    ];
    expect(countActionableQueueItems(items, 'ch', 'dev-ch', ROLES.CREATIVE_HEAD)).toBe(1);
    expect(
      countActionableQueueItems(
        [
          task({
            id: 'mine',
            pipelineStage: 'awaiting_cm',
            staff: [assignee({ userId: 'cm-1' })],
          }),
          task({
            id: 'done',
            pipelineStage: 'assigned_staff',
            creativeManager: assignee({ userId: 'cm-1' }),
            staff: [assignee({ userId: 'staff' })],
          }),
        ],
        'cm',
        'cm-1',
        ROLES.CREATIVE_MANAGER,
      ),
    ).toBe(1);
  });

  it('separates CM pickers from creative staff', () => {
    const options = [
      assignee({ userId: 'cm', role: ROLES.CREATIVE_MANAGER, department: 'creative_hcm' }),
      assignee({ userId: 'ch', role: ROLES.CREATIVE_HEAD, department: 'creative_hcm' }),
      assignee({ userId: 'staff', role: ROLES.EMPLOYEE, department: 'creative_hcm' }),
      assignee({ userId: 'proj', role: ROLES.EMPLOYEE, department: 'project' }),
    ];
    expect(filterCreativeManagers(options).map((item) => item.userId)).toEqual(['cm']);
    expect(filterCreativeStaff(options).map((item) => item.userId)).toEqual(['staff']);
  });

  it('labels Người nhận as Creative Staff names only', () => {
    expect(pipelineAssigneeLabel(task({ pipelineStage: 'awaiting_ch', staff: [] }))).toBe('—');
    expect(
      pipelineAssigneeLabel(
        task({
          pipelineStage: 'awaiting_cm',
          creativeManager: assignee({ name: 'Yen', userId: 'cm' }),
          staff: [assignee({ name: 'Yen', userId: 'cm' })],
        }),
      ),
    ).toBe('—');
    expect(
      pipelineAssigneeLabel(
        task({
          pipelineStage: 'assigned_staff',
          creativeManager: assignee({ name: 'Yen', userId: 'cm' }),
          staff: [assignee({ name: 'An' }), assignee({ name: 'Thao' })],
        }),
      ),
    ).toBe('An, Thao');
    expect(
      pipelineAssigneeLabel(
        task({
          pipelineStage: 'assigned_staff',
          creativeManager: assignee({ name: 'Yen', userId: 'cm' }),
          staff: [
            assignee({ name: 'Yen', userId: 'cm' }),
            assignee({ name: 'An', userId: 'staff-1' }),
          ],
        }),
      ),
    ).toBe('An');
    expect(
      pipelineAssigneeLabel(
        task({
          pipelineStage: 'split',
          creativeManager: assignee({ name: 'Yen', userId: 'cm' }),
          staff: [assignee({ name: 'Yen', userId: 'cm' })],
        }),
      ),
    ).toBe('—');
    expect(
      pipelineAssigneeLabel(
        task({
          id: 'parent-split',
          pipelineStage: 'split',
          creativeManager: assignee({ name: 'Yen', userId: 'cm' }),
          staff: [assignee({ name: 'Yen', userId: 'cm' })],
        }),
        [
          task({
            id: 'c1',
            parentTaskId: 'parent-split',
            pipelineStage: 'assigned_staff',
            staff: [assignee({ name: 'Hoang Yen', userId: 's1' })],
          }),
          task({
            id: 'c2',
            parentTaskId: 'parent-split',
            pipelineStage: 'assigned_staff',
            staff: [assignee({ name: 'Nguyen Van An', userId: 's2' })],
          }),
        ],
      ),
    ).toBe('Hoang Yen, Nguyen Van An');
    expect(
      pipelineAssigneeLabel(
        task({
          pipelineStage: 'split',
          creativeManager: assignee({ name: 'Yen', userId: 'cm' }),
          staff: [
            assignee({ name: 'Hoang Yen', userId: 's1' }),
            assignee({ name: 'Nguyen Van An', userId: 's2' }),
          ],
        }),
      ),
    ).toBe('Hoang Yen, Nguyen Van An');
  });

  it('locks level after staff confirm and scopes edit permissions', () => {
    const assigned = task({
      pipelineStage: 'assigned_staff',
      staffConfirmation: 'confirmed',
      creativeManager: assignee({ userId: 'cm-1', name: 'CM' }),
      staff: [assignee({ userId: 'staff-1', name: 'An' })],
    });
    expect(isCreativeLevelLockedByStaffConfirm(assigned)).toBe(true);
    expect(canChangeCreativeLevelRole(ROLES.CREATIVE_MANAGER)).toBe(false);
    expect(canChangeCreativeLevelRole(ROLES.CREATIVE_HEAD)).toBe(true);
    expect(canEditCreativePipelineTask(assigned, ROLES.CREATIVE_MANAGER, 'cm-1')).toBe(true);
    expect(canEditCreativePipelineTask(assigned, ROLES.CREATIVE_MANAGER, 'other')).toBe(false);
    expect(canReassignCreativeStaff(assigned, ROLES.CREATIVE_HEAD)).toBe(true);
  });

  it('resolves assign mode and split subtasks for edit UI', () => {
    expect(resolveCreativeAssignMode(task({ pipelineStage: 'awaiting_cm' }))).toBeNull();
    expect(resolveCreativeAssignMode(task({ pipelineStage: 'assigned_staff' }))).toBe('whole');
    expect(resolveCreativeAssignMode(task({ pipelineStage: 'split' }))).toBe('split');

    const parent = task({ id: 'p1', pipelineStage: 'split' });
    const children = [
      task({ id: 'c2', parentTaskId: 'p1', taskCode: 'T-S2' }),
      task({ id: 'c1', parentTaskId: 'p1', taskCode: 'T-S1' }),
    ];
    expect(getCreativeSplitSubtasks(parent, children).map((item) => item.id)).toEqual(['c1', 'c2']);

    expect(
      resolveWholeAssignStaff(
        task({
          pipelineStage: 'assigned_staff',
          creativeManager: assignee({ userId: 'cm', name: 'CM' }),
          staff: [assignee({ userId: 'cm', name: 'CM' }), assignee({ userId: 's1', name: 'An' })],
        }),
      ).map((m) => m.name),
    ).toEqual(['An']);
  });

  it('resolves task-detail creative assign CTA by stage and role', () => {
    const awaitingCh = task({ pipelineStage: 'awaiting_ch', staff: [], description: '' });
    expect(resolveCreativeDetailPipelineAction(awaitingCh, ROLES.CREATIVE_HEAD, 'ch')).toEqual({
      action: 'assign_cm',
      label: 'Bổ sung brief & giao CM',
    });
    expect(resolveCreativeDetailPipelineAction(awaitingCh, ROLES.PM, 'pm')).toEqual({
      action: 'assign_cm',
      label: 'Bổ sung brief & giao CM',
    });
    expect(resolveCreativeDetailPipelineAction(awaitingCh, ROLES.EMPLOYEE, 'e1')).toBeNull();
    expect(
      resolveCreativeDetailPipelineAction(awaitingCh, ROLES.CREATIVE_MANAGER, 'cm'),
    ).toBeNull();

    const awaitingCm = task({
      pipelineStage: 'awaiting_cm',
      creativeManager: assignee({ userId: 'cm-1', name: 'Yen' }),
      staff: [assignee({ userId: 'cm-1', name: 'Yen' })],
    });
    expect(resolveCreativeDetailPipelineAction(awaitingCm, ROLES.CREATIVE_MANAGER, 'cm-1')).toEqual(
      {
        action: 'assign_staff',
        label: 'Giao cho Staff',
      },
    );
    expect(
      resolveCreativeDetailPipelineAction(awaitingCm, ROLES.CREATIVE_MANAGER, 'other'),
    ).toBeNull();
    expect(resolveCreativeDetailPipelineAction(awaitingCm, ROLES.ADMIN, 'admin')).toEqual({
      action: 'assign_staff',
      label: 'Giao cho Staff',
    });
    expect(resolveCreativeDetailPipelineAction(awaitingCm, ROLES.CREATIVE_HEAD, 'ch')).toEqual({
      action: 'edit',
      label: 'Sửa / Đổi giao',
    });

    const assigned = task({
      pipelineStage: 'assigned_staff',
      creativeManager: assignee({ userId: 'cm-1' }),
      staff: [assignee({ userId: 'staff-1', name: 'An' })],
    });
    expect(resolveCreativeDetailPipelineAction(assigned, ROLES.PM, 'pm')?.action).toBe('edit');
    expect(
      resolveCreativeDetailPipelineAction(
        { ...assigned, staffConfirmation: 'finished' },
        ROLES.ADMIN,
        'admin',
      ),
    ).toBeNull();
    expect(
      resolveCreativeDetailPipelineAction(
        task({ pipelineStage: 'awaiting_ch', parentTaskId: 'parent', staff: [] }),
        ROLES.ADMIN,
        'admin',
      ),
    ).toBeNull();
  });
});
