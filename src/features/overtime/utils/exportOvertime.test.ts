import { describe, expect, it } from 'vitest';
import type { OvertimeRecord } from '../schemas/overtime.schema';
import { OVERTIME_EXPORT_HEADERS, buildOvertimeExportRows } from './exportOvertime';

describe('buildOvertimeExportRows', () => {
  it('maps OT records to labeled spreadsheet rows', () => {
    const record = {
      id: 'ot-1',
      requestedBy: { userId: 'u1', code: 'PM01', name: 'Lan' },
      assignee: { userId: 'u2', code: 'ST01', name: 'Minh' },
      project: { id: 'p1', code: 'PRJ', name: 'Deck A' },
      task: { id: 't1', name: 'Slide 12' },
      otDate: '2026-09-08',
      startTime: '18:00',
      endTime: '20:30',
      estimatedHours: 2.5,
      actualHours: 2,
      reasonCategories: ['urgent', 'late_feedbacks'],
      reason: 'Need extra time',
      taskName: 'Slide 12',
      staffNote: 'Done',
      status: 'completed',
      approvedBy: { userId: 'u3', code: 'HD01', name: 'Head' },
      approvedAt: '2026-09-07T10:15:00',
      rejectReason: '',
      resultApproved: true,
      resultReviewNote: 'OK',
      resultReviewedAt: '2026-09-08T21:00:00',
      createdAt: '2026-09-07T09:00:00',
      updatedAt: '2026-09-08T21:00:00',
    } satisfies OvertimeRecord;

    const [row] = buildOvertimeExportRows([record]);
    expect([...OVERTIME_EXPORT_HEADERS]).toEqual(
      expect.arrayContaining(['Ngày OT', 'Dự án', 'Người OT', 'Trạng thái']),
    );
    expect(row).toEqual([
      '08/09/2026',
      'Deck A',
      'Minh',
      'Lan',
      '18:00 – 20:30',
      2.5,
      2,
      'Urgent, Late Feedbacks',
      'Need extra time',
      'Slide 12',
      'Done',
      'Hoàn thành',
      'Head',
      '07/09/2026 10:15',
      '',
      'OK',
    ]);
  });
});
