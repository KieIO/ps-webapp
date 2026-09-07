import { Alert, Spin, Tag } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Link } from 'react-router-dom';
import { buildMyTaskDetailPath, DATE_FORMAT } from '@/config/constants';
import { TaskConfirmationBadge } from '../TaskConfirmationBadge/TaskConfirmationBadge';
import { useTaskRevisions } from '../../hooks/useTaskRevisions';
import type { MyTask } from '../../schemas/task.schema';
import { formatTaskDateTime } from '../../utils/taskDates';
import { formatTaskStaffNames } from '../../utils/staff';
import {
  ACTIVE_REVISION_CONFIRMATIONS,
  formatRevisionLabel,
  inferParentTaskCodeFromRevision,
  isRevisionTask,
} from '../../utils/taskRevision';
import styles from './TaskRevisionHistoryTab.module.scss';

dayjs.extend(utc);

interface TaskRevisionHistoryTabProps {
  task: MyTask;
}

export function TaskRevisionHistoryTab({ task }: TaskRevisionHistoryTabProps) {
  const isRevision = isRevisionTask(task);
  const revisionsQuery = useTaskRevisions(task.id, { enabled: !isRevision });
  const revisionItems = revisionsQuery.data?.items ?? [];

  if (isRevision) {
    const parentCode = inferParentTaskCodeFromRevision(task.taskCode);
    return (
      <div className={styles.root}>
        <Alert
          type="info"
          showIcon
          message={`${formatRevisionLabel(task)} · ${task.taskCode}`}
          description={
            task.parentTaskId ? (
              <span>
                Đây là revision của{' '}
                <Link to={buildMyTaskDetailPath(task.parentTaskId)}>
                  {parentCode ?? 'task gốc'}
                </Link>
                . Lịch sử đầy đủ nằm trên task gốc.
              </span>
            ) : (
              'Đây là revision subtask. Lịch sử đầy đủ nằm trên task gốc.'
            )
          }
        />
        {task.revisionReason ? (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Lý do revision</h3>
            <p className={styles.reason}>{task.revisionReason}</p>
          </section>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h3 className={styles.sectionTitle}>Danh sách revision</h3>
        <p className={styles.hint}>
          Mỗi lần yêu cầu tạo một task làm lại riêng: người nhận giữ nguyên, có deadline và workload
          riêng. Cập nhật trạng thái / số lượng / đánh giá trên revision con.
        </p>
      </header>

      {revisionsQuery.isLoading ? (
        <div className={styles.loading}>
          <Spin size="small" />
        </div>
      ) : revisionsQuery.isError ? (
        <Alert type="error" showIcon message="Không tải được danh sách revision." />
      ) : revisionItems.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Chưa có revision</p>
          <p className={styles.emptyBody}>
            Dùng nút <strong>Yêu cầu revision</strong> để tạo lần làm lại đầu tiên.
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {revisionItems.map((item, index) => {
            const isActive = ACTIVE_REVISION_CONFIRMATIONS.has(item.staffConfirmation);
            const detailPath = buildMyTaskDetailPath(item.id);
            return (
              <li key={item.id} className={styles.item}>
                <div className={styles.itemHeader}>
                  <div className={styles.itemHeading}>
                    <Link to={detailPath} className={styles.itemTitle}>
                      {formatRevisionLabel(item)}
                      <span className={styles.itemCode}>{item.taskCode}</span>
                    </Link>
                    <div className={styles.itemTags}>
                      {index === 0 ? (
                        <Tag className={styles.latestTag} color="blue">
                          Mới nhất
                        </Tag>
                      ) : null}
                      <TaskConfirmationBadge status={item.staffConfirmation} />
                    </div>
                  </div>
                  <Link to={detailPath} className={styles.openLink}>
                    {isActive ? 'Cập nhật' : 'Xem'}
                    <ArrowRightOutlined className={styles.openLinkIcon} />
                  </Link>
                </div>

                <dl className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <dt>Người nhận</dt>
                    <dd>{formatTaskStaffNames(item.staff, '—')}</dd>
                  </div>
                  <div className={styles.metaItem}>
                    <dt>Số lượng</dt>
                    <dd>{item.quantity}</dd>
                  </div>
                  <div className={styles.metaItem}>
                    <dt>Deadline</dt>
                    <dd>{formatTaskDateTime(item.deadline ?? item.date)}</dd>
                  </div>
                  <div className={styles.metaItem}>
                    <dt>Ngày capacity</dt>
                    <dd>{dayjs.utc(item.date).format(DATE_FORMAT)}</dd>
                  </div>
                </dl>

                {item.revisionReason ? (
                  <p className={styles.reason}>
                    <span className={styles.reasonLabel}>Lý do</span>
                    {item.revisionReason}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
