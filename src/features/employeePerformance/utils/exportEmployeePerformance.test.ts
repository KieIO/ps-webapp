import { describe, expect, it } from 'vitest';
import type { EmployeePerformanceDetail } from '../schemas/employeePerformance.schema';
import {
  EMPLOYEE_PERFORMANCE_EXPORT_HEADERS,
  buildEmployeePerformanceExportRows,
} from './exportEmployeePerformance';

const baseDetail = {
  period: {
    year: 2026,
    month: 9,
    startDate: '2026-09-01',
    endDate: '2026-09-30',
  },
  profile: {
    userId: '7382239a-84ff-4150-9630-0ffe49a4f6f4',
    name: 'Nguyễn Văn A',
    department: 'project',
    displayDepartment: 'Project',
    jobTitleName: 'Designer',
    jobLevelLabel: 'Junior',
    joinedAt: '2024-01-15',
  },
  summary: {
    capacityPercent: 80,
    capacityDelta: 2,
    output: {
      value: 40,
      unit: 'slides',
      projectSlides: 40,
      creativeDa: 0,
      editFeedback: 1,
    },
    qualityScore: { average: 85, reviewCount: 3, deltaAverage: 1 },
    onTimeRate: { percent: 90, finishedCount: 10, onTimeCount: 9 },
    revisionRate: { percent: 20, reviewedCount: 5, revisedCount: 1 },
    avgTaskLevel: 2.5,
    creativeDa: { assigned: 0, approved: 0 },
  },
  qualityScoreTrend: [],
  capacityTrend: [],
  recentTasks: [
    {
      taskId: '11111111-1111-1111-1111-111111111111',
      taskCode: 'PRJ-001',
      taskName: 'Slide cover',
      level: 2,
      quantity: 12,
      revisionCount: 1,
      qualityScore: 88,
      completedAt: '2026-09-08',
      onTime: true,
    },
    {
      taskId: '22222222-2222-2222-2222-222222222222',
      taskCode: 'PRJ-002',
      taskName: 'Deck final',
      level: 3,
      quantity: 20,
      revisionCount: null,
      qualityScore: null,
      completedAt: null,
      onTime: false,
    },
  ],
  comments: [],
} satisfies EmployeePerformanceDetail;

describe('buildEmployeePerformanceExportRows', () => {
  it('maps recent tasks with employee/period context', () => {
    const rows = buildEmployeePerformanceExportRows(baseDetail);
    expect([...EMPLOYEE_PERFORMANCE_EXPORT_HEADERS]).toEqual(
      expect.arrayContaining(['Task code', 'Tên task', 'Đúng hạn']),
    );
    expect(rows).toEqual([
      [
        'Nguyễn Văn A',
        'Project',
        '2026-09',
        'PRJ-001',
        'Slide cover',
        2,
        12,
        1,
        88,
        '08/09/2026',
        'Đúng hạn',
      ],
      ['Nguyễn Văn A', 'Project', '2026-09', 'PRJ-002', 'Deck final', 3, 20, '', '', '', 'Trễ hạn'],
    ]);
  });
});
