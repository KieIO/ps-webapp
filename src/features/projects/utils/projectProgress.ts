import type { MyTask } from '@/features/tasks/schemas/task.schema';
import type { Project } from '../schemas/project.schema';
import { isTaskForProject } from './projectTaskCount';

type ProjectLike = Pick<Project, 'id' | 'code' | 'name'>;

export const getProjectTasks = (
  project: ProjectLike,
  tasks: MyTask[],
  allProjects: ProjectLike[],
): MyTask[] => tasks.filter((task) => isTaskForProject(project, task, allProjects));

export const computeProjectTotalSlides = (
  project: ProjectLike,
  tasks: MyTask[],
  allProjects: ProjectLike[],
): number =>
  getProjectTasks(project, tasks, allProjects).reduce((sum, task) => sum + task.quantity, 0);

export const computeProjectCompletionPercent = (
  project: ProjectLike,
  tasks: MyTask[],
  allProjects: ProjectLike[],
): number => {
  const projectTasks = getProjectTasks(project, tasks, allProjects);
  const totalSlides = projectTasks.reduce((sum, task) => sum + task.quantity, 0);
  if (totalSlides === 0) return 0;

  const weightedSum = projectTasks.reduce(
    (sum, task) => sum + (task.completionPercent ?? 0) * task.quantity,
    0,
  );

  return Math.round(weightedSum / totalSlides);
};
