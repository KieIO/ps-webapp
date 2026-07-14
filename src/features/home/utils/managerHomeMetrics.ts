import dayjs from 'dayjs';
import type { EmployeeCapacity } from '@/features/capacity/schemas/capacity.schema';
import { PROJECT_URGENCY_STYLES } from '@/features/projects/constants';
import type { Project, ProjectUrgencyColor } from '@/features/projects/schemas/project.schema';
import { resolveProjectUrgencyDisplay } from '@/features/projects/utils/resolveProjectUrgencyDisplay';
import type { MyTask } from '@/features/tasks/schemas/task.schema';
import { formatTaskCodeShort, getTaskDeadline } from '@/features/tasks/utils/taskDetail';
import { CONFIRMATION_LABELS } from '@/shared/constants/taskConfirmation';
import { DEPARTMENT_LABELS } from '@/features/users/constants';
import { DEADLINE_RISK_DAYS, OVERLOAD_CAPACITY_THRESHOLD } from '../constants';
import {
  calendarDaysUntil,
  getProjectDeadlineDaysUntil,
  getTodayCalendarKey,
  isProjectDeadlineAtRisk,
  isTaskActiveToday,
  toCalendarDateKey,
} from './homeMetrics';

export type ManagerActionIssue = 'unconfirmed' | 'deadline_risk';

export const MANAGER_ACTION_ISSUE_LABELS: Record<ManagerActionIssue, string> = {
  unconfirmed: 'Chưa cập nhật',
  deadline_risk: 'Sắp quá deadline',
};

/** CTA copy — mirrors why the task is in this queue. */
export const MANAGER_ACTION_REMIND_CTA: Record<ManagerActionIssue, string> = {
  unconfirmed: 'Nhắc cập nhật',
  deadline_risk: 'Nhắc deadline',
};

export const managerActionRemindHint = (
  issue: ManagerActionIssue,
  assigneeName: string,
): string => {
  const name = assigneeName.trim() || 'assignee';
  if (issue === 'unconfirmed') {
    return `Gửi nhắc cập nhật status tới ${name}`;
  }
  return `Gửi nhắc sắp quá deadline tới ${name}`;
};

export interface ManagerRunningProjectItem {
  id: string;
  name: string;
  clientName: string;
  endDate: string;
  daysUntil: number | null;
  atRisk: boolean;
  completionPercent: number;
  urgency: ProjectUrgencyColor;
  urgencyLabel: string;
}

export interface ManagerActionTaskItem {
  id: string;
  taskCode: string;
  taskCodeShort: string;
  taskName: string;
  projectName: string;
  assigneeName: string;
  /** Assignees with linked accounts — used to enable Remind. */
  assigneeUserIds: string[];
  canRemind: boolean;
  issue: ManagerActionIssue;
  issueLabel: string;
  deadline: string;
  staffConfirmationLabel: string;
}

export interface ManagerTeamCapacityItem {
  id: string;
  name: string;
  departmentLabel: string;
  capacityPercent: number;
  overloaded: boolean;
}

export interface ManagerCompletedTodaySummary {
  completedCount: number;
  assignedTodayCount: number;
  remainingCount: number;
  percent: number;
}

const CLOSED_TASK_STATUSES = new Set(['finished', 'cancelled', 'decline']);

const isTaskDeadlineAtRisk = (task: MyTask, today = dayjs()): boolean => {
  if (CLOSED_TASK_STATUSES.has(task.staffConfirmation)) return false;
  const deadlineKey = toCalendarDateKey(getTaskDeadline(task));
  const daysUntil = calendarDaysUntil(getTodayCalendarKey(today), deadlineKey);
  return daysUntil <= DEADLINE_RISK_DAYS;
};

const assigneeLabel = (task: MyTask): string => {
  if (task.staff.length === 0) return 'Chưa gán';
  if (task.staff.length === 1) return task.staff[0]?.name ?? 'Chưa gán';
  return `${task.staff[0]?.name ?? 'Staff'} +${task.staff.length - 1}`;
};

const collectAssigneeUserIds = (task: MyTask): string[] => {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const member of task.staff) {
    const userId = member.userId?.trim();
    if (!userId || seen.has(userId)) continue;
    seen.add(userId);
    ids.push(userId);
  }
  return ids;
};

export const buildManagerRunningProjects = (
  projects: Project[],
  today = dayjs(),
): ManagerRunningProjectItem[] =>
  projects
    .map((project) => {
      const daysUntil = getProjectDeadlineDaysUntil(project, today);
      const urgency = resolveProjectUrgencyDisplay(project);
      return {
        id: project.id,
        name: project.name,
        clientName: project.client.name,
        endDate: project.endDate,
        daysUntil,
        atRisk: isProjectDeadlineAtRisk(project, today),
        completionPercent: Math.round(project.completionPercent),
        urgency,
        urgencyLabel: PROJECT_URGENCY_STYLES[urgency].label,
      };
    })
    .sort((a, b) => {
      if (a.atRisk !== b.atRisk) return a.atRisk ? -1 : 1;
      const aDays = a.daysUntil ?? Number.POSITIVE_INFINITY;
      const bDays = b.daysUntil ?? Number.POSITIVE_INFINITY;
      return aDays - bDays || a.name.localeCompare(b.name);
    });

/**
 * Action queue: unconfirmed (not_updated) or deadline risk (≤ DEADLINE_RISK_DAYS).
 * Absent-staff / re-assign remain deferred; remind is supported via assignee userIds.
 */
export const buildManagerActionTasks = (
  tasks: MyTask[],
  today = dayjs(),
  options?: { excludeUserId?: string },
): ManagerActionTaskItem[] => {
  const items: ManagerActionTaskItem[] = [];
  const excludeUserId = options?.excludeUserId?.trim();

  for (const task of tasks) {
    if (task.staffConfirmation === 'cancelled') continue;

    let issue: ManagerActionIssue | null = null;
    if (task.staffConfirmation === 'not_updated') {
      issue = 'unconfirmed';
    } else if (isTaskDeadlineAtRisk(task, today)) {
      issue = 'deadline_risk';
    }

    if (!issue) continue;

    const assigneeUserIds = collectAssigneeUserIds(task).filter(
      (userId) => !excludeUserId || userId !== excludeUserId,
    );

    items.push({
      id: task.id,
      taskCode: task.taskCode,
      taskCodeShort: formatTaskCodeShort(task.taskCode),
      taskName: task.taskName,
      projectName: task.projectName,
      assigneeName: assigneeLabel(task),
      assigneeUserIds,
      canRemind: assigneeUserIds.length > 0,
      issue,
      issueLabel: MANAGER_ACTION_ISSUE_LABELS[issue],
      deadline: getTaskDeadline(task),
      staffConfirmationLabel: CONFIRMATION_LABELS[task.staffConfirmation],
    });
  }

  const issueOrder: Record<ManagerActionIssue, number> = {
    deadline_risk: 0,
    unconfirmed: 1,
  };

  return items.sort(
    (a, b) =>
      issueOrder[a.issue] - issueOrder[b.issue] ||
      a.deadline.localeCompare(b.deadline) ||
      a.taskCode.localeCompare(b.taskCode),
  );
};

export const buildManagerCompletedTodaySummary = (
  tasks: MyTask[],
  today = dayjs(),
): ManagerCompletedTodaySummary => {
  const todayKey = getTodayCalendarKey(today);
  const assignedToday = tasks.filter(
    (task) => task.staffConfirmation !== 'cancelled' && isTaskActiveToday(task, today),
  );
  const completedToday = tasks.filter((task) => {
    if (task.staffConfirmation !== 'finished') return false;
    if (!task.updatedAt) return false;
    return toCalendarDateKey(task.updatedAt) === todayKey;
  });

  const assignedTodayCount = assignedToday.length;
  const completedCount = completedToday.length;
  const remainingCount = Math.max(0, assignedTodayCount - completedCount);
  const percent =
    assignedTodayCount === 0 ? 0 : Math.round((completedCount / assignedTodayCount) * 100);

  return { completedCount, assignedTodayCount, remainingCount, percent };
};

export const collectStaffIdsFromTasks = (tasks: MyTask[]): Set<string> => {
  const ids = new Set<string>();
  for (const task of tasks) {
    for (const member of task.staff) {
      if (member.userId) ids.add(member.userId);
    }
  }
  return ids;
};

export const buildManagerTeamCapacity = (
  capacityItems: EmployeeCapacity[],
  staffIds: ReadonlySet<string>,
): ManagerTeamCapacityItem[] =>
  capacityItems
    .filter(
      (item) =>
        staffIds.has(item.id) && item.workStatus === 'working' && item.capacityPercent != null,
    )
    .map((item) => ({
      id: item.id,
      name: item.name,
      departmentLabel: DEPARTMENT_LABELS[item.department],
      capacityPercent: Math.round(item.capacityPercent ?? 0),
      overloaded: (item.capacityPercent ?? 0) > OVERLOAD_CAPACITY_THRESHOLD,
    }))
    .sort((a, b) => b.capacityPercent - a.capacityPercent || a.name.localeCompare(b.name));
