import { FolderKanban, Layers, CalendarDays, CalendarRange } from 'lucide-react';
import type { CapacityMonthlySummary } from '../../schemas/capacityMonthly.schema';
import styles from './CapacityMonthlySummaryStrip.module.scss';

interface CapacityMonthlySummaryStripProps {
  summary: CapacityMonthlySummary;
  periodLabel: string;
  loading?: boolean;
}

function formatNumber(value: number) {
  return value.toLocaleString('vi-VN');
}

export function CapacityMonthlySummaryStrip({
  summary,
  periodLabel,
  loading,
}: CapacityMonthlySummaryStripProps) {
  const items = [
    {
      key: 'projects',
      label: 'Total projects',
      value: formatNumber(summary.totalProjects),
      hint: 'Distinct projects with tasks in period',
      icon: FolderKanban,
      tone: styles.toneBlue,
    },
    {
      key: 'slides',
      label: 'Total slides',
      value: formatNumber(summary.totalSlides),
      hint: 'Sum of task quantity delivered',
      icon: Layers,
      tone: styles.toneAmber,
    },
    {
      key: 'working',
      label: 'Working days',
      value: formatNumber(summary.workingDays),
      hint: 'Weekdays in selected period',
      icon: CalendarDays,
      tone: styles.toneTeal,
    },
    {
      key: 'days',
      label: 'Days in view',
      value: formatNumber(summary.dayCount),
      hint: periodLabel,
      icon: CalendarRange,
      tone: styles.toneSlate,
    },
  ] as const;

  return (
    <div className={styles.strip} aria-busy={loading}>
      {items.map(({ key, label, value, hint, icon: Icon, tone }) => (
        <div key={key} className={[styles.card, tone].join(' ')}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>{label}</span>
            <Icon size={16} className={styles.cardIcon} aria-hidden />
          </div>
          <div className={styles.cardValue}>{loading ? '—' : value}</div>
          <div className={styles.cardHint}>{hint}</div>
        </div>
      ))}
    </div>
  );
}
