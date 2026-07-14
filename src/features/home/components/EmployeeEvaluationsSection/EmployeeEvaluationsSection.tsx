import { Empty } from 'antd';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { ROUTES, buildMyTaskDetailPath } from '@/config/constants';
import type { MyTask } from '@/features/tasks/schemas/task.schema';
import { formatTaskCodeShort } from '@/features/tasks/utils/taskDetail';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import homeStyles from '../../styles/homeSection.module.scss';
import styles from './EmployeeEvaluationsSection.module.scss';

interface EmployeeEvaluationsSectionProps {
  items: MyTask[];
  total: number;
}

export function EmployeeEvaluationsSection({ items, total }: EmployeeEvaluationsSectionProps) {
  return (
    <CardWrapper
      title="Đánh giá từ manager"
      subtitle={
        total > 0
          ? `${total} task đã có đánh giá / ghi chú`
          : 'Task đã được manager đánh giá hoặc để lại ghi chú'
      }
      actions={
        <Link to={ROUTES.PROJECT_TASKS} className={homeStyles.link}>
          Task list
        </Link>
      }
      className={styles.card}
    >
      {items.length === 0 ? (
        <Empty description="Chưa có đánh giá từ manager" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <ul className={classNames(homeStyles.stack, homeStyles.scrollBody)}>
          {items.map((task) => {
            const evaluation = task.pmEvaluation?.trim();
            const note = task.pmNote?.trim();
            const percent =
              task.completionPercent != null ? Math.round(task.completionPercent) : null;

            return (
              <li key={task.id} className={homeStyles.item}>
                <div className={styles.header}>
                  <div className={styles.titleBlock}>
                    <Link to={buildMyTaskDetailPath(task.id)} className={styles.code}>
                      {formatTaskCodeShort(task.taskCode)}
                    </Link>
                    <p className={styles.taskName}>{task.taskName}</p>
                    <p className={homeStyles.meta}>{task.projectName || '—'}</p>
                  </div>
                  {percent != null && <span className={styles.percent}>{percent}%</span>}
                </div>

                {evaluation ? (
                  <p className={styles.evaluation}>
                    <span className={styles.evalLabel}>Đánh giá</span>
                    {evaluation}
                  </p>
                ) : null}

                {note ? (
                  <p className={styles.note}>
                    <span className={styles.evalLabel}>Ghi chú</span>
                    {note}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </CardWrapper>
  );
}
