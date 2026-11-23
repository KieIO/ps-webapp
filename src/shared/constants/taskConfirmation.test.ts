import { describe, expect, it } from 'vitest';
import {
  CONFIRMATION_LABELS,
  TRACKER_BLOCK_LABELS,
  TRACKER_BLOCK_LEGEND,
  TRACKER_VISIBLE_TASK_BLOCK_TYPES,
} from './taskConfirmation';

describe('tracker task legend vs list status wording', () => {
  it('legend only shows Đang làm and Hoàn thành', () => {
    expect([...TRACKER_VISIBLE_TASK_BLOCK_TYPES]).toEqual(['active', 'completed']);
    expect(TRACKER_BLOCK_LEGEND.map((item) => item.label)).toEqual(['Đang làm', 'Hoàn thành']);
  });

  it('pending (not_updated) shares Đang làm label with active', () => {
    expect(TRACKER_BLOCK_LABELS.pending).toBe(CONFIRMATION_LABELS.confirmed);
    expect(TRACKER_BLOCK_LABELS.active).toBe(CONFIRMATION_LABELS.confirmed);
    expect(TRACKER_BLOCK_LABELS.pending).toBe('Đang làm');
  });
});
