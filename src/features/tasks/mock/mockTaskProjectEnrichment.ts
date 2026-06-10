import { getMockProjectsStore } from '@/features/projects/mock/projects.data';
import type { MyTask } from '../schemas/task.schema';
import { resolveProjectContextFromTask } from '../utils/taskProjectContext';

/** Mock-only: merge project registry fields onto tasks for Department Head columns. */
export const enrichMockTaskWithProjectContext = (task: MyTask): MyTask => {
  const project = getMockProjectsStore().find((entry) => entry.name === task.projectName);
  const context = resolveProjectContextFromTask(task);

  if (!project) {
    return { ...task, ...context };
  }

  return {
    ...task,
    projectId: task.projectId ?? project.id,
    projectStartDate: project.startDate,
    projectEndDate: project.endDate,
    projectLevel: project.projectLevel,
    projectBrief: project.brief,
    projectVolume: project.volume,
    projectNature: project.nature,
    projectTime: project.time,
    projectStatus: project.status,
    projectFinishedDate: project.finishedDate,
    additionalFactors: task.additionalFactors || project.additionalFactors,
    pmEvaluation: project.evaluation || task.pmEvaluation,
    pmNote: project.note || task.pmNote,
  };
};
