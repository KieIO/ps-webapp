import type { Project, UpdateProjectRequest } from '../schemas/project.schema';

/** Build a full update payload from the current project, with optional field overrides. */
export const buildUpdateProjectPayload = (
  project: Project,
  overrides: Partial<UpdateProjectRequest> = {},
): UpdateProjectRequest => ({
  clientId: project.clientId,
  name: project.name,
  startDate: project.startDate,
  endDate: project.endDate,
  department: project.department,
  departmentHead: project.departmentHead,
  brief: project.brief,
  volume: project.volume,
  nature: project.nature,
  time: project.time,
  additionalFactors: project.additionalFactors,
  pm: project.pm,
  evaluation: project.evaluation,
  note: project.note,
  status: project.status,
  urgency: project.urgency,
  ...overrides,
});
