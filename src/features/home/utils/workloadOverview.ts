import type { Role } from '@/config/permissions';
import type { EmployeeCapacity } from '@/features/capacity/schemas/capacity.schema';
import type { Project } from '@/features/projects/schemas/project.schema';
import type { MyTask } from '@/features/tasks/schemas/task.schema';
import type { User } from '@/features/users/schemas/user.schema';
import { DEPARTMENT_LABELS } from '@/features/users/constants';
import {
  HOME_WORKLOAD_STATUS,
  OVERLOAD_CAPACITY_THRESHOLD,
  type HomeWorkloadStatus,
} from '../constants';
import { isTaskActiveToday } from './homeMetrics';
import {
  getWorkloadRowKind,
  isKnownUserDepartment,
  isPmOnTask,
  isStaffOnTask,
  selectWorkloadPeople,
  WORKLOAD_PERSON_COLUMN_LABEL,
  type WorkloadPerson,
  type WorkloadRowKind,
} from './homeScope';

export interface WorkloadOverviewRow {
  key: string;
  name: string;
  userId?: string;
  departmentLabel?: string;
  projectCount: number;
  runningTaskCount: number;
  capacityPercent: number | null;
  status: HomeWorkloadStatus;
}

export interface OverloadRankingItem {
  rank: number;
  name: string;
  userId?: string;
  departmentLabel: string;
  capacityPercent: number;
}

export const getWorkloadStatus = (capacityPercent: number | null): HomeWorkloadStatus => {
  if (capacityPercent == null) return HOME_WORKLOAD_STATUS.NORMAL;
  if (capacityPercent > OVERLOAD_CAPACITY_THRESHOLD) return HOME_WORKLOAD_STATUS.OVERLOADED;
  if (capacityPercent < 70) return HOME_WORKLOAD_STATUS.GOOD;
  return HOME_WORKLOAD_STATUS.NORMAL;
};

const findCapacityForPerson = (
  capacityItems: EmployeeCapacity[],
  person: { id?: string; name: string },
): EmployeeCapacity | undefined => {
  if (person.id) {
    const byId = capacityItems.find((item) => item.id === person.id);
    if (byId) return byId;
  }
  const needle = person.name.trim().toLowerCase();
  return capacityItems.find((item) => item.name.trim().toLowerCase() === needle);
};

/** Projects owned by this PM (project.pm). */
const countProjectsForPm = (projects: Project[], person: WorkloadPerson): number =>
  projects.filter((project) => {
    if (person.id && project.pm.userId === person.id) return true;
    if (person.code && project.pm.code === person.code) return true;
    return project.pm.name.trim().toLowerCase() === person.name.trim().toLowerCase();
  }).length;

/**
 * CM project attribution via staff involvement on scoped tasks.
 * TODO(home-cm-attribution): prefer CreativeManagerID when exposed on MyTask API.
 */
const countProjectsForCreativeManager = (tasks: MyTask[], person: WorkloadPerson): number => {
  const names = new Set<string>();
  for (const task of tasks) {
    if (!isStaffOnTask(task, person)) continue;
    if (task.projectName) names.add(task.projectName);
  }
  return names.size;
};

const countRunningTasksForPerson = (
  todayTasks: MyTask[],
  person: WorkloadPerson,
  rowKind: WorkloadRowKind,
): number => {
  if (rowKind === 'pm') {
    return todayTasks.filter((task) => isPmOnTask(task, person)).length;
  }
  return todayTasks.filter((task) => isStaffOnTask(task, person)).length;
};

export const buildWorkloadOverviewRows = (input: {
  role: Role;
  users: User[];
  scopedProjects: Project[];
  scopedTasks: MyTask[];
  capacityItems: EmployeeCapacity[];
}): { rows: WorkloadOverviewRow[]; personColumnLabel: string; rowKind: WorkloadRowKind } => {
  const rowKind = getWorkloadRowKind(input.role);
  const people = selectWorkloadPeople(input.role, input.users, input.scopedProjects);
  const todayTasks = input.scopedTasks.filter((task) => isTaskActiveToday(task));

  const rows: WorkloadOverviewRow[] = people.map((person) => {
    const projectCount =
      rowKind === 'pm'
        ? countProjectsForPm(input.scopedProjects, person)
        : countProjectsForCreativeManager(input.scopedTasks, person);

    const capacity = findCapacityForPerson(input.capacityItems, person);
    const capacityPercent = capacity?.capacityPercent ?? null;

    return {
      key: person.id ?? person.code ?? person.name,
      name: person.name,
      userId: person.id,
      departmentLabel: person.departmentLabel
        ? isKnownUserDepartment(person.departmentLabel)
          ? DEPARTMENT_LABELS[person.departmentLabel]
          : person.departmentLabel
        : undefined,
      projectCount,
      runningTaskCount: countRunningTasksForPerson(todayTasks, person, rowKind),
      capacityPercent,
      status: getWorkloadStatus(capacityPercent),
    };
  });

  rows.sort((a, b) => {
    const aCap = a.capacityPercent ?? -1;
    const bCap = b.capacityPercent ?? -1;
    return bCap - aCap || a.name.localeCompare(b.name);
  });

  return {
    rows,
    personColumnLabel: WORKLOAD_PERSON_COLUMN_LABEL[rowKind],
    rowKind,
  };
};

export const buildTopOverloadItems = (
  capacityItems: EmployeeCapacity[],
  limit = 5,
): OverloadRankingItem[] =>
  capacityItems
    .filter(
      (item) =>
        item.workStatus === 'working' &&
        item.capacityPercent != null &&
        item.capacityPercent > OVERLOAD_CAPACITY_THRESHOLD,
    )
    .sort(
      (a, b) => (b.capacityPercent ?? 0) - (a.capacityPercent ?? 0) || a.name.localeCompare(b.name),
    )
    .slice(0, limit)
    .map((item, index) => ({
      rank: index + 1,
      name: item.name,
      userId: item.id,
      departmentLabel: DEPARTMENT_LABELS[item.department],
      capacityPercent: item.capacityPercent ?? 0,
    }));
