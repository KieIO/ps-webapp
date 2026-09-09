import { describe, expect, it } from 'vitest';
import type { ProductivityRankingRow } from '../schemas/productivityDashboard.schema';
import {
  PRODUCTIVITY_RANKING_EXPORT_HEADERS,
  buildProductivityRankingExportRows,
} from './exportProductivityRanking';

describe('buildProductivityRankingExportRows', () => {
  it('maps ranking rows to spreadsheet cells', () => {
    const row = {
      userId: '11111111-1111-1111-1111-111111111111',
      name: 'Minh',
      department: 'project',
      displayDepartment: 'Project',
      pmName: 'Lan',
      pmUserId: '22222222-2222-2222-2222-222222222222',
      cmName: '',
      cmUserId: null,
      capacityPercent: 92.4,
      projectSlides: 120,
      creativeDa: 0,
      editFeedback: 3,
      outputValue: 120,
      outputUnit: 'slides',
      vsTarget: {
        available: true,
        label: '105%',
        percent: 105,
        targetValue: 100,
      },
      onTimePercent: 88.2,
      onTimeFinished: 10,
      onTimeOnTime: 9,
      revisionPercent: 20,
      revisionReviewed: 5,
      revisionRevised: 1,
      qualityScore: 82.5,
      qualityReviewed: 4,
      overtimeHours: 4.5,
      trend: 'up',
      capacityDelta: 3.2,
    } satisfies ProductivityRankingRow;

    const [exportRow] = buildProductivityRankingExportRows([row]);
    expect([...PRODUCTIVITY_RANKING_EXPORT_HEADERS]).toEqual(
      expect.arrayContaining(['Nhân viên', 'Capacity (%)', 'On-time (%)', 'Trend']),
    );
    expect(exportRow).toEqual([
      'Minh',
      'Project',
      'Lan',
      '',
      92.4,
      120,
      'slides',
      120,
      0,
      3,
      '105%',
      105,
      88.2,
      '9/10',
      20,
      '1/5',
      82.5,
      4,
      4.5,
      'Tăng',
      3.2,
    ]);
  });

  it('keeps CM only for Creative staff', () => {
    const row = {
      userId: '11111111-1111-1111-1111-111111111111',
      name: 'An',
      department: 'creative',
      displayDepartment: 'Creative',
      pmName: 'Lan',
      pmUserId: null,
      cmName: 'Hoa',
      cmUserId: '33333333-3333-3333-3333-333333333333',
      capacityPercent: null,
      projectSlides: 0,
      creativeDa: 12,
      editFeedback: 0,
      outputValue: 12,
      outputUnit: 'DA',
      vsTarget: { available: false, label: 'N/A', message: 'Chưa có target' },
      onTimePercent: null,
      onTimeFinished: 0,
      onTimeOnTime: 0,
      revisionPercent: null,
      revisionReviewed: 0,
      revisionRevised: 0,
      qualityScore: null,
      qualityReviewed: 0,
      overtimeHours: 0,
      trend: 'flat',
      capacityDelta: null,
    } satisfies ProductivityRankingRow;

    const [exportRow] = buildProductivityRankingExportRows([row]);
    expect(exportRow[2]).toBe('Lan');
    expect(exportRow[3]).toBe('Hoa');
    expect(exportRow[4]).toBe('');
    expect(exportRow[19]).toBe('Ổn định');
  });
});
