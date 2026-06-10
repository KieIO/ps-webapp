import type { ProjectStatus } from '@/features/projects/schemas/project.schema';
import type { MyTask, TaskConfirmationStatus } from '../schemas/task.schema';

export interface ResolvedProjectContext {
  projectStartDate: string;
  projectEndDate: string;
  projectLevel: number;
  projectBrief: string;
  projectVolume: number;
  projectNature: number;
  projectTime: number;
  projectStatus: ProjectStatus;
  projectFinishedDate?: string;
  additionalFactors: string;
  pmEvaluation: string;
  pmNote: string;
}

const confirmationToProjectStatus = (
  confirmation: TaskConfirmationStatus,
): ProjectStatus => {
  switch (confirmation) {
    case 'finished':
      return 'finish';
    case 'confirmed':
      return 'in_progress';
    case 'decline':
      return 'cancel';
    default:
      return 'not_updated';
  }
};

/** Resolve denormalized project fields from task payload (API or fallbacks). */
export const resolveProjectContextFromTask = (task: MyTask): ResolvedProjectContext => ({
  projectStartDate: task.projectStartDate ?? task.date,
  projectEndDate: task.projectEndDate ?? task.updatedAt ?? task.date,
  projectLevel: task.projectLevel ?? task.level,
  projectBrief: task.projectBrief ?? task.description,
  projectVolume: task.projectVolume ?? task.designThinking,
  projectNature: task.projectNature ?? task.technical,
  projectTime: task.projectTime ?? task.contentProcessing,
  projectStatus:
    task.projectStatus ?? confirmationToProjectStatus(task.staffConfirmation),
  projectFinishedDate:
    task.projectFinishedDate ??
    (task.staffConfirmation === 'finished' ? task.updatedAt : undefined),
  additionalFactors: task.additionalFactors,
  pmEvaluation: task.pmEvaluation,
  pmNote: task.pmNote,
});
