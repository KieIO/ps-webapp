import { useState, type ReactNode } from 'react';
import { Tooltip } from 'antd';
import {
  ChevronDown,
  CircleHelp,
  Clock3,
  Gauge,
  Image,
  Presentation,
  RotateCcw,
  Star,
  Target,
} from 'lucide-react';
import { ROLES, type Role } from '@/config/permissions';
import type { TeamProductivity } from '../../schemas/teamProductivity.schema';
import { formatCapacityPercent } from '../../utils/formatCapacityPercent';
import styles from './TeamMetricGrid.module.scss';

interface TeamMetricGridProps {
  data: TeamProductivity;
  groupLabel: string;
  role: Role;
}

const formatNumber = new Intl.NumberFormat('vi-VN');

function MetricCard({
  label,
  value,
  hint,
  icon,
  unavailable,
  explanation,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  unavailable?: boolean;
  explanation?: string;
}) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.labelRow}>
          <p className={styles.label}>{label}</p>
          {explanation && (
            <Tooltip title={explanation} placement="top">
              <button type="button" className={styles.help} aria-label={`Cách tính ${label}`}>
                <CircleHelp size={14} aria-hidden />
              </button>
            </Tooltip>
          )}
        </div>
        <span className={styles.icon}>{icon}</span>
      </div>
      <p className={unavailable ? styles.unavailable : styles.value}>{value}</p>
      <p className={styles.hint}>{hint}</p>
    </article>
  );
}

export function TeamMetricGrid({ data, groupLabel, role }: TeamMetricGridProps) {
  const [showMore, setShowMore] = useState(false);
  const isCreativeManager = role === ROLES.CREATIVE_MANAGER;

  const revisionValue =
    data.revisionRate.reviewedCount > 0 && data.revisionRate.percent != null
      ? `${data.revisionRate.percent.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`
      : 'Chưa có review';
  const qualityValue =
    data.qualityScore.available && data.qualityScore.average != null
      ? `${data.qualityScore.average.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} / 100`
      : 'Chưa có review';

  const capacityHint =
    data.capacityPercent == null
      ? 'Chưa có capacity trong kỳ'
      : data.overloadedCount === 0
        ? `${data.teamSize} người · không overload`
        : `${data.teamSize} người · ${data.overloadedCount} overload`;

  return (
    <section className={styles.section} aria-label={`Chỉ số ${groupLabel}`}>
      <div className={styles.grid}>
        <MetricCard
          label="Capacity"
          value={
            data.capacityPercent == null
              ? 'Chưa có dữ liệu'
              : formatCapacityPercent(data.capacityPercent)
          }
          hint={capacityHint}
          unavailable={data.capacityPercent == null}
          icon={<Gauge size={18} aria-hidden />}
          explanation="Trung bình capacity của nhân sự đang làm việc trong nhóm."
        />
        <MetricCard
          label="On-time"
          value={
            data.onTimeRate.available && data.onTimeRate.percent != null
              ? `${Math.round(data.onTimeRate.percent)}%`
              : 'Chưa có task'
          }
          hint={
            data.onTimeRate.available
              ? `${data.onTimeRate.onTimeCount}/${data.onTimeRate.finishedCount} task đúng hạn`
              : 'Chưa có task hoàn thành'
          }
          unavailable={!data.onTimeRate.available}
          icon={<Clock3 size={18} aria-hidden />}
        />
        <MetricCard
          label="Vs target"
          value={data.vsTarget.label}
          hint={data.vsTarget.message ?? 'Output chính so với target kỳ'}
          unavailable={!data.vsTarget.available}
          icon={<Target size={18} aria-hidden />}
        />
        <MetricCard
          label="Quality"
          value={qualityValue}
          hint={
            data.qualityScore.reviewCount > 0
              ? `Từ ${data.qualityScore.reviewCount} review có điểm`
              : (data.qualityScore.message ?? 'Chưa có điểm chất lượng')
          }
          unavailable={!data.qualityScore.available}
          icon={<Star size={18} aria-hidden />}
        />
      </div>

      <button
        type="button"
        className={styles.toggle}
        aria-expanded={showMore}
        onClick={() => setShowMore((prev) => !prev)}
      >
        <span>{showMore ? 'Thu gọn' : 'Xem thêm'}</span>
        <ChevronDown
          size={16}
          aria-hidden
          className={showMore ? styles.chevronOpen : styles.chevron}
        />
      </button>

      {showMore ? (
        <div className={styles.grid} aria-label="Chỉ số phụ">
          {isCreativeManager ? (
            <MetricCard
              label="Output · DA"
              value={formatNumber.format(data.output.creativeDa)}
              hint="DA / Edit DA / Rework DA trong nhóm"
              icon={<Image size={18} aria-hidden />}
            />
          ) : (
            <MetricCard
              label="Output · Slides"
              value={formatNumber.format(data.output.projectSlides)}
              hint={`${formatNumber.format(data.editFeedback)} edit feedback`}
              icon={<Presentation size={18} aria-hidden />}
            />
          )}
          <MetricCard
            label="Revision"
            value={revisionValue}
            hint={
              data.revisionRate.reviewedCount > 0
                ? `${data.revisionRate.revisedCount}/${data.revisionRate.reviewedCount} task có revision`
                : (data.revisionRate.message ?? 'Chưa có quality review')
            }
            unavailable={data.revisionRate.reviewedCount === 0}
            icon={<RotateCcw size={18} aria-hidden />}
          />
          <MetricCard
            label="OT"
            value={
              data.overtime.available ? `${data.overtime.totalHours.toFixed(1)}h` : 'Chưa có OT'
            }
            hint={
              data.overtime.available
                ? `${data.overtime.requestCount} yêu cầu đã duyệt`
                : 'Chưa có yêu cầu được duyệt'
            }
            unavailable={!data.overtime.available}
            icon={<Clock3 size={18} aria-hidden />}
          />
        </div>
      ) : null}
    </section>
  );
}
