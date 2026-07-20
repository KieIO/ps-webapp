import type { ProductivityRankingRow } from '@/features/productivity/schemas/productivityDashboard.schema';

export type MainMetricKey = 'onTime' | 'output' | 'capacity' | 'revision' | 'quality';

export const MAIN_METRIC_OPTIONS: { value: MainMetricKey; label: string }[] = [
  { value: 'onTime', label: 'Chỉ số chính: On-time Rate' },
  { value: 'output', label: 'Chỉ số chính: Output' },
  { value: 'capacity', label: 'Chỉ số chính: Capacity' },
  { value: 'revision', label: 'Chỉ số chính: Revision Rate' },
  { value: 'quality', label: 'Chỉ số chính: Quality Rating' },
];

export function mainMetricShortLabel(metric: MainMetricKey): string {
  switch (metric) {
    case 'onTime':
      return 'On-time Rate';
    case 'output':
      return 'Output';
    case 'capacity':
      return 'Capacity';
    case 'revision':
      return 'Revision Rate';
    case 'quality':
      return 'Quality Rating';
    default:
      return metric;
  }
}

function metricValue(row: ProductivityRankingRow, metric: MainMetricKey): number | null {
  switch (metric) {
    case 'onTime':
      return row.onTimePercent;
    case 'output':
      return row.outputValue;
    case 'capacity':
      return row.capacityPercent;
    case 'revision':
      return row.revisionReviewed > 0 ? row.revisionPercent : null;
    case 'quality':
      return row.qualityScore;
    default:
      return null;
  }
}

/** Sort ranking by main metric. Revision: lower is better; others: higher is better. */
export function sortRankingByMetric(
  rows: ProductivityRankingRow[],
  metric: MainMetricKey,
): ProductivityRankingRow[] {
  const ascending = metric === 'revision';
  return [...rows].sort((a, b) => {
    const left = metricValue(a, metric);
    const right = metricValue(b, metric);
    if (left == null && right == null) return a.name.localeCompare(b.name);
    if (left == null) return 1;
    if (right == null) return -1;
    const diff = ascending ? left - right : right - left;
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  });
}

export function anonymizeName(rank: number): string {
  return `Nhân viên ${rank}`;
}
