import { Avatar } from 'antd';
import { getInitials } from '@/shared/utils/person';
import { STAFF_AVAILABILITY_LABELS } from '../../utils/staffAvailability';
import type { StaffAvailability, TaskAssignee } from '../../schemas/task.schema';
import styles from './creativePipeline.module.scss';

const AVAILABILITY_DOT: Record<StaffAvailability, string> = {
  free: styles.dotFree,
  normal: styles.dotNormal,
  overloaded: styles.dotOverloaded,
  on_leave: styles.dotLeave,
};

interface AssigneeOptionLabelProps {
  staff: TaskAssignee;
  activeCount?: number;
  capacityPercent?: number;
  /** When set (from capacity API), overrides staff.availability for the badge. */
  availability?: StaffAvailability;
}

export function AssigneeOptionLabel({
  staff,
  activeCount,
  capacityPercent,
  availability: availabilityProp,
}: AssigneeOptionLabelProps) {
  const availability = availabilityProp ?? staff.availability;

  return (
    <span className={styles.staffOption}>
      <Avatar size={22}>{getInitials(staff.name)}</Avatar>
      <span>{staff.name}</span>
      <span className={styles.staffMeta}>
        {activeCount != null ? `${activeCount} tasks` : null}
        {capacityPercent != null ? ` | ${capacityPercent}%` : null}
        {availability ? (
          <>
            <span className={`${styles.dot} ${AVAILABILITY_DOT[availability]}`} />
            {STAFF_AVAILABILITY_LABELS[availability]}
          </>
        ) : null}
      </span>
    </span>
  );
}
