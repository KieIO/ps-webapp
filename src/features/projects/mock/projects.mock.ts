import { getMockTasksStore, MOCK_PROJECT_STAFF_ROSTER } from '@/features/tasks/mock/tasks.data';
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

const mockExtraMembersForProject = (projectName: string): PersonWithCode[] =>
  (MOCK_PROJECT_STAFF_ROSTER[projectName] ?? []).map((staff) => ({
    code: staff.code,
    name: staff.name,
  }));

const filterProjects = (
  projects: StoredProject[],
  filters: ProjectListFilters,
): StoredProject[] => {
  const search = filters.search?.trim().toLowerCase();

  return projects.filter((project) => {
    if (filters.client && project.client !== filters.client) return false;
    if (filters.status && project.status !== filters.status) return false;
    if (filters.pmCode && project.pm.code !== filters.pmCode) return false;
    if (filters.headName && project.departmentHead.name !== filters.headName) return false;
    if (filters.projectLevel && project.projectLevel !== filters.projectLevel) return false;
    if (search) {
      const haystack =
        `${project.code} ${project.name} ${project.client} ${project.brief}`.toLowerCase();
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
  const items = enrichProjectsForList(
    filterProjects(allProjects, filters),
    tasks,
    (project) => mockExtraMembersForProject(project.name),
  );
  return { items, total: items.length };
};

export const mockGetProjectClientOptions = async (): Promise<string[]> => {
  await mockDelay();
  const clients = new Set(getMockProjectsStore().map((project) => project.client));
  return [...clients].sort((a, b) => a.localeCompare(b));
};

export const mockGetProjectPmOptions = async (): Promise<{ code: string; name: string }[]> => {
  await mockDelay();
  const seen = new Map<string, string>();
  for (const project of getMockProjectsStore()) {
    seen.set(project.pm.code, project.pm.name);
  }
  return [...seen.entries()]
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const mockGetProjectHeadNameOptions = async (): Promise<string[]> => {
  await mockDelay();
  const names = new Set(getMockProjectsStore().map((project) => project.departmentHead.name));
  return [...names].sort((a, b) => a.localeCompare(b));
};

export const mockGetProjectHeadOptions = async (): Promise<{ code: string; name: string }[]> => {
  await mockDelay();
  const seen = new Map<string, string>();
  for (const project of getMockProjectsStore()) {
    seen.set(project.departmentHead.code, project.departmentHead.name);
  }
  return [...seen.entries()]
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
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
  client: string,
  startDate: string,
  projects: StoredProject[],
): string => {
  const date = new Date(startDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const clientAbbr = client.replace(/\s+/g, '').slice(0, 3).toUpperCase();

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

  const created: Project = {
    id,
    code: generateProjectCode(payload.client, payload.startDate, projects),
    client: payload.client,
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
    urgency: payload.status === 'finish' ? 'green' : 'gray',
    finishedDate: payload.status === 'finish' ? now : undefined,
    taskCount: 0,
    members: [],
    totalSlides: 0,
    completionPercent: 0,
    updatedAt: now,
  };

  const {
    taskCount: _taskCount,
    members: _members,
    totalSlides: _totalSlides,
    completionPercent: _completionPercent,
    ...stored
  } = created;
  setMockProjectsStore([stored, ...projects]);
  return created;
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
    payload.status === 'finish' ? (current.finishedDate ?? now) : undefined;

  const updated = {
    ...current,
    client: payload.client,
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
    finishedDate,
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
