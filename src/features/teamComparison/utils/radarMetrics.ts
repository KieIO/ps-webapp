import type { ProductivityRankingRow } from '@/features/productivity/schemas/productivityDashboard.schema';

export type RadarMetricKey = 'onTime' | 'outputVsTarget' | 'capacity' | 'quality' | 'revisionInv';

export interface RadarMetricDef {
  key: RadarMetricKey;
  label: string;
  /** Shown in the numeric legend (raw metric, not inverted). */
  legendLabel: string;
  /** Axis is visible but excluded from completeness checks until backend data exists. */
  placeholder?: boolean;
}

export const RADAR_METRICS: readonly RadarMetricDef[] = [
  { key: 'onTime', label: 'On-time Rate', legendLabel: 'On-time Rate' },
  {
    key: 'outputVsTarget',
    label: 'Output vs Target',
    legendLabel: 'Output vs Target',
  },
  { key: 'capacity', label: 'Capacity', legendLabel: 'Capacity' },
  { key: 'quality', label: 'Quality Rating', legendLabel: 'Quality Rating' },
  { key: 'revisionInv', label: 'Rev Rate (inv)', legendLabel: 'Revision Rate' },
] as const;

export interface RadarAxisValues {
  onTime: number | null;
  outputVsTarget: number | null;
  capacity: number | null;
  quality: number | null;
  /** Inverted revision for radar (higher = better). */
  revisionInv: number | null;
  /** Raw revision % for legend display. */
  revisionRaw: number | null;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function vsTargetPercent(row: ProductivityRankingRow): number | null {
  if (!row.vsTarget.available || row.vsTarget.percent == null) return null;
  return row.vsTarget.percent;
}

export function rowToRadarValues(row: ProductivityRankingRow): RadarAxisValues {
  const revisionRaw = row.revisionReviewed > 0 ? row.revisionPercent : null;
  return {
    onTime: row.onTimePercent,
    outputVsTarget: vsTargetPercent(row),
    capacity: row.capacityPercent == null ? null : clampPercent(row.capacityPercent),
    quality: row.qualityScore,
    revisionInv: revisionRaw == null ? null : clampPercent(100 - revisionRaw),
    revisionRaw,
  };
}

/** Team average across rows that have a value for each axis. */
export function computeTeamRadarAverage(rows: ProductivityRankingRow[]): RadarAxisValues {
  const avg = (pick: (row: ProductivityRankingRow) => number | null): number | null => {
    const values = rows.map(pick).filter((v): v is number => v != null);
    if (values.length === 0) return null;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  };

  const revisionRaw = avg((row) => (row.revisionReviewed > 0 ? row.revisionPercent : null));
  const capacityRaw = avg((row) => row.capacityPercent);

  return {
    onTime: avg((row) => row.onTimePercent),
    outputVsTarget: avg(vsTargetPercent),
    capacity: capacityRaw == null ? null : clampPercent(capacityRaw),
    quality: avg((row) => row.qualityScore),
    revisionInv: revisionRaw == null ? null : clampPercent(100 - revisionRaw),
    revisionRaw,
  };
}

/** Recharts radar data rows: one per axis with team + individual values (0 when missing). */
export function buildRadarChartData(
  team: RadarAxisValues,
  individual: RadarAxisValues,
): Array<{ metric: string; team: number; individual: number; fullMark: number }> {
  return RADAR_METRICS.map((def) => ({
    metric: def.label,
    team: clampPercent(team[def.key] ?? 0),
    individual: clampPercent(individual[def.key] ?? 0),
    fullMark: 100,
  }));
}

export function formatRadarLegendValue(key: RadarMetricKey, values: RadarAxisValues): string {
  if (key === 'revisionInv') {
    return values.revisionRaw == null ? '—' : `${Math.round(values.revisionRaw)}%`;
  }
  const value = values[key];
  if (value == null) return '—';
  if (key === 'outputVsTarget' || key === 'onTime') {
    return `${Math.round(value)}%`;
  }
  if (key === 'capacity' || key === 'quality') {
    return `${value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}${key === 'quality' ? '' : '%'}`;
  }
  return `${Math.round(value)}%`;
}
