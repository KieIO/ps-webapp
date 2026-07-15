import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip as AntTooltip } from 'antd';
import {
  Area,
  AreaChart,
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
import type { OverallDashboard } from '../../schemas/overallDashboard.schema';
import styles from './OverallTrendSection.module.scss';

interface OverallTrendSectionProps {
  data: OverallDashboard;
}

const axisProps = {
  tick: { fontSize: 11, fill: '#64748b' },
  tickLine: false,
};

const percentTickFormatter = (value: number | string) => `${Number(value)}%`;
const percentValueFormatter = (
  value: number | string | Array<number | string> | null | undefined,
) => {
  if (value == null) return 'Chưa có dữ liệu';
  const numericValue = Array.isArray(value) ? Number(value[0]) : Number(value);
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(numericValue)}%`;
};

const calculatePercent = (numerator: number, denominator: number): number | null =>
  denominator > 0 ? (numerator / denominator) * 100 : null;
const formatShortDate = (value: string) => {
  const [, month, day] = value.split('-');
  return `${day}/${month}`;
};

type ProductivityTooltipPoint = OverallDashboard['productivity'][number];

interface ProductivityTooltipProps {
  active?: boolean;
  label?: string;
  payload?: Array<{ payload?: ProductivityTooltipPoint }>;
}

function ProductivityTooltip({ active, label, payload }: ProductivityTooltipProps) {
  const point = payload?.[0]?.payload;
  if (!active || !point) {
    return null;
  }

  const renderDepartment = (
    name: string,
    completed: number,
    assigned: number,
    tone: 'project' | 'creative',
  ) => (
    <div className={styles.tooltipDepartment}>
      <strong className={styles[tone]}>
        {name}: {percentValueFormatter(calculatePercent(completed, assigned))}
      </strong>
      {assigned > 0 ? (
        <span>
          {completed} hoàn thành ÷ {assigned} được giao × 100
        </span>
      ) : (
        <span>Không có task trong tuần</span>
      )}
    </div>
  );

  return (
    <div className={styles.productivityTooltip}>
      <strong>
        {label} · {formatShortDate(point.startDate)}–{formatShortDate(point.endDate)}
      </strong>
      {renderDepartment('Project', point.projectCompleted, point.projectAssigned, 'project')}
      {renderDepartment('Creative', point.creativeCompleted, point.creativeAssigned, 'creative')}
    </div>
  );
}

export function OverallTrendSection({ data }: OverallTrendSectionProps) {
  const workloadTrend = data.capacity.weekly.map((week) => ({
    ...week,
    project: calculatePercent(
      week.projectDetail.workloadPoints,
      week.projectDetail.availableCapacityPoints,
    ),
    creative: calculatePercent(
      week.creativeDetail.workloadPoints,
      week.creativeDetail.availableCapacityPoints,
    ),
  }));
  const productivityTrend = data.productivity.map((week) => ({
    ...week,
    projectPercent: calculatePercent(week.projectCompleted, week.projectAssigned),
    creativePercent: calculatePercent(week.creativeCompleted, week.creativeAssigned),
  }));
  const hasWorkloadTrend = workloadTrend.some(
    (week) => week.project != null || week.creative != null,
  );
  const hasProductivityTrend = productivityTrend.some(
    (week) => week.projectPercent != null || week.creativePercent != null,
  );

  return (
    <div className={styles.grid}>
      <CardWrapper
        title="Workload Trend"
        subtitle="Capacity theo tuần và phòng ban"
        className={styles.card}
      >
        {hasWorkloadTrend ? (
          <div className={styles.chart} aria-label="Biểu đồ workload trend">
            <ResponsiveContainer width="100%" height={290}>
              <AreaChart data={workloadTrend} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="projectCapacity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="creativeCapacity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={{ stroke: '#e2e8f0' }} {...axisProps} />
                <YAxis
                  domain={[0, 'auto']}
                  width={48}
                  axisLine={false}
                  tickFormatter={percentTickFormatter}
                  {...axisProps}
                />
                <ChartTooltip formatter={percentValueFormatter} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <ReferenceLine
                  y={90}
                  stroke="#dc2626"
                  strokeDasharray="5 5"
                  label={{ value: 'Ngưỡng 90%', fill: '#dc2626', fontSize: 10 }}
                />
                <Area
                  type="monotone"
                  dataKey="project"
                  name="Project"
                  stroke="#2563eb"
                  strokeWidth={2.25}
                  fill="url(#projectCapacity)"
                  activeDot={{ r: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="creative"
                  name="Creative"
                  stroke="#7c3aed"
                  strokeWidth={2.25}
                  fill="url(#creativeCapacity)"
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className={styles.emptyState}>Chưa có dữ liệu Capacity cho kỳ này.</div>
        )}
      </CardWrapper>

      <CardWrapper
        title="Productivity Trend"
        subtitle="Tỉ lệ task hoàn thành theo tuần"
        className={styles.card}
        actions={
          <AntTooltip
            title="Được giao: task không bị huỷ và có lịch trong tuần. Hoàn thành: task finished có ngày hoàn thành trong tuần."
            placement="topRight"
          >
            <InfoCircleOutlined
              className={styles.infoIcon}
              tabIndex={0}
              aria-label="Giải thích cách tính Productivity Trend"
            />
          </AntTooltip>
        }
      >
        {hasProductivityTrend ? (
          <div className={styles.chart} aria-label="Biểu đồ productivity trend">
            <ResponsiveContainer width="100%" height={290}>
              <LineChart
                data={productivityTrend}
                margin={{ top: 12, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={{ stroke: '#e2e8f0' }} {...axisProps} />
                <YAxis
                  domain={[0, 100]}
                  width={48}
                  axisLine={false}
                  tickFormatter={percentTickFormatter}
                  {...axisProps}
                />
                <ChartTooltip content={<ProductivityTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Line
                  type="monotone"
                  dataKey="projectPercent"
                  name="Project"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2563eb' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="creativePercent"
                  name="Creative"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#7c3aed' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className={styles.emptyState}>Chưa có task được giao để tính Productivity.</div>
        )}
      </CardWrapper>
    </div>
  );
}
