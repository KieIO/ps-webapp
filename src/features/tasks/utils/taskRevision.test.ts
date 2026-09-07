import { describe, expect, it } from 'vitest';
import type { MyTask } from '../schemas/task.schema';
import {
  areParentActionsLockedByActiveRevision,
  canRequestRevision,
  findActiveRevision,
  formatHasRevisionChildrenLabel,
  formatRevisionLabel,
  formatRevisionQuantityExtra,
  getDirectRevisionChildren,
  getNextRevisionRound,
  getRequestRevisionBlockReason,
  hasActiveRevisionChildren,
  hasRevisionChildren,
  inferParentTaskCodeFromRevision,
  isRevisionDeadlineOnOrAfterWorkDate,
  isRevisionTask,
  resolveTaskKind,
  revisionCountsTowardCapacity,
  assertRevisionQuantity,
  compareRevisionQuantityToParent,
  revisionQuantityExpandedCapacityHint,
} from './taskRevision';

const baseTask = (overrides: Partial<MyTask> = {}): MyTask =>
  ({
    id: 'parent-1',
    taskCategory: 'project',
    taskCode: 'T-001',
    projectName: 'Demo',
    projectManager: { code: 'PM1', name: 'PM' },
    taskName: 'Slides',
    level: 2,
    quantity: 20,
    date: '2026-09-01T00:00:00.000Z',
    description: 'Brief',
    staff: [{ code: 'S1', name: 'Staff One', userId: 'user-s1' }],
    department: 'project',
    designThinking: 2,
    technical: 2,
    contentProcessing: 2,
    additionalFactors: '',
    completionPercent: null,
    pmEvaluation: '',
    pmNote: '',
    staffConfirmation: 'confirmed',
    staffNote: '',
    urgency: 'auto',
    ...overrides,
  }) as MyTask;

describe('resolveTaskKind', () => {
  it('defaults to original without parent', () => {
    expect(resolveTaskKind(baseTask())).toBe('original');
  });

  it('treats legacy parentTaskId as split', () => {
    expect(resolveTaskKind(baseTask({ parentTaskId: 'p', taskKind: undefined }))).toBe('split');
  });

  it('prefers explicit taskKind', () => {
    expect(resolveTaskKind(baseTask({ parentTaskId: 'p', taskKind: 'revision' }))).toBe('revision');
  });
});

describe('revision children helpers', () => {
  const parent = baseTask();
  const revisions = [
    baseTask({
      id: 'r1',
      parentTaskId: parent.id,
      taskKind: 'revision',
      revisionRound: 1,
      staffConfirmation: 'finished',
      updatedAt: '2026-09-01T10:00:00.000Z',
    }),
    baseTask({
      id: 'r2',
      parentTaskId: parent.id,
      taskKind: 'revision',
      revisionRound: 2,
      staffConfirmation: 'confirmed',
      updatedAt: '2026-09-02T10:00:00.000Z',
    }),
    baseTask({
      id: 'split-1',
      parentTaskId: parent.id,
      taskKind: 'split',
      staffConfirmation: 'confirmed',
    }),
  ];

  it('lists only revision children newest-first by round', () => {
    const list = getDirectRevisionChildren(parent.id, revisions);
    expect(list.map((item) => item.id)).toEqual(['r2', 'r1']);
  });

  it('computes next round', () => {
    expect(getNextRevisionRound(parent.id, revisions)).toBe(3);
    expect(getNextRevisionRound(parent.id, [])).toBe(1);
  });

  it('finds active revision', () => {
    expect(findActiveRevision(parent.id, revisions)?.id).toBe('r2');
  });
});

describe('canRequestRevision / block reasons', () => {
  it('allows when evaluate + assigned + not finished + no active', () => {
    const task = baseTask();
    expect(canRequestRevision(task, [], true)).toBe(true);
    expect(getRequestRevisionBlockReason(task, [], true)).toBeNull();
  });

  it('blocks finished parent', () => {
    const task = baseTask({ staffConfirmation: 'finished' });
    expect(getRequestRevisionBlockReason(task, [], true)).toBe('finished');
  });

  it('blocks cancelled parent', () => {
    const task = baseTask({ staffConfirmation: 'cancelled' });
    expect(getRequestRevisionBlockReason(task, [], true)).toBe('cancelled');
    expect(canRequestRevision(task, [], true)).toBe(false);
  });

  it('blocks missing assignee', () => {
    const task = baseTask({ staff: [] });
    expect(getRequestRevisionBlockReason(task, [], true)).toBe('no_assignee');
  });

  it('blocks revision-on-revision', () => {
    const task = baseTask({ taskKind: 'revision', parentTaskId: 'p', revisionRound: 1 });
    expect(isRevisionTask(task)).toBe(true);
    expect(getRequestRevisionBlockReason(task, [], true)).toBe('is_revision');
  });

  it('blocks when active revision exists', () => {
    const task = baseTask();
    const active = baseTask({
      id: 'r-active',
      parentTaskId: task.id,
      taskKind: 'revision',
      revisionRound: 1,
      staffConfirmation: 'not_updated',
    });
    expect(getRequestRevisionBlockReason(task, [active], true)).toBe('active_revision_exists');
  });

  it('allows after previous revision finished', () => {
    const task = baseTask();
    const done = baseTask({
      id: 'r-done',
      parentTaskId: task.id,
      taskKind: 'revision',
      revisionRound: 1,
      staffConfirmation: 'finished',
    });
    expect(canRequestRevision(task, [done], true)).toBe(true);
  });

  it('blocks without permission', () => {
    expect(getRequestRevisionBlockReason(baseTask(), [], false)).toBe('no_permission');
  });
});

describe('revisionCountsTowardCapacity', () => {
  it('excludes cancelled revision', () => {
    expect(
      revisionCountsTowardCapacity(
        baseTask({ taskKind: 'revision', parentTaskId: 'p', staffConfirmation: 'cancelled' }),
      ),
    ).toBe(false);
  });

  it('includes active revision', () => {
    expect(
      revisionCountsTowardCapacity(
        baseTask({ taskKind: 'revision', parentTaskId: 'p', staffConfirmation: 'confirmed' }),
      ),
    ).toBe(true);
  });
});

describe('formatRevisionLabel', () => {
  it('formats round', () => {
    expect(formatRevisionLabel({ revisionRound: 3 })).toBe('Revision #3');
  });
});

describe('parent has revision children labels', () => {
  it('formats parent badge and ignores revision rows', () => {
    expect(formatHasRevisionChildrenLabel(1)).toBe('Có revision');
    expect(formatHasRevisionChildrenLabel(3)).toBe('Có 3 revision');
    expect(formatHasRevisionChildrenLabel(2, { activeCount: 1 })).toBe('Đang revision');
    expect(formatHasRevisionChildrenLabel(2, { activeCount: 2 })).toBe('Đang 2 revision');
    expect(hasRevisionChildren({ revisionChildCount: 2 })).toBe(true);
    expect(hasActiveRevisionChildren({ activeRevisionChildCount: 1 })).toBe(true);
    expect(
      hasRevisionChildren({
        revisionChildCount: 2,
        taskKind: 'revision',
        parentTaskId: 'p',
      }),
    ).toBe(false);
    expect(
      areParentActionsLockedByActiveRevision({
        activeRevisionChildCount: 1,
      }),
    ).toBe(true);
  });
});

describe('inferParentTaskCodeFromRevision', () => {
  it('infers parent task code from revision code', () => {
    expect(inferParentTaskCodeFromRevision('PM-GOWARE-008-R1')).toBe('PM-GOWARE-008');
    expect(inferParentTaskCodeFromRevision('PM-GOWARE-008-R12')).toBe('PM-GOWARE-008');
    expect(inferParentTaskCodeFromRevision('PM-GOWARE-008')).toBeNull();
  });
});

describe('revision quantity policy (Option A)', () => {
  it('classifies partial / same / expanded vs parent', () => {
    expect(compareRevisionQuantityToParent(5, 20)).toBe('partial');
    expect(compareRevisionQuantityToParent(20, 20)).toBe('same');
    expect(compareRevisionQuantityToParent(14, 1)).toBe('expanded');
  });

  it('only rejects non-positive quantity', () => {
    expect(() => assertRevisionQuantity(14)).not.toThrow();
    expect(() => assertRevisionQuantity(0.5)).not.toThrow();
    expect(() => assertRevisionQuantity(0)).toThrow(/lớn hơn 0/);
    expect(() => assertRevisionQuantity(-1)).toThrow(/lớn hơn 0/);
  });

  it('shows capacity hint only when expanded', () => {
    expect(revisionQuantityExpandedCapacityHint(14, 1)).toMatch(/cao hơn task gốc/);
    expect(revisionQuantityExpandedCapacityHint(1, 1)).toBeNull();
    expect(revisionQuantityExpandedCapacityHint(0.5, 1)).toBeNull();
  });

  it('formats quantity helper copy for both directions', () => {
    expect(formatRevisionQuantityExtra(1)).toMatch(/ít hơn hoặc nhiều hơn/);
  });
});

describe('isRevisionDeadlineOnOrAfterWorkDate', () => {
  it('allows same calendar day and later deadlines', () => {
    expect(isRevisionDeadlineOnOrAfterWorkDate('2026-09-07', '2026-09-07T00:00:00Z')).toBe(true);
    expect(isRevisionDeadlineOnOrAfterWorkDate('2026-09-07', '2026-09-07T17:00:00Z')).toBe(true);
    expect(isRevisionDeadlineOnOrAfterWorkDate('2026-09-07', '2026-09-20T08:30:00Z')).toBe(true);
  });

  it('rejects deadline before the work date', () => {
    expect(isRevisionDeadlineOnOrAfterWorkDate('2026-09-07', '2026-09-06T23:59:59Z')).toBe(false);
  });

  it('rejects invalid date strings', () => {
    expect(isRevisionDeadlineOnOrAfterWorkDate('', '2026-09-07T17:00:00Z')).toBe(false);
    expect(isRevisionDeadlineOnOrAfterWorkDate('2026-09-07', 'soon')).toBe(false);
  });
});
