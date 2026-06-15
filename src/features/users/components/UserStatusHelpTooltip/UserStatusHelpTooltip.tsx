import { CapacityHelpTooltip } from '@/features/capacity/components/CapacityHelpTooltip/CapacityHelpTooltip';
import { STATUS_DESCRIPTIONS, STATUS_LABELS } from '../../constants';
import { USER_STATUSES } from '../../schemas/user.schema';
import styles from './UserStatusHelpTooltip.module.scss';

function UserStatusTooltipContent() {
  return (
    <div className={styles.content}>
      <p className={styles.title}>Ý nghĩa trạng thái</p>
      <ul className={styles.list}>
        {USER_STATUSES.map((status) => (
          <li key={status}>
            <strong>{STATUS_LABELS[status]}</strong> — {STATUS_DESCRIPTIONS[status]}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function UserStatusColumnTitle() {
  return (
    <span className={styles.columnHeader}>
      Status
      <CapacityHelpTooltip
        title={<UserStatusTooltipContent />}
        ariaLabel="Giải thích trạng thái user"
        placement="top"
      />
    </span>
  );
}
