import type { MyTask } from '@/features/tasks/schemas/task.schema';
import { countsTowardQuantityAggregates } from '@/features/tasks/utils/creativePipeline';
import { parseTaskScoreName } from '@/features/tasks/utils/taskScoreName';
import type { Project } from '../schemas/project.schema';
import { isTaskForProject } from './projectTaskCount';

type ProjectLike = Pick<Project, 'id' | 'code' | 'name'>;

export interface ProjectDetailQuantityByType {
  /** Catalog base name (Slides, DA, QA, …). */
  name: string;
  quantity: number;
}

export interface ProjectDetailStats {
  taskCount: number;
  /** Sum of qty across all counting tasks on the detail table (every type). */
  totalQuantity: number;
  /** Per task-type qty for types present on the current task list. */
  quantityByType: ProjectDetailQuantityByType[];
  averageCompletionPercent: number;
}

export const getProjectTasks = (
  project: ProjectLike,
  tasks: MyTask[],
  allProjects: ProjectLike[],
): MyTask[] => tasks.filter((task) => isTaskForProject(project, task, allProjects));

/** List-page total: every task quantity, including Creative DA. */
export const computeProjectTotalSlides = (
  project: ProjectLike,
  tasks: MyTask[],
  allProjects: ProjectLike[],
): number =>
  getProjectTasks(project, tasks, allProjects)
    .filter(countsTowardQuantityAggregates)
    .reduce((sum, task) => sum + task.quantity, 0);

/** List-page %: quantity-weighted across all tasks. Detail uses an unweighted average of evaluated tasks. */
export const computeProjectCompletionPercent = (
  project: ProjectLike,
  tasks: MyTask[],
  allProjects: ProjectLike[],
): number => {
  const projectTasks = getProjectTasks(project, tasks, allProjects).filter(
    countsTowardQuantityAggregates,
  );
  const totalQuantity = projectTasks.reduce((sum, task) => sum + task.quantity, 0);
  if (totalQuantity === 0) return 0;

  const weightedSum = projectTasks.reduce(
    (sum, task) => sum + (task.completionPercent ?? 0) * task.quantity,
    0,
  );

  return Math.round(weightedSum / totalQuantity);
};

const taskTypeLabel = (taskName: string): string => {
  const base = parseTaskScoreName(taskName).baseName.trim();
  return base || taskName.trim() || '—';
};

/** Aggregate counting tasks by catalog base name; stable A–Z by name. */
export const aggregateQuantityByTaskType = (tasks: MyTask[]): ProjectDetailQuantityByType[] => {
  const byKey = new Map<string, { name: string; quantity: number }>();

  for (const task of tasks) {
    if (!countsTowardQuantityAggregates(task)) continue;
    const name = taskTypeLabel(task.taskName);
    const key = name.toLowerCase();
    const current = byKey.get(key);
    if (current) {
      current.quantity += task.quantity;
    } else {
      byKey.set(key, { name, quantity: task.quantity });
    }
  }

  return [...byKey.values()]
    .map((row) => ({ name: row.name, quantity: Math.round(row.quantity) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
};

const fromProjectRecord = (
  project: Pick<Project, 'taskCount' | 'totalSlides' | 'completionPercent'>,
): ProjectDetailStats => ({
  taskCount: project.taskCount,
  totalQuantity: project.totalSlides,
  quantityByType: [],
  averageCompletionPercent: Math.round(project.completionPercent),
});

/**
 * Stats for the project-detail summary:
 * - totalQuantity = every counting task on the table
 * - quantityByType = one block per task type present
 * - % = unweighted average among evaluated tasks
 */
export const computeProjectDetailStats = (tasks: MyTask[]): ProjectDetailStats => {
  const percents = tasks
    .map((task) => task.completionPercent)
    .filter((value): value is number => value != null);
  const quantityByType = aggregateQuantityByTaskType(tasks);
  const totalQuantity = quantityByType.reduce((sum, row) => sum + row.quantity, 0);

  return {
    taskCount: tasks.length,
    totalQuantity,
    quantityByType,
    averageCompletionPercent:
      percents.length === 0
        ? 0
        : Math.round(percents.reduce((sum, value) => sum + value, 0) / percents.length),
  };
};

/**
 * Prefer live task-table numbers when the full list is available.
 * Fall back to API aggregates while tasks are loading or scoped away.
 */
export const resolveProjectDetailStats = (
  project: Pick<Project, 'taskCount' | 'totalSlides' | 'completionPercent'>,
  tasks: MyTask[] | undefined,
): ProjectDetailStats => {
  if (tasks == null) return fromProjectRecord(project);
  return computeProjectDetailStats(tasks);
};
