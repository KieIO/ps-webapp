import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import type { ProductivityDashboard } from '../../schemas/productivityDashboard.schema';
import styles from './ProductivityChartsSection.module.scss';

interface ProductivityChartsSectionProps {
  data: ProductivityDashboard;
}

const axisProps = {
  tick: { fontSize: 11, fill: '#64748b' },
  tickLine: false,
};

const numberFormatter = (value: number | string) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Number(value));

const percentFormatter = (value: number | string) => `${Number(value)}%`;

const OUTPUT_SERIES = [
  { key: 'slidesProject', name: 'Slide · Project', color: '#2563eb' },
  { key: 'slidesCreative', name: 'Slide · Creative', color: '#6366f1' },
  { key: 'slideMasterProject', name: 'Slide master · Project', color: '#0284c7' },
  { key: 'creativeDa', name: 'DA · Creative', color: '#7c3aed' },
] as const;

type OutputSeriesKey = (typeof OUTPUT_SERIES)[number]['key'];

const ALL_SERIES_VISIBLE: Record<OutputSeriesKey, boolean> = {
  slidesProject: true,
  slidesCreative: true,
  slideMasterProject: true,
  creativeDa: true,
};

export function ProductivityChartsSection({ data }: ProductivityChartsSectionProps) {
  const [visibleSeries, setVisibleSeries] =
    useState<Record<OutputSeriesKey, boolean>>(ALL_SERIES_VISIBLE);

  useEffect(() => {
    setVisibleSeries(ALL_SERIES_VISIBLE);
  }, [data.period.year, data.period.month]);

  const outputData = data.weeklyOutput.map((week) => ({
    ...week,
    label: week.label.replace('Tuần ', 'W'),
  }));
  const onTimeData = data.weeklyOnTime.map((week) => ({
    ...week,
    label: week.label.replace('Tuần ', 'W'),
    percent: week.percent ?? 0,
    hasData: week.finishedCount > 0,
  }));

  const hasOutput = outputData.some((week) => OUTPUT_SERIES.some((series) => week[series.key] > 0));
  const hasOnTime = onTimeData.some((week) => week.hasData);

  const visibleCount = OUTPUT_SERIES.filter((series) => visibleSeries[series.key]).length;

  const toggleSeries = (key: OutputSeriesKey) => {
    setVisibleSeries((current) => {
      const nextVisible = !current[key];
      const currentVisibleCount = OUTPUT_SERIES.filter((series) => current[series.key]).length;
      if (!nextVisible && currentVisibleCount <= 1) {
        return current;
      }
      return { ...current, [key]: nextVisible };
    });
  };

  return (
    <div className={styles.grid}>
      <CardWrapper
        title="Output theo tuần"
        subtitle="Slide, Slide master và DA theo phòng ban. Bấm chú thích để ẩn hoặc hiện."
        className={styles.card}
      >
        {hasOutput ? (
          <div className={styles.chart} aria-label="Biểu đồ output theo tuần">
            <div className={styles.seriesToggles} role="group" aria-label="Ẩn hiện chuỗi output">
              {OUTPUT_SERIES.map((series) => {
                const active = visibleSeries[series.key];
                return (
                  <button
                    key={series.key}
                    type="button"
                    className={`${styles.seriesToggle} ${active ? styles.seriesToggleActive : ''}`}
                    aria-pressed={active}
                    aria-label={active ? `Ẩn ${series.name}` : `Hiện ${series.name}`}
                    disabled={active && visibleCount <= 1}
                    onClick={() => toggleSeries(series.key)}
                  >
                    <span className={styles.seriesSwatch} style={{ background: series.color }} />
                    {series.name}
                  </button>
                );
              })}
            </div>
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={outputData} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={{ stroke: '#e2e8f0' }} {...axisProps} />
                <YAxis width={48} axisLine={false} tickFormatter={numberFormatter} {...axisProps} />
                <ChartTooltip
                  formatter={(value, name) => [numberFormatter(value as number), name]}
                />
                {OUTPUT_SERIES.map(
                  (series) =>
                    visibleSeries[series.key] && (
                      <Bar
                        key={series.key}
                        dataKey={series.key}
                        name={series.name}
                        fill={series.color}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={22}
                      />
                    ),
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className={styles.emptyState}>Chưa có output trong kỳ này.</div>
        )}
      </CardWrapper>

      <CardWrapper
        title="On-time rate theo tuần"
        subtitle="Task Project hoàn thành đúng hạn"
        className={styles.card}
      >
        {hasOnTime ? (
          <div className={styles.chart} aria-label="Biểu đồ on-time rate theo tuần">
            <ResponsiveContainer width="100%" height={290}>
              <LineChart data={onTimeData} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={{ stroke: '#e2e8f0' }} {...axisProps} />
                <YAxis
                  domain={[0, 100]}
                  width={48}
                  axisLine={false}
                  tickFormatter={percentFormatter}
                  {...axisProps}
                />
                <ChartTooltip
                  formatter={(value, _name, item) => {
                    const point = item?.payload as (typeof onTimeData)[number] | undefined;
                    if (!point?.hasData) return 'Chưa có task hoàn thành';
                    return percentFormatter(value as number);
                  }}
                  labelFormatter={(label, payload) => {
                    const point = payload?.[0]?.payload as (typeof onTimeData)[number] | undefined;
                    if (!point) return label;
                    return `${label} · ${point.onTimeCount}/${point.finishedCount} đúng hạn`;
                  }}
                />
                <ReferenceLine
                  y={80}
                  stroke="#dc2626"
                  strokeDasharray="5 5"
                  label={{ value: 'Ngưỡng 80%', fill: '#dc2626', fontSize: 10 }}
                />
                <Line
                  type="monotone"
                  dataKey="percent"
                  name="On-time rate"
                  stroke="#0f766e"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0f766e' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className={styles.emptyState}>Chưa có task hoàn thành trong kỳ này.</div>
        )}
      </CardWrapper>
    </div>
  );
}
