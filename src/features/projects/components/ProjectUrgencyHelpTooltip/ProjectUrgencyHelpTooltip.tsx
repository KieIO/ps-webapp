import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { PROJECT_URGENCY_STYLES } from '../../constants';
import styles from './ProjectUrgencyHelpTooltip.module.scss';

const URGENCY_HELP_ITEMS = [
  {
    key: 'green' as const,
    note: ' — Low priority (Auto: còn > 7 ngày, hoặc chưa có deadline)',
  },
  {
    key: 'orange' as const,
    note: ' — Medium priority (Auto: còn 4–7 ngày)',
  },
  {
    key: 'red' as const,
    note: ' — High priority (Auto: quá hạn, hoặc còn ≤ 3 ngày)',
  },
  { key: 'purple' as const, note: ' — Freelancer (chọn thủ công)' },
  { key: 'yellow' as const, note: ' — Pending Feedback (chọn thủ công)' },
  { key: 'cyan' as const, note: ' — Pending brief (chọn thủ công)' },
  { key: 'gray' as const, note: ' — Finished (dự án Finish hoặc Cancel)' },
] as const;

function ProjectUrgencyTooltipContent() {
  return (
    <div className={styles.tooltipContent}>
      <p className={styles.tooltipTitle}>Cách tính Urgency</p>
      <p>
        Urgency phản ánh mức độ ưu tiên của dự án. Chọn <strong>Auto</strong> để tính theo deadline
        (Low / Medium / High), hoặc khóa một mức thủ công.
      </p>
      <ul className={styles.tooltipList}>
        <li>
          <strong>Deadline</strong> — lấy theo field <strong>End date</strong> /{' '}
          <strong>Ngày kết thúc</strong> của dự án
        </li>
        <li>
          <strong>Số ngày còn lại</strong> = deadline − hôm nay
        </li>
      </ul>
      <ul className={styles.statusList}>
        {URGENCY_HELP_ITEMS.map(({ key, note }) => (
          <li key={key}>
            <span
              className={styles.statusDot}
              style={{
                backgroundColor: PROJECT_URGENCY_STYLES[key].dot,
                boxShadow: key === 'gray' ? 'inset 0 0 0 1px #D1D5DB' : undefined,
              }}
              aria-hidden
            />
            <strong>{PROJECT_URGENCY_STYLES[key].label}</strong>
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProjectUrgencyColumnTitle() {
  return (
    <span className={styles.columnHeader}>
      Urgency
      <Tooltip
        title={<ProjectUrgencyTooltipContent />}
        placement="topLeft"
        overlayClassName={styles.tooltipOverlay}
      >
        <InfoCircleOutlined className={styles.infoIcon} aria-label="Cách tính Urgency" />
      </Tooltip>
    </span>
  );
}
