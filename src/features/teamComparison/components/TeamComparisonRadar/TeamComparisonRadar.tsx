import { Select } from 'antd';
import { ChartNoAxesCombined } from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
} from 'recharts';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import type { ProductivityRankingRow } from '@/features/productivity/schemas/productivityDashboard.schema';
import {
  RADAR_METRICS,
  buildRadarChartData,
  computeTeamRadarAverage,
  formatRadarLegendValue,
  rowToRadarValues,
} from '../../utils/radarMetrics';
import styles from './TeamComparisonRadar.module.scss';

interface TeamComparisonRadarProps {
  rows: ProductivityRankingRow[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  displayName: (row: ProductivityRankingRow) => string;
}

export function TeamComparisonRadar({
  rows,
  selectedUserId,
  onSelectUser,
  displayName,
}: TeamComparisonRadarProps) {
  const selected = rows.find((row) => row.userId === selectedUserId) ?? rows[0] ?? null;
  const teamAvg = computeTeamRadarAverage(rows);
  const individual = selected ? rowToRadarValues(selected) : null;
  const chartData = individual != null ? buildRadarChartData(teamAvg, individual) : [];
  const personLabel = selected ? displayName(selected) : 'Cá nhân';
  const missingMetrics =
    individual == null
      ? RADAR_METRICS
      : RADAR_METRICS.filter(
          (metric) => teamAvg[metric.key] == null || individual[metric.key] == null,
        );
  const canRenderRadar = individual != null && missingMetrics.length === 0;

  return (
    <CardWrapper
      title="Biểu đồ năng lực đa chiều — Team vs Cá nhân"
      subtitle="So sánh trung bình team với nhân viên được chọn — chọn từ dropdown hoặc bảng xếp hạng bên dưới"
      className={styles.card}
      actions={
        <Select
          className={styles.select}
          value={selected?.userId}
          onChange={onSelectUser}
          options={rows.map((row) => ({
            value: row.userId,
            label: displayName(row),
          }))}
          placeholder="Chọn nhân viên"
          showSearch
          optionFilterProp="label"
          aria-label="Chọn nhân viên để so sánh"
          disabled={rows.length === 0}
        />
      }
    >
      {rows.length === 0 || !individual ? (
        <div className={styles.empty}>Chưa có dữ liệu để vẽ biểu đồ so sánh</div>
      ) : (
        <div className={styles.content}>
          <div className={styles.chart} aria-label="Biểu đồ radar team vs cá nhân">
            {canRenderRadar ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="76%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#475569' }} />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fontSize: 9, fill: '#94a3b8' }}
                    tickCount={5}
                    axisLine={false}
                  />
                  <Radar
                    name="TB Team"
                    dataKey="team"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.14}
                    strokeWidth={2}
                  />
                  <Radar
                    name={personLabel}
                    dataKey="individual"
                    stroke="#0f172a"
                    fill="#0f172a"
                    fillOpacity={0.04}
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#0f172a', stroke: '#fff', strokeWidth: 2 }}
                  />
                  <ChartTooltip
                    formatter={(value, name) => [
                      Number(value).toLocaleString('vi-VN', {
                        maximumFractionDigits: 1,
                      }),
                      name,
                    ]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.incomplete}>
                <span className={styles.incompleteIcon}>
                  <ChartNoAxesCombined size={22} aria-hidden />
                </span>
                <strong>Chưa đủ dữ liệu để vẽ radar</strong>
                <p>
                  Cần đủ On-time, Output vs Target, Capacity, Quality và Revision cho cả team và
                  nhân viên.
                </p>
                <span className={styles.missing}>
                  Còn thiếu: {missingMetrics.map((metric) => metric.legendLabel).join(', ')}
                </span>
              </div>
            )}
          </div>

          <div className={styles.legend}>
            <div className={styles.legendHeader}>
              <span>Chỉ số</span>
              <span className={styles.legendColumn}>
                <i className={styles.swatchTeam} aria-hidden />
                TB Team
              </span>
              <span className={styles.legendColumn}>
                <i className={styles.swatchIndividual} aria-hidden />
                {personLabel}
              </span>
            </div>
            <div className={styles.comparison}>
              {RADAR_METRICS.map((def) => {
                const teamDisplay = formatRadarLegendValue(def.key, teamAvg);
                const individualDisplay = formatRadarLegendValue(def.key, individual);
                const unavailable = teamDisplay === '—' && individualDisplay === '—';

                return (
                  <div key={def.key} className={styles.comparisonRow}>
                    <span className={styles.comparisonLabel}>{def.legendLabel}</span>
                    {unavailable ? (
                      <span className={styles.unavailableValue}>Chưa có dữ liệu</span>
                    ) : (
                      <div className={styles.comparisonValues}>
                        <span className={styles.teamValue}>{teamDisplay}</span>
                        <span className={styles.individualValue}>{individualDisplay}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className={styles.hint}>
              Radar đảo Revision Rate thành 100 − tỷ lệ revision để mọi trục đều có cùng quy ước:
              càng cao càng tốt. Output vs Target = % output chính so với target tính từ capacity
              kỳ.
            </p>
          </div>
        </div>
      )}
    </CardWrapper>
  );
}
