import { describe, expect, it } from 'vitest';
import type { MyTask } from '../schemas/task.schema';
import {
  buildEvaluationRemainderAutoNote,
  canSpawnEvaluationRemainder,
  computeAcceptedRemainderQuantity,
  formatEvaluationAcceptedLabel,
  hasCmEvaluation,
  nextSplitChildTaskCode,
} from './evaluationRemainder';

const baseChild = (overrides: Partial<MyTask> = {}): MyTask =>
  ({
    id: 'child-1',
    taskCode: 'PO.001-S1',
    taskName: 'Slides',
    parentTaskId: 'parent-1',
    taskKind: 'split',
    quantity: 8,
    staffConfirmation: 'finished',
    pipelineStage: 'assigned_staff',
    staff: [],
    ...overrides,
  }) as MyTask;

describe('computeAcceptedRemainderQuantity', () => {
  it('returns assigned − accepted within bounds', () => {
    expect(computeAcceptedRemainderQuantity(8, 3)).toBe(5);
    expect(computeAcceptedRemainderQuantity(8, 8)).toBe(0);
    expect(computeAcceptedRemainderQuantity(8, 0)).toBe(8);
  });

  it('clamps accepted to 0…assigned', () => {
    expect(computeAcceptedRemainderQuantity(8, 10)).toBe(0);
    expect(computeAcceptedRemainderQuantity(8, -2)).toBe(8);
  });
});

describe('canSpawnEvaluationRemainder', () => {
  it('allows finished split children with partial acceptance', () => {
    expect(canSpawnEvaluationRemainder(baseChild(), 3)).toBe(true);
  });

  it('rejects non-finished, full acceptance, or non-split tasks', () => {
    expect(canSpawnEvaluationRemainder(baseChild({ staffConfirmation: 'confirmed' }), 3)).toBe(
      false,
    );
    expect(canSpawnEvaluationRemainder(baseChild(), 8)).toBe(false);
    expect(canSpawnEvaluationRemainder(baseChild({ parentTaskId: undefined }), 3)).toBe(false);
    expect(
      canSpawnEvaluationRemainder(baseChild({ taskKind: 'revision', parentTaskId: 'p' }), 3),
    ).toBe(false);
    expect(canSpawnEvaluationRemainder(baseChild({ evaluationRemainderTaskId: 'rem-1' }), 3)).toBe(
      false,
    );
  });
});

describe('evaluation display helpers', () => {
  it('builds auto note and accepted labels', () => {
    expect(
      buildEvaluationRemainderAutoNote({
        acceptedQuantity: 3,
        originalAssignedQuantity: 15,
        remainderTaskCode: 'PO.020-SG-004-S6',
        remainderQuantity: 12,
      }),
    ).toBe('CM chấp nhận 3/15 · đã tạo PO.020-SG-004-S6 (12)');
    expect(formatEvaluationAcceptedLabel({ quantity: 3, originalAssignedQuantity: 15 })).toBe(
      'Đạt 3/15',
    );
    expect(formatEvaluationAcceptedLabel({ quantity: 3 })).toBe('Đạt 3');
    expect(hasCmEvaluation({ completionPercent: 100, pmEvaluation: '' })).toBe(true);
    expect(hasCmEvaluation({ completionPercent: null, pmEvaluation: 'A' })).toBe(true);
    expect(hasCmEvaluation({ completionPercent: null, pmEvaluation: '' })).toBe(false);
  });
});

describe('nextSplitChildTaskCode', () => {
  it('increments the highest existing -Sn suffix', () => {
    expect(
      nextSplitChildTaskCode('PO.001', [
        baseChild({ taskCode: 'PO.001-S1' }),
        baseChild({ taskCode: 'PO.001-S3' }),
      ]),
    ).toBe('PO.001-S4');
  });
});
