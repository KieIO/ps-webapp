import { ExclamationCircleFilled, InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import {
  CREATIVE_DEADLINE_AFTER_PM_WARNING,
  CREATIVE_DEADLINE_FIELD_TOOLTIP,
} from '../../utils/taskDates';
import styles from './CreativeDeadlineFieldLabel.module.scss';

export function CreativeDeadlineFieldLabel({ children }: { children: string }) {
  return (
    <span className={styles.root}>
      {children}
      <Tooltip title={CREATIVE_DEADLINE_FIELD_TOOLTIP}>
        <InfoCircleOutlined className={styles.icon} aria-label={CREATIVE_DEADLINE_FIELD_TOOLTIP} />
      </Tooltip>
    </span>
  );
}

/** Form.Item `extra`: optional base hint + soft after-PM warning. */
export function CreativeDeadlineFieldExtra({
  afterPm,
  base,
}: {
  afterPm: boolean;
  base?: string | null;
}) {
  const hint = base?.trim();
  if (!hint && !afterPm) return null;

  return (
    <span className={styles.extra}>
      {hint ? <span className={styles.hint}>{hint}</span> : null}
      {afterPm ? (
        <span className={styles.warn} role="status">
          <ExclamationCircleFilled className={styles.warnIcon} aria-hidden />
          {CREATIVE_DEADLINE_AFTER_PM_WARNING}
        </span>
      ) : null}
    </span>
  );
}
