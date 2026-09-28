import type { MyTask } from '@/features/tasks/schemas/task.schema';
import { countsTowardQuantityAggregates } from '@/features/tasks/utils/creativePipeline';
import { isSlidesOutputTaskName } from '@/features/tasks/utils/taskName';
import type { Project } from '../schemas/project.schema';
import { isTaskForProject } from './projectTaskCount';

type ProjectLike = Pick<Project, 'id' | 'code' | 'name'>;

export interface ProjectDetailStats {
  taskCount: number;
  totalSlides: number;
  averageCompletionPercent: number;
}

export const getProjectTasks = (
  project: ProjectLike,
  tasks: MyTask[],
  allProjects: ProjectLike[],
): MyTask[] => tasks.filter((task) => isTaskForProject(project, task, allProjects));

/** List-page total: every task quantity, including Creative DA. Do not merge with computeProjectDetailStats. */
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
  const totalSlides = projectTasks.reduce((sum, task) => sum + task.quantity, 0);
  if (totalSlides === 0) return 0;

  const weightedSum = projectTasks.reduce(
    (sum, task) => sum + (task.completionPercent ?? 0) * task.quantity,
    0,
  );

  return Math.round(weightedSum / totalSlides);
};

const fromProjectRecord = (
  project: Pick<Project, 'taskCount' | 'totalSlides' | 'completionPercent'>,
): ProjectDetailStats => ({
  taskCount: project.taskCount,
  totalSlides: project.totalSlides,
  averageCompletionPercent: Math.round(project.completionPercent),
});

/** Stats for the project-detail summary: slides qty excludes Creative DA; % is unweighted among evaluated tasks. */
export const computeProjectDetailStats = (tasks: MyTask[]): ProjectDetailStats => {
  const percents = tasks
    .map((task) => task.completionPercent)
    .filter((value): value is number => value != null);
  const totalSlides = tasks
    .filter((task) => isSlidesOutputTaskName(task.taskName) && countsTowardQuantityAggregates(task))
    .reduce((sum, task) => sum + task.quantity, 0);

  return {
    taskCount: tasks.length,
    totalSlides: Math.round(totalSlides),
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
