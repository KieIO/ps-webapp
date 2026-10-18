import { Alert, Spin, Table, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { buildMyTaskDetailPath } from '@/config/constants';
import { useCreativeSplitChildren } from '../../hooks/useCreativeSplitChildren';
import type { MyTask } from '../../schemas/task.schema';
import { isSplitParentTask, SPLIT_CHILD_BADGE_LABEL } from '../../utils/creativePipeline';
import { formatTaskQuantity } from '../../utils/taskDetail';
import { TaskConfirmationBadge } from '../TaskConfirmationBadge/TaskConfirmationBadge';
import { TaskStaffNameCell } from '../TaskStaffNameCell/TaskStaffNameCell';
import styles from './TaskDetailSplitChildren.module.scss';

interface TaskDetailSplitChildrenProps {
  task: MyTask;
}

export function TaskDetailSplitChildren({ task }: TaskDetailSplitChildrenProps) {
  const isSplitParent = isSplitParentTask(task);
  const {
    data: children = [],
    isLoading,
    isError,
  } = useCreativeSplitChildren(task.id, {
    enabled: isSplitParent,
  });

  if (!isSplitParent) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <p className={styles.title}>Task nhỏ</p>
        <Tag color="blue">{SPLIT_CHILD_BADGE_LABEL}</Tag>
        <span className={styles.count}>{children.length} phần</span>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <Spin size="small" /> Đang tải task nhỏ…
        </div>
      ) : null}

      {isError ? (
        <Alert type="warning" showIcon message="Không tải được danh sách task nhỏ." />
      ) : null}

      {!isLoading && !isError && children.length === 0 ? (
        <div className={styles.empty}>Chưa có task nhỏ.</div>
      ) : null}

      {!isLoading && !isError && children.length > 0 ? (
        <Table
          size="small"
          pagination={false}
          rowKey="id"
          dataSource={children}
          className={styles.table}
          columns={[
            {
              title: 'Mã',
              dataIndex: 'taskCode',
              key: 'taskCode',
              render: (code: string, row: MyTask) => (
                <Link to={buildMyTaskDetailPath(row.id)} className={styles.codeLink}>
                  {code}
                </Link>
              ),
            },
            {
              title: 'Tên',
              dataIndex: 'taskName',
              key: 'taskName',
              ellipsis: true,
            },
            {
              title: 'SL',
              key: 'quantity',
              width: 72,
              align: 'right',
              render: (_: unknown, row: MyTask) => formatTaskQuantity(row),
            },
            {
              title: 'Staff',
              key: 'staff',
              ellipsis: true,
              render: (_: unknown, row: MyTask) => <TaskStaffNameCell staff={row.staff} />,
            },
            {
              title: 'Status',
              key: 'status',
              width: 130,
              render: (_: unknown, row: MyTask) => (
                <TaskConfirmationBadge status={row.staffConfirmation} />
              ),
            },
          ]}
        />
      ) : null}
    </section>
  );
}
