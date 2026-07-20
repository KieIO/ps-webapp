import {
  Bar,
  BarChart,
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

export function ProductivityChartsSection({ data }: ProductivityChartsSectionProps) {
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

  const hasOutput = outputData.some(
    (week) => week.projectSlides > 0 || week.creativeDa > 0 || week.editFeedback > 0,
  );
  const hasOnTime = onTimeData.some((week) => week.hasData);

  return (
    <div className={styles.grid}>
      <CardWrapper
        title="Output theo tuần"
        subtitle="Slides Project và DA Creative"
        className={styles.card}
      >
        {hasOutput ? (
          <div className={styles.chart} aria-label="Biểu đồ output theo tuần">
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={outputData} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={{ stroke: '#e2e8f0' }} {...axisProps} />
                <YAxis width={48} axisLine={false} tickFormatter={numberFormatter} {...axisProps} />
                <ChartTooltip formatter={(value) => numberFormatter(value as number)} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Bar
                  dataKey="projectSlides"
                  name="Project slides"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="creativeDa"
                  name="Creative DA"
                  fill="#7c3aed"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
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
