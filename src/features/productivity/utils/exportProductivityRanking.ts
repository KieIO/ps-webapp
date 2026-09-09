import dayjs from 'dayjs';
import { downloadCsv } from '@/shared/utils/exportCsv';
import type { ProductivityRankingRow } from '../schemas/productivityDashboard.schema';

const TREND_LABELS: Record<ProductivityRankingRow['trend'], string> = {
  up: 'Tăng',
  down: 'Giảm',
  flat: 'Ổn định',
};

export const PRODUCTIVITY_RANKING_EXPORT_HEADERS = [
  'Nhân viên',
  'Phòng',
  'PM',
  'CM',
  'Capacity (%)',
  'Output',
  'Đơn vị output',
  'Slides (Project)',
  'DA (Creative)',
  'Edit / Feedback',
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
] as const;

const formatPercent = (value: number | null | undefined): string | number =>
  value == null ? '' : Math.round(value * 10) / 10;

export const buildProductivityRankingExportRows = (
  rows: ProductivityRankingRow[],
): (string | number)[][] =>
  rows.map((row) => [
    row.name,
    row.displayDepartment || row.department,
    row.pmName.trim(),
    row.displayDepartment === 'Creative' ? row.cmName.trim() : '',
    formatPercent(row.capacityPercent),
    row.outputValue,
    row.outputUnit,
    row.projectSlides,
    row.creativeDa,
    row.editFeedback,
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
  ]);

export const exportProductivityRankingToCsv = (
  rows: ProductivityRankingRow[],
  period?: { year: number; month: number },
): void => {
  const monthKey = period
    ? `${period.year}-${String(period.month).padStart(2, '0')}`
    : dayjs().format('YYYY-MM');

  downloadCsv(
    `productivity-ranking-${monthKey}.csv`,
    [...PRODUCTIVITY_RANKING_EXPORT_HEADERS],
    buildProductivityRankingExportRows(rows),
  );
};
