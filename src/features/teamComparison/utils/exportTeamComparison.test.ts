import { describe, expect, it } from 'vitest';
import type { TeamComparisonExportRow } from './exportTeamComparison';
import {
  TEAM_COMPARISON_EXPORT_HEADERS,
  buildTeamComparisonExportRows,
} from './exportTeamComparison';

describe('buildTeamComparisonExportRows', () => {
  it('exports ranked rows with display names and sort metric', () => {
    const row = {
      userId: '11111111-1111-1111-1111-111111111111',
      name: 'Nguyễn Văn A',
      displayName: 'Nhân viên #1',
      rank: 1,
      department: 'project',
      displayDepartment: 'Project',
      pmName: 'Lan',
      pmUserId: null,
      cmName: '',
      cmUserId: null,
      capacityPercent: 88.5,
      projectSlides: 40,
      creativeDa: 0,
      editFeedback: 2,
      outputValue: 40,
      outputUnit: 'slides',
      vsTarget: { available: true, label: '110%', percent: 110, targetValue: 100 },
      onTimePercent: 92,
      onTimeFinished: 10,
      onTimeOnTime: 9,
      revisionPercent: 10,
      revisionReviewed: 5,
      revisionRevised: 1,
      qualityScore: 84,
      qualityReviewed: 4,
      overtimeHours: 3,
      trend: 'up',
      capacityDelta: 2.5,
    } satisfies TeamComparisonExportRow;

    const [exportRow] = buildTeamComparisonExportRows([row], 'onTime');
    expect([...TEAM_COMPARISON_EXPORT_HEADERS]).toEqual(
      expect.arrayContaining(['Hạng', 'Nhân viên', 'Chỉ số xếp hạng']),
    );
    expect(exportRow).toEqual([
      1,
      'Nhân viên #1',
      'Project',
      88.5,
      40,
      'slides',
      '110%',
      110,
      92,
      '9/10',
      10,
      '1/5',
      84,
      4,
      3,
      'Tăng',
      2.5,
      'On-time',
    ]);
  });
});
