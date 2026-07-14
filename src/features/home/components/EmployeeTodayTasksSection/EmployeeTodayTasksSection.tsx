import dayjs from 'dayjs';
import { Button, Empty, Modal, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { DATE_FORMAT, ROUTES, buildMyTaskDetailPath } from '@/config/constants';
import { ProjectUrgencyBadge } from '@/features/projects/components/ProjectUrgencyBadge/ProjectUrgencyBadge';
import { TaskConfirmationBadge } from '@/features/tasks/components/TaskConfirmationBadge/TaskConfirmationBadge';
import { useUpdateMyTaskStatus } from '@/features/tasks/hooks/useUpdateMyTaskStatus';
import type { MyTask } from '@/features/tasks/schemas/task.schema';
import { formatTaskCodeShort, getTaskDeadline } from '@/features/tasks/utils/taskDetail';
import { resolveTaskUrgencyDisplay } from '@/features/tasks/utils/taskUrgency';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import homeStyles from '../../styles/homeSection.module.scss';
import styles from './EmployeeTodayTasksSection.module.scss';

interface EmployeeTodayTasksSectionProps {
  items: MyTask[];
  todayLabel: string;
  todayWeekday: string;
}

export function EmployeeTodayTasksSection({
  items,
  todayLabel,
  todayWeekday,
}: EmployeeTodayTasksSectionProps) {
  const updateStatus = useUpdateMyTaskStatus();

  const runStatus = (task: MyTask, staffConfirmation: 'confirmed' | 'finished' | 'decline') => {
    updateStatus.mutate({
      id: task.id,
      staffConfirmation,
      staffNote: task.staffNote ?? '',
    });
  };

  const confirmDecline = (task: MyTask) => {
    Modal.confirm({
      title: 'Từ chối task này?',
      content: 'Trạng thái sẽ đổi thành Từ chối. Bạn vẫn có thể mở lại từ chi tiết task nếu cần.',
      okText: 'Từ chối',
      okButtonProps: { danger: true },
      cancelText: 'Quay lại',
      centered: true,
      onOk: () => runStatus(task, 'decline'),
    });
  };

  return (
    <CardWrapper
      title="Task hôm nay"
      subtitle={`${todayWeekday}, ${todayLabel} · task có thời gian làm việc hôm nay`}
      actions={
        <Link to={ROUTES.PROJECT_TASKS} className={homeStyles.link}>
          Task list
        </Link>
      }
      className={styles.card}
    >
      {items.length === 0 ? (
        <Empty description="Không có task cần làm hôm nay" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div className={classNames(styles.tableWrap, homeStyles.scrollBody)}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Deadline</th>
                <th>Urgency</th>
                <th>Trạng thái</th>
                <th className={styles.actionsCol}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {items.map((task) => {
                const pending = updateStatus.isPending && updateStatus.variables?.id === task.id;
                const urgency = resolveTaskUrgencyDisplay(task);
                const description = task.description?.trim();

                return (
                  <tr key={task.id}>
                    <td>
                      <Link to={buildMyTaskDetailPath(task.id)} className={styles.code}>
                        {formatTaskCodeShort(task.taskCode)}
                      </Link>
                      <p className={styles.taskName}>{task.taskName}</p>
                      {description ? (
                        <Tooltip title={description}>
                          <p className={styles.description}>{description}</p>
                        </Tooltip>
                      ) : null}
                    </td>
                    <td className={styles.muted}>{task.projectName || '—'}</td>
                    <td className={styles.deadline}>
                      {dayjs(getTaskDeadline(task)).format(DATE_FORMAT)}
                    </td>
                    <td>
                      <ProjectUrgencyBadge urgency={urgency} />
                    </td>
                    <td>
                      <TaskConfirmationBadge status={task.staffConfirmation} />
                    </td>
                    <td className={styles.actions}>
                      {task.staffConfirmation === 'not_updated' && (
                        <>
                          <Button
                            size="small"
                            type="primary"
                            loading={pending}
                            disabled={updateStatus.isPending}
                            onClick={() => runStatus(task, 'confirmed')}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="small"
                            danger
                            loading={pending}
                            disabled={updateStatus.isPending}
                            onClick={() => confirmDecline(task)}
                          >
                            Từ chối
                          </Button>
                        </>
                      )}
                      {task.staffConfirmation === 'confirmed' && (
                        <Button
                          size="small"
                          type="primary"
                          className={styles.finishBtn}
                          loading={pending}
                          disabled={updateStatus.isPending}
                          onClick={() => runStatus(task, 'finished')}
                        >
                          Hoàn thành
                        </Button>
                      )}
                      {(task.staffConfirmation === 'finished' ||
                        task.staffConfirmation === 'decline') && (
                        <Link to={buildMyTaskDetailPath(task.id)} className={homeStyles.link}>
                          Chi tiết
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </CardWrapper>
  );
}
