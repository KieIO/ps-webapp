import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { PROJECT_URGENCY_STYLES } from '@/features/projects/constants';
import helpStyles from '@/features/projects/components/ProjectUrgencyHelpTooltip/ProjectUrgencyHelpTooltip.module.scss';

function TaskUrgencyTooltipContent() {
  return (
    <div className={helpStyles.tooltipContent}>
      <p className={helpStyles.tooltipTitle}>Cách tính Urgency</p>
      <p>
        Urgency phản ánh mức độ gấp của task dựa trên trạng thái và số ngày còn lại đến deadline.
      </p>
      <ul className={helpStyles.tooltipList}>
        <li>
          Chọn <strong>Auto</strong> để hệ thống tự tính theo deadline; chọn màu để khóa thủ công.
        </li>
        <li>
          <strong>Deadline</strong> — Client Deadline → Internal Deadline → Task Date
        </li>
        <li>
          <strong>Số ngày còn lại</strong> = deadline − hôm nay
        </li>
      </ul>
      <ul className={helpStyles.statusList}>
        {(['gray', 'red', 'orange', 'green'] as const).map((key) => (
          <li key={key}>
            <span
              className={helpStyles.statusDot}
              style={{ backgroundColor: PROJECT_URGENCY_STYLES[key].dot }}
              aria-hidden
            />
            <strong>{PROJECT_URGENCY_STYLES[key].label}</strong>
            {key === 'gray' && ' — task đã Finished (hoặc chọn thủ công)'}
            {key === 'red' && ' — quá hạn, hoặc còn ≤ 3 ngày'}
            {key === 'orange' && ' — còn 4–7 ngày'}
            {key === 'green' && ' — còn > 7 ngày, hoặc chưa có deadline'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TaskUrgencyColumnTitle() {
  return (
    <span className={helpStyles.columnHeader}>
      Urgency
      <Tooltip
        title={<TaskUrgencyTooltipContent />}
        placement="topLeft"
        overlayClassName={helpStyles.tooltipOverlay}
      >
        <InfoCircleOutlined className={helpStyles.infoIcon} aria-label="Cách tính Urgency" />
      </Tooltip>
    </span>
  );
}
