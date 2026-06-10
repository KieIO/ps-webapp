import { Alert, Button, Tabs } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GlobalLoadingSpinner } from '@/shared/ui/GlobalLoadingSpinner/GlobalLoadingSpinner';
import { TaskDetailHistoryPanel } from '../TaskDetailHistoryPanel/TaskDetailHistoryPanel';
import { TaskDetailStatusPanel } from '../TaskDetailStatusPanel/TaskDetailStatusPanel';
import { TaskDetailSummaryCard } from '../TaskDetailSummaryCard/TaskDetailSummaryCard';
import { useMyTask } from '../../hooks/useMyTask';
import {
  formatTaskDisplayId,
  getTaskListLabel,
  getTaskListPath,
} from '../../utils/taskDetail';
import type { TaskCategory } from '../../schemas/task.schema';
import styles from './TaskDetailView.module.scss';

interface TaskDetailLocationState {
  from?: TaskCategory;
}

interface TaskDetailViewProps {
  taskId: string;
}

export function TaskDetailView({ taskId }: TaskDetailViewProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as TaskDetailLocationState | null;
  const { data: task, isLoading, isError } = useMyTask(taskId);

  if (isLoading) {
    return <GlobalLoadingSpinner />;
  }

  if (isError || !task) {
    return (
      <Alert
        type="error"
        showIcon
        message="Unable to load task"
        description="The task may have been removed or you may not have access."
        action={
          <Button size="small" onClick={() => navigate(-1)}>
            Go back
          </Button>
        }
      />
    );
  }

  const listCategory = locationState?.from ?? task.taskCategory;
  const listPath = getTaskListPath(listCategory);
  const listLabel = getTaskListLabel(listCategory);
  const displayId = formatTaskDisplayId(task);

  return (
    <>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to={listPath} className={styles.breadcrumbLink}>
          {listLabel}
        </Link>
        <span className={styles.breadcrumbSep} aria-hidden>
          /
        </span>
        <span className={styles.breadcrumbCurrent}>{displayId}</span>
      </nav>

      <h1 className={styles.title}>Task detail — {displayId}</h1>

      <div className={styles.summary}>
        <TaskDetailSummaryCard task={task} />
      </div>

      <div className={styles.body}>
        <div className={styles.main}>
          <Tabs
            defaultActiveKey="details"
            items={[
              {
                key: 'details',
                label: 'Details & description',
                children: (
                  <>
                    <p className={styles.sectionTitle}>Task description</p>
                    <p className={styles.description}>{task.description}</p>

                    {task.pmNote ? (
                      <Alert
                        className={styles.noteAlert}
                        type="warning"
                        showIcon
                        message="Note from PM"
                        description={task.pmNote}
                      />
                    ) : null}

                    {task.additionalFactors ? (
                      <>
                        <p className={styles.sectionTitle}>Additional factors</p>
                        <p className={styles.description}>{task.additionalFactors}</p>
                      </>
                    ) : null}

                    <p className={styles.sectionTitle}>Attachments</p>
                    <div className={styles.emptyBlock}>No attachments for this task.</div>
                  </>
                ),
              },
              {
                key: 'revision',
                label: 'Revision history',
                children: (
                  <div className={styles.emptyBlock}>No revision history for this task yet.</div>
                ),
              },
              {
                key: 'evaluation',
                label: 'Evaluation',
                children:
                  task.pmEvaluation || task.completionPercent != null ? (
                    <div className={styles.evalGrid}>
                      <div className={styles.evalItem}>
                        <span className={styles.evalLabel}>Completion</span>
                        <span className={styles.evalValue}>
                          {task.completionPercent != null ? `${task.completionPercent}%` : '—'}
                        </span>
                      </div>
                      <div className={styles.evalItem}>
                        <span className={styles.evalLabel}>Evaluation</span>
                        <span className={styles.evalValue}>{task.pmEvaluation || '—'}</span>
                      </div>
                      <div className={styles.evalItem}>
                        <span className={styles.evalLabel}>PM note</span>
                        <span className={styles.evalValue}>{task.pmNote || '—'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.emptyBlock}>No evaluation recorded yet.</div>
                  ),
              },
            ]}
          />
        </div>

        <div className={styles.side}>
          <TaskDetailHistoryPanel task={task} />
        </div>
      </div>

      <footer className={styles.footer}>
        <TaskDetailStatusPanel task={task} />
      </footer>
    </>
  );
}
