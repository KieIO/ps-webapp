import { describe, expect, it } from 'vitest';
import type { MyTask } from '../schemas/task.schema';
import {
  buildEvaluationRemainderAutoNote,
  canSpawnEvaluationRemainder,
  computeAcceptedRemainderQuantity,
  formatEvaluationAcceptedLabel,
  formatEvaluationBadgeLabel,
  formatEvaluationQuantitySummary,
  formatFinishedQuantitySummary,
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
    expect(formatEvaluationAcceptedLabel({ quantity: 40 })).toBeNull();
    expect(formatEvaluationBadgeLabel({ quantity: 40 })).toBe('Đã đánh giá');
    expect(formatEvaluationBadgeLabel({ quantity: 3, originalAssignedQuantity: 15 })).toBe(
      'Đạt 3/15',
    );
    expect(hasCmEvaluation({ completionPercent: 100, pmEvaluation: '' })).toBe(true);
    expect(hasCmEvaluation({ completionPercent: null, pmEvaluation: 'A' })).toBe(true);
    expect(hasCmEvaluation({ completionPercent: null, pmEvaluation: '' })).toBe(false);
  });
});

describe('formatEvaluationQuantitySummary', () => {
  const evaluatedParent = (overrides: Partial<MyTask> = {}): MyTask =>
    ({
      id: 'parent-1',
      taskCode: 'PO.020-CHRISTMA-005',
      taskName: 'Slides',
      quantity: 31,
      staffConfirmation: 'not_updated',
      completionPercent: 52,
      pmEvaluation: '4',
      pipelineStage: 'split',
      staff: [],
      ...overrides,
    }) as MyTask;

  it('shows Đạt / Còn for an evaluated split parent (percent → accepted qty)', () => {
    expect(formatEvaluationQuantitySummary(evaluatedParent())).toBe('Đạt 16 / 31 · Còn 15');
  });

  it('shows đã tách after remainder spawn', () => {
    expect(
      formatEvaluationQuantitySummary(
        baseChild({
          quantity: 3,
          originalAssignedQuantity: 8,
          evaluationRemainderTaskId: 'rem-1',
          evaluationRemainderQuantity: 5,
          completionPercent: 38,
          pmEvaluation: 'B',
        }),
      ),
    ).toBe('Đạt 3 / 8 · đã tách 5');
  });

  it('returns null when full acceptance or not evaluated', () => {
    expect(formatEvaluationQuantitySummary(evaluatedParent({ completionPercent: 100 }))).toBeNull();
    expect(
      formatEvaluationQuantitySummary(
        evaluatedParent({ completionPercent: null, pmEvaluation: '' }),
      ),
    ).toBeNull();
  });
});

describe('formatFinishedQuantitySummary', () => {
  const whole = (overrides: Partial<MyTask> = {}): MyTask =>
    ({
      id: 'whole-1',
      taskCode: 'PM-GOWARE-001',
      taskName: 'Slides',
      quantity: 23,
      staffConfirmation: 'finished',
      completionPercent: 13,
      pipelineStage: 'assigned_staff',
      staff: [],
      ...overrides,
    }) as MyTask;

  it('shows accepted vs assigned for a finished whole task (Đạt wording)', () => {
    expect(formatFinishedQuantitySummary(whole())).toBe('Đạt 3 / 23 · Còn 20');
  });

  it('keeps the plain quantity when acceptance is full, unevaluated, or not finished', () => {
    expect(formatFinishedQuantitySummary(whole({ completionPercent: 100 }))).toBeNull();
    expect(formatFinishedQuantitySummary(whole({ completionPercent: null }))).toBeNull();
    expect(formatFinishedQuantitySummary(whole({ staffConfirmation: 'confirmed' }))).toBeNull();
  });

  it('does not rewrite unevaluated split-family quantities', () => {
    expect(formatFinishedQuantitySummary(baseChild({ quantity: 23, completionPercent: 13 }))).toBe(
      null,
    );
    expect(
      formatFinishedQuantitySummary(
        whole({
          pipelineStage: 'split',
          parentTaskId: undefined,
          staffConfirmation: 'not_updated',
          completionPercent: 13,
        }),
      ),
    ).toBeNull();
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
