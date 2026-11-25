import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import type { MyTask } from '../schemas/task.schema';
import {
  canEvaluateCmHandoffPackage,
  canEvaluateTaskLayer,
  hasChEvaluation,
  isCreativePastChToCmHandoff,
  resolveEvaluationWriteLayer,
  resolveEvaluationWriteLayerSafe,
} from './taskEvaluation';

const task = (overrides: Partial<MyTask> & Pick<MyTask, 'id'>): MyTask =>
  ({
    taskCode: overrides.id,
    taskName: overrides.id,
    department: 'creative',
    staff: [],
    quantity: 10,
    ...overrides,
  }) as MyTask;

describe('canEvaluateTaskLayer', () => {
  const parent = task({ id: 'awaiting-cm', pipelineStage: 'awaiting_cm' });
  const awaitingCh = task({ id: 'awaiting-ch', pipelineStage: 'awaiting_ch' });
  const splitParent = task({ id: 'split-parent', pipelineStage: 'split' });
  const child = task({
    id: 'child',
    parentTaskId: 'split-parent',
    taskKind: 'split',
    pipelineStage: 'assigned_staff',
  });

  it('PM evaluates creative parents after CH→CM; CH/Head on split parent', () => {
    expect(canEvaluateTaskLayer(ROLES.PM, parent)).toBe(true);
    expect(canEvaluateTaskLayer(ROLES.PM, child)).toBe(false);
    expect(canEvaluateTaskLayer(ROLES.CREATIVE_HEAD, parent)).toBe(false);
    expect(canEvaluateTaskLayer(ROLES.CREATIVE_HEAD, splitParent)).toBe(true);
    expect(canEvaluateTaskLayer(ROLES.HEAD, splitParent)).toBe(true);
    expect(canEvaluateTaskLayer(ROLES.CREATIVE_HEAD, child)).toBe(false);
  });

  it('PM cannot evaluate creative until CH has assigned a CM', () => {
    expect(canEvaluateTaskLayer(ROLES.PM, awaitingCh)).toBe(false);
    expect(canEvaluateTaskLayer(ROLES.PM, parent)).toBe(true);
    expect(canEvaluateTaskLayer(ROLES.PM, splitParent)).toBe(true);
  });

  it('CH cannot evaluate Creative while awaiting_cm; can on split parent', () => {
    expect(canEvaluateTaskLayer(ROLES.CREATIVE_HEAD, awaitingCh)).toBe(false);
    expect(canEvaluateTaskLayer(ROLES.CREATIVE_HEAD, parent)).toBe(false);
    expect(canEvaluateTaskLayer(ROLES.CREATIVE_HEAD, splitParent)).toBe(true);
  });

  it('CM evaluates staff execution on children, not split parents', () => {
    expect(canEvaluateTaskLayer(ROLES.CREATIVE_MANAGER, child)).toBe(true);
    expect(canEvaluateTaskLayer(ROLES.CREATIVE_MANAGER, splitParent)).toBe(false);
    expect(canEvaluateTaskLayer(ROLES.CREATIVE_MANAGER, parent)).toBe(false);
  });

  it('Admin can evaluate any layer; Employee cannot', () => {
    expect(canEvaluateTaskLayer(ROLES.ADMIN, child)).toBe(true);
    expect(canEvaluateTaskLayer(ROLES.ADMIN, parent)).toBe(true);
    expect(canEvaluateTaskLayer(ROLES.EMPLOYEE, parent)).toBe(false);
  });
});

describe('split-parent handoff evaluation layers', () => {
  const awaiting = task({ id: 'awaiting', pipelineStage: 'awaiting_cm' });
  const awaitingCh = task({ id: 'awaiting-ch', pipelineStage: 'awaiting_ch' });
  const splitParent = task({ id: 'split', pipelineStage: 'split' });

  it('keeps layered write targets on split parent handoff', () => {
    expect(canEvaluateCmHandoffPackage(splitParent)).toBe(true);
    expect(canEvaluateCmHandoffPackage(awaiting)).toBe(false);
    expect(resolveEvaluationWriteLayer(ROLES.CREATIVE_HEAD, splitParent)).toBe('handoff');
    expect(resolveEvaluationWriteLayer(ROLES.PM, splitParent)).toBe('ch');
    expect(() => resolveEvaluationWriteLayer(ROLES.CREATIVE_MANAGER, splitParent)).toThrow(
      /từng task nhỏ/,
    );
    expect(() => resolveEvaluationWriteLayer(ROLES.CREATIVE_HEAD, awaiting)).toThrow(
      /sau khi CM đã chia/,
    );
    expect(() => resolveEvaluationWriteLayer(ROLES.CREATIVE_HEAD, awaiting, 'other')).toThrow(
      /không hợp lệ/,
    );
    expect(() => resolveEvaluationWriteLayer(ROLES.CREATIVE_HEAD, splitParent, 'staff')).toThrow(
      /từng task nhỏ/,
    );
    expect(() => resolveEvaluationWriteLayer(ROLES.PM, splitParent, 'handoff')).toThrow(
      /Creative Head/,
    );
    expect(() => resolveEvaluationWriteLayer(ROLES.ADMIN, splitParent)).toThrow(/chọn lớp/);
    expect(resolveEvaluationWriteLayer(ROLES.ADMIN, splitParent, 'handoff')).toBe('handoff');
    expect(resolveEvaluationWriteLayer(ROLES.ADMIN, splitParent, 'ch')).toBe('ch');
    expect(() => resolveEvaluationWriteLayer(ROLES.ADMIN, splitParent, 'staff')).toThrow(
      /từng task nhỏ/,
    );
  });

  it('lets PM score Creative Head after CH→CM (and through finished chain)', () => {
    expect(isCreativePastChToCmHandoff(awaiting)).toBe(true);
    expect(isCreativePastChToCmHandoff(splitParent)).toBe(true);
    expect(isCreativePastChToCmHandoff(awaitingCh)).toBe(false);

    expect(resolveEvaluationWriteLayer(ROLES.PM, awaiting)).toBe('ch');
    expect(resolveEvaluationWriteLayer(ROLES.PM, splitParent)).toBe('ch');
    expect(resolveEvaluationWriteLayer(ROLES.ADMIN, awaiting)).toBe('ch');
    expect(() => resolveEvaluationWriteLayer(ROLES.PM, awaitingCh, 'ch')).toThrow(
      /sau khi CH đã giao CM/,
    );
    expect(() => resolveEvaluationWriteLayer(ROLES.CREATIVE_HEAD, splitParent, 'ch')).toThrow(
      /Chỉ PM/,
    );
  });

  it('blocks CM / Head / Employee from writing the ch layer', () => {
    expect(() => resolveEvaluationWriteLayer(ROLES.CREATIVE_MANAGER, splitParent, 'ch')).toThrow(
      /Chỉ PM/,
    );
    expect(() => resolveEvaluationWriteLayer(ROLES.HEAD, splitParent, 'ch')).toThrow(/Chỉ PM/);
    expect(() => resolveEvaluationWriteLayer(ROLES.EMPLOYEE, splitParent, 'ch')).toThrow(/Chỉ PM/);
    expect(() => resolveEvaluationWriteLayer(ROLES.CREATIVE_MANAGER, awaiting, 'ch')).toThrow(
      /Chỉ PM/,
    );
  });

  it('keeps PM on staff layer for non-creative tasks', () => {
    const projectTask = task({
      id: 'project',
      department: 'project',
      pipelineStage: undefined,
    });
    expect(isCreativePastChToCmHandoff(projectTask)).toBe(false);
    expect(resolveEvaluationWriteLayer(ROLES.PM, projectTask)).toBe('staff');
    expect(resolveEvaluationWriteLayerSafe(ROLES.PM, awaitingCh)).toBeUndefined();
    expect(resolveEvaluationWriteLayerSafe(ROLES.PM, awaiting)).toBe('ch');
  });

  it('does not treat split children or revisions as past CH→CM for PM scoring', () => {
    const child = task({
      id: 'child',
      parentTaskId: 'split',
      taskKind: 'split',
      pipelineStage: 'assigned_staff',
    });
    const revision = task({
      id: 'rev',
      taskKind: 'revision',
      parentTaskId: 'split',
      pipelineStage: 'assigned_staff',
    });
    expect(isCreativePastChToCmHandoff(child)).toBe(false);
    expect(isCreativePastChToCmHandoff(revision)).toBe(false);
    expect(canEvaluateTaskLayer(ROLES.PM, child)).toBe(false);
  });
});

describe('hasChEvaluation', () => {
  it('detects any recorded PM→CH score field', () => {
    expect(hasChEvaluation({})).toBe(false);
    expect(hasChEvaluation({ chCompletionPercent: null, chEvaluation: '', chNote: '' })).toBe(
      false,
    );
    expect(hasChEvaluation({ chCompletionPercent: 80 })).toBe(true);
    expect(hasChEvaluation({ chEvaluation: '4' })).toBe(true);
    expect(hasChEvaluation({ chNote: 'ok' })).toBe(true);
  });
});
