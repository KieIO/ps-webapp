import { describe, expect, it } from 'vitest';
import { filterJobTitles } from './filterJobTitles';

const titles = [
  {
    id: '1',
    code: 'JPE-1',
    name: 'Junior Project Executive Level 1',
    jobLevelId: 'lvl-junior',
    jobGroupId: 'grp-staff',
  },
  {
    id: '2',
    code: 'PM-1',
    name: 'Project Manager Level 1',
    jobLevelId: 'lvl-manager',
    jobGroupId: 'grp-manager',
  },
  {
    id: '3',
    code: 'JGD-2',
    name: 'Junior Graphic Designer Level 2',
    jobLevelId: 'lvl-junior',
    jobGroupId: 'grp-staff',
  },
];

describe('filterJobTitles', () => {
  it('filters by search on code or title', () => {
    expect(filterJobTitles(titles, { search: 'jpe' }).map((t) => t.id)).toEqual(['1']);
    expect(filterJobTitles(titles, { search: 'Graphic' }).map((t) => t.id)).toEqual(['3']);
  });

  it('filters by job level', () => {
    expect(filterJobTitles(titles, { jobLevelId: 'lvl-junior' }).map((t) => t.id)).toEqual([
      '1',
      '3',
    ]);
  });

  it('filters by job group', () => {
    expect(filterJobTitles(titles, { jobGroupId: 'grp-manager' }).map((t) => t.id)).toEqual(['2']);
  });

  it('combines search + level + group', () => {
    expect(
      filterJobTitles(titles, {
        search: 'junior',
        jobLevelId: 'lvl-junior',
        jobGroupId: 'grp-staff',
      }).map((t) => t.id),
    ).toEqual(['1', '3']);
  });
});
