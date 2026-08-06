import { Tooltip } from 'antd';
import { AlertTriangle, CheckCircle2, CircleHelp, Clock3, RotateCcw } from 'lucide-react';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import type { TeamAlert } from '../../schemas/teamProductivity.schema';
import styles from './TeamAlertsSection.module.scss';

interface TeamAlertsSectionProps {
  alerts: TeamAlert[];
}

const iconForType = (type: string) => {
  if (type === 'overload') return <AlertTriangle size={16} aria-hidden />;
  if (type === 'deadline_warning') return <Clock3 size={16} aria-hidden />;
  return <RotateCcw size={16} aria-hidden />;
};

const alertsHelp = (
  <div className={styles.tooltipContent}>
    <p className={styles.tooltipLead}>Cảnh báo khi:</p>
    <ul className={styles.tooltipList}>
      <li>
        <strong>Overload</strong> — capacity trên 90%
      </li>
      <li>
        <strong>Trễ hạn</strong> — đúng hạn dưới 80%
      </li>
      <li>
        <strong>Revision cao</strong> — từ 40% trở lên (tối thiểu 2 task đã review)
      </li>
    </ul>
  </div>
);

export function TeamAlertsSection({ alerts }: TeamAlertsSectionProps) {
  if (alerts.length === 0) {
    return (
      <div className={styles.emptyBanner} role="status">
        <CheckCircle2 size={16} aria-hidden className={styles.emptyIcon} />
        <p className={styles.emptyText}>Không có cảnh báo trong tháng này</p>
        <Tooltip title={alertsHelp} placement="topLeft" mouseEnterDelay={0.15}>
          <button
            type="button"
            className={styles.helpButton}
            aria-label="Giải thích các loại cảnh báo nhóm"
          >
            <CircleHelp size={16} aria-hidden />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <CardWrapper
      title="Cảnh báo nhóm"
      subtitle="Overload, trễ hạn, revision cao"
      className={styles.card}
      actions={
        <Tooltip title={alertsHelp} placement="topLeft" mouseEnterDelay={0.15}>
          <button
            type="button"
            className={styles.helpButton}
            aria-label="Giải thích các loại cảnh báo nhóm"
          >
            <CircleHelp size={16} aria-hidden />
          </button>
        </Tooltip>
      }
    >
      <ul className={styles.list}>
        {alerts.map((alert, index) => (
          <li
            key={`${alert.type}-${alert.userId ?? 'na'}-${index}`}
            className={`${styles.item} ${styles[alert.severity] ?? ''}`}
          >
            <span className={styles.icon}>{iconForType(alert.type)}</span>
            <div>
              <p className={styles.title}>{alert.title}</p>
              <p className={styles.body}>{alert.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </CardWrapper>
  );
}
