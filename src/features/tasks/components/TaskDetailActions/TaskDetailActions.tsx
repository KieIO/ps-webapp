import { useState } from 'react';
import { DeleteOutlined, EditOutlined, StarOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Divider, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '@/config/permissions';
import { usePermission } from '@/shared/hooks/usePermission';
import { EditHeadTaskModal } from '../EditHeadTaskModal/EditHeadTaskModal';
import { EditTaskModal } from '../EditTaskModal/EditTaskModal';
import { EvaluateTaskModal } from '../EvaluateTaskModal/EvaluateTaskModal';
import { UpdateTaskStatusModal } from '../UpdateTaskStatusModal/UpdateTaskStatusModal';
import { useDeleteMyTask } from '../../hooks/useDeleteMyTask';
import type { MyTask } from '../../schemas/task.schema';
import { getTaskListPath } from '../../utils/taskDetail';
import { canDeleteTask } from '../../utils/taskStatusLock';
import styles from './TaskDetailActions.module.scss';

interface TaskDetailActionsProps {
  task: MyTask;
}

export function TaskDetailActions({ task }: TaskDetailActionsProps) {
  const navigate = useNavigate();
  const { can, role } = usePermission();
  const canEvaluate = can('EVALUATE_TASK');
  const canDelete = canDeleteTask(role);

  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [evaluateOpen, setEvaluateOpen] = useState(false);

  const { mutate: deleteTask, isPending: isDeleting } = useDeleteMyTask();

  const handleDelete = () => {
    deleteTask(task.id, {
      onSuccess: () => {
        navigate(getTaskListPath(task.taskCategory));
      },
    });
  };

  const handleCloseEdit = () => setEditOpen(false);
  const handleCloseStatus = () => setStatusOpen(false);
  const handleCloseEvaluate = () => setEvaluateOpen(false);

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.primaryActions}>
          <Button icon={<SyncOutlined />} onClick={() => setStatusOpen(true)} block>
            Update status
          </Button>
          <Button icon={<EditOutlined />} onClick={() => setEditOpen(true)} block>
            Edit task
          </Button>
          {canEvaluate ? (
            <Button icon={<StarOutlined />} onClick={() => setEvaluateOpen(true)} block>
              Evaluate
            </Button>
          ) : null}
        </div>

        {canDelete ? (
          <>
            <Divider className={styles.divider} />

            <Popconfirm
              title="Delete this task?"
              description="This action cannot be undone."
              okText="Delete"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
              onConfirm={handleDelete}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={isDeleting}
                disabled={isDeleting}
                block
                className={styles.deleteBtn}
              >
                Delete task
              </Button>
            </Popconfirm>
          </>
        ) : null}
      </div>

      {role === ROLES.HEAD ? (
        <EditHeadTaskModal open={editOpen} task={task} onClose={handleCloseEdit} />
      ) : (
        <EditTaskModal
          open={editOpen}
          task={task}
          role={role ?? ROLES.EMPLOYEE}
          canEvaluate={canEvaluate}
          onClose={handleCloseEdit}
        />
      )}

      <UpdateTaskStatusModal open={statusOpen} task={task} onClose={handleCloseStatus} />

      {canEvaluate ? (
        <EvaluateTaskModal open={evaluateOpen} task={task} onClose={handleCloseEvaluate} />
      ) : null}
    </>
  );
}
