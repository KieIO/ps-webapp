import { Button, Modal, Spin } from 'antd';
import dayjs from 'dayjs';
import { CalendarOutlined } from '@ant-design/icons';
import { DATE_FORMAT } from '@/config/constants';
import { usePermission } from '@/shared/hooks/usePermission';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { StatusPill } from '@/shared/ui/StatusPill/StatusPill';
import {
  useActiveLeave,
  useCancelLeave,
  useOpenLeaves,
  useReactivateUser,
  useUserLeaveHistory,
} from '../../hooks/useLeave';
import { isOpenLeave, leaveStatusLabel } from '../../utils/leaveStatus';
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
  const { data: openLeaves = [], isLoading: openLoading } = useOpenLeaves(userId);
  const { data: history = [], isLoading: historyLoading } = useUserLeaveHistory(userId);
  const { mutate: reactivate, isPending: reactivating } = useReactivateUser();
  const { mutate: cancelLeave, isPending: cancelling } = useCancelLeave();

  const leaveEnded =
    activeLeave?.status === 'ended' ||
    (activeLeave != null && dayjs(activeLeave.endDate).isBefore(dayjs(), 'day'));

  // Leave row may already be marked ended (no covering active leave) while user.status is still on_leave.
  const needsReactivation = userStatus === 'on_leave' && (!activeLeave || leaveEnded);
  const latestEndedLeave = history.find((entry) => entry.status === 'ended');
  const pendingLeaveDates = activeLeave ?? latestEndedLeave;
  const hasUpcomingScheduled = openLeaves.some((leave) => leave.status === 'scheduled');
  const canSchedule = canManageLeave && userStatus !== 'inactive' && userStatus !== 'invited';

  const pastHistory = history.filter((entry) => {
    if (isOpenLeave(entry)) return false;
    if (needsReactivation && !activeLeave && latestEndedLeave && entry.id === latestEndedLeave.id) {
      return false;
    }
    return true;
  });

  const handleCancelLeave = (leaveId: string, label: string) => {
    Modal.confirm({
      title: 'Cancel leave?',
      content: `Cancel ${label}? Task reassignments made for this period will not be automatically reversed.`,
      okText: 'Cancel leave',
      okType: 'danger',
      cancelText: 'Keep leave',
      onOk: () => cancelLeave({ userId, leaveId }),
    });
  };

  if (
    !canManageLeave &&
    !canReactivate &&
    openLeaves.length === 0 &&
    !activeLeave &&
    history.length === 0
  ) {
    return null;
  }

  const loading = activeLoading || openLoading;

  return (
    <CardWrapper title="Leave" className={styles.section}>
      {loading ? (
        <div className={styles.loading}>
          <Spin size="small" />
        </div>
      ) : (
        <>
          {needsReactivation ? (
            <div className={styles.currentLeave}>
              <div className={styles.currentHeader}>
                <CalendarOutlined className={styles.calendarIcon} />
                <div>
                  <div className={styles.currentTitle}>
                    <StatusPill label="Needs Activate" variant="on-leave" />
                    {pendingLeaveDates ? (
                      <span>
                        {dayjs(pendingLeaveDates.startDate).format(DATE_FORMAT)} →{' '}
                        {dayjs(pendingLeaveDates.endDate).format(DATE_FORMAT)}
                      </span>
                    ) : null}
                  </div>
                  <p className={styles.pendingNote}>
                    Leave has ended. Activate to restore access
                    {hasUpcomingScheduled ? '. Upcoming scheduled leave stays booked.' : '.'}
                  </p>
                </div>
              </div>
              {canReactivate ? (
                <div className={styles.actions}>
                  <Button type="primary" loading={reactivating} onClick={() => reactivate(userId)}>
                    Activate employee
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {openLeaves.length > 0 ? (
            <div className={styles.openList}>
              <h4 className={styles.historyTitle}>Scheduled & current</h4>
              <ul className={styles.historyList}>
                {openLeaves.map((leave) => {
                  const rangeLabel = `${dayjs(leave.startDate).format(DATE_FORMAT)} → ${dayjs(leave.endDate).format(DATE_FORMAT)}`;
                  return (
                    <li key={leave.id} className={styles.openItem}>
                      <div className={styles.openMeta}>
                        <StatusPill
                          label={leaveStatusLabel(leave.status)}
                          variant={leave.status === 'active' ? 'on-leave' : 'pending'}
                        />
                        <span>{rangeLabel}</span>
                        {leave.reason ? (
                          <span className={styles.reasonInline}>{leave.reason}</span>
                        ) : null}
                      </div>
                      {canManageLeave ? (
                        <Button
                          danger
                          size="small"
                          loading={cancelling}
                          onClick={() => handleCancelLeave(leave.id, rangeLabel)}
                        >
                          Cancel
                        </Button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : !needsReactivation ? (
            <div className={styles.noLeave}>
              <p className={styles.noLeaveText}>No scheduled or active leave.</p>
            </div>
          ) : null}

          {canSchedule ? (
            <div className={styles.scheduleRow}>
              <Button type="default" onClick={onScheduleLeave}>
                Schedule leave
              </Button>
              {openLeaves.length > 0 ? (
                <span className={styles.scheduleHint}>Add another non-overlapping period</span>
              ) : null}
            </div>
          ) : null}
        </>
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
                  {dayjs(entry.startDate).format(DATE_FORMAT)} →{' '}
                  {dayjs(entry.endDate).format(DATE_FORMAT)}
                </span>
                <StatusPill
                  label={leaveStatusLabel(entry.status)}
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
