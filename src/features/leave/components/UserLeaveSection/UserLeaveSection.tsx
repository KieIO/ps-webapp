import { Button, Modal, Spin } from 'antd';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { usePermission } from '@/shared/hooks/usePermission';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { StatusPill } from '@/shared/ui/StatusPill/StatusPill';
import { useCancelLeave, useOpenLeaves, useUserLeaveHistory } from '../../hooks/useLeave';
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

  const { data: openLeaves = [], isLoading: openLoading } = useOpenLeaves(userId);
  const { data: history = [], isLoading: historyLoading } = useUserLeaveHistory(userId);
  const { mutate: cancelLeave, isPending: cancelling } = useCancelLeave();

  const canSchedule = canManageLeave && userStatus !== 'inactive' && userStatus !== 'invited';

  const pastHistory = history.filter((entry) => !isOpenLeave(entry));

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

  if (!canManageLeave && openLeaves.length === 0 && history.length === 0) {
    return null;
  }

  return (
    <CardWrapper title="Leave" className={styles.section}>
      {openLoading ? (
        <div className={styles.loading}>
          <Spin size="small" />
        </div>
      ) : (
        <>
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
          ) : (
            <div className={styles.noLeave}>
              <p className={styles.noLeaveText}>No scheduled or active leave.</p>
            </div>
          )}

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
                <div className={styles.historyMeta}>
                  <span>
                    {dayjs(entry.startDate).format(DATE_FORMAT)} →{' '}
                    {dayjs(entry.endDate).format(DATE_FORMAT)}
                  </span>
                  {entry.reason ? (
                    <span className={styles.reasonInline}>{entry.reason}</span>
                  ) : null}
                </div>
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
