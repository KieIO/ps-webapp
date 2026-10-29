import { describe, expect, it } from 'vitest';
import { buildMyTaskDetailPath, buildProjectTasksPath } from './constants';

describe('buildProjectTasksPath', () => {
  it('builds tracker drill with project, search, and workDate (no output KPI filter)', () => {
    expect(
      buildProjectTasksPath({
        projectName: 'christmas',
        search: 'QA',
        workDate: '2026-11-01',
      }),
    ).toBe('/tasks/project?projectName=christmas&search=QA&workDate=2026-11-01');
  });

  it('keeps productivity KPI params when both metric and month are set', () => {
    expect(
      buildProjectTasksPath({
        projectName: 'Acme',
        outputMetric: 'project_slides',
        outputMonth: '2026-11',
      }),
    ).toBe('/tasks/project?projectName=Acme&outputMetric=project_slides&outputMonth=2026-11');
  });

  it('ignores invalid workDate', () => {
    expect(buildProjectTasksPath({ projectName: 'christmas', workDate: '2026-11' })).toBe(
      '/tasks/project?projectName=christmas',
    );
  });
});

describe('buildMyTaskDetailPath', () => {
  it('builds bare detail path', () => {
    expect(buildMyTaskDetailPath('task-1')).toBe('/tasks/detail/task-1');
  });

  it('adds tab query', () => {
    expect(buildMyTaskDetailPath('task-1', { tab: 'evaluation' })).toBe(
      '/tasks/detail/task-1?tab=evaluation',
    );
  });

  it('adds from for parent/child navigation', () => {
    expect(buildMyTaskDetailPath('parent-1', { from: 'child-1' })).toBe(
      '/tasks/detail/parent-1?from=child-1',
    );
  });

  it('combines tab and from', () => {
    expect(buildMyTaskDetailPath('parent-1', { tab: 'revision', from: 'child-1' })).toBe(
      '/tasks/detail/parent-1?tab=revision&from=child-1',
    );
  });

  it('omits from when empty or same as id', () => {
    expect(buildMyTaskDetailPath('task-1', { from: '  ' })).toBe('/tasks/detail/task-1');
    expect(buildMyTaskDetailPath('task-1', { from: 'task-1' })).toBe('/tasks/detail/task-1');
  });
});
