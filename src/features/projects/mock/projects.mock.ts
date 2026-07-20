import { ROLES } from '@/config/permissions';
import { getMockClientsStore } from '@/features/clients/mock/clients.data';
import { getMockTasksStore, MOCK_PROJECT_STAFF_ROSTER } from '@/features/tasks/mock/tasks.data';
import { getMockUsersStore } from '@/features/users/mock/users.data';
import type { PersonWithCode } from '../schemas/project.schema';
import type {
  CreateProjectRequest,
  Project,
  ProjectListFilters,
  ProjectListResponse,
  UpdateProjectRequest,
} from '../schemas/project.schema';
import { computeProjectLevel } from '../utils/projectLevel';
import { enrichProject, enrichProjectsForList } from '../utils/projectTaskCount';
import { mockDelay } from '@/shared/mock/mockDelay';
import { getMockProjectsStore, setMockProjectsStore, type StoredProject } from './projects.data';

const codeFromEmail = (email: string): string => {
  const local = email.split('@')[0] ?? email;
  return local.toUpperCase();
};

const mockStaffOptions = (roles: readonly string[]): PersonWithCode[] =>
  getMockUsersStore()
    .filter((user) => roles.includes(user.role) && user.status === 'active')
    .map((user) => ({
      code: codeFromEmail(user.email),
      name: user.name,
      userId: user.id,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

const mockExtraMembersForProject = (projectName: string): PersonWithCode[] =>
  (MOCK_PROJECT_STAFF_ROSTER[projectName] ?? []).map((staff) => ({
    code: staff.code,
    name: staff.name,
    userId: staff.userId ?? undefined,
  }));

const resolveClientRef = (clientId: string) => {
  const client = getMockClientsStore().find((entry) => entry.id === clientId);
  if (!client) {
    throw new Error('Client not found');
  }
  return { id: client.id, name: client.name };
};

const filterProjects = (
  projects: StoredProject[],
  filters: ProjectListFilters,
): StoredProject[] => {
  const search = filters.search?.trim().toLowerCase();

  return projects.filter((project) => {
    const isArchived = Boolean(project.archivedAt);
    if (filters.archived) {
      if (!isArchived) return false;
    } else if (isArchived) {
      return false;
    }
    if (filters.clientId && project.clientId !== filters.clientId) return false;
    if (filters.status && project.status !== filters.status) return false;
    if (filters.pmCode && project.pm.code !== filters.pmCode) return false;
    if (filters.headName && project.departmentHead.name !== filters.headName) return false;
    if (filters.projectLevel && project.projectLevel !== filters.projectLevel) return false;
    if (search) {
      const haystack =
        `${project.code} ${project.name} ${project.client.name} ${project.brief}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
};

export const mockGetProjectList = async (
  filters: ProjectListFilters,
): Promise<ProjectListResponse> => {
  await mockDelay();
  const allProjects = getMockProjectsStore();
  const tasks = getMockTasksStore();
  const items = enrichProjectsForList(filterProjects(allProjects, filters), tasks, (project) =>
    mockExtraMembersForProject(project.name),
  );
  return { items, total: items.length };
};

export const mockGetProjectPmOptions = async (): Promise<PersonWithCode[]> => {
  await mockDelay();
  return mockStaffOptions([ROLES.PM]);
};

export const mockGetProjectHeadNameOptions = async (): Promise<string[]> => {
  await mockDelay();
  return mockStaffOptions([
    ROLES.PM,
    ROLES.CREATIVE_MANAGER,
    ROLES.CREATIVE_HEAD,
    ROLES.HEAD,
    ROLES.ADMIN,
  ]).map((option) => option.name);
};

export const mockGetProjectHeadOptions = async (): Promise<PersonWithCode[]> => {
  await mockDelay();
  return mockStaffOptions([
    ROLES.PM,
    ROLES.CREATIVE_MANAGER,
    ROLES.CREATIVE_HEAD,
    ROLES.HEAD,
    ROLES.ADMIN,
  ]);
};

export const mockGetProjectById = async (id: string): Promise<Project> => {
  await mockDelay();
  const allProjects = getMockProjectsStore();
  const project = allProjects.find((entry) => entry.id === id);
  if (!project) {
    throw new Error('Project not found');
  }
  return enrichProject(project, getMockTasksStore(), allProjects, {
    extraMembers: mockExtraMembersForProject(project.name),
  });
};

const generateProjectCode = (
  clientName: string,
  startDate: string,
  projects: StoredProject[],
): string => {
  const date = new Date(startDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const clientAbbr = clientName.replace(/\s+/g, '').slice(0, 3).toUpperCase();

  const pokeNumbers = projects
    .map((project) => Number.parseInt(project.code.match(/^POKE(\d+)/)?.[1] ?? '0', 10))
    .filter((value) => !Number.isNaN(value));
  const nextNum = pokeNumbers.length > 0 ? Math.max(...pokeNumbers) + 1 : 1;
  const seq = String(nextNum).padStart(3, '0');

  return `POKE${seq}.${day}.${month}.${clientAbbr}`;
};

export const mockCreateProject = async (payload: CreateProjectRequest): Promise<Project> => {
  await mockDelay();

  const projects = getMockProjectsStore();
  const now = new Date().toISOString();
  const projectLevel = computeProjectLevel(payload.volume, payload.nature, payload.time);
  const id = `prj-${crypto.randomUUID().slice(0, 8)}`;
  const client = resolveClientRef(payload.clientId);

  const stored: StoredProject = {
    id,
    code: generateProjectCode(client.name, payload.startDate, projects),
    clientId: client.id,
    client,
    name: payload.name,
    startDate: payload.startDate,
    endDate: payload.endDate,
    projectLevel,
    department: payload.department,
    departmentHead: payload.departmentHead,
    brief: payload.brief,
    volume: payload.volume,
    nature: payload.nature,
    time: payload.time,
    additionalFactors: payload.additionalFactors,
    pm: payload.pm,
    evaluation: payload.evaluation,
    note: payload.note,
    status: payload.status,
    urgency: payload.status === 'finish' || payload.status === 'cancel' ? 'gray' : payload.urgency,
    finishedDate: payload.status === 'finish' ? now : undefined,
    updatedAt: now,
  };

  setMockProjectsStore([stored, ...projects]);
  return enrichProject(stored, getMockTasksStore(), [stored, ...projects], {
    extraMembers: mockExtraMembersForProject(stored.name),
  });
};

export const mockUpdateProject = async (
  id: string,
  payload: UpdateProjectRequest,
): Promise<Project> => {
  await mockDelay();

  const projects = getMockProjectsStore();
  const index = projects.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new Error('Project not found');
  }

  const current = projects[index];
  const projectLevel = computeProjectLevel(payload.volume, payload.nature, payload.time);
  const now = new Date().toISOString();
  const finishedDate =
    payload.status === 'finish'
      ? (current.finishedDate ?? now)
      : payload.status === 'cancel'
        ? undefined
        : current.finishedDate;
  const client = resolveClientRef(payload.clientId);

  const updated: StoredProject = {
    ...current,
    clientId: client.id,
    client,
    name: payload.name,
    startDate: payload.startDate,
    endDate: payload.endDate,
    projectLevel,
    department: payload.department,
    departmentHead: payload.departmentHead,
    brief: payload.brief,
    volume: payload.volume,
    nature: payload.nature,
    time: payload.time,
    additionalFactors: payload.additionalFactors,
    pm: payload.pm,
    evaluation: payload.evaluation,
    note: payload.note,
    status: payload.status,
    urgency: payload.status === 'finish' || payload.status === 'cancel' ? 'gray' : payload.urgency,
    finishedDate,
    // Only overwrite when Evaluate (or another caller) explicitly sends a value.
    completionPercent:
      payload.completionPercent !== undefined
        ? payload.completionPercent
        : current.completionPercent,
    updatedAt: now,
  };

  const next = [...projects];
  next[index] = updated;
  setMockProjectsStore(next);

  return enrichProject(updated, getMockTasksStore(), next, {
    extraMembers: mockExtraMembersForProject(updated.name),
  });
};

export const mockDeleteProject = async (id: string, userId?: string): Promise<void> => {
  await mockDelay();

  if (!userId) {
    throw new Error('You must be logged in to delete a project');
  }

  const projects = getMockProjectsStore();
  if (!projects.some((entry) => entry.id === id)) {
    throw new Error('Project not found');
  }

  setMockProjectsStore(projects.filter((entry) => entry.id !== id));
};

export const mockArchiveProject = async (id: string): Promise<Project> => {
  await mockDelay();

  const projects = getMockProjectsStore();
  const index = projects.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new Error('Project not found');
  }

  const current = projects[index];
  if (current.archivedAt) {
    throw new Error('Project is already archived');
  }

  const now = new Date().toISOString();
  const updated: StoredProject = {
    ...current,
    archivedAt: now,
    updatedAt: now,
  };
  const next = [...projects];
  next[index] = updated;
  setMockProjectsStore(next);

  return enrichProject(updated, getMockTasksStore(), next, {
    extraMembers: mockExtraMembersForProject(updated.name),
  });
};

export const mockUnarchiveProject = async (id: string): Promise<Project> => {
  await mockDelay();

  const projects = getMockProjectsStore();
  const index = projects.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new Error('Project not found');
  }

  const current = projects[index];
  if (!current.archivedAt) {
    throw new Error('Project is not archived');
  }

  const now = new Date().toISOString();
  const updated: StoredProject = {
    ...current,
    archivedAt: undefined,
    updatedAt: now,
  };
  const next = [...projects];
  next[index] = updated;
  setMockProjectsStore(next);

  return enrichProject(updated, getMockTasksStore(), next, {
    extraMembers: mockExtraMembersForProject(updated.name),
  });
};
