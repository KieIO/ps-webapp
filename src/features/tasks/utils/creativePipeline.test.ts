import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import type { CreateMyTaskRequest, MyTask, TaskAssignee } from '../schemas/task.schema';
import {
  countActionableQueueItems,
  filterCreativeManagers,
  filterCreativeQueue,
  filterCreativeStaff,
  needsChBrief,
  resolveCreateBriefOwner,
  resolveCreatePipelineStage,
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

  it('shows all awaiting_ch tasks to every Creative Head', () => {
    const items = [
      task({ id: 'a', pipelineStage: 'awaiting_ch' }),
      task({ id: 'b', pipelineStage: 'awaiting_cm', staff: [assignee({ userId: 'dev-cm' })] }),
      task({ id: 'c', pipelineStage: 'assigned_staff' }),
      task({ id: 'd', pipelineStage: 'awaiting_ch', parentTaskId: 'a' }),
    ];
    expect(
      filterCreativeQueue(items, 'ch', 'dev-creative_head', ROLES.CREATIVE_HEAD).map(
        (item) => item.id,
      ),
    ).toEqual(['a', 'b']);
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

  it('shows CM only their awaiting_cm tasks', () => {
    const items = [
      task({
        id: 'mine',
        pipelineStage: 'awaiting_cm',
        staff: [assignee({ userId: 'dev-creative_manager' })],
      }),
      task({
        id: 'other',
        pipelineStage: 'awaiting_cm',
        staff: [assignee({ userId: 'usr-cm-yen' })],
      }),
    ];
    expect(
      filterCreativeQueue(items, 'cm', 'dev-creative_manager', ROLES.CREATIVE_MANAGER).map(
        (item) => item.id,
      ),
    ).toEqual(['mine']);
  });

  it('counts only actionable CH items', () => {
    const items = [
      task({ id: 'a', pipelineStage: 'awaiting_ch' }),
      task({ id: 'b', pipelineStage: 'awaiting_cm' }),
    ];
    expect(countActionableQueueItems(items, 'ch', 'dev-ch', ROLES.CREATIVE_HEAD)).toBe(1);
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
});
