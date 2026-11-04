import { Avatar } from 'antd';
import classNames from 'classnames';
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
  /** Soft hint when leave overlaps today→deadline but staff stays selectable (e.g. "Nghỉ 06/11"). */
  leaveHint?: string | null;
}

export function AssigneeOptionLabel({
  staff,
  activeCount,
  capacityPercent,
  availability: availabilityProp,
  leaveHint,
}: AssigneeOptionLabelProps) {
  const availability = availabilityProp ?? staff.availability;
  const onLeave = availability === 'on_leave';
  const softLeaveHint = leaveHint?.trim() || null;

  return (
    <span
      className={classNames(
        styles.staffOption,
        onLeave && styles.staffOptionLeave,
        softLeaveHint && !onLeave && styles.staffOptionHasLeaveHint,
      )}
    >
      <Avatar size={22}>{getInitials(staff.name)}</Avatar>
      <span className={styles.staffName}>{staff.name}</span>
      <span className={styles.staffMeta}>
        {!onLeave && activeCount != null ? `${activeCount} tasks` : null}
        {!onLeave && capacityPercent != null ? ` | ${capacityPercent}%` : null}
        {availability ? (
          <>
            <span className={`${styles.dot} ${AVAILABILITY_DOT[availability]}`} />
            {onLeave && softLeaveHint ? softLeaveHint : STAFF_AVAILABILITY_LABELS[availability]}
          </>
        ) : null}
        {!onLeave && softLeaveHint ? (
          <span className={styles.leaveChip}>{softLeaveHint}</span>
        ) : null}
      </span>
    </span>
  );
}
