import { describe, expect, it } from 'vitest';
import {
  CONFIRMATION_LABELS,
  TRACKER_BLOCK_LABELS,
  TRACKER_BLOCK_LEGEND,
  TRACKER_VISIBLE_TASK_BLOCK_TYPES,
} from './taskConfirmation';

describe('tracker task legend vs list status wording', () => {
  it('legend shows Chưa xác nhận, Đang làm and Hoàn thành', () => {
    expect([...TRACKER_VISIBLE_TASK_BLOCK_TYPES]).toEqual(['pending', 'active', 'completed']);
    expect(TRACKER_BLOCK_LEGEND.map((item) => item.label)).toEqual([
      'Chưa xác nhận',
      'Đang làm',
      'Hoàn thành',
    ]);
  });

  it('pending uses Chưa xác nhận; active uses Đang làm', () => {
    expect(TRACKER_BLOCK_LABELS.pending).toBe(CONFIRMATION_LABELS.not_updated);
    expect(TRACKER_BLOCK_LABELS.active).toBe(CONFIRMATION_LABELS.confirmed);
    expect(TRACKER_BLOCK_LABELS.pending).toBe('Chưa xác nhận');
    expect(TRACKER_BLOCK_LABELS.active).toBe('Đang làm');
  });
});
