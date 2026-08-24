import { describe, expect, it, afterEach } from 'vitest';
import type { CreateMyTaskRequest, MyTask } from '../schemas/task.schema';
import { INITIAL_MOCK_TASKS, getMockTasksStore, resetMockTasksStore } from './tasks.data';
import {
  filterMockTasks,
  mockAssignCreativeHead,
  mockAssignCreativeManager,
  mockCreateMyTask,
} from './tasks.mock';

const baseTask = INITIAL_MOCK_TASKS[0];

const task = (overrides: Partial<MyTask>): MyTask => ({
  ...baseTask,
  id: overrides.id ?? 'test-task',
  ...overrides,
});

describe('filterMockTasks dashboard drill-down filters', () => {
  it('filters completed tasks by month and timeliness', () => {
    const onTime = task({
      id: 'on-time',
      staffConfirmation: 'finished',
      completedAt: '2026-07-10T18:00:00.000Z',
      deadline: '2026-07-10T23:59:59.000Z',
    });
    const late = task({
      id: 'late',
      staffConfirmation: 'finished',
      completedAt: '2026-07-11T01:00:00.000Z',
      deadline: '2026-07-10T23:59:59.000Z',
    });
    const unfinished = task({
      id: 'unfinished',
      staffConfirmation: 'confirmed',
      completedAt: null,
    });

    expect(
      filterMockTasks([onTime, late, unfinished], {
        timeliness: 'completed',
        completedMonth: '2026-07',
      }).map((item) => item.id),
    ).toEqual(['on-time', 'late']);
    expect(
      filterMockTasks([onTime, late], {
        timeliness: 'on_time',
        completedMonth: '2026-07',
      }).map((item) => item.id),
    ).toEqual(['on-time']);
    expect(
      filterMockTasks([onTime, late], {
        timeliness: 'not_on_time',
        completedMonth: '2026-07',
      }).map((item) => item.id),
    ).toEqual(['late']);
  });

  it('filters project and creative output by task month', () => {
    const projectOutput = task({
      id: 'project-output',
      projectName: 'Sanofi Meninga',
      date: '2026-07-05T00:00:00.000Z',
    });
    const creativeOutput = task({
      id: 'creative-output',
      projectId: null,
      projectName: 'Internal creative',
      taskName: 'Edit   DA 2',
      department: 'creative',
      date: '2026-07-06T00:00:00.000Z',
    });
    const projectCreativeDA = task({
      id: 'project-creative-da',
      projectName: 'Sanofi Meninga',
      taskName: 'DA',
      department: 'creative',
      date: '2026-07-07T00:00:00.000Z',
      staff: [{ code: 'THAO', name: 'Nguyen Thao', userId: 'user-thao' }],
    });
    const otherMonth = task({
      id: 'other-month',
      projectName: 'Sanofi Meninga',
      date: '2026-08-05T00:00:00.000Z',
    });

    expect(
      filterMockTasks([projectOutput, creativeOutput, projectCreativeDA, otherMonth], {
        outputMetric: 'project_slides',
        outputMonth: '2026-07',
      }).map((item) => item.id),
    ).toEqual(['project-output']);
    expect(
      filterMockTasks([projectOutput, creativeOutput, projectCreativeDA], {
        outputMetric: 'creative_da',
        outputMonth: '2026-07',
      }).map((item) => item.id),
    ).toEqual(['creative-output', 'project-creative-da']);
  });
});

const createPayload = (overrides: Partial<CreateMyTaskRequest> = {}): CreateMyTaskRequest => ({
  taskCategory: 'project',
  projectName: 'CRM Redesign',
  projectManager: { code: 'PO.031', name: 'Nguyen Long' },
  taskName: 'Slides',
  level: 2,
  quantity: 3,
  date: '2026-05-14T10:00:00Z',
  description: 'Brief from PM',
  department: 'project',
  designThinking: 2,
  technical: 2,
  contentProcessing: 2,
  additionalFactors: '',
  staff: [
    {
      code: 'PO.061',
      name: 'Nguyen Thao',
      userId: 'usr-thao',
      department: 'project',
      availability: 'free',
    },
  ],
  staffConfirmation: 'not_updated',
  staffNote: '',
  urgency: 'auto',
  workflowKind: 'project',
  assignDirection: 'project_staff',
  ...overrides,
});

describe('mockCreateMyTask assign pipeline', () => {
  afterEach(() => {
    resetMockTasksStore();
  });

  it('allows PM to assign a project staff task', async () => {
    const created = await mockCreateMyTask(createPayload(), 'dev-pm', 'Dev PM');
    expect(created.assignDirection).toBe('project_staff');
    expect(created.staff).toHaveLength(1);
    expect(created.assignedAt).toBeTruthy();
    expect(created.staffConfirmation).toBe('not_updated');
  });

  it('allows a creative handoff with no staff', async () => {
    const created = await mockCreateMyTask(
      createPayload({
        department: 'creative',
        assignDirection: 'creative_department',
        staff: [],
      }),
      'dev-pm',
      'Dev PM',
    );
    expect(created.staff).toEqual([]);
    expect(created.assignedAt).toBeFalsy();
    expect(created.department).toBe('creative');
    expect(created.pipelineStage).toBe('awaiting_ch');
    expect(created.briefOwner).toBe('pm');
  });

  it('rejects Head creating tasks', async () => {
    await expect(mockCreateMyTask(createPayload(), 'dev-head', 'Dev Head')).rejects.toThrow(
      /Project Manager or Admin/,
    );
  });

  it('rejects overloaded staff', async () => {
    await expect(
      mockCreateMyTask(
        createPayload({
          staff: [
            {
              code: 'PO.063',
              name: 'Pham Duc',
              userId: 'usr-duc',
              department: 'project',
              availability: 'overloaded',
            },
          ],
        }),
        'dev-pm',
        'Dev PM',
      ),
    ).rejects.toThrow(/overloaded or on-leave/);
  });
});

describe('creative CH/CM pipeline', () => {
  afterEach(() => {
    resetMockTasksStore();
  });

  it('lets any Creative Head assign a PM-briefed task to a CM without rewriting the brief', async () => {
    const updated = await mockAssignCreativeHead(
      'task-ch-031',
      { cmUserId: 'dev-creative_manager', cmNote: 'Ưu tiên Q3' },
      'dev-creative_head',
    );
    expect(updated.pipelineStage).toBe('awaiting_cm');
    expect(updated.description).toContain('Banner campaign Q3');
    expect(updated.staff[0]?.userId).toBe('dev-creative_manager');
    expect(updated.creativeManager?.userId).toBe('dev-creative_manager');
  });

  it('requires CH to fill brief on a creative-origin task', async () => {
    await expect(
      mockAssignCreativeHead(
        'task-ch-028',
        { cmUserId: 'dev-creative_manager' },
        'dev-creative_head',
      ),
    ).rejects.toThrow(/fill brief/);
  });

  it('lets CH fill brief, classify level, then assign CM', async () => {
    const updated = await mockAssignCreativeHead(
      'task-ch-028',
      {
        cmUserId: 'usr-cm-yen',
        description: 'Motion 15s, tone navy & gold.',
        designThinking: 3,
        technical: 2,
        contentProcessing: 1,
      },
      'dev-creative_head',
    );
    expect(updated.pipelineStage).toBe('awaiting_cm');
    expect(updated.description).toContain('Motion 15s');
    expect(updated.level).toBe(2);
    expect(updated.staff[0]?.userId).toBe('usr-cm-yen');
  });

  it('rejects a second CH after the task left the inbox', async () => {
    await mockAssignCreativeHead(
      'task-ch-031',
      { cmUserId: 'dev-creative_manager' },
      'dev-creative_head',
    );
    await expect(
      mockAssignCreativeHead('task-ch-031', { cmUserId: 'usr-cm-yen' }, 'dev-creative_head'),
    ).rejects.toThrow(/đã được Creative Head khác xử lý/);
  });

  it('lets CM assign the whole task to staff without changing level', async () => {
    const before = await mockAssignCreativeHead(
      'task-ch-031',
      { cmUserId: 'dev-creative_manager' },
      'dev-creative_head',
    );
    const updated = await mockAssignCreativeManager(
      before.id,
      { mode: 'whole', staffUserId: 'usr-creative-ha' },
      'dev-creative_manager',
    );
    expect(updated.pipelineStage).toBe('assigned_staff');
    expect(updated.level).toBe(before.level);
    expect(updated.staff[0]?.userId).toBe('usr-creative-ha');
    expect(updated.assignedAt).toBeTruthy();
  });

  it('lets CM split into subtasks assigned to different staff', async () => {
    const parent = await mockAssignCreativeManager(
      'task-cm-025',
      {
        mode: 'split',
        subtasks: [
          { name: 'Icon dashboard', staffUserId: 'usr-creative-ha', quantity: 12 },
          { name: 'Icon forms', staffUserId: 'usr-creative-tran', quantity: 12 },
        ],
      },
      'dev-creative_manager',
    );
    expect(parent.pipelineStage).toBe('split');
    const children = getMockTasksStore().filter((item) => item.parentTaskId === 'task-cm-025');
    expect(children).toHaveLength(2);
    expect(children.every((item) => item.pipelineStage === 'assigned_staff')).toBe(true);
  });

  it('blocks overloaded creative staff', async () => {
    await expect(
      mockAssignCreativeManager(
        'task-cm-025',
        { mode: 'whole', staffUserId: 'usr-creative-khoa' },
        'dev-creative_manager',
      ),
    ).rejects.toThrow(/Overloaded/);
  });
});
