import { mockDelay } from '@/shared/mock/mockDelay';
import type {
  CreateJobGroupRequest,
  CreateJobLevelRequest,
  CreateJobTitleRequest,
  JobGroupListResponse,
  JobLevelListResponse,
  JobTitleListFilters,
  JobTitleListItem,
  JobTitleListResponse,
  UpdateJobTitleCapacityRequest,
} from '../schemas/title.schema';
import {
  compareJobGroups,
  compareJobLevels,
  compareJobTitles,
  getNextJobTitleSortOrder,
} from '../utils/sortTitles';
import { computeSpecialistTaskPoints } from '../utils/capacityFormula';
import { getCapacityFormulaForCode } from './capacityFormula.data';
import {
  getMockJobGroupsStore,
  getMockJobLevelsStore,
  getMockJobTitlesStore,
  setMockJobGroupsStore,
  setMockJobLevelsStore,
  setMockJobTitlesStore,
} from './titles.data';

const normalizeCode = (code: string) => code.trim().toUpperCase();

const enrichJobTitle = (title: ReturnType<typeof getMockJobTitlesStore>[number]): JobTitleListItem => {
  const level = getMockJobLevelsStore().find((entry) => entry.id === title.jobLevelId);
  const group = getMockJobGroupsStore().find((entry) => entry.id === title.jobGroupId);

  if (!level || !group) {
    throw new Error('Job title references missing level or group');
  }

  return {
    ...title,
    jobLevelCode: level.code,
    jobLevelLabel: level.label,
    jobGroupCode: group.code,
    jobGroupLabel: group.label,
  };
};

const filterJobTitles = (
  titles: ReturnType<typeof getMockJobTitlesStore>,
  filters: JobTitleListFilters,
) => {
  const search = filters.search?.trim().toLowerCase();

  return titles.filter((title) => {
    if (filters.jobLevelId && title.jobLevelId !== filters.jobLevelId) return false;
    if (filters.jobGroupId && title.jobGroupId !== filters.jobGroupId) return false;
    if (search) {
      const haystack = `${title.code} ${title.name}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
};

export const mockGetJobLevelList = async (): Promise<JobLevelListResponse> => {
  await mockDelay();
  const items = [...getMockJobLevelsStore()].sort(compareJobLevels);
  return { items, total: items.length };
};

export const mockGetJobGroupList = async (): Promise<JobGroupListResponse> => {
  await mockDelay();
  const items = [...getMockJobGroupsStore()].sort(compareJobGroups);
  return { items, total: items.length };
};

export const mockGetJobTitleList = async (
  filters: JobTitleListFilters,
): Promise<JobTitleListResponse> => {
  await mockDelay();
  const items = filterJobTitles(getMockJobTitlesStore(), filters)
    .map(enrichJobTitle)
    .sort(compareJobTitles);
  return { items, total: items.length };
};

export const mockCreateJobLevel = async (payload: CreateJobLevelRequest) => {
  await mockDelay();

  const code = normalizeCode(payload.code);
  const label = payload.label.trim();
  const levels = getMockJobLevelsStore();
  const duplicate = levels.find((entry) => entry.code.toUpperCase() === code);
  if (duplicate) {
    throw new Error('A job level with this code already exists');
  }

  const created = {
    id: `lvl-${Date.now()}`,
    code,
    label,
    sortOrder: levels.reduce((max, entry) => Math.max(max, entry.sortOrder), -1) + 1,
    createdAt: new Date().toISOString(),
  };

  setMockJobLevelsStore([...levels, created]);
  return created;
};

export const mockCreateJobGroup = async (payload: CreateJobGroupRequest) => {
  await mockDelay();

  const code = normalizeCode(payload.code);
  const label = payload.label.trim();
  const groups = getMockJobGroupsStore();
  const duplicate = groups.find((entry) => entry.code.toUpperCase() === code);
  if (duplicate) {
    throw new Error('A job group with this code already exists');
  }

  const created = {
    id: `grp-${Date.now()}`,
    code,
    label,
    sortOrder: groups.reduce((max, entry) => Math.max(max, entry.sortOrder), -1) + 1,
    createdAt: new Date().toISOString(),
  };

  setMockJobGroupsStore([...groups, created]);
  return created;
};

export const mockDeleteJobGroup = async (id: string): Promise<void> => {
  await mockDelay();

  const groups = getMockJobGroupsStore();
  const group = groups.find((entry) => entry.id === id);
  if (!group) {
    throw new Error('Job group not found');
  }

  if (groups.length <= 1) {
    throw new Error('At least one job group must remain');
  }

  const titleCount = getMockJobTitlesStore().filter((title) => title.jobGroupId === id).length;
  if (titleCount > 0) {
    throw new Error(
      `Cannot delete — ${titleCount} job title${titleCount === 1 ? '' : 's'} use this group`,
    );
  }

  setMockJobGroupsStore(groups.filter((entry) => entry.id !== id));
};

export const mockCreateJobTitle = async (payload: CreateJobTitleRequest) => {
  await mockDelay();

  const code = payload.code.trim();
  const name = payload.name.trim();
  const titles = getMockJobTitlesStore();
  const duplicate = titles.find((entry) => entry.code.toLowerCase() === code.toLowerCase());
  if (duplicate) {
    throw new Error('A job title with this code already exists');
  }

  const level = getMockJobLevelsStore().find((entry) => entry.id === payload.jobLevelId);
  if (!level) {
    throw new Error('Selected job level does not exist');
  }

  const group = getMockJobGroupsStore().find((entry) => entry.id === payload.jobGroupId);
  if (!group) {
    throw new Error('Selected job group does not exist');
  }

  const capacity = getCapacityFormulaForCode(code);
  const created = {
    id: `title-${Date.now()}`,
    code,
    name,
    jobLevelId: payload.jobLevelId,
    jobGroupId: payload.jobGroupId,
    sortOrder: getNextJobTitleSortOrder(titles),
    ...capacity,
    createdAt: new Date().toISOString(),
  };

  setMockJobTitlesStore([...titles, created]);
  return enrichJobTitle(created);
};

export const mockUpdateJobTitleCapacity = async (
  id: string,
  payload: UpdateJobTitleCapacityRequest,
): Promise<JobTitleListItem> => {
  await mockDelay();

  const titles = getMockJobTitlesStore();
  const index = titles.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new Error('Job title not found');
  }

  const specialistTaskPoints = computeSpecialistTaskPoints(
    payload.dailyCapacityPoints,
    payload.taskConversionRatio,
  );

  const updated = {
    ...titles[index],
    dailyCapacityPoints: payload.dailyCapacityPoints,
    taskConversionRatio: payload.taskConversionRatio,
    specialistTaskPoints,
  };

  const next = [...titles];
  next[index] = updated;
  setMockJobTitlesStore(next);
  return enrichJobTitle(updated);
};
