import type { Project, ProjectStatus } from '../schemas/project.schema';

export interface ProjectStatusSummary {
  total: number;
  notUpdated: number;
  inProgress: number;
  finish: number;
  cancel: number;
}

const EMPTY_SUMMARY: ProjectStatusSummary = {
  total: 0,
  notUpdated: 0,
  inProgress: 0,
  finish: 0,
  cancel: 0,
};

const STATUS_KEY: Record<ProjectStatus, keyof Omit<ProjectStatusSummary, 'total'>> = {
  not_updated: 'notUpdated',
  in_progress: 'inProgress',
  finish: 'finish',
  cancel: 'cancel',
};

export const computeProjectStatusSummary = (projects: Project[]): ProjectStatusSummary => {
  if (projects.length === 0) return EMPTY_SUMMARY;

  const summary: ProjectStatusSummary = { ...EMPTY_SUMMARY, total: projects.length };

  for (const project of projects) {
    summary[STATUS_KEY[project.status]] += 1;
  }

  return summary;
};
