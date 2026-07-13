/**
 * In-memory task fixtures for `/tasks/project` and `/tasks/non-project`.
 *
 * One `MyTask` row carries every field the API will return; the table shows a
 * role-specific subset of columns (see `getMyTaskColumnKeysForRole`). Department Head
 * sees task columns plus ĐỘ KHÓ / KHỐI LƯỢNG / THỜI GIAN from denormalized project context.
 */
import type { MyTask, TaskAssignee, TaskCategory } from '../schemas/task.schema';
import { computeTaskLevel } from '../utils/taskLevel';
import { enrichMockTaskWithProjectContext } from './mockTaskProjectEnrichment';

const pm012 = { code: 'PO.012', name: 'Phan Thi Cam Tu' };
const pm023 = { code: 'PO.023', name: 'Lam Ngoc Kim Ngan' };
const pm031 = { code: 'PO.031', name: 'Hoang Thi Mai' };

export const MOCK_PROJECT_MANAGERS = [pm012, pm023, pm031] as const;

const staffKhanh: TaskAssignee = {
  code: 'PO.047',
  name: 'Phan Hoang Phuong Khanh',
  userId: 'dev-employee',
};
const staffLong: TaskAssignee = {
  code: 'PO.055',
  name: 'Truong Nhut Long',
  userId: 'dev-creative_manager',
};
const staffNgan: TaskAssignee = {
  code: 'PO.023',
  name: 'Lam Ngoc Kim Ngan',
  userId: 'dev-pm',
};
const staffCreative: TaskAssignee = {
  code: 'CREATIVE',
  name: 'Creative Department',
  userId: 'dev-creative_head',
};

export const MOCK_ASSIGNABLE_STAFF: TaskAssignee[] = [
  staffKhanh,
  staffLong,
  staffNgan,
  staffCreative,
];

/** Staff roster per project — a project may have multiple assignable staff. */
export const MOCK_PROJECT_STAFF_ROSTER: Record<string, TaskAssignee[]> = {
  'Covsignec AMI classification': [staffKhanh, staffLong],
  'AIT Enzymes': [staffKhanh, staffNgan],
  'Altevia Renault Transform in PPT': [staffLong, staffCreative],
  'Sanofi Meninga': [staffKhanh, staffLong, staffCreative],
  'EG Q1 Meeting': [staffNgan, staffKhanh],
  'SPIE Network': [staffKhanh, staffLong, staffNgan],
  'AIA Jul': [staffLong, staffKhanh],
  'Everest Q1 Meeting': [staffKhanh, staffNgan],
  'Internal Training Deck': [staffNgan, staffKhanh],
  'Allianz SPIE Network': [staffKhanh, staffLong],
};

const toIso = (day: number, month: number, year: number): string =>
  new Date(year, month - 1, day).toISOString();

const buildTask = (
  partial: Omit<MyTask, 'level' | 'taskCategory' | 'urgency'> & {
    level?: number;
    taskCategory?: TaskCategory;
  },
): MyTask =>
  enrichMockTaskWithProjectContext({
    taskCategory: partial.taskCategory ?? 'project',
    ...partial,
    level:
      partial.level ??
      computeTaskLevel(partial.designThinking, partial.technical, partial.contentProcessing),
  });

export const INITIAL_MOCK_PROJECT_TASKS: MyTask[] = [
  buildTask({
    id: 'task-001',
    taskCode: 'PO.012.01.0505 - POKE002.26.04.CAC',
    projectName: 'Covsignec AMI classification',
    projectManager: pm012,
    taskName: 'Animation',
    quantity: 19,
    date: toIso(5, 5, 2026),
    description: 'Create animations for slides completed yesterday.',
    staff: [staffKhanh],
    designThinking: 2,
    technical: 2,
    contentProcessing: 2,
    additionalFactors: '',
    completionPercent: 69,
    pmEvaluation: '3',
    pmNote: 'Trong quá trình làm gặp nhiều lỗi lặp lại, cần rà soát lại animation.',
    staffConfirmation: 'not_updated',
    staffNote: '',
    updatedAt: toIso(5, 5, 2026),
  }),
  buildTask({
    id: 'task-002',
    taskCode: 'PO.012.02.0505 - POKE003.18.04.AIT',
    projectName: 'AIT Enzymes',
    projectManager: pm012,
    taskName: 'Slides',
    quantity: 14,
    date: toIso(5, 5, 2026),
    description: 'Build slides as specified in the client WORD file.',
    staff: [staffKhanh],
    designThinking: 2,
    technical: 2,
    contentProcessing: 2,
    additionalFactors: '',
    pmEvaluation: '3',
    pmNote: 'Build slides theo file WORD client gửi.',
    staffConfirmation: 'not_updated',
    staffNote: '',
    updatedAt: toIso(5, 5, 2026),
  }),
  buildTask({
    id: 'task-003',
    taskCode: 'PO.012.03.0306 - POKE004.12.04.ALT',
    projectName: 'Altevia Renault Transform in PPT',
    projectManager: pm012,
    taskName: 'Edit feedback DE',
    quantity: 4,
    date: toIso(3, 6, 2026),
    description: 'Apply German-language feedback on selected slides.',
    staff: [staffLong],
    designThinking: 3,
    technical: 3,
    contentProcessing: 3,
    additionalFactors: 'Client review cycle',
    pmEvaluation: '2',
    pmNote: 'Ưu tiên chỉnh slides 8–12 theo feedback DE.',
    staffConfirmation: 'not_updated',
    staffNote: '',
    updatedAt: toIso(3, 6, 2026),
  }),
  buildTask({
    id: 'task-004',
    taskCode: 'PO.012.04.0306 - POKE005.08.04.SAN',
    projectName: 'Sanofi Meninga',
    projectManager: pm012,
    taskName: 'Redo slide',
    quantity: 13,
    date: toIso(3, 6, 2026),
    description: 'Redo slides flagged in the latest QA pass.',
    staff: [staffCreative],
    designThinking: 2,
    technical: 3,
    contentProcessing: 2,
    additionalFactors: '',
    completionPercent: 45,
    pmEvaluation: '3',
    pmNote: 'Trong quá trình làm gặp nhiều lỗi lặp lại, cần PM theo sát tiến độ.',
    staffConfirmation: 'not_updated',
    staffNote: '',
    updatedAt: toIso(3, 6, 2026),
  }),
  buildTask({
    id: 'task-005',
    taskCode: 'PO.012.05.1005 - POKE006.14.04.EG',
    projectName: 'EG Q1 Meeting',
    projectManager: pm012,
    taskName: 'DA',
    quantity: 99,
    date: toIso(10, 5, 2026),
    description: 'Design asset production for Q1 meeting deck.',
    staff: [staffNgan],
    designThinking: 3,
    technical: 3,
    contentProcessing: 3,
    additionalFactors: 'High volume batch',
    pmEvaluation: '3',
    pmNote: 'Chia nhỏ khối lượng làm trong hai ngày nếu cần.',
    staffConfirmation: 'confirmed',
    staffNote: 'Started batch 1.',
    updatedAt: toIso(10, 5, 2026),
  }),
  buildTask({
    id: 'task-006',
    taskCode: 'PO.012.06.1205 - POKE007.20.04.SPI',
    projectName: 'SPIE Network',
    projectManager: pm012,
    taskName: 'Slides',
    quantity: 30,
    date: toIso(12, 5, 2026),
    description: 'Layout pass for network overview section.',
    staff: [staffKhanh, staffLong],
    designThinking: 2,
    technical: 2,
    contentProcessing: 2,
    additionalFactors: '',
    completionPercent: 100,
    pmEvaluation: '4',
    pmNote: 'Hoàn thành đúng tiến độ, chất lượng đạt yêu cầu.',
    staffConfirmation: 'confirmed',
    staffNote: '',
    updatedAt: toIso(12, 5, 2026),
  }),
  buildTask({
    id: 'task-007',
    taskCode: 'PO.012.07.1505 - POKE008.22.04.AIA',
    projectName: 'AIA Jul',
    projectManager: pm012,
    taskName: 'Animation',
    quantity: 1,
    date: toIso(15, 5, 2026),
    description: 'Single hero slide animation for executive summary.',
    staff: [staffLong],
    designThinking: 3,
    technical: 3,
    contentProcessing: 2,
    additionalFactors: '',
    pmEvaluation: '3',
    pmNote: 'Trong quá trình làm gặp nhiều lỗi lặp lại, đã yêu cầu team cập nhật checklist.',
    staffConfirmation: 'not_updated',
    staffNote: '',
    updatedAt: toIso(15, 5, 2026),
  }),
  buildTask({
    id: 'task-008',
    taskCode: 'PO.012.08.1805 - POKE009.25.04.EVR',
    projectName: 'Everest Q1 Meeting',
    projectManager: pm012,
    taskName: 'Slides',
    quantity: 22,
    date: toIso(18, 5, 2026),
    description: 'Financial charts and KPI slides for Everest Q1 pack.',
    staff: [staffKhanh],
    designThinking: 2,
    technical: 2,
    contentProcessing: 3,
    additionalFactors: 'Data refresh pending',
    completionPercent: 30,
    pmEvaluation: '3',
    pmNote: 'Đang chờ số liệu tài chính cập nhật từ phía client.',
    staffConfirmation: 'not_updated',
    staffNote: '',
    updatedAt: toIso(18, 5, 2026),
  }),
  buildTask({
    id: 'task-009',
    taskCode: 'PO.012.09.2005 - POKE010.01.05.INT',
    projectName: 'Internal Training Deck',
    projectManager: pm012,
    taskName: 'Content update',
    quantity: 8,
    date: toIso(20, 5, 2026),
    description: 'Update onboarding module slides for new hires.',
    staff: [{ code: 'PO.023', name: 'Lam Ngoc Kim Ngan', userId: 'dev-head' }],
    designThinking: 1,
    technical: 1,
    contentProcessing: 2,
    additionalFactors: '',
    pmEvaluation: '3',
    pmNote: 'Trong quá trình làm gặp nhiều lỗi lặp lại, cần PM theo sát tiến độ.',
    staffConfirmation: 'confirmed',
    staffNote: 'Draft sent for review.',
    updatedAt: toIso(20, 5, 2026),
  }),
  buildTask({
    id: 'task-010',
    taskCode: 'PO.012.10.2205 - POKE011.05.05.ALL',
    projectName: 'Allianz SPIE Network',
    projectManager: pm012,
    taskName: 'Edit feedback',
    quantity: 6,
    date: toIso(22, 5, 2026),
    description: 'Incorporate client comments from review session.',
    staff: [staffKhanh],
    designThinking: 2,
    technical: 2,
    contentProcessing: 2,
    additionalFactors: '',
    pmEvaluation: '2',
    pmNote: 'Trong quá trình làm gặp nhiều lỗi lặp lại, cần làm rõ yêu cầu slide 4 với client.',
    staffConfirmation: 'decline',
    staffNote: 'Need clarification on slide 4.',
    updatedAt: toIso(22, 5, 2026),
  }),
];

export const INITIAL_MOCK_NON_PROJECT_TASKS: MyTask[] = [
  buildTask({
    id: 'npt-001',
    taskCategory: 'non_project',
    taskCode: 'INT.01.0106 - INTERNAL_TRAINING',
    projectName: 'Internal Training',
    projectManager: pm023,
    taskName: 'Slides',
    quantity: 12,
    date: toIso(1, 6, 2026),
    description: 'Update onboarding deck for new hires.',
    staff: [staffKhanh],
    designThinking: 1,
    technical: 1,
    contentProcessing: 2,
    additionalFactors: '',
    pmEvaluation: '',
    pmNote: '',
    staffConfirmation: 'not_updated',
    staffNote: '',
    updatedAt: toIso(1, 6, 2026),
  }),
  buildTask({
    id: 'npt-002',
    taskCategory: 'non_project',
    taskCode: 'INT.02.0506 - TEAM_MEETING',
    projectName: 'Team Meeting',
    projectManager: pm012,
    taskName: 'Animation',
    quantity: 3,
    date: toIso(5, 6, 2026),
    description: 'Monthly all-hands presentation animations.',
    staff: [staffLong],
    designThinking: 2,
    technical: 2,
    contentProcessing: 2,
    additionalFactors: '',
    completionPercent: 50,
    pmEvaluation: 'In progress',
    pmNote: 'Draft due Friday.',
    staffConfirmation: 'confirmed',
    staffNote: '',
    updatedAt: toIso(5, 6, 2026),
  }),
  buildTask({
    id: 'npt-003',
    taskCategory: 'non_project',
    taskCode: 'INT.03.0806 - ADMIN_REPORT',
    projectName: 'Admin Reporting',
    projectManager: pm031,
    taskName: 'DA',
    quantity: 5,
    date: toIso(8, 6, 2026),
    description: 'Prepare internal KPI charts for leadership review.',
    staff: [staffNgan],
    designThinking: 2,
    technical: 3,
    contentProcessing: 2,
    additionalFactors: '',
    pmEvaluation: '',
    pmNote: '',
    staffConfirmation: 'not_updated',
    staffNote: '',
    updatedAt: toIso(8, 6, 2026),
  }),
  buildTask({
    id: 'npt-004',
    taskCategory: 'non_project',
    taskCode: 'INT.04.1006 - IT_ONBOARDING',
    projectName: 'IT Onboarding',
    projectManager: pm023,
    taskName: 'Slides',
    quantity: 8,
    date: toIso(10, 6, 2026),
    description: 'Security and tooling slides for IT onboarding.',
    staff: [staffKhanh],
    designThinking: 1,
    technical: 2,
    contentProcessing: 1,
    additionalFactors: '',
    pmEvaluation: '',
    pmNote: '',
    staffConfirmation: 'finished',
    staffNote: 'Delivered to HR.',
    updatedAt: toIso(10, 6, 2026),
  }),
  buildTask({
    id: 'npt-005',
    taskCategory: 'non_project',
    taskCode: 'INT.05.1206 - PROCESS_DOC',
    projectName: 'Process Documentation',
    projectManager: pm012,
    taskName: 'Edit feedback DE',
    quantity: 2,
    date: toIso(12, 6, 2026),
    description: 'Revise SOP deck based on ops team feedback.',
    staff: [staffCreative],
    designThinking: 2,
    technical: 2,
    contentProcessing: 3,
    additionalFactors: 'Internal review',
    pmEvaluation: '',
    pmNote: '',
    staffConfirmation: 'decline',
    staffNote: 'Need updated process map.',
    updatedAt: toIso(12, 6, 2026),
  }),
];

export const INITIAL_MOCK_TASKS: MyTask[] = [
  ...INITIAL_MOCK_PROJECT_TASKS,
  ...INITIAL_MOCK_NON_PROJECT_TASKS,
];

/** @deprecated Use INITIAL_MOCK_PROJECT_TASKS */
export const INITIAL_MOCK_MY_TASKS = INITIAL_MOCK_PROJECT_TASKS;

let mockTasksStore: MyTask[] = [...INITIAL_MOCK_TASKS];

export const getMockTasksStore = (): MyTask[] => mockTasksStore;

export const resetMockTasksStore = (): void => {
  mockTasksStore = [...INITIAL_MOCK_TASKS];
};

export const setMockTasksStore = (tasks: MyTask[]): void => {
  mockTasksStore = tasks;
};
