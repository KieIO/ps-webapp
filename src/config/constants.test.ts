import { describe, expect, it } from 'vitest';
import { buildMyTaskDetailPath } from './constants';

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
