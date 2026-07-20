import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Tooltip } from 'antd';
import { CircleHelp, Clock3, Gauge, Image, Presentation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import type {
  OverallDashboard,
  OverallWeeklyCapacity,
} from '../../schemas/overallDashboard.schema';
import type { CapacityBreakdownScope } from '../../schemas/capacityBreakdown.schema';
import { CapacityBreakdownModal } from '../CapacityBreakdownModal/CapacityBreakdownModal';
import styles from './OverallMetricGrid.module.scss';

interface OverallMetricGridProps {
  data: OverallDashboard;
  showCompanyCapacity?: boolean;
  hideStatGrid?: boolean;
}

const formatNumber = new Intl.NumberFormat('vi-VN');
const formatPercent = (value: number) =>
  `${value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;

const calculateCapacityPercent = (
  workloadPoints: number,
  availableCapacityPoints: number,
): number | null =>
  availableCapacityPoints > 0 ? (workloadPoints / availableCapacityPoints) * 100 : null;

type CapacityTone = 'company' | 'project' | 'creative';
type CapacityWeek = {
  label: string;
  startDate: string;
  endDate: string;
  value: number | null;
  workloadPoints: number;
  availableCapacityPoints: number;
};

const formatShortDate = (value: string) => {
  const [, month, day] = value.split('-');
  return `${day}/${month}`;
};

function WeeklyCapacityExplanation({ week }: { week: CapacityWeek }) {
  return (
    <div className={styles.weeklyTooltipContent}>
      <strong>
        {week.label} · {formatShortDate(week.startDate)}–{formatShortDate(week.endDate)}
      </strong>
      <p>Capacity: {week.value == null ? 'Chưa có dữ liệu' : formatPercent(week.value)}</p>
      <p>
        {formatNumber.format(week.workloadPoints)} workload ÷{' '}
        {formatNumber.format(week.availableCapacityPoints)} khả dụng × 100
      </p>
    </div>
  );
}

function WeeklyCapacityBar({ week }: { week: CapacityWeek }) {
  const content = (
    <>
      <span className={styles.miniBarTrack}>
        <span
          className={styles.miniBarFill}
          style={{ width: `${Math.min(week.value ?? 0, 100)}%` }}
        />
      </span>
      <span>{week.label.replace('Tuần ', 'W')}</span>
    </>
  );

  if (week.value == null) {
    return (
      <div
        className={`${styles.miniBarItem} ${styles.miniBarItemInactive}`}
        aria-label={`${week.label}, chưa có năng lực khả dụng để tính Capacity`}
      >
        {content}
      </div>
    );
  }

  return (
    <Tooltip
      title={<WeeklyCapacityExplanation week={week} />}
      placement="top"
      mouseEnterDelay={0.1}
    >
      <button
        type="button"
        className={styles.miniBarItem}
        aria-label={`${week.label}, Capacity ${formatPercent(week.value)}`}
      >
        {content}
      </button>
    </Tooltip>
  );
}

const buildCapacityWeeks = (weeks: OverallWeeklyCapacity[], scope: CapacityTone): CapacityWeek[] =>
  weeks.map((week) => {
    const detail =
      scope === 'company'
        ? week.companyDetail
        : scope === 'project'
          ? week.projectDetail
          : week.creativeDetail;
    return {
      label: week.label,
      startDate: week.startDate,
      endDate: week.endDate,
      value: calculateCapacityPercent(detail.workloadPoints, detail.availableCapacityPoints),
      workloadPoints: detail.workloadPoints,
      availableCapacityPoints: detail.availableCapacityPoints,
    };
  });

function CapacityExplanation({
  workloadPoints,
  availableCapacityPoints,
  scopeNote,
  onOpenBreakdown,
}: {
  workloadPoints: number;
  availableCapacityPoints: number;
  scopeNote: string;
  onOpenBreakdown: () => void;
}) {
  const exactPercent =
    availableCapacityPoints > 0 ? (workloadPoints / availableCapacityPoints) * 100 : null;

  return (
    <div className={styles.tooltipContent}>
      <strong>Cách tính Capacity</strong>
      <p>
        Workload thực tế: <strong>{formatNumber.format(workloadPoints)} điểm</strong>, được cộng từ
        task × điểm chuẩn theo loại task và level.
      </p>
      <p>
        Năng lực khả dụng: <strong>{formatNumber.format(availableCapacityPoints)} điểm</strong>,
        bằng tổng capacity/ngày theo job title × số ngày trong tuần (Thứ 2–6) của tháng.
      </p>
      {exactPercent == null ? (
        <p>Chưa có năng lực khả dụng để tính tỷ lệ.</p>
      ) : (
        <p>
          <strong>{formatNumber.format(workloadPoints)}</strong> ÷{' '}
          <strong>{formatNumber.format(availableCapacityPoints)}</strong> × 100 ={' '}
          <strong>{formatPercent(exactPercent)}</strong>.
        </p>
      )}
      <p>{scopeNote}</p>
      <button
        type="button"
        className={styles.breakdownButton}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onOpenBreakdown();
        }}
      >
        Xem breakdown chi tiết
      </button>
    </div>
  );
}

function MetricLabel({
  label,
  explanation,
  forceClose = false,
}: {
  label: string;
  explanation?: ReactNode;
  forceClose?: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (forceClose) setOpen(false);
  }, [forceClose]);

  return (
    <div className={styles.labelRow}>
      <p className={styles.eyebrow}>{label}</p>
      {explanation && (
        <Tooltip
          title={explanation}
          placement="top"
          mouseEnterDelay={0.15}
          open={open && !forceClose}
          onOpenChange={(nextOpen) => {
            if (forceClose) {
              setOpen(false);
              return;
            }
            setOpen(nextOpen);
          }}
          overlayClassName={styles.metricTooltipOverlay}
        >
          <button
            type="button"
            className={styles.helpButton}
            aria-label={`Cách tính ${label}`}
            onClick={(event) => event.stopPropagation()}
          >
            <CircleHelp size={14} aria-hidden />
          </button>
        </Tooltip>
      )}
    </div>
  );
}

function CapacityCard({
  label,
  value,
  weeks,
  tone,
  explanation,
  forceCloseHelp,
}: {
  label: string;
  value: number | null;
  weeks: CapacityWeek[];
  tone: CapacityTone;
  explanation: ReactNode;
  forceCloseHelp?: boolean;
}) {
  return (
    <article className={`${styles.capacityCard} ${styles[tone]}`}>
      <div className={styles.capacityHeader}>
        <div>
          <MetricLabel label={label} explanation={explanation} forceClose={forceCloseHelp} />
          <p className={value == null ? styles.unavailableValue : styles.capacityValue}>
            {value == null ? 'Chưa có dữ liệu' : formatPercent(value)}
          </p>
        </div>
        <span className={styles.iconBubble}>
          <Gauge size={18} aria-hidden />
        </span>
      </div>
      <p className={styles.muted}>
        {value == null
          ? 'Chưa có năng lực khả dụng để tính Capacity'
          : 'Capacity trung bình trong tháng'}
      </p>
      {weeks.length > 0 && (
        <div className={styles.miniBars} aria-label={`Capacity theo tuần của ${label}`}>
          {weeks.map((week) => (
            <WeeklyCapacityBar key={week.startDate} week={week} />
          ))}
        </div>
      )}
    </article>
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
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  unavailable?: boolean;
  explanation?: ReactNode;
  onActivate?: () => void;
  actionHint?: string;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onActivate || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    onActivate();
  };

  return (
    <article
      className={`${styles.statCard} ${onActivate ? styles.clickableStatCard : ''}`}
      role={onActivate ? 'link' : undefined}
      tabIndex={onActivate ? 0 : undefined}
      onClick={onActivate}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.statHeader}>
        <MetricLabel label={label} explanation={explanation} />
        <span className={styles.statIcon}>{icon}</span>
      </div>
      <p className={unavailable ? styles.unavailableValue : styles.statValue}>{value}</p>
      <p className={styles.muted}>{hint}</p>
      {actionHint && <p className={styles.actionHint}>{actionHint}</p>}
    </article>
  );
}

export function OverallMetricGrid({
  data,
  showCompanyCapacity = true,
  hideStatGrid = false,
}: OverallMetricGridProps) {
  const navigate = useNavigate();
  const weekly = data.capacity.weekly;
  const [breakdownScope, setBreakdownScope] = useState<CapacityBreakdownScope | null>(null);
  const completedMonth = `${data.period.year}-${String(data.period.month).padStart(2, '0')}`;
  const openOnTimeTasks = data.onTimeRate.available
    ? () => navigate(`${ROUTES.PROJECT_TASKS}?timeliness=on_time&completedMonth=${completedMonth}`)
    : undefined;
  const openProjectSlidesTasks =
    data.output.projectSlides > 0
      ? () =>
          navigate(
            `${ROUTES.PROJECT_TASKS}?outputMetric=project_slides&outputMonth=${completedMonth}`,
          )
      : undefined;
  const openCreativeDATasks = () =>
    navigate(`${ROUTES.PROJECT_TASKS}?outputMetric=creative_da&outputMonth=${completedMonth}`);

  return (
    <section className={styles.section} aria-label="Chỉ số tổng quan">
      <div
        className={`${styles.capacityGrid} ${!showCompanyCapacity ? styles.capacityGridDepartment : ''}`}
      >
        {showCompanyCapacity && (
          <CapacityCard
            label="Capacity toàn công ty"
            value={calculateCapacityPercent(
              data.capacity.details.company.workloadPoints,
              data.capacity.details.company.availableCapacityPoints,
            )}
            weeks={buildCapacityWeeks(weekly, 'company')}
            tone="company"
            forceCloseHelp={breakdownScope != null}
            explanation={
              <CapacityExplanation
                workloadPoints={data.capacity.details.company.workloadPoints}
                availableCapacityPoints={data.capacity.details.company.availableCapacityPoints}
                scopeNote="Phạm vi: nhân sự toàn công ty có cấu hình capacity và đang làm việc."
                onOpenBreakdown={() => setBreakdownScope('company')}
              />
            }
          />
        )}
        <CapacityCard
          label="Capacity phòng Project"
          value={calculateCapacityPercent(
            data.capacity.details.project.workloadPoints,
            data.capacity.details.project.availableCapacityPoints,
          )}
          weeks={buildCapacityWeeks(weekly, 'project')}
          tone="project"
          forceCloseHelp={breakdownScope != null}
          explanation={
            <CapacityExplanation
              workloadPoints={data.capacity.details.project.workloadPoints}
              availableCapacityPoints={data.capacity.details.project.availableCapacityPoints}
              scopeNote="Phạm vi: nhân sự thuộc phòng Project."
              onOpenBreakdown={() => setBreakdownScope('project')}
            />
          }
        />
        <CapacityCard
          label="Capacity phòng Creative"
          value={calculateCapacityPercent(
            data.capacity.details.creative.workloadPoints,
            data.capacity.details.creative.availableCapacityPoints,
          )}
          weeks={buildCapacityWeeks(weekly, 'creative')}
          tone="creative"
          forceCloseHelp={breakdownScope != null}
          explanation={
            <CapacityExplanation
              workloadPoints={data.capacity.details.creative.workloadPoints}
              availableCapacityPoints={data.capacity.details.creative.availableCapacityPoints}
              scopeNote="Phạm vi: nhân sự Creative HCM và Creative AG."
              onOpenBreakdown={() => setBreakdownScope('creative')}
            />
          }
        />
      </div>

      {!hideStatGrid && (
        <div className={styles.statGrid}>
          <StatCard
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
          <StatCard
            label="OT hours"
            value={
              data.overtime.available
                ? `${data.overtime.totalHours.toFixed(1)}h`
                : 'Chưa có dữ liệu'
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
        </div>
      )}

      <CapacityBreakdownModal
        open={breakdownScope != null}
        scope={breakdownScope}
        period={{ year: data.period.year, month: data.period.month }}
        onClose={() => setBreakdownScope(null)}
      />
    </section>
  );
}
