import dayjs from 'dayjs';
import { Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MessageSquareText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildMyTaskDetailPath } from '@/config/constants';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import type {
  EmployeePerformanceComment,
  EmployeeRecentTask,
} from '../../schemas/employeePerformance.schema';
import styles from './EmployeeDetailsSection.module.scss';

interface EmployeeDetailsSectionProps {
  tasks: EmployeeRecentTask[];
  comments: EmployeePerformanceComment[];
}

const numberFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });
const roleLabel: Record<string, string> = {
  head: 'Department Head',
  creative_head: 'Creative Head',
  admin: 'Admin',
  pm: 'Project Manager',
  creative_manager: 'Creative Manager',
};

// Static column defs — hoist so Ant Table keeps a stable columns reference.
const taskColumns: ColumnsType<EmployeeRecentTask> = [
  {
    title: 'Task code',
    dataIndex: 'taskCode',
    key: 'taskCode',
    width: 170,
    render: (code: string, task) => (
      <Link className={styles.taskCode} to={buildMyTaskDetailPath(task.taskId)}>
        {code}
      </Link>
    ),
  },
  {
    title: 'Tên task',
    dataIndex: 'taskName',
    key: 'taskName',
    ellipsis: true,
    width: 150,
  },
  {
    title: 'Level',
    dataIndex: 'level',
    key: 'level',
    width: 72,
    render: (value: number) => `L${numberFormat.format(value)}`,
  },
  {
    title: 'Output',
    dataIndex: 'quantity',
    key: 'quantity',
    width: 76,
    render: (value: number) => numberFormat.format(value),
  },
  {
    title: 'Revision',
    dataIndex: 'revisionCount',
    key: 'revisionCount',
    width: 82,
    render: (value: number | null) =>
      value == null ? (
        <span className={styles.muted}>—</span>
      ) : (
        <span className={value > 1 ? styles.warning : undefined}>{value}</span>
      ),
  },
  {
    title: 'Quality',
    dataIndex: 'qualityScore',
    key: 'qualityScore',
    width: 80,
    render: (value: number | null) =>
      value == null ? (
        <span className={styles.muted}>—</span>
      ) : (
        <span className={value >= 80 ? styles.good : styles.warning}>
          {numberFormat.format(value)}
        </span>
      ),
  },
  {
    title: 'Hoàn thành',
    dataIndex: 'completedAt',
    key: 'completedAt',
    width: 105,
    render: (value: string | null) =>
      value ? dayjs(value).format('DD/MM/YYYY') : <span className={styles.muted}>—</span>,
  },
  {
    title: 'Đúng hạn',
    dataIndex: 'onTime',
    key: 'onTime',
    width: 86,
    render: (value: boolean | null) =>
      value == null ? (
        <span className={styles.muted}>—</span>
      ) : value ? (
        <Tag color="success">Đúng hạn</Tag>
      ) : (
        <Tag color="error">Trễ hạn</Tag>
      ),
  },
];

export function EmployeeDetailsSection({ tasks, comments }: EmployeeDetailsSectionProps) {
  return (
    <section className={styles.grid}>
      <CardWrapper
        title="Chi tiết task gần đây"
        subtitle="Tối đa 10 project task trong kỳ được chọn"
      >
        <Table
          className={styles.table}
          rowKey="taskId"
          columns={taskColumns}
          dataSource={tasks}
          pagination={false}
          size="small"
          scroll={{ x: 850 }}
          locale={{ emptyText: 'Chưa có task trong kỳ này' }}
        />
      </CardWrapper>

      <CardWrapper title="Nhận xét từ Head/PM" subtitle="Nhận xét quality review mới nhất trong kỳ">
        {comments.length === 0 ? (
          <div className={styles.emptyComments}>
            <MessageSquareText size={20} aria-hidden />
            <span>Chưa có nhận xét trong kỳ này</span>
          </div>
        ) : (
          <ul className={styles.comments}>
            {comments.map((comment) => (
              <li key={comment.id} className={styles.comment}>
                <div className={styles.commentHeader}>
                  <div>
                    <strong>{comment.reviewerName}</strong>
                    <span>{roleLabel[comment.reviewerRole] ?? comment.reviewerRole}</span>
                  </div>
                  <Tooltip title={dayjs(comment.createdAt).format('DD/MM/YYYY HH:mm')}>
                    <time>{dayjs(comment.createdAt).format('DD/MM')}</time>
                  </Tooltip>
                </div>
                <p>{comment.comment}</p>
                <span className={styles.commentTask}>{comment.taskCode}</span>
              </li>
            ))}
          </ul>
        )}
      </CardWrapper>
    </section>
  );
}
