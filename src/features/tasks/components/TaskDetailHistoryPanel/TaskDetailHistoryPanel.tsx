import { Spin } from 'antd';
import { formatTaskHistoryDateLabel } from '../../utils/taskDetail';
import { useMyTaskHistory } from '../../hooks/useMyTaskHistory';
import type { MyTask } from '../../schemas/task.schema';
import styles from './TaskDetailHistoryPanel.module.scss';

interface TaskDetailHistoryPanelProps {
  task: MyTask;
}

export function TaskDetailHistoryPanel({ task }: TaskDetailHistoryPanelProps) {
  const { data, isLoading, isError } = useMyTaskHistory(task.id);
  const events = data?.items ?? [];

  return (
    <aside className={styles.panel}>
      <h3 className={styles.title}>History</h3>
      {isLoading ? (
        <div className={styles.loading}>
          <Spin size="small" />
        </div>
      ) : isError ? (
        <p className={styles.empty}>Unable to load history.</p>
      ) : events.length === 0 ? (
        <p className={styles.empty}>No history yet.</p>
      ) : (
        <div className={styles.timeline}>
          {events.map((event) => (
            <div key={event.id} className={styles.event}>
              <span
                className={`${styles.dot} ${event.completed ? styles.dotCompleted : styles.dotPending}`}
                aria-hidden
              />
              <div>
                <p className={styles.dateLabel}>
                  {formatTaskHistoryDateLabel(event.occurredAt, event.kind)}
                </p>
                <p className={styles.description}>{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
