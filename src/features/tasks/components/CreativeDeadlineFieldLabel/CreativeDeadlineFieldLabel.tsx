import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { CREATIVE_DEADLINE_WITHIN_PM_TOOLTIP } from '../../utils/taskDates';
import styles from './CreativeDeadlineFieldLabel.module.scss';

export function CreativeDeadlineFieldLabel({ children }: { children: string }) {
  return (
    <span className={styles.root}>
      {children}
      <Tooltip title={CREATIVE_DEADLINE_WITHIN_PM_TOOLTIP}>
        <InfoCircleOutlined
          className={styles.icon}
          aria-label={CREATIVE_DEADLINE_WITHIN_PM_TOOLTIP}
        />
      </Tooltip>
    </span>
  );
}
