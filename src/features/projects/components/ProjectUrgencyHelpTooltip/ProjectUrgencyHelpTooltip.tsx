import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { PROJECT_URGENCY_STYLES } from '../../constants';
import styles from './ProjectUrgencyHelpTooltip.module.scss';

function ProjectUrgencyTooltipContent() {
  return (
    <div className={styles.tooltipContent}>
      <p className={styles.tooltipTitle}>Cách tính Urgency</p>
      <p>
        Urgency phản ánh mức độ gấp của dự án. Chọn <strong>Auto</strong> để tính theo deadline,
        hoặc khóa một mức thủ công.
      </p>
      <ul className={styles.tooltipList}>
        <li>
          <strong>Deadline</strong> — lấy theo thứ tự ưu tiên: End Date → Client Deadline → Internal
          Deadline
        </li>
        <li>
          <strong>Số ngày còn lại</strong> = deadline − hôm nay
        </li>
      </ul>
      <ul className={styles.statusList}>
        {(['gray', 'red', 'orange', 'green'] as const).map((key) => (
          <li key={key}>
            <span
              className={styles.statusDot}
              style={{ backgroundColor: PROJECT_URGENCY_STYLES[key].dot }}
              aria-hidden
            />
            <strong>{PROJECT_URGENCY_STYLES[key].label}</strong>
            {key === 'gray' && ' — dự án Finish hoặc Cancel'}
            {key === 'red' && ' — quá hạn, hoặc còn ≤ 3 ngày'}
            {key === 'orange' && ' — còn 4–7 ngày'}
            {key === 'green' && ' — còn > 7 ngày, hoặc chưa có deadline'}
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
