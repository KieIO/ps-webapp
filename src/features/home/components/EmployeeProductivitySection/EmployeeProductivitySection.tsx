import { Progress, Tooltip } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, InfoCircleOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import type { EmployeeProductivity } from '../../schemas/employeeProductivity.schema';
import { ON_TIME_RATE_TOOLTIP, REVISION_RATE_TOOLTIP } from '../../utils/employeeHomeMetrics';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import styles from './EmployeeProductivitySection.module.scss';

interface EmployeeProductivitySectionProps {
  productivity: EmployeeProductivity | null;
}

const formatPercent = (value: number | null | undefined): string =>
  value == null ? '—' : `${value}%`;

export function EmployeeProductivitySection({ productivity }: EmployeeProductivitySectionProps) {
  const onTime = productivity?.onTimeRate;
  const weekly = productivity?.weeklyCompleted;
  const revision = productivity?.revisionRate;

  const onTimeDelta = onTime?.deltaPercent;
  const onTimeDeltaUp = onTimeDelta != null && onTimeDelta > 0;
  const onTimeDeltaDown = onTimeDelta != null && onTimeDelta < 0;

  // Revision rate: lower is better — invert delta colors vs on-time.
  const revisionDelta = revision?.deltaPercent;
  const revisionImproved = revisionDelta != null && revisionDelta < 0;
  const revisionWorsened = revisionDelta != null && revisionDelta > 0;

  return (
    <section className={styles.grid} aria-label="Personal productivity">
      <CardWrapper className={styles.card}>
        <div className={styles.metricHeader}>
          <span className={styles.label}>
            On-time rate tháng này
            <Tooltip title={ON_TIME_RATE_TOOLTIP}>
              <InfoCircleOutlined className={styles.info} aria-label="Giải thích on-time rate" />
            </Tooltip>
          </span>
        </div>
        <div className={styles.valueRow}>
          <span className={styles.value}>{formatPercent(onTime?.currentPercent)}</span>
          {onTimeDelta != null && (
            <span
              className={classNames(
                styles.delta,
                onTimeDeltaUp && styles.deltaUp,
                onTimeDeltaDown && styles.deltaDown,
              )}
            >
              {onTimeDeltaUp ? <ArrowUpOutlined /> : null}
              {onTimeDeltaDown ? <ArrowDownOutlined /> : null}
              {onTimeDelta > 0 ? '+' : ''}
              {onTimeDelta}%
            </span>
          )}
        </div>
        <p className={styles.hint}>
          {onTime == null
            ? 'Không tải được dữ liệu on-time'
            : onTime.finishedCount
              ? `So với tháng trước: ${formatPercent(onTime.previousPercent)} · ${onTime.onTimeCount}/${onTime.finishedCount} đúng hạn`
              : 'Chưa có task finished trong tháng này'}
        </p>
      </CardWrapper>

      <CardWrapper className={styles.card}>
        <div className={styles.metricHeader}>
          <span className={styles.label}>Task hoàn thành tuần này</span>
        </div>
        <div className={styles.valueRow}>
          <span className={styles.value}>
            {weekly != null ? (
              <>
                {weekly.completedCount}
                <span className={styles.slash}>/</span>
                {weekly.assignedCount}
              </>
            ) : (
              '—'
            )}
          </span>
          <span className={weekly != null ? styles.weeklyPercent : styles.valueMuted}>
            {weekly != null ? `${weekly.percent}%` : '—'}
          </span>
        </div>
        {weekly != null ? (
          <Progress
            percent={weekly.percent}
            showInfo={false}
            size="small"
            strokeColor="var(--color-primary)"
            className={styles.progress}
          />
        ) : null}
        <p className={styles.hint}>
          {weekly == null
            ? 'Không tải được dữ liệu tuần này'
            : weekly.assignedCount > 0
              ? weekly.remainingCount > 0
                ? `Còn ${weekly.remainingCount} task trong tuần lịch (T2–CN)`
                : 'Đã hoàn thành toàn bộ task trong tuần'
              : 'Chưa có task trong tuần lịch này'}
        </p>
      </CardWrapper>

      <CardWrapper className={styles.card}>
        <div className={styles.metricHeader}>
          <span className={styles.label}>
            Revision rate tháng này
            <Tooltip title={REVISION_RATE_TOOLTIP}>
              <InfoCircleOutlined className={styles.info} aria-label="Giải thích revision rate" />
            </Tooltip>
          </span>
        </div>
        <div className={styles.valueRow}>
          <span className={styles.value}>{formatPercent(revision?.currentPercent)}</span>
          {revisionDelta != null && (
            <span
              className={classNames(
                styles.delta,
                revisionImproved && styles.deltaUp,
                revisionWorsened && styles.deltaDown,
              )}
            >
              {revisionDelta > 0 ? <ArrowUpOutlined /> : null}
              {revisionDelta < 0 ? <ArrowDownOutlined /> : null}
              {revisionDelta > 0 ? '+' : ''}
              {revisionDelta}%
            </span>
          )}
        </div>
        <p className={styles.hint}>
          {revision == null
            ? 'Không tải được dữ liệu revision'
            : revision.reviewedCount
              ? `So với tháng trước: ${formatPercent(revision.previousPercent)} · ${revision.revisedCount}/${revision.reviewedCount} phải sửa`
              : revision.message || 'Chưa có quality review trong tháng này'}
        </p>
      </CardWrapper>
    </section>
  );
}
