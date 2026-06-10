import type { PersonWithCode, Project, ProjectRecord } from '../schemas/project.schema';

const EMPTY_MEMBERS: PersonWithCode[] = [];

/** Apply list-table defaults when the API omits derived aggregate fields. */
export const withProjectListDefaults = (
  record: ProjectRecord &
    Partial<Pick<Project, 'taskCount' | 'members' | 'totalSlides' | 'completionPercent' | 'urgency'>>,
): Project => ({
  ...record,
  taskCount: record.taskCount ?? 0,
  members: record.members ?? EMPTY_MEMBERS,
  totalSlides: record.totalSlides ?? 0,
  completionPercent: record.completionPercent ?? 0,
  urgency: record.urgency ?? 'gray',
});
