import dayjs from 'dayjs';
import type { ProductivityRankingRow } from '@/features/productivity/schemas/productivityDashboard.schema';
import { downloadCsv } from '@/shared/utils/exportCsv';
import { mainMetricShortLabel, type MainMetricKey } from './sortRanking';

const TREND_LABELS: Record<ProductivityRankingRow['trend'], string> = {
  up: 'Tăng',
  down: 'Giảm',
  flat: 'Ổn định',
};

export interface TeamComparisonExportRow extends ProductivityRankingRow {
  rank: number;
  displayName: string;
}

export const TEAM_COMPARISON_EXPORT_HEADERS = [
  'Hạng',
  'Nhân viên',
  'Phòng',
  'Capacity (%)',
  'Output',
  'Đơn vị output',
  'vs Target',
  'vs Target (%)',
  'On-time (%)',
  'On-time (đúng hạn/tổng)',
  'Revision (%)',
  'Revision (có revision/đã review)',
  'Quality',
  'Quality (số review)',
  'OT hours',
  'Trend',
  'Capacity delta (%)',
  'Chỉ số xếp hạng',
] as const;

const formatPercent = (value: number | null | undefined): string | number =>
  value == null ? '' : Math.round(value * 10) / 10;

export const buildTeamComparisonExportRows = (
  rows: TeamComparisonExportRow[],
  mainMetric: MainMetricKey,
): (string | number)[][] => {
  const metricLabel = mainMetricShortLabel(mainMetric);
  return rows.map((row) => [
    row.rank,
    row.displayName,
    row.displayDepartment || row.department,
    formatPercent(row.capacityPercent),
    row.outputValue,
    row.outputUnit,
    row.vsTarget.label,
    formatPercent(row.vsTarget.percent),
    formatPercent(row.onTimePercent),
    row.onTimeFinished > 0 ? `${row.onTimeOnTime}/${row.onTimeFinished}` : '',
    row.revisionReviewed > 0 ? formatPercent(row.revisionPercent) : '',
    row.revisionReviewed > 0 ? `${row.revisionRevised}/${row.revisionReviewed}` : '',
    formatPercent(row.qualityScore),
    row.qualityReviewed > 0 ? row.qualityReviewed : '',
    row.overtimeHours,
    TREND_LABELS[row.trend],
    formatPercent(row.capacityDelta),
    metricLabel,
  ]);
};

export const exportTeamComparisonToCsv = (
  rows: TeamComparisonExportRow[],
  options: {
    period?: { year: number; month: number };
    mainMetric: MainMetricKey;
  },
): void => {
  const monthKey = options.period
    ? `${options.period.year}-${String(options.period.month).padStart(2, '0')}`
    : dayjs().format('YYYY-MM');

  downloadCsv(
    `team-comparison-${monthKey}.csv`,
    [...TEAM_COMPARISON_EXPORT_HEADERS],
    buildTeamComparisonExportRows(rows, options.mainMetric),
  );
};
