import {
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
import type { EmployeePerformanceDetail } from '../../schemas/employeePerformance.schema';
import styles from './EmployeeTrendSection.module.scss';

interface EmployeeTrendSectionProps {
  data: EmployeePerformanceDetail;
}

const axisProps = {
  tick: { fontSize: 11, fill: '#64748b' },
  tickLine: false,
};

const monthLabel = (year: number, month: number) => `T${month}/${String(year).slice(-2)}`;

export function EmployeeTrendSection({ data }: EmployeeTrendSectionProps) {
  const qualityData = data.qualityScoreTrend.map((point) => ({
    ...point,
    label: monthLabel(point.year, point.month),
  }));
  const capacityData = data.capacityTrend.map((point) => ({
    ...point,
    label: monthLabel(point.year, point.month),
  }));
  const hasQuality = qualityData.some((point) => point.average != null);
  const hasCapacity = capacityData.some((point) => point.capacityPercent != null);

  return (
    <section className={styles.grid}>
      <CardWrapper
        title="Quality Score — 6 tháng gần nhất"
        subtitle="Điểm trung bình từ các task đã được review"
      >
        {hasQuality ? (
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={qualityData} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={{ stroke: '#e2e8f0' }} {...axisProps} />
                <YAxis
                  width={42}
                  domain={[0, 100]}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  {...axisProps}
                />
                <ChartTooltip
                  formatter={(value) => [
                    `${Number(value).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}/100`,
                    'Quality',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  name="Quality"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className={styles.empty}>Chưa có quality review trong 6 tháng gần nhất</div>
        )}
      </CardWrapper>

      <CardWrapper
        title="Capacity — 6 tháng gần nhất"
        subtitle="Mức sử dụng capacity theo từng tháng"
      >
        {hasCapacity ? (
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={capacityData} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={{ stroke: '#e2e8f0' }} {...axisProps} />
                <YAxis
                  width={42}
                  domain={[0, 120]}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                  {...axisProps}
                />
                <ReferenceLine
                  y={90}
                  stroke="#d97706"
                  strokeDasharray="4 4"
                  label={{ value: '90%', fill: '#d97706', fontSize: 10 }}
                />
                <ChartTooltip
                  formatter={(value) => [
                    `${Number(value).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`,
                    'Capacity',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="capacityPercent"
                  name="Capacity"
                  stroke="#0f766e"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#0f766e', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className={styles.empty}>Chưa có dữ liệu capacity trong 6 tháng gần nhất</div>
        )}
      </CardWrapper>
    </section>
  );
}
