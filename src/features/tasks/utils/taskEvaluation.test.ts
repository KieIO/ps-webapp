import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import type { MyTask } from '../schemas/task.schema';
import {
  canEvaluateTaskLayer,
  hasChEvaluation,
  isCreativePastChToCmHandoff,
  isCreativeWholeAssigned,
  resolveEvaluationWriteLayer,
  resolveEvaluationWriteLayerSafe,
} from './taskEvaluation';

const task = (overrides: Partial<MyTask>): MyTask =>
  ({
    id: 't1',
    taskCategory: 'project',
    taskCode: 'T-1',
    projectName: 'CRM',
    projectManager: { code: 'PM', name: 'Long' },
    taskName: 'Banner',
    level: 2,
    quantity: 10,
    date: '2026-05-14T00:00:00.000Z',
    description: 'Brief',
    staff: [],
    department: 'creative',
    ...overrides,
  }) as MyTask;

describe('canEvaluateTaskLayer', () => {
  const awaitingCh = task({ id: 'awaiting-ch', pipelineStage: 'awaiting_ch' });
  const parent = task({ id: 'parent', pipelineStage: 'awaiting_cm' });
  const splitParent = task({ id: 'split-parent', pipelineStage: 'split' });
  const child = task({
    id: 'child',
    parentTaskId: 'split-parent',
    taskKind: 'split',
    pipelineStage: 'assigned_staff',
  });
  const wholeStaff = task({ id: 'whole', pipelineStage: 'assigned_staff' });

  it('PM / CH / Head evaluate parents only, not split children', () => {
    for (const role of [ROLES.PM, ROLES.CREATIVE_HEAD, ROLES.HEAD]) {
      expect(canEvaluateTaskLayer(role, parent)).toBe(true);
      expect(canEvaluateTaskLayer(role, child)).toBe(false);
    }
  });

  it('PM cannot evaluate creative until CH has assigned a CM', () => {
    expect(canEvaluateTaskLayer(ROLES.PM, awaitingCh)).toBe(false);
    expect(canEvaluateTaskLayer(ROLES.PM, parent)).toBe(true);
    expect(canEvaluateTaskLayer(ROLES.PM, wholeStaff)).toBe(true);
    expect(canEvaluateTaskLayer(ROLES.PM, splitParent)).toBe(true);
  });

  it('CM evaluates staff execution, not split parents', () => {
    expect(canEvaluateTaskLayer(ROLES.CREATIVE_MANAGER, child)).toBe(true);
    expect(canEvaluateTaskLayer(ROLES.CREATIVE_MANAGER, wholeStaff)).toBe(true);
    expect(canEvaluateTaskLayer(ROLES.CREATIVE_MANAGER, splitParent)).toBe(false);
    expect(canEvaluateTaskLayer(ROLES.CREATIVE_MANAGER, parent)).toBe(false);
  });

  it('Admin can evaluate any layer; Employee cannot', () => {
    expect(canEvaluateTaskLayer(ROLES.ADMIN, child)).toBe(true);
    expect(canEvaluateTaskLayer(ROLES.ADMIN, parent)).toBe(true);
    expect(canEvaluateTaskLayer(ROLES.EMPLOYEE, parent)).toBe(false);
  });
});

describe('whole-assign evaluation layers', () => {
  const whole = task({ id: 'whole', pipelineStage: 'assigned_staff' });
  const awaiting = task({ id: 'awaiting', pipelineStage: 'awaiting_cm' });
  const awaitingCh = task({ id: 'awaiting-ch', pipelineStage: 'awaiting_ch' });
  const splitParent = task({ id: 'split', pipelineStage: 'split' });

  it('keeps layered write targets on creative whole assign', () => {
    expect(isCreativeWholeAssigned(whole)).toBe(true);
    expect(isCreativeWholeAssigned(awaiting)).toBe(false);
    expect(resolveEvaluationWriteLayer(ROLES.CREATIVE_MANAGER, whole)).toBe('staff');
    expect(resolveEvaluationWriteLayer(ROLES.CREATIVE_HEAD, whole)).toBe('handoff');
    expect(resolveEvaluationWriteLayer(ROLES.PM, whole)).toBe('ch');
    expect(resolveEvaluationWriteLayer(ROLES.CREATIVE_HEAD, awaiting)).toBe('staff');
    expect(() => resolveEvaluationWriteLayer(ROLES.CREATIVE_HEAD, awaiting, 'other')).toThrow(
      /không hợp lệ/,
    );
    expect(() => resolveEvaluationWriteLayer(ROLES.CREATIVE_MANAGER, whole, 'handoff')).toThrow(
      /kết quả Staff/,
    );
    expect(() => resolveEvaluationWriteLayer(ROLES.CREATIVE_HEAD, whole, 'staff')).toThrow(
      /gói của CM/,
    );
    expect(() => resolveEvaluationWriteLayer(ROLES.PM, whole, 'handoff')).toThrow(/Creative Head/);
    expect(() => resolveEvaluationWriteLayer(ROLES.ADMIN, whole)).toThrow(/chọn lớp/);
    expect(resolveEvaluationWriteLayer(ROLES.ADMIN, whole, 'handoff')).toBe('handoff');
    expect(resolveEvaluationWriteLayer(ROLES.ADMIN, whole, 'ch')).toBe('ch');
  });

  it('lets PM score Creative Head after CH→CM (and through finished chain)', () => {
    expect(isCreativePastChToCmHandoff(awaiting)).toBe(true);
    expect(isCreativePastChToCmHandoff(whole)).toBe(true);
    expect(isCreativePastChToCmHandoff(splitParent)).toBe(true);
    expect(isCreativePastChToCmHandoff(awaitingCh)).toBe(false);

    expect(resolveEvaluationWriteLayer(ROLES.PM, awaiting)).toBe('ch');
    expect(resolveEvaluationWriteLayer(ROLES.PM, splitParent)).toBe('ch');
    expect(resolveEvaluationWriteLayer(ROLES.ADMIN, awaiting)).toBe('ch');
    expect(() => resolveEvaluationWriteLayer(ROLES.PM, awaitingCh, 'ch')).toThrow(
      /sau khi CH đã giao CM/,
    );
    expect(() => resolveEvaluationWriteLayer(ROLES.CREATIVE_HEAD, whole, 'ch')).toThrow(/Chỉ PM/);
  });

  it('blocks CM / Head / Employee from writing the ch layer', () => {
    expect(() => resolveEvaluationWriteLayer(ROLES.CREATIVE_MANAGER, whole, 'ch')).toThrow(
      /Chỉ PM/,
    );
    expect(() => resolveEvaluationWriteLayer(ROLES.HEAD, whole, 'ch')).toThrow(/Chỉ PM/);
    expect(() => resolveEvaluationWriteLayer(ROLES.EMPLOYEE, whole, 'ch')).toThrow(/Chỉ PM/);
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
      parentTaskId: 'whole',
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
