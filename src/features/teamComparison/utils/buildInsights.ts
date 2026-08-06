import type { ProductivityRankingRow } from '@/features/productivity/schemas/productivityDashboard.schema';

export type InsightTone = 'positive' | 'warning' | 'info';

export interface TeamComparisonInsight {
  id: string;
  tone: InsightTone;
  text: string;
}

const ON_TIME_WARN = 80;
const REVISION_WARN = 40;
const QUALITY_GOOD = 80;

/**
 * Rule-based insights from the current month ranking (no AI).
 * Uses capacity trend vs last month where available.
 */
export function buildTeamComparisonInsights(
  rows: ProductivityRankingRow[],
  monthLabel: string,
  hideNames: boolean,
): TeamComparisonInsight[] {
  if (rows.length === 0) return [];

  const insights: TeamComparisonInsight[] = [];
  const rankOf = (userId: string) => rows.findIndex((r) => r.userId === userId) + 1;
  const nameOf = (row: ProductivityRankingRow) =>
    hideNames ? `Nhân viên ${rankOf(row.userId)}` : row.name;

  const withDelta = rows.filter((r) => r.capacityDelta != null);
  if (withDelta.length > 0) {
    const best = [...withDelta].sort((a, b) => (b.capacityDelta ?? 0) - (a.capacityDelta ?? 0))[0];
    if (best && (best.capacityDelta ?? 0) > 0) {
      const delta = best.capacityDelta!.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
      insights.push({
        id: 'best-capacity-delta',
        tone: 'positive',
        text: `${nameOf(best)} cải thiện capacity mạnh nhất: +${delta} điểm so với tháng trước.`,
      });
    }

    const worst = [...withDelta].sort((a, b) => (a.capacityDelta ?? 0) - (b.capacityDelta ?? 0))[0];
    if (worst && (worst.capacityDelta ?? 0) < 0) {
      const delta = Math.abs(worst.capacityDelta!).toLocaleString('vi-VN', {
        maximumFractionDigits: 1,
      });
      insights.push({
        id: 'worst-capacity-delta',
        tone: 'warning',
        text: `${nameOf(worst)} giảm capacity ${delta} điểm so với tháng trước — cần follow up.`,
      });
    }
  }

  const outputLeader = [...rows].sort((a, b) => b.outputValue - a.outputValue)[0];
  if (outputLeader && outputLeader.outputValue > 0) {
    insights.push({
      id: 'output-leader',
      tone: 'positive',
      text: `${nameOf(outputLeader)} dẫn đầu output: ${outputLeader.outputValue.toLocaleString('vi-VN')} ${outputLeader.outputUnit}.`,
    });
  }

  const revisionRows = rows.filter((r) => r.revisionReviewed > 0 && r.revisionPercent != null);
  if (revisionRows.length > 0) {
    const avg =
      revisionRows.reduce((sum, r) => sum + (r.revisionPercent ?? 0), 0) / revisionRows.length;
    if (avg >= REVISION_WARN) {
      insights.push({
        id: 'team-revision-high',
        tone: 'warning',
        text: `Revision trung bình nhóm tháng ${monthLabel}: ${Math.round(avg)}% — cao hơn ngưỡng ${REVISION_WARN}%.`,
      });
    } else {
      insights.push({
        id: 'team-revision-ok',
        tone: 'info',
        text: `Revision trung bình nhóm tháng ${monthLabel}: ${Math.round(avg)}%.`,
      });
    }
  }

  const lateCount = rows.filter(
    (r) => r.onTimePercent != null && r.onTimePercent < ON_TIME_WARN,
  ).length;
  if (lateCount > 0) {
    insights.push({
      id: 'ontime-risk',
      tone: 'warning',
      text: `${lateCount}/${rows.length} người có on-time dưới ${ON_TIME_WARN}% trong tháng ${monthLabel}.`,
    });
  }

  if (rows.some((r) => r.qualityScore != null)) {
    const qualityGood = rows.filter(
      (r) => r.qualityScore != null && r.qualityScore >= QUALITY_GOOD,
    ).length;
    insights.push({
      id: 'quality-good',
      tone: 'info',
      text: `${qualityGood}/${rows.length} người đạt quality ≥ ${QUALITY_GOOD}/100.`,
    });
  }

  return insights.slice(0, 6);
}
