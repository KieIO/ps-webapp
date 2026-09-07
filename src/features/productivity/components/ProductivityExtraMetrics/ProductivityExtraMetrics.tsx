import { Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { KeyboardEvent, ReactNode } from 'react';
import {
  CircleHelp,
  Clock3,
  FolderKanban,
  Image,
  Presentation,
  RotateCcw,
  Star,
} from 'lucide-react';
import { ROUTES } from '@/config/constants';
import type { ProductivityDashboard } from '../../schemas/productivityDashboard.schema';
import statStyles from '@/features/home/components/OverallMetricGrid/OverallMetricGrid.module.scss';
import styles from './ProductivityExtraMetrics.module.scss';

interface ProductivityExtraMetricsProps {
  data: ProductivityDashboard;
}

const formatNumber = new Intl.NumberFormat('vi-VN');

function MetricLabel({ label, explanation }: { label: string; explanation?: ReactNode }) {
  return (
    <div className={statStyles.labelRow}>
      <p className={statStyles.eyebrow}>{label}</p>
      {explanation && (
        <Tooltip title={explanation} placement="top" mouseEnterDelay={0.15}>
          <button type="button" className={statStyles.helpButton} aria-label={`Cách tính ${label}`}>
            <CircleHelp size={14} aria-hidden />
          </button>
        </Tooltip>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  unavailable,
  explanation,
  onActivate,
  actionHint,
  layout,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  unavailable?: boolean;
  explanation?: ReactNode;
  onActivate?: () => void;
  actionHint?: string;
  layout: 'primary' | 'secondary';
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onActivate || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    onActivate();
  };

  return (
    <article
      className={`${statStyles.statCard} ${layout === 'secondary' ? styles.secondaryStatCard : ''} ${onActivate ? statStyles.clickableStatCard : ''} ${layout === 'primary' ? styles.primaryCell : styles.secondaryCell}`}
      role={onActivate ? 'link' : undefined}
      tabIndex={onActivate ? 0 : undefined}
      onClick={onActivate}
      onKeyDown={handleKeyDown}
    >
      <div className={statStyles.statHeader}>
        <MetricLabel label={label} explanation={explanation} />
        <span className={layout === 'secondary' ? styles.secondaryIcon : statStyles.statIcon}>
          {icon}
        </span>
      </div>
      <p className={unavailable ? statStyles.unavailableValue : statStyles.statValue}>{value}</p>
      <p className={statStyles.muted}>{hint}</p>
      {actionHint && <p className={statStyles.actionHint}>{actionHint}</p>}
    </article>
  );
}

function TrendMetricCard({
  label,
  value,
  hint,
  delta,
  deltaLabel,
  unavailable,
  explanation,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  delta?: number | null;
  deltaLabel?: string;
  unavailable?: boolean;
  explanation?: string;
  icon: ReactNode;
}) {
  const deltaTone =
    delta == null
      ? null
      : delta > 0
        ? styles.deltaUp
        : delta < 0
          ? styles.deltaDown
          : styles.deltaFlat;

  return (
    <article className={`${styles.trendCard} ${styles.secondaryCell}`}>
      <div className={styles.header}>
        <div className={styles.labelRow}>
          <p className={styles.label}>{label}</p>
          {explanation && (
            <Tooltip title={explanation} placement="top" mouseEnterDelay={0.15}>
              <button type="button" className={styles.helpButton} aria-label={`Cách tính ${label}`}>
                <CircleHelp size={14} aria-hidden />
              </button>
            </Tooltip>
          )}
        </div>
        <span className={styles.icon}>{icon}</span>
      </div>
      <p className={unavailable ? styles.unavailable : styles.value}>{value}</p>
      <p className={styles.hint}>{hint}</p>
      {delta != null && deltaLabel && (
        <p className={`${styles.delta} ${deltaTone ?? ''}`}>{deltaLabel}</p>
      )}
    </article>
  );
}

export function ProductivityExtraMetrics({ data }: ProductivityExtraMetricsProps) {
  const navigate = useNavigate();
  const revision = data.revisionRate;
  const quality = data.qualityScore;
  const completedMonth = `${data.period.year}-${String(data.period.month).padStart(2, '0')}`;

  const openProjectSlidesTasks =
    data.output.projectSlides > 0
      ? () =>
          navigate(
            `${ROUTES.PROJECT_TASKS}?outputMetric=project_slides&outputMonth=${completedMonth}`,
          )
      : undefined;
  const openCreativeDATasks = () =>
    navigate(`${ROUTES.PROJECT_TASKS}?outputMetric=creative_da&outputMonth=${completedMonth}`);
  const openOnTimeTasks = data.onTimeRate.available
    ? () => navigate(`${ROUTES.PROJECT_TASKS}?timeliness=on_time&completedMonth=${completedMonth}`)
    : undefined;

  const revisionValue =
    revision.reviewedCount > 0 && revision.percent != null
      ? `${revision.percent.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`
      : 'Chưa có dữ liệu';

  const qualityValue =
    quality.available && quality.average != null
      ? `${quality.average.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} / 100`
      : 'Chưa có dữ liệu';

  const revisionDelta =
    revision.deltaPercent != null
      ? `${revision.deltaPercent > 0 ? '▲' : revision.deltaPercent < 0 ? '▼' : '='} ${Math.abs(revision.deltaPercent).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}% vs tháng trước`
      : undefined;

  const qualityDelta =
    quality.deltaAverage != null
      ? `${quality.deltaAverage > 0 ? '▲' : quality.deltaAverage < 0 ? '▼' : '='} ${Math.abs(quality.deltaAverage).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} vs tháng trước`
      : undefined;

  return (
    <div className={styles.grid} aria-label="Chỉ số output, tiến độ và chất lượng">
      <StatCard
        layout="primary"
        label="Slides · Project"
        value={formatNumber.format(data.output.projectSlides)}
        hint="Tổng output task Project trong tháng"
        icon={<Presentation size={18} aria-hidden />}
        onActivate={openProjectSlidesTasks}
        actionHint={
          openProjectSlidesTasks
            ? `Xem task tạo ${formatNumber.format(data.output.projectSlides)} slides →`
            : undefined
        }
      />
      <StatCard
        layout="primary"
        label="DA · Creative"
        value={formatNumber.format(data.output.creativeDa)}
        hint="DA, Edit DA và Rework DA trong tháng"
        icon={<Image size={18} aria-hidden />}
        onActivate={openCreativeDATasks}
        actionHint={
          data.output.creativeDa > 0
            ? `Xem task tạo ${formatNumber.format(data.output.creativeDa)} DA →`
            : 'Xem task DA trong tháng →'
        }
      />
      <StatCard
        layout="primary"
        label="Projects"
        value={formatNumber.format(data.projectCount)}
        hint="Số project có task trong tháng"
        explanation="Đếm các project khác nhau có ít nhất 1 Project Task chưa hủy, với ngày task nằm trong tháng báo cáo. Không gồm task hủy và task không gắn project."
        icon={<FolderKanban size={18} aria-hidden />}
      />
      <StatCard
        layout="primary"
        label="OT hours"
        value={
          data.overtime.available ? `${data.overtime.totalHours.toFixed(1)}h` : 'Chưa có dữ liệu'
        }
        hint={
          data.overtime.available
            ? `${data.overtime.requestCount} yêu cầu đã duyệt · giờ ước tính`
            : 'Chưa có yêu cầu OT được duyệt'
        }
        unavailable={!data.overtime.available}
        icon={<Clock3 size={18} aria-hidden />}
        explanation="Tổng số giờ OT ước tính từ các yêu cầu đã được duyệt có ngày OT trong tháng. Đây chưa phải số giờ làm thực tế."
      />
      <StatCard
        layout="secondary"
        label="On-time rate"
        value={
          data.onTimeRate.available && data.onTimeRate.percent != null
            ? `${Math.round(data.onTimeRate.percent)}%`
            : 'Chưa có dữ liệu'
        }
        hint={
          data.onTimeRate.available
            ? `${data.onTimeRate.onTimeCount}/${data.onTimeRate.finishedCount} task hoàn thành đúng hạn`
            : 'Chưa có task hoàn thành trong tháng'
        }
        unavailable={!data.onTimeRate.available}
        icon={<Clock3 size={18} aria-hidden />}
        explanation="On-time rate = số Project Task hoàn thành không trễ deadline ÷ tổng Project Task hoàn thành trong tháng × 100. Deadline ưu tiên client deadline, sau đó internal deadline và ngày task."
        onActivate={openOnTimeTasks}
        actionHint={
          data.onTimeRate.available
            ? `Xem ${data.onTimeRate.onTimeCount} task đúng hạn →`
            : undefined
        }
      />
      <TrendMetricCard
        label="Revision rate"
        value={revisionValue}
        hint={
          revision.reviewedCount > 0
            ? `${revision.revisedCount}/${revision.reviewedCount} task có revision`
            : (revision.message ?? 'Chưa có quality review trong tháng')
        }
        unavailable={revision.reviewedCount === 0}
        delta={revision.deltaPercent}
        deltaLabel={revisionDelta}
        explanation="Tỷ lệ task được review có ít nhất 1 revision trong tháng. Mỗi task lấy review mới nhất trong tháng."
        icon={<RotateCcw size={18} aria-hidden />}
      />
      <TrendMetricCard
        label="Quality score"
        value={qualityValue}
        hint={
          quality.reviewCount > 0
            ? `Trung bình từ ${quality.reviewCount} review có điểm`
            : (quality.message ?? 'Chưa có điểm chất lượng')
        }
        unavailable={!quality.available}
        delta={quality.deltaAverage}
        deltaLabel={qualityDelta}
        explanation="Trung bình quality score từ review mới nhất mỗi task trong tháng (chỉ tính review có điểm > 0)."
        icon={<Star size={18} aria-hidden />}
      />
    </div>
  );
}
