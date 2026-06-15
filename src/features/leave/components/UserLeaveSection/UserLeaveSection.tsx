import { Button, Modal, Spin } from 'antd';
import dayjs from 'dayjs';
import { CalendarOutlined } from '@ant-design/icons';
import { DATE_FORMAT } from '@/config/constants';
import { usePermission } from '@/shared/hooks/usePermission';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { StatusPill } from '@/shared/ui/StatusPill/StatusPill';
import { useActiveLeave, useCancelLeave, useReactivateUser, useUserLeaveHistory } from '../../hooks/useLeave';
import styles from './UserLeaveSection.module.scss';

interface UserLeaveSectionProps {
  userId: string;
  userStatus: string;
  onScheduleLeave: () => void;
}

export function UserLeaveSection({ userId, userStatus, onScheduleLeave }: UserLeaveSectionProps) {
  const { can } = usePermission();
  const canManageLeave = can('MANAGE_LEAVE');
  const canReactivate = can('REACTIVATE_USER');

  const { data: activeLeave, isLoading: activeLoading } = useActiveLeave(userId);
  const { data: history = [], isLoading: historyLoading } = useUserLeaveHistory(userId);
  const { mutate: reactivate, isPending: reactivating } = useReactivateUser();
  const { mutate: cancelLeave, isPending: cancelling } = useCancelLeave();

  const leaveEnded =
    activeLeave?.status === 'ended' ||
    (activeLeave && dayjs(activeLeave.endDate).isBefore(dayjs(), 'day'));

  const canCancelLeave = canManageLeave && activeLeave?.status === 'active' && !leaveEnded;

  const handleCancelLeave = () => {
    Modal.confirm({
      title: 'Cancel leave?',
      content:
        'The employee will return to Active status immediately. Task reassignments made during leave scheduling will not be automatically reversed.',
      okText: 'Cancel leave',
      okType: 'danger',
      cancelText: 'Keep leave',
      onOk: () => cancelLeave(userId),
    });
  };

  const pastHistory = history.filter((entry) => entry.id !== activeLeave?.id);

  if (!canManageLeave && !canReactivate && !activeLeave && history.length === 0) {
    return null;
  }

  return (
    <CardWrapper title="Leave" className={styles.section}>
      {activeLoading ? (
        <div className={styles.loading}>
          <Spin size="small" />
        </div>
      ) : activeLeave ? (
        <div className={styles.currentLeave}>
          <div className={styles.currentHeader}>
            <CalendarOutlined className={styles.calendarIcon} />
            <div>
              <div className={styles.currentTitle}>
                <StatusPill label="On leave" variant="on-leave" />
                <span>
                  {dayjs(activeLeave.startDate).format(DATE_FORMAT)} →{' '}
                  {dayjs(activeLeave.endDate).format(DATE_FORMAT)}
                </span>
              </div>
              {activeLeave.reason ? (
                <p className={styles.reason}>{activeLeave.reason}</p>
              ) : null}
              {leaveEnded ? (
                <p className={styles.pendingNote}>
                  Leave period has ended. Reactivate this employee to restore access.
                </p>
              ) : null}
            </div>
          </div>

          <div className={styles.actions}>
            {canCancelLeave ? (
              <Button danger loading={cancelling} onClick={handleCancelLeave}>
                Cancel leave
              </Button>
            ) : null}
            {canReactivate && userStatus === 'on_leave' && leaveEnded ? (
              <Button
                type="primary"
                loading={reactivating}
                onClick={() => reactivate(userId)}
              >
                Activate employee
              </Button>
            ) : null}
          </div>
        </div>
      ) : canManageLeave ? (
        <div className={styles.noLeave}>
          <p>No active leave scheduled.</p>
          <Button type="default" onClick={onScheduleLeave}>
            Schedule leave
          </Button>
        </div>
      ) : (
        <p className={styles.noLeaveText}>No active leave.</p>
      )}

      {historyLoading ? (
        <div className={styles.loading}>
          <Spin size="small" />
        </div>
      ) : pastHistory.length > 0 ? (
        <div className={styles.history}>
          <h4 className={styles.historyTitle}>History</h4>
          <ul className={styles.historyList}>
            {pastHistory.map((entry) => (
              <li key={entry.id} className={styles.historyItem}>
                <span>
                  {dayjs(entry.startDate).format(DATE_FORMAT)} → {dayjs(entry.endDate).format(DATE_FORMAT)}
                </span>
                <StatusPill
                  label={entry.status === 'ended' ? 'Ended' : entry.status}
                  variant={entry.status === 'cancelled' ? 'overdue' : 'completed'}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </CardWrapper>
  );
}
