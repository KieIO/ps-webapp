import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { hasCreateTaskDraftChanges, snapshotCreateTaskDraft } from './createTaskDraft';

describe('createTaskDraft', () => {
  const emptyBaseline = snapshotCreateTaskDraft({
    projectName: '',
    projectManager: { code: '', name: '' },
    quantity: 1,
    date: dayjs('2026-08-25'),
    description: '',
    staffNote: '',
  });

  it('returns false when values match baseline', () => {
    const current = snapshotCreateTaskDraft({
      projectName: '',
      projectManager: { code: 'PM', name: 'Dev PM' },
      quantity: 1,
      date: dayjs('2026-08-25'),
      description: '',
    });
    const baseline = snapshotCreateTaskDraft({
      projectName: '',
      projectManager: { code: 'PM', name: 'Dev PM' },
      quantity: 1,
      date: dayjs('2026-08-25'),
      description: '',
    });
    expect(hasCreateTaskDraftChanges(baseline, current)).toBe(false);
  });

  it('returns true when user entered project name', () => {
    const current = snapshotCreateTaskDraft({
      projectName: 'Goware',
      quantity: 1,
      date: dayjs('2026-08-25'),
      description: '',
    });
    expect(hasCreateTaskDraftChanges(emptyBaseline, current)).toBe(true);
  });

  it('returns false for whitespace-only changes', () => {
    const baseline = snapshotCreateTaskDraft({
      description: 'brief',
      date: dayjs('2026-08-25'),
    });
    const current = snapshotCreateTaskDraft({
      description: ' brief ',
      date: dayjs('2026-08-25'),
    });
    expect(hasCreateTaskDraftChanges(baseline, current)).toBe(false);
  });

  it('returns false when baseline is missing', () => {
    expect(
      hasCreateTaskDraftChanges(null, snapshotCreateTaskDraft({ date: dayjs('2026-08-25') })),
    ).toBe(false);
  });
});
