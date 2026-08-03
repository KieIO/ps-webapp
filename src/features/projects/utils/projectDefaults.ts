import type {
  CreateProjectRequest,
  PersonWithCode,
  Project,
  ProjectRecord,
} from '../schemas/project.schema';

const EMPTY_MEMBERS: PersonWithCode[] = [];

/** Preferred default when the departments catalog includes the seed code. */
export const DEFAULT_PROJECT_DEPARTMENT = 'project';

/**
 * Fields not collected in Create project UI — applied when building the API payload.
 * Status/evaluation are set later via Edit; department is resolved from the live catalog.
 */
export const CREATE_PROJECT_DEFAULTS = {
  evaluation: '',
  status: 'not_updated',
} as const satisfies Pick<CreateProjectRequest, 'evaluation' | 'status'>;

/**
 * Pick a valid department code for create.
 * Prefers `project` when present; otherwise the first catalog code.
 */
export const resolveCreateDepartment = (codes: readonly string[]): string | undefined => {
  if (codes.includes(DEFAULT_PROJECT_DEPARTMENT)) return DEFAULT_PROJECT_DEPARTMENT;
  return codes[0];
};

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
