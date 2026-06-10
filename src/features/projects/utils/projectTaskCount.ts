import type { MyTask } from '@/features/tasks/schemas/task.schema';
import type { PersonWithCode, Project, ProjectRecord } from '../schemas/project.schema';
import { withProjectListDefaults } from './projectDefaults';
import { collectProjectMembers } from './projectMembers';
import {
  computeProjectCompletionPercent,
  computeProjectTotalSlides,
} from './projectProgress';

type ProjectLike = Pick<Project, 'id' | 'code' | 'name'>;

export interface EnrichProjectOptions {
  extraMembers?: PersonWithCode[];
}

const getPokeKey = (code: string): string | null => code.match(/^(POKE\d{3})/)?.[1] ?? null;

export const isTaskForProject = (
  project: ProjectLike,
  task: MyTask,
  allProjects: ProjectLike[],
): boolean => {
  if (task.taskCategory !== 'project') return false;

  const pokeKey = getPokeKey(project.code);
  if (pokeKey && task.taskCode.includes(pokeKey)) return true;

  if (task.projectName !== project.name) return false;

  const sameNameCount = allProjects.filter((entry) => entry.name === project.name).length;
  return sameNameCount === 1;
};

export const countProjectTasks = (
  project: ProjectLike,
  tasks: MyTask[],
  allProjects: ProjectLike[],
): number => tasks.filter((task) => isTaskForProject(project, task, allProjects)).length;

export const enrichProject = <T extends ProjectRecord>(
  project: T,
  tasks: MyTask[],
  allProjects: ProjectLike[],
  options?: EnrichProjectOptions,
): Project =>
  withProjectListDefaults({
    ...project,
    taskCount: countProjectTasks(project, tasks, allProjects),
    members: collectProjectMembers(project, tasks, allProjects, options?.extraMembers),
    totalSlides: computeProjectTotalSlides(project, tasks, allProjects),
    completionPercent: computeProjectCompletionPercent(project, tasks, allProjects),
  });

export const enrichProjectsForList = <T extends ProjectRecord>(
  projects: T[],
  tasks: MyTask[],
  getExtraMembers?: (project: T) => PersonWithCode[],
): Project[] =>
  projects.map((project) =>
    enrichProject(project, tasks, projects, {
      extraMembers: getExtraMembers?.(project),
    }),
  );
