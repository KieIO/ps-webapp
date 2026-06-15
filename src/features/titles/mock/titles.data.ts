/** Seed data + in-memory store for job levels, groups, and titles (dev mock). */
import type { JobGroup, JobLevel, JobTitle } from '../schemas/title.schema';
import { getCapacityFormulaForCode } from './capacityFormula.data';

const SEED_DATE = '2024-01-01T00:00:00.000Z';

export const INITIAL_JOB_LEVELS: JobLevel[] = [
  { id: 'lvl-intern', code: 'INTERN', label: 'Intern', sortOrder: 0, createdAt: SEED_DATE },
  { id: 'lvl-junior', code: 'JUNIOR', label: 'Junior', sortOrder: 1, createdAt: SEED_DATE },
  { id: 'lvl-executive', code: 'EXECUTIVE', label: 'Executive', sortOrder: 2, createdAt: SEED_DATE },
  { id: 'lvl-senior', code: 'SENIOR', label: 'Senior', sortOrder: 3, createdAt: SEED_DATE },
  { id: 'lvl-manager', code: 'MANAGER', label: 'Manager', sortOrder: 4, createdAt: SEED_DATE },
];

export const INITIAL_JOB_GROUPS: JobGroup[] = [
  { id: 'grp-staff', code: 'STAFF', label: 'Staff', sortOrder: 0, createdAt: SEED_DATE },
  { id: 'grp-manager', code: 'MANAGER', label: 'Manager', sortOrder: 1, createdAt: SEED_DATE },
];

const buildLeveledTitles = (
  prefix: string,
  nameBase: string,
  count: number,
  jobLevelId: string,
  jobGroupId: string,
  startSortOrder: number,
): { titles: JobTitle[]; nextSortOrder: number } => {
  const titles = Array.from({ length: count }, (_, index) => {
    const level = index + 1;
    const code = `${prefix}-${level}`;
    const capacity = getCapacityFormulaForCode(code);

    return {
      id: `title-${prefix.toLowerCase()}-${level}`,
      code,
      name: `${nameBase} Level ${level}`,
      jobLevelId,
      jobGroupId,
      sortOrder: startSortOrder + index,
      ...capacity,
      createdAt: SEED_DATE,
    };
  });

  return { titles, nextSortOrder: startSortOrder + count };
};

const buildInitialJobTitles = (): JobTitle[] => {
  let sortOrder = 0;
  const titles: JobTitle[] = [];

  titles.push({
    id: 'title-in-0',
    code: 'IN.0',
    name: 'Intern',
    jobLevelId: 'lvl-intern',
    jobGroupId: 'grp-staff',
    sortOrder: sortOrder++,
    ...getCapacityFormulaForCode('IN.0'),
    createdAt: SEED_DATE,
  });

  const groups = [
    { prefix: 'JPE', nameBase: 'Junior Project Executive', count: 10, levelId: 'lvl-junior', groupId: 'grp-staff' },
    { prefix: 'PE', nameBase: 'Project Executive', count: 10, levelId: 'lvl-executive', groupId: 'grp-staff' },
    { prefix: 'SPE', nameBase: 'Senior Project Executive', count: 10, levelId: 'lvl-senior', groupId: 'grp-staff' },
    { prefix: 'PM', nameBase: 'Project Manager', count: 10, levelId: 'lvl-manager', groupId: 'grp-manager' },
    { prefix: 'JGD', nameBase: 'Junior Graphic Designer', count: 10, levelId: 'lvl-junior', groupId: 'grp-staff' },
    { prefix: 'GD', nameBase: 'Graphic Designer', count: 10, levelId: 'lvl-executive', groupId: 'grp-staff' },
    { prefix: 'SGD', nameBase: 'Senior Graphic Designer', count: 10, levelId: 'lvl-senior', groupId: 'grp-staff' },
    { prefix: 'DM', nameBase: 'Creative Manager', count: 10, levelId: 'lvl-manager', groupId: 'grp-manager' },
  ] as const;

  for (const group of groups) {
    const built = buildLeveledTitles(
      group.prefix,
      group.nameBase,
      group.count,
      group.levelId,
      group.groupId,
      sortOrder,
    );
    titles.push(...built.titles);
    sortOrder = built.nextSortOrder;
  }

  return titles;
};

export const INITIAL_JOB_TITLES: JobTitle[] = buildInitialJobTitles();

let jobLevelsStore = [...INITIAL_JOB_LEVELS];
let jobGroupsStore = [...INITIAL_JOB_GROUPS];
let jobTitlesStore = [...INITIAL_JOB_TITLES];

export const getMockJobLevelsStore = () => jobLevelsStore;
export const setMockJobLevelsStore = (next: JobLevel[]) => {
  jobLevelsStore = next;
};

export const getMockJobGroupsStore = () => jobGroupsStore;
export const setMockJobGroupsStore = (next: JobGroup[]) => {
  jobGroupsStore = next;
};

export const getMockJobTitlesStore = () => jobTitlesStore;
export const setMockJobTitlesStore = (next: JobTitle[]) => {
  jobTitlesStore = next;
};
