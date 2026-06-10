import { buildTaskHistoryEvents } from '../../utils/taskDetail';
import type { MyTask } from '../../schemas/task.schema';
import styles from './TaskDetailHistoryPanel.module.scss';

interface TaskDetailHistoryPanelProps {
  task: MyTask;
}

export function TaskDetailHistoryPanel({ task }: TaskDetailHistoryPanelProps) {
  const events = buildTaskHistoryEvents(task);

  return (
    <aside className={styles.panel}>
      <h3 className={styles.title}>History</h3>
      <div className={styles.timeline}>
        {events.map((event) => (
          <div key={event.key} className={styles.event}>
            <span
              className={`${styles.dot} ${event.completed ? styles.dotCompleted : styles.dotPending}`}
              aria-hidden
            />
            <div>
              <p className={styles.dateLabel}>{event.dateLabel}</p>
              <p className={styles.description}>{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
