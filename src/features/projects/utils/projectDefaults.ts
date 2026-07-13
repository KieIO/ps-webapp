import type {
  CreateProjectRequest,
  PersonWithCode,
  Project,
  ProjectRecord,
} from '../schemas/project.schema';

const EMPTY_MEMBERS: PersonWithCode[] = [];

/**
 * Fields not collected in Create project UI — applied when building the API payload.
 * Status/evaluation are set later via Edit; department comes from task score groups.
 */
export const CREATE_PROJECT_DEFAULTS = {
  department: 'project',
  evaluation: '',
  status: 'not_updated',
} as const satisfies Pick<CreateProjectRequest, 'department' | 'evaluation' | 'status'>;

/** Apply list-table defaults when the API omits derived aggregate fields. */
export const withProjectListDefaults = (
  record: ProjectRecord &
    Partial<
      Pick<Project, 'taskCount' | 'members' | 'totalSlides' | 'completionPercent' | 'urgency'>
    >,
): Project => ({
  ...record,
  taskCount: record.taskCount ?? 0,
  members: record.members ?? EMPTY_MEMBERS,
  totalSlides: record.totalSlides ?? 0,
  completionPercent: record.completionPercent ?? 0,
  urgency: record.urgency ?? 'auto',
});
