import dayjs from 'dayjs';
import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { LineProps, TooltipProps } from 'recharts';
import { DATE_FORMAT } from '@/config/constants';
import type { CapacityMonthlyDay } from '../../schemas/capacityMonthly.schema';
import {
  buildCapacityMonthlyChartData,
  CAPACITY_CHART_SERIES,
  type CapacityMonthlyChartPoint,
  getCapacityChartYMax,
} from '../../utils/capacityMonthlyChartData';
import styles from './CapacityMonthlyChart.module.scss';

interface CapacityMonthlyChartProps {
  days: CapacityMonthlyDay[];
}

function renderCapacityDot() {
  return (dotProps: { cx?: number; cy?: number; stroke?: string; value?: number }) => {
    const { cx, cy, value, stroke } = dotProps;
    if (value === 0 || cx == null || cy == null) return null;
    return (
      <circle cx={cx} cy={cy} r={3.5} fill={stroke} stroke="#fff" strokeWidth={1.5} />
    );
  };
}

function ChartTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload as CapacityMonthlyChartPoint | undefined;
  if (!point) return null;

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{dayjs(point.date).format(DATE_FORMAT)}</p>
      <ul className={styles.tooltipList}>
        {CAPACITY_CHART_SERIES.map((series) => (
          <li key={series.key} className={styles.tooltipItem}>
            <span className={styles.tooltipLabel}>
              <span
                className={styles.tooltipDot}
                style={{ backgroundColor: series.color }}
              />
              {series.label}
            </span>
            <span className={styles.tooltipValue}>{point[series.key]}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CapacityMonthlyChart({ days }: CapacityMonthlyChartProps) {
  const chartData = useMemo(() => buildCapacityMonthlyChartData(days), [days]);
  const yMax = useMemo(() => getCapacityChartYMax(chartData), [chartData]);

  if (chartData.length === 0) {
    return <div className={styles.empty}>No capacity data for this month.</div>;
  }

  return (
    <div className={styles.chartWrap}>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="dayLabel"
            scale="point"
            type="category"
            padding={{ left: 12, right: 12 }}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#d1d5db' }}
            interval={0}
            minTickGap={0}
            angle={chartData.length > 20 ? -45 : 0}
            textAnchor={chartData.length > 20 ? 'end' : 'middle'}
            height={chartData.length > 20 ? 52 : 30}
          />
          <YAxis
            domain={[0, yMax]}
            tickFormatter={(value) => `${value}%`}
            width={44}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="line"
            wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
          />
          <ReferenceLine
            y={80}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            label={{
              value: '80% target',
              position: 'insideTopRight',
              fill: '#94a3b8',
              fontSize: 11,
            }}
          />
          {CAPACITY_CHART_SERIES.map((series) => (
            <Line
              key={series.key}
              type="linear"
              dataKey={series.key}
              name={series.label}
              stroke={series.color}
              strokeWidth={series.key === 'total' ? 2.5 : 1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              isAnimationActive={false}
              dot={renderCapacityDot() as LineProps['dot']}
              activeDot={{ r: 5, stroke: '#fff', strokeWidth: 1.5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className={styles.legendNote}>
        Same weighted capacity % as the table below · dashed line = 80% utilization target
      </p>
    </div>
  );
}
