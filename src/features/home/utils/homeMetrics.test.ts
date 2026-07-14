import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import type { MyTask } from '@/features/tasks/schemas/task.schema';
import type { Project } from '@/features/projects/schemas/project.schema';
import {
  countTasksByType,
  getTodayCalendarKey,
  isProjectDeadlineAtRisk,
  isTaskActiveToday,
  listDeadlineRiskProjects,
} from './homeMetrics';

const baseTask = {
  id: 't1',
  taskCategory: 'project' as const,
  taskCode: 'CODE',
  projectName: 'P',
  projectManager: { code: 'PM', name: 'PM' },
  level: 2,
  quantity: 1,
  description: '',
  staff: [],
  designThinking: 2,
  technical: 2,
  contentProcessing: 2,
  additionalFactors: '',
  pmEvaluation: '',
  pmNote: '',
  staffConfirmation: 'not_updated' as const,
  staffNote: '',
  urgency: 'auto' as const,
};

const baseProject = {
  id: 'p1',
  code: 'CODE',
  clientId: 'c1',
  client: { id: 'c1', name: 'Client' },
  startDate: '2026-07-01T00:00:00.000Z',
  projectLevel: 2,
  department: 'project' as const,
  departmentHead: { code: 'H', name: 'Head' },
  brief: '',
  volume: 2,
  nature: 2,
  time: 2,
  additionalFactors: '',
  pm: { code: 'PM', name: 'PM' },
  evaluation: '',
  note: '',
  status: 'in_progress' as const,
  urgency: 'auto' as const,
  taskCount: 0,
  members: [],
  totalSlides: 0,
  completionPercent: 0,
};

describe('isTaskActiveToday', () => {
  it('returns true when today falls within date–deadline range', () => {
    const task: MyTask = {
      ...baseTask,
      taskName: 'Slides',
      date: '2026-07-12T00:00:00.000Z',
      deadline: '2026-07-16T23:59:59.000Z',
    };
    expect(isTaskActiveToday(task, dayjs('2026-07-14'))).toBe(true);
  });

  it('returns true for single-day task on today', () => {
    const task: MyTask = {
      ...baseTask,
      taskName: 'Slides',
      date: '2026-07-14T00:00:00.000Z',
      deadline: '2026-07-14T23:59:59.000Z',
    };
    expect(isTaskActiveToday(task, dayjs('2026-07-14'))).toBe(true);
  });

  it('returns false when task date is in the past (single-day)', () => {
    const task: MyTask = {
      ...baseTask,
      taskName: 'Slides',
      date: '2026-06-13T00:00:00.000Z',
      deadline: '2026-06-13T23:59:59.000Z',
    };
    expect(isTaskActiveToday(task, dayjs('2026-07-14'))).toBe(false);
  });

  it('returns false when today is before task start', () => {
    const task: MyTask = {
      ...baseTask,
      taskName: 'Slides',
      date: '2026-07-20T00:00:00.000Z',
      deadline: '2026-07-25T23:59:59.000Z',
    };
    expect(isTaskActiveToday(task, dayjs('2026-07-14'))).toBe(false);
  });
});

describe('isProjectDeadlineAtRisk', () => {
  it('does not flag GoWare-like project ending in 11 days', () => {
    const project = {
      ...baseProject,
      name: 'GoWare Presentation',
      endDate: '2026-07-25T00:00:00.000Z',
    } as Project;
    expect(isProjectDeadlineAtRisk(project, dayjs('2026-07-14'))).toBe(false);
  });

  it('flags overdue running project (Altevia-like)', () => {
    const project = {
      ...baseProject,
      name: 'Altevia Renault Transform in PPT',
      endDate: '2026-06-25T00:00:00.000Z',
    } as Project;
    expect(isProjectDeadlineAtRisk(project, dayjs('2026-07-14'))).toBe(true);
  });

  it('flags project due within 3 days', () => {
    const project = {
      ...baseProject,
      name: 'Near',
      endDate: '2026-07-16T00:00:00.000Z',
    } as Project;
    expect(isProjectDeadlineAtRisk(project, dayjs('2026-07-14'))).toBe(true);
  });

  it('lists at-risk projects with daysUntil and excludes far deadlines', () => {
    const projects = [
      {
        ...baseProject,
        id: 'goware',
        name: 'GoWare Presentation',
        endDate: '2026-07-25T00:00:00.000Z',
      },
      {
        ...baseProject,
        id: 'altevia',
        name: 'Altevia Renault Transform in PPT',
        endDate: '2026-06-25T00:00:00.000Z',
      },
    ] as Project[];

    const atRisk = listDeadlineRiskProjects(projects, dayjs('2026-07-14'));
    expect(atRisk).toHaveLength(1);
    expect(atRisk[0]?.name).toBe('Altevia Renault Transform in PPT');
    expect(atRisk[0]?.daysUntil).toBeLessThan(0);
  });
});

describe('countTasksByType', () => {
  it('groups by taskName catalog label', () => {
    const tasks: MyTask[] = [
      { ...baseTask, taskName: 'Slides', date: '2026-07-14T00:00:00.000Z' },
      { ...baseTask, id: 't2', taskName: 'Slides', date: '2026-07-14T00:00:00.000Z' },
      { ...baseTask, id: 't3', taskName: 'Edit Feedback', date: '2026-07-14T00:00:00.000Z' },
    ];
    expect(countTasksByType(tasks)).toEqual([
      { type: 'Slides', count: 2 },
      { type: 'Edit Feedback', count: 1 },
    ]);
  });
});

describe('getTodayCalendarKey', () => {
  it('formats local calendar date', () => {
    expect(getTodayCalendarKey(dayjs('2026-07-14'))).toBe('2026-07-14');
  });
});
