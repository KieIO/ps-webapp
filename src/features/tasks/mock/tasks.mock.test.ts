import { describe, expect, it, afterEach } from 'vitest';
import type { CreateMyTaskRequest, MyTask } from '../schemas/task.schema';
import {
  INITIAL_MOCK_TASKS,
  getMockTasksStore,
  resetMockTasksStore,
  setMockTasksStore,
} from './tasks.data';
import {
  filterMockTasks,
  mockAssignCreativeHead,
  mockAssignCreativeManager,
  mockCreateMyTask,
  mockCreateRevisionTask,
  mockListRevisionTasks,
  mockListSplitChildren,
  mockRehandCreativeToCH,
  mockSpawnEvaluationRemainder,
  mockUpdateCreativePipeline,
  mockUpdateMyTaskPmEvaluation,
  mockUpdateMyTaskStatus,
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

  it('filters tasks whose work window includes workDate', () => {
    const spanning = task({
      id: 'spanning',
      date: '2026-09-04T00:00:00.000Z',
      deadline: '2026-09-06T21:19:00.000Z',
    });
    const otherDay = task({
      id: 'other-day',
      date: '2026-09-01T00:00:00.000Z',
      deadline: '2026-09-01T23:59:59.000Z',
    });

    expect(
      filterMockTasks([spanning, otherDay], { workDate: '2026-09-06' }).map((item) => item.id),
    ).toEqual(['spanning']);
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

  it('allows overloaded staff and rejects on-leave staff', async () => {
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
    ).resolves.toBeTruthy();

    await expect(
      mockCreateMyTask(
        createPayload({
          staff: [
            {
              code: 'PO.064',
              name: 'Le Huong',
              userId: 'usr-huong',
              department: 'project',
              availability: 'on_leave',
            },
          ],
        }),
        'dev-pm',
        'Dev PM',
      ),
    ).rejects.toThrow(/on-leave/);
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
    expect(updated.creativeDeadline).toBeTruthy();
  });

  it('rejects PM assigning a CM', async () => {
    await expect(
      mockAssignCreativeHead('task-ch-031', { cmUserId: 'dev-creative_manager' }, 'dev-pm'),
    ).rejects.toThrow(/Creative Head hoặc Admin/);
  });

  it('lets PM rehand a CH-refused task back to awaiting_ch for any CH', async () => {
    await expect(
      mockUpdateMyTaskStatus(
        'task-ch-031',
        { staffConfirmation: 'decline', staffNote: '' },
        'dev-creative_head',
      ),
    ).rejects.toThrow(/lý do/);

    const refused = await mockUpdateMyTaskStatus(
      'task-ch-031',
      { staffConfirmation: 'decline', staffNote: 'Brief thiếu scope' },
      'dev-creative_head',
    );
    expect(refused.pipelineStage).toBe('returned_to_pm');
    expect(refused.staffConfirmation).toBe('decline');

    await expect(mockRehandCreativeToCH('task-ch-031', 'dev-creative_head')).rejects.toThrow(
      /PM hoặc Admin/,
    );

    const rehanded = await mockRehandCreativeToCH('task-ch-031', 'dev-pm');
    expect(rehanded.pipelineStage).toBe('awaiting_ch');
    expect(rehanded.staffConfirmation).toBe('not_updated');
    expect(rehanded.staff).toEqual([]);

    const assigned = await mockAssignCreativeHead(
      'task-ch-031',
      { cmUserId: 'dev-creative_manager' },
      'dev-creative_head',
    );
    expect(assigned.pipelineStage).toBe('awaiting_cm');
  });

  it('persists an explicit creative deadline when CH picks one', async () => {
    const creativeDeadline = '2026-05-01T09:30:00Z';
    const updated = await mockAssignCreativeHead(
      'task-ch-031',
      { cmUserId: 'dev-creative_manager', creativeDeadline },
      'dev-creative_head',
    );
    expect(updated.creativeDeadline).toBe(creativeDeadline);
  });

  it('allows a creative deadline after the PM deadline', async () => {
    const creativeDeadline = '2026-08-22T09:30:00Z';
    const updated = await mockAssignCreativeHead(
      'task-ch-031',
      { cmUserId: 'dev-creative_manager', creativeDeadline },
      'dev-creative_head',
    );
    expect(updated.creativeDeadline).toBe(creativeDeadline);
  });

  it('defaults creative deadline to the Admin/PM deadline when CH leaves it empty', async () => {
    const updated = await mockAssignCreativeHead(
      'task-ch-031',
      { cmUserId: 'dev-creative_manager' },
      'dev-creative_head',
    );
    expect(updated.creativeDeadline).toBe(updated.deadline ?? updated.date);
  });

  it('syncs calendar date when Admin changes PM deadline on creative edit', async () => {
    await mockAssignCreativeHead(
      'task-ch-031',
      { cmUserId: 'dev-creative_manager' },
      'dev-creative_head',
    );
    const deadline = '2026-09-30T17:08:00Z';
    const updated = await mockUpdateCreativePipeline(
      'task-ch-031',
      { deadline },
      'dev-admin',
      'admin',
    );
    expect(updated.deadline).toBe(deadline);
    expect(updated.date).toBe('2026-09-30T00:00:00.000Z');
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
        urgency: 'red',
      },
      'dev-creative_head',
    );
    expect(updated.pipelineStage).toBe('awaiting_cm');
    expect(updated.description).toContain('Motion 15s');
    expect(updated.level).toBe(2);
    expect(updated.urgency).toBe('red');
    expect(updated.staff[0]?.userId).toBe('usr-cm-yen');
  });

  it('does not change urgency when assigning a PM-briefed task', async () => {
    const updated = await mockAssignCreativeHead(
      'task-ch-031',
      { cmUserId: 'dev-creative_manager', urgency: 'red' },
      'dev-creative_head',
    );
    expect(updated.urgency).not.toBe('red');
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
      { mode: 'whole', staffUserId: 'usr-creative-ha', quantity: before.quantity },
      'dev-creative_manager',
    );
    expect(updated.pipelineStage).toBe('assigned_staff');
    expect(updated.level).toBe(before.level);
    expect(updated.staff[0]?.userId).toBe('usr-creative-ha');
    expect(updated.quantity).toBe(before.quantity);
    expect(updated.assignedAt).toBeTruthy();
  });

  it('rejects whole assign when CM quantity exceeds current SL', async () => {
    resetMockTasksStore();
    const before = await mockAssignCreativeHead(
      'task-ch-031',
      { cmUserId: 'dev-creative_manager' },
      'dev-creative_head',
    );
    await expect(
      mockAssignCreativeManager(
        before.id,
        { mode: 'whole', staffUserId: 'usr-creative-ha', quantity: before.quantity + 1 },
        'dev-creative_manager',
      ),
    ).rejects.toThrow(/không được lớn hơn SL hiện tại/);
  });

  it('uses the parent task type when a split child name is left blank', async () => {
    resetMockTasksStore();
    const parent = getMockTasksStore().find((item) => item.id === 'task-cm-025');
    expect(parent?.taskName).toBeTruthy();

    await mockAssignCreativeManager(
      'task-cm-025',
      {
        mode: 'split',
        subtasks: [
          {
            name: '  ',
            staffUserId: 'usr-creative-ha',
            quantity: 10,
            description: 'Phần brief 1',
          },
          {
            name: '',
            staffUserId: 'usr-creative-tran',
            quantity: 14,
            description: 'Phần brief 2',
          },
        ],
      },
      'dev-admin',
    );

    const children = getMockTasksStore().filter((item) => item.parentTaskId === 'task-cm-025');
    expect(children.map((item) => item.taskName)).toEqual([parent?.taskName, parent?.taskName]);
  });

  it('lets CM split into subtasks assigned to different staff', async () => {
    const parent = await mockAssignCreativeManager(
      'task-cm-025',
      {
        mode: 'split',
        subtasks: [
          {
            name: 'Icon dashboard',
            staffUserId: 'usr-creative-ha',
            quantity: 12,
            description: 'Brief icon dashboard',
          },
          {
            name: 'Icon forms',
            staffUserId: 'usr-creative-tran',
            quantity: 12,
            description: 'Brief icon forms',
          },
        ],
      },
      'dev-creative_manager',
    );
    expect(parent.pipelineStage).toBe('split');
    expect(parent.quantity).toBe(24);
    const children = getMockTasksStore().filter((item) => item.parentTaskId === 'task-cm-025');
    expect(children).toHaveLength(2);
    expect(children.every((item) => item.pipelineStage === 'assigned_staff')).toBe(true);
    expect(children[0]?.description).toBe('Brief icon dashboard');
    expect(children[1]?.description).toBe('Brief icon forms');
    expect(parent.staff.map((member) => member.userId).sort()).toEqual(
      ['usr-creative-ha', 'usr-creative-tran'].sort(),
    );
  });

  it('updates parent total and redistributes when editing split SL', async () => {
    await mockAssignCreativeManager(
      'task-cm-025',
      {
        mode: 'split',
        subtasks: [
          {
            name: 'Icon dashboard',
            staffUserId: 'usr-creative-ha',
            quantity: 12,
            description: 'Brief icon dashboard',
          },
          {
            name: 'Icon forms',
            staffUserId: 'usr-creative-tran',
            quantity: 12,
            description: 'Brief icon forms',
          },
        ],
      },
      'dev-admin',
    );

    await mockUpdateCreativePipeline(
      'task-cm-025',
      { quantity: 30, changeReason: 'đổi scope cha' },
      'dev-admin',
      'admin',
    );
    expect(getMockTasksStore().find((item) => item.id === 'task-cm-025')?.quantity).toBe(30);

    const children = getMockTasksStore().filter((item) => item.parentTaskId === 'task-cm-025');
    const [first, second] = children;
    await expect(
      mockUpdateCreativePipeline(
        first!.id,
        {
          changeReason: 'đối soát SL',
          childQuantities: [
            { id: first!.id, quantity: 20 },
            { id: second!.id, quantity: 12 },
          ],
        },
        'dev-creative_manager',
        'creative_manager',
      ),
    ).rejects.toThrow(/không được lớn hơn/);
    expect(getMockTasksStore().find((item) => item.id === 'task-cm-025')?.quantity).toBe(30);

    await expect(
      mockUpdateCreativePipeline(
        'task-cm-025',
        { quantity: 40, changeReason: 'đổi scope cha' },
        'dev-creative_manager',
        'creative_manager',
      ),
    ).rejects.toThrow(/SL tổng/);

    await expect(
      mockUpdateCreativePipeline(
        'task-cm-025',
        {
          changeReason: 'đối soát SL',
          childQuantities: [
            { id: first!.id, quantity: 20 },
            { id: second!.id, quantity: 12 },
          ],
        },
        'dev-admin',
        'admin',
      ),
    ).rejects.toThrow(/không được lớn hơn/);
    expect(getMockTasksStore().find((item) => item.id === 'task-cm-025')?.quantity).toBe(30);

    await mockUpdateCreativePipeline(
      first!.id,
      {
        changeReason: 'đối soát SL',
        childQuantities: [
          { id: first!.id, quantity: 16 },
          { id: second!.id, quantity: 14 },
        ],
      },
      'dev-creative_manager',
      'creative_manager',
    );
    expect(getMockTasksStore().find((item) => item.id === 'task-cm-025')?.quantity).toBe(30);
    expect(getMockTasksStore().find((item) => item.id === first!.id)?.quantity).toBe(16);
    expect(getMockTasksStore().find((item) => item.id === second!.id)?.quantity).toBe(14);
  });

  it('allows changing confirmed child SL; blocks finished / cancelled', async () => {
    await mockAssignCreativeManager(
      'task-cm-025',
      {
        mode: 'split',
        subtasks: [
          {
            name: 'Icon dashboard',
            staffUserId: 'usr-creative-ha',
            quantity: 12,
            description: 'Brief icon dashboard',
          },
          {
            name: 'Icon forms',
            staffUserId: 'usr-creative-tran',
            quantity: 12,
            description: 'Brief icon forms',
          },
        ],
      },
      'dev-admin',
    );
    const children = getMockTasksStore().filter((item) => item.parentTaskId === 'task-cm-025');
    const [first, second] = children;
    const store = getMockTasksStore();
    const firstIdx = store.findIndex((item) => item.id === first!.id);
    store[firstIdx] = { ...store[firstIdx], staffConfirmation: 'confirmed' };
    setMockTasksStore([...store]);

    await expect(
      mockUpdateCreativePipeline(
        'task-cm-025',
        {
          description: 'Updated brief',
          changeReason: 'đối soát SL',
          childQuantities: [
            { id: first!.id, quantity: 12 },
            { id: second!.id, quantity: 12 },
          ],
        },
        'dev-admin',
        'admin',
      ),
    ).resolves.toMatchObject({ description: 'Updated brief' });

    await mockUpdateCreativePipeline(
      'task-cm-025',
      {
        changeReason: 'đối soát SL',
        childQuantities: [
          { id: first!.id, quantity: 10 },
          { id: second!.id, quantity: 14 },
        ],
      },
      'dev-admin',
      'admin',
    );
    expect(getMockTasksStore().find((item) => item.id === first!.id)?.quantity).toBe(10);
    expect(getMockTasksStore().find((item) => item.id === second!.id)?.quantity).toBe(14);

    const afterConfirm = getMockTasksStore();
    const finishedIdx = afterConfirm.findIndex((item) => item.id === first!.id);
    afterConfirm[finishedIdx] = {
      ...afterConfirm[finishedIdx],
      staffConfirmation: 'finished',
    };
    setMockTasksStore([...afterConfirm]);

    await expect(
      mockUpdateCreativePipeline(
        'task-cm-025',
        {
          changeReason: 'đối soát SL',
          childQuantities: [
            { id: first!.id, quantity: 8 },
            { id: second!.id, quantity: 16 },
          ],
        },
        'dev-admin',
        'admin',
      ),
    ).rejects.toThrow(/finish|huỷ/);
  });

  it('rejects non-CM/Admin when adding a split child after split', async () => {
    resetMockTasksStore();
    await mockAssignCreativeManager(
      'task-cm-025',
      {
        mode: 'split',
        subtasks: [
          {
            name: 'Icon dashboard',
            staffUserId: 'usr-creative-ha',
            quantity: 12,
            description: 'Brief icon dashboard',
          },
          {
            name: 'Icon forms',
            staffUserId: 'usr-creative-tran',
            quantity: 12,
            description: 'Brief icon forms',
          },
        ],
      },
      'dev-admin',
    );
    const parent = getMockTasksStore().find((item) => item.id === 'task-cm-025')!;

    // Head can open the edit drawer, but only CM/Admin may addSubtasks.
    await expect(
      mockUpdateCreativePipeline(
        parent.id,
        {
          changeReason: 'Head thử thêm',
          addSubtasks: [{ description: 'blocked', quantity: 0 }],
        },
        'dev-head',
        'head',
      ),
    ).rejects.toThrow(/CM hoặc Admin/);
  });

  it('lets Admin add a QA child whose quantity is outside parent SL', async () => {
    resetMockTasksStore();
    await mockAssignCreativeManager(
      'task-cm-025',
      {
        mode: 'split',
        subtasks: [
          {
            name: 'Icon dashboard',
            staffUserId: 'usr-creative-ha',
            quantity: 12,
            description: 'Brief icon dashboard',
          },
          {
            name: 'Icon forms',
            staffUserId: 'usr-creative-tran',
            quantity: 12,
            description: 'Brief icon forms',
          },
        ],
      },
      'dev-admin',
    );
    const parent = getMockTasksStore().find((item) => item.id === 'task-cm-025')!;
    expect(parent.quantity).toBe(24);

    await mockUpdateCreativePipeline(
      parent.id,
      {
        changeReason: 'thêm QA cho phần đã làm',
        addSubtasks: [
          {
            name: 'QA',
            description: 'QA slides của Quy Ngoc',
            quantity: 5,
            isQa: true,
            qaLevel: 2,
          },
        ],
      },
      'dev-admin',
      'admin',
    );

    const children = getMockTasksStore().filter(
      (item) => item.parentTaskId === parent.id && item.taskKind === 'split',
    );
    const qa = children.find((item) => item.taskName === 'QA');
    expect(qa).toMatchObject({ quantity: 5, level: 2, taskName: 'QA' });
    expect(getMockTasksStore().find((item) => item.id === parent.id)?.quantity).toBe(24);
    const scopeSum = children
      .filter((item) => item.taskName !== 'QA')
      .reduce((sum, item) => sum + item.quantity, 0);
    expect(scopeSum).toBe(24);
  });

  it('lists split children for admin even though list hides them', async () => {
    await mockAssignCreativeManager(
      'task-cm-025',
      {
        mode: 'split',
        subtasks: [
          {
            name: 'Icon dashboard',
            staffUserId: 'usr-creative-ha',
            quantity: 12,
            description: 'Brief icon dashboard',
          },
          {
            name: 'Icon forms',
            staffUserId: 'usr-creative-tran',
            quantity: 12,
            description: 'Brief icon forms',
          },
        ],
      },
      'dev-admin',
    );

    const listed = filterMockTasks(
      getMockTasksStore(),
      { taskCategory: 'project' },
      'dev-admin',
      'admin',
    );
    expect(listed.every((item) => item.parentTaskId !== 'task-cm-025')).toBe(true);

    const children = await mockListSplitChildren('task-cm-025', 'dev-admin', 'admin');
    expect(children).toHaveLength(2);
    expect(children.every((item) => item.parentTaskId === 'task-cm-025')).toBe(true);

    const parent = getMockTasksStore().find((item) => item.id === 'task-cm-025');
    expect(parent?.projectName).toBeTruthy();
    const projectScoped = filterMockTasks(
      getMockTasksStore(),
      { taskCategory: 'project', projectName: parent!.projectName },
      'dev-admin',
      'admin',
    );
    expect(projectScoped.some((item) => item.parentTaskId === 'task-cm-025')).toBe(true);
  });

  it('allows reassigning staff on confirmed split child and resets confirmation', async () => {
    await mockAssignCreativeManager(
      'task-cm-025',
      {
        mode: 'split',
        subtasks: [
          {
            name: 'Icon dashboard',
            staffUserId: 'usr-creative-ha',
            quantity: 12,
            description: 'Brief icon dashboard',
          },
          {
            name: 'Icon forms',
            staffUserId: 'usr-creative-tran',
            quantity: 12,
            description: 'Brief icon forms',
          },
        ],
      },
      'dev-admin',
    );
    const children = getMockTasksStore().filter((item) => item.parentTaskId === 'task-cm-025');
    const first = children[0]!;
    const store = getMockTasksStore();
    const idx = store.findIndex((item) => item.id === first.id);
    store[idx] = { ...store[idx], staffConfirmation: 'confirmed' };
    setMockTasksStore([...store]);

    const updated = await mockUpdateCreativePipeline(
      first.id,
      { staffUserId: 'usr-creative-khoa', changeReason: 'đổi Staff' },
      'dev-admin',
      'admin',
    );
    expect(updated.staffConfirmation).toBe('not_updated');
    expect(updated.staff[0]?.userId).toBe('usr-creative-khoa');
  });

  it('spawns remainder sibling when CM accepts partial quantity on finished split child', async () => {
    await mockAssignCreativeManager(
      'task-cm-025',
      {
        mode: 'split',
        subtasks: [
          {
            name: 'Icon dashboard',
            staffUserId: 'usr-creative-ha',
            quantity: 8,
            description: 'Brief icon dashboard',
          },
          {
            name: 'Icon forms',
            staffUserId: 'usr-creative-tran',
            quantity: 8,
            description: 'Brief icon forms',
          },
        ],
      },
      'dev-admin',
    );
    const children = getMockTasksStore().filter((item) => item.parentTaskId === 'task-cm-025');
    const source = children[0]!;
    const store = getMockTasksStore();
    const idx = store.findIndex((item) => item.id === source.id);
    store[idx] = { ...store[idx], staffConfirmation: 'finished' };
    setMockTasksStore([...store]);

    const result = await mockSpawnEvaluationRemainder(
      source.id,
      { acceptedQuantity: 3, changeReason: 'A mới làm được 3' },
      'dev-creative_manager',
    );

    expect(result.sourceTask.quantity).toBe(3);
    expect(result.sourceTask.originalAssignedQuantity).toBe(8);
    expect(result.sourceTask.evaluationRemainderTaskId).toBe(result.remainderTask.id);
    expect(result.sourceTask.evaluationRemainderTaskCode).toBe(result.remainderTask.taskCode);
    expect(result.sourceTask.evaluationRemainderQuantity).toBe(5);
    expect(result.remainderTask.quantity).toBe(5);
    expect(result.remainderTask.parentTaskId).toBe('task-cm-025');
    expect(result.remainderTask.staff).toEqual([]);
    expect(result.remainderTask.description).toBe(source.description);
    expect(result.remainderTask.designThinking).toBe(source.designThinking);
    expect(
      getMockTasksStore()
        .filter((item) => item.parentTaskId === 'task-cm-025')
        .reduce((sum, item) => sum + item.quantity, 0),
    ).toBe(16);
    expect(getMockTasksStore().find((item) => item.id === 'task-cm-025')?.quantity).toBe(24);

    await expect(
      mockSpawnEvaluationRemainder(
        source.id,
        { acceptedQuantity: 3, changeReason: 'A mới làm được 3' },
        'dev-creative_manager',
      ),
    ).rejects.toThrow(/phần còn lại/);

    const evaluated = await mockUpdateMyTaskPmEvaluation(
      source.id,
      { completionPercent: 38, pmEvaluation: '', pmNote: '' },
      'dev-creative_manager',
    );
    expect(evaluated.completionPercent).toBe(38);
    expect(evaluated.pmNote).toBe(`CM chấp nhận 3/8 · đã tạo ${result.remainderTask.taskCode} (5)`);
  });

  it('staffName filter matches displayed child staff on split parent, not parked CM', async () => {
    const parent = await mockAssignCreativeManager(
      'task-cm-025',
      {
        mode: 'split',
        subtasks: [
          {
            name: 'Icon dashboard',
            staffUserId: 'usr-creative-ha',
            quantity: 12,
            description: 'Brief icon dashboard',
          },
          {
            name: 'Icon forms',
            staffUserId: 'usr-creative-tran',
            quantity: 12,
            description: 'Brief icon forms',
          },
        ],
      },
      'dev-admin',
    );
    const cmName = 'Truong Nhut Long';
    const childName = parent.staff[0]?.name;
    expect(childName).toBeTruthy();
    expect(parent.staff.some((member) => member.name === cmName)).toBe(false);

    const byCm = filterMockTasks([parent], { staffName: cmName });
    expect(byCm.map((item) => item.id)).toEqual([]);

    const byChild = filterMockTasks([parent], { staffName: childName });
    expect(byChild.map((item) => item.id)).toEqual([parent.id]);
  });

  it('allows overloaded creative staff', async () => {
    await expect(
      mockAssignCreativeManager(
        'task-cm-025',
        { mode: 'whole', staffUserId: 'usr-creative-khoa', quantity: 12 },
        'dev-creative_manager',
      ),
    ).resolves.toMatchObject({ pipelineStage: 'assigned_staff', quantity: 12 });
  });

  it('keeps the CM staff score and the CH package score on one whole-assigned task', async () => {
    resetMockTasksStore();
    const handed = await mockAssignCreativeHead(
      'task-ch-031',
      { cmUserId: 'dev-creative_manager' },
      'dev-creative_head',
    );
    const assigned = await mockAssignCreativeManager(
      handed.id,
      { mode: 'whole', staffUserId: 'usr-creative-ha', quantity: handed.quantity },
      'dev-creative_manager',
    );

    const staffScore = await mockUpdateMyTaskPmEvaluation(
      assigned.id,
      { completionPercent: 40, pmEvaluation: '3', pmNote: 'staff result' },
      'dev-creative_manager',
    );
    expect(staffScore.pmEvaluation).toBe('3');
    expect(staffScore.handoffEvaluation ?? '').toBe('');

    const handoff = await mockUpdateMyTaskPmEvaluation(
      assigned.id,
      { completionPercent: 90, pmEvaluation: '5', pmNote: 'CH scores CM' },
      'dev-creative_head',
    );
    expect(handoff.completionPercent).toBe(40);
    expect(handoff.pmEvaluation).toBe('3');
    expect(handoff.pmNote).toBe('staff result');
    expect(handoff.handoffCompletionPercent).toBe(90);
    expect(handoff.handoffEvaluation).toBe('5');
    expect(handoff.handoffNote).toBe('CH scores CM');

    await expect(
      mockUpdateMyTaskPmEvaluation(
        assigned.id,
        { completionPercent: 10, pmEvaluation: '1', pmNote: 'no', layer: 'handoff' },
        'dev-creative_manager',
      ),
    ).rejects.toThrow(/kết quả Staff/);
  });
});

describe('mockCreateRevisionTask', () => {
  afterEach(() => {
    resetMockTasksStore();
  });

  it('creates a linked revision subtask with locked assignee and capacity date', async () => {
    const created = await mockCreateRevisionTask(
      'task-005',
      {
        revisionReason: 'Client đổi màu chart',
        quantity: 10,
        level: 2,
        date: '2026-09-10',
        deadline: '2026-09-12T17:00:00Z',
      },
      'dev-pm',
    );

    expect(created.taskKind).toBe('revision');
    expect(created.parentTaskId).toBe('task-005');
    expect(created.revisionRound).toBe(1);
    expect(created.revisionReason).toBe('Client đổi màu chart');
    expect(created.quantity).toBe(10);
    expect(created.staff[0]?.userId).toBe('dev-pm');
    expect(created.staffConfirmation).toBe('not_updated');
    expect(created.pipelineStage).toBe('assigned_staff');
    expect(created.taskCode).toContain('-R1');

    const listed = await mockListRevisionTasks('task-005', 'dev-pm');
    expect(listed.total).toBeGreaterThanOrEqual(1);
    expect(listed.items.some((item) => item.id === created.id)).toBe(true);
  });

  it('allows quantity larger than parent (expanded scope)', async () => {
    const parent = getMockTasksStore().find((item) => item.id === 'task-005');
    expect(parent).toBeTruthy();
    expect(parent!.quantity).toBe(99);

    const created = await mockCreateRevisionTask(
      'task-005',
      {
        revisionReason: 'Client thêm nhiều slide',
        quantity: 140,
        level: 3,
        date: '2026-09-10',
        deadline: '2026-09-12T17:00:00Z',
      },
      'dev-pm',
    );

    expect(created.quantity).toBe(140);
    expect(created.quantity).toBeGreaterThan(parent!.quantity);
  });

  it('blocks a second active revision on the same parent', async () => {
    await mockCreateRevisionTask(
      'task-006',
      {
        revisionReason: 'First rework',
        quantity: 5,
        level: 2,
        date: '2026-09-10',
        deadline: '2026-09-11T17:00:00Z',
      },
      'dev-pm',
    );

    await expect(
      mockCreateRevisionTask(
        'task-006',
        {
          revisionReason: 'Second rework',
          quantity: 5,
          level: 2,
          date: '2026-09-12',
          deadline: '2026-09-13T17:00:00Z',
        },
        'dev-pm',
      ),
    ).rejects.toThrow(/revision chưa hoàn tất/);
  });

  it('blocks revision when parent is finished', async () => {
    await expect(
      mockCreateRevisionTask(
        'npt-004',
        {
          revisionReason: 'Too late',
          quantity: 1,
          level: 1,
          date: '2026-09-10',
          deadline: '2026-09-11T17:00:00Z',
        },
        'dev-pm',
      ),
    ).rejects.toThrow(/finished/);
  });

  it('blocks revision when parent is cancelled', async () => {
    const parent = getMockTasksStore().find((item) => item.id === 'task-005');
    expect(parent).toBeTruthy();
    setMockTasksStore(
      getMockTasksStore().map((item) =>
        item.id === 'task-005' ? { ...item, staffConfirmation: 'cancelled' as const } : item,
      ),
    );

    await expect(
      mockCreateRevisionTask(
        'task-005',
        {
          revisionReason: 'Cancelled parent',
          quantity: 1,
          level: 1,
          date: '2026-09-10',
          deadline: '2026-09-11T17:00:00Z',
        },
        'dev-pm',
      ),
    ).rejects.toThrow(/hủy/);
  });

  it('blocks deadline before the work date', async () => {
    await expect(
      mockCreateRevisionTask(
        'task-005',
        {
          revisionReason: 'Deadline too early',
          quantity: 1,
          level: 1,
          date: '2026-09-12',
          deadline: '2026-09-11T17:00:00Z',
        },
        'dev-pm',
      ),
    ).rejects.toThrow(/Deadline phải vào ngày tính workload/);
  });
});
