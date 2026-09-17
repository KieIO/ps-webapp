import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import type { TaskScore } from '@/features/task-scores/schemas/taskScore.schema';
import { buildCreateTaskPayload, CreateTaskPayloadError } from './buildCreateTaskPayload';
import type { CreateTaskFormSnapshot } from './buildCreateTaskPayload';
import type { TaskAssignee } from '../schemas/task.schema';

const scores: TaskScore[] = [
  {
    id: 'score-1',
    name: 'Slides 1',
    group: 'g-project',
    taskType: 'Slides',
    score: 10,
    department: 'project',
    sortOrder: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

const staff: TaskAssignee[] = [
  {
    code: 'PO.061',
    name: 'Nguyễn Thảo',
    userId: 'usr-thao',
    department: 'project',
    availability: 'free',
  },
  {
    code: 'PO.062',
    name: 'Phạm Đức',
    userId: 'usr-duc',
    department: 'project',
    availability: 'overloaded',
  },
];

const baseValues = (): CreateTaskFormSnapshot => ({
  projectName: 'CRM Redesign',
  projectManager: { code: 'PO.031', name: 'Nguyễn Long' },
  taskScoreName: 'Slides 1',
  quantity: 3,
  date: dayjs('2026-05-14T10:00:00'),
  description: 'Brief từ PM',
  designThinking: 2,
  technical: 2,
  contentProcessing: 2,
  assignDirection: 'project_staff',
  staffUserId: 'usr-thao',
  staffNote: '',
});

describe('buildCreateTaskPayload', () => {
  it('builds a project-staff assignment with brief and level', () => {
    const payload = buildCreateTaskPayload({
      workflowKind: 'project',
      values: baseValues(),
      scores,
      staffOptions: staff,
    });

    expect(payload.department).toBe('project');
    expect(payload.assignDirection).toBe('project_staff');
    expect(payload.staff).toHaveLength(1);
    expect(payload.staff[0]?.name).toBe('Nguyễn Thảo');
    expect(payload.description).toBe('Brief từ PM');
    expect(payload.level).toBe(2);
    expect(payload.staffConfirmation).toBe('not_updated');
  });

  it('transfers a project task to creative with brief and no staff', () => {
    const payload = buildCreateTaskPayload({
      workflowKind: 'project',
      values: { ...baseValues(), assignDirection: 'creative_department', staffUserId: 'usr-thao' },
      scores,
      staffOptions: staff,
    });

    expect(payload.department).toBe('creative');
    expect(payload.assignDirection).toBe('creative_department');
    expect(payload.staff).toEqual([]);
    expect(payload.description).toBe('Brief từ PM');
    expect(payload.designThinking).toBe(2);
  });

  it('builds a creative task without brief', () => {
    const payload = buildCreateTaskPayload({
      workflowKind: 'creative',
      values: { ...baseValues(), description: 'should be dropped', assignDirection: undefined },
      scores,
      staffOptions: staff,
    });

    expect(payload.workflowKind).toBe('creative');
    expect(payload.assignDirection).toBe('creative_department');
    expect(payload.description).toBe('');
    expect(payload.staff).toEqual([]);
    expect(payload.department).toBe('creative');
  });

  it('rejects overloaded staff', () => {
    expect(() =>
      buildCreateTaskPayload({
        workflowKind: 'project',
        values: { ...baseValues(), staffUserId: 'usr-duc' },
        scores,
        staffOptions: staff,
      }),
    ).toThrow(CreateTaskPayloadError);
  });

  it('passes selected urgency into the create payload', () => {
    const payload = buildCreateTaskPayload({
      workflowKind: 'project',
      values: { ...baseValues(), urgency: 'red' },
      scores,
      staffOptions: staff,
    });

    expect(payload.urgency).toBe('red');
  });

  it('defaults urgency to auto when omitted', () => {
    const payload = buildCreateTaskPayload({
      workflowKind: 'project',
      values: baseValues(),
      scores,
      staffOptions: staff,
    });

    expect(payload.urgency).toBe('auto');
  });
});
