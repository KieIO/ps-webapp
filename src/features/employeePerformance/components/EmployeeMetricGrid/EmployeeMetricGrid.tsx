import {
  BadgeCheck,
  Clock3,
  Gauge,
  Layers3,
  Presentation,
  RotateCcw,
  Star,
  type LucideIcon,
} from 'lucide-react';
import type { EmployeePerformanceDetail } from '../../schemas/employeePerformance.schema';
import styles from './EmployeeMetricGrid.module.scss';

interface EmployeeMetricGridProps {
  data: EmployeePerformanceDetail;
}

type Tone = 'blue' | 'teal' | 'amber' | 'green' | 'purple' | 'slate';

interface Metric {
  label: string;
  value: string;
  hint: string;
  meta?: string;
  tone: Tone;
  icon: LucideIcon;
}

const numberFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });
const valueOrDash = (value: number | null, suffix = '') =>
  value == null ? '—' : `${numberFormat.format(value)}${suffix}`;
const signed = (value: number | null, suffix: string) =>
  value == null ? undefined : `${value > 0 ? '+' : ''}${numberFormat.format(value)}${suffix}`;

export function EmployeeMetricGrid({ data }: EmployeeMetricGridProps) {
  const { summary } = data;
  const isCreative = data.profile.displayDepartment === 'Creative';
  const metrics: Metric[] = [
    {
      label: 'Output',
      value: `${numberFormat.format(summary.output.value)} ${summary.output.unit}`,
      hint: isCreative ? 'DA được giao trong kỳ' : 'Slides thực hiện trong kỳ',
      tone: 'blue',
      icon: Presentation,
    },
    {
      label: 'Capacity',
      value: valueOrDash(summary.capacityPercent, '%'),
      hint: 'Mức sử dụng năng lực tháng',
      meta: signed(summary.capacityDelta, ' điểm so với tháng trước'),
      tone: 'teal',
      icon: Gauge,
    },
    {
      label: 'Quality Score',
      value: valueOrDash(summary.qualityScore.average, '/100'),
      hint: `${summary.qualityScore.reviewCount} task đã review`,
      meta: signed(summary.qualityScore.deltaAverage, ' điểm so với tháng trước'),
      tone: 'amber',
      icon: Star,
    },
    {
      label: 'On-time Rate',
      value: valueOrDash(summary.onTimeRate.percent, '%'),
      hint: `${summary.onTimeRate.onTimeCount}/${summary.onTimeRate.finishedCount} task đúng hạn`,
      tone: 'green',
      icon: Clock3,
    },
    {
      label: 'Revision Rate',
      value: valueOrDash(summary.revisionRate.percent, '%'),
      hint: `${summary.revisionRate.revisedCount}/${summary.revisionRate.reviewedCount} task có revision`,
      tone: 'amber',
      icon: RotateCcw,
    },
    {
      label: 'Avg Task Level',
      value:
        summary.avgTaskLevel == null ? '—' : `Level ${numberFormat.format(summary.avgTaskLevel)}`,
      hint: 'Độ khó trung bình task được giao',
      tone: 'purple',
      icon: Layers3,
    },
    {
      label: 'DA Approved',
      value: isCreative
        ? `${numberFormat.format(summary.creativeDa.approved)}/${numberFormat.format(summary.creativeDa.assigned)}`
        : 'Không áp dụng',
      hint: isCreative ? 'DA approved / DA được giao' : 'Chỉ áp dụng cho phòng Creative',
      tone: 'slate',
      icon: BadgeCheck,
    },
  ];

  return (
    <section className={styles.grid} aria-label="Chỉ số hiệu suất nhân viên">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <article key={metric.label} className={`${styles.card} ${styles[metric.tone]}`}>
            <div className={styles.top}>
              <span className={styles.label}>{metric.label}</span>
              <span className={styles.icon}>
                <Icon size={16} aria-hidden />
              </span>
            </div>
            <strong className={styles.value}>{metric.value}</strong>
            <span className={styles.hint}>{metric.hint}</span>
            {metric.meta ? (
              <span className={metric.meta.startsWith('-') ? styles.negative : styles.positive}>
                {metric.meta}
              </span>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
