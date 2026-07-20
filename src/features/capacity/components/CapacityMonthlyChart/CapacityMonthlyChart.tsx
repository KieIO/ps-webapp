import dayjs from 'dayjs';
import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
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

const axisProps = {
  tick: { fontSize: 11, fill: '#64748b' },
  tickLine: false,
};

const percentFormatter = (value: number | string) => `${Number(value)}%`;

export function CapacityMonthlyChart({ days }: CapacityMonthlyChartProps) {
  const chartData = useMemo(() => buildCapacityMonthlyChartData(days), [days]);
  const yMax = useMemo(() => getCapacityChartYMax(chartData), [chartData]);

  if (chartData.length === 0) {
    return <div className={styles.empty}>No capacity data for this month.</div>;
  }

  return (
    <div className={styles.chartWrap}>
      <ResponsiveContainer width="100%" height={290}>
        <LineChart data={chartData} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="dayLabel"
            scale="point"
            type="category"
            padding={{ left: 12, right: 12 }}
            axisLine={{ stroke: '#e2e8f0' }}
            interval={0}
            minTickGap={0}
            angle={chartData.length > 20 ? -45 : 0}
            textAnchor={chartData.length > 20 ? 'end' : 'middle'}
            height={chartData.length > 20 ? 52 : 30}
            {...axisProps}
          />
          <YAxis
            domain={[0, yMax]}
            width={48}
            axisLine={false}
            tickFormatter={percentFormatter}
            {...axisProps}
          />
          <ChartTooltip
            formatter={(value) => percentFormatter(value as number)}
            labelFormatter={(_label, payload) => {
              const point = payload?.[0]?.payload as CapacityMonthlyChartPoint | undefined;
              if (!point) return _label;
              return dayjs(point.date).format(DATE_FORMAT);
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <ReferenceLine
            y={80}
            stroke="#dc2626"
            strokeDasharray="5 5"
            label={{ value: '80% target', fill: '#dc2626', fontSize: 10 }}
          />
          {CAPACITY_CHART_SERIES.map((series) => (
            <Line
              key={series.key}
              type="monotone"
              dataKey={series.key}
              name={series.label}
              stroke={series.color}
              strokeWidth={series.key === 'total' ? 2.5 : 2}
              dot={{ r: 4, fill: series.color }}
              activeDot={{ r: 5 }}
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
