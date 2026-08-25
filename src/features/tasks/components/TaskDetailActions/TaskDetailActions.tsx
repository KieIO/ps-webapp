import { useMemo, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  StarOutlined,
  SyncOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Divider, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '@/config/permissions';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { usePermission } from '@/shared/hooks/usePermission';
import { CreativeEditDrawer } from '../creativePipeline/CreativeEditDrawer';
import { CreativeHeadAssignDrawer } from '../creativePipeline/CreativeHeadAssignDrawer';
import { CreativeManagerAssignDrawer } from '../creativePipeline/CreativeManagerAssignDrawer';
import { EditHeadTaskModal } from '../EditHeadTaskModal/EditHeadTaskModal';
import { EditTaskModal } from '../EditTaskModal/EditTaskModal';
import { EvaluateTaskModal } from '../EvaluateTaskModal/EvaluateTaskModal';
import { UpdateTaskStatusModal } from '../UpdateTaskStatusModal/UpdateTaskStatusModal';
import { useDeleteMyTask } from '../../hooks/useDeleteMyTask';
import type { MyTask } from '../../schemas/task.schema';
import {
  canProcessChQueue,
  canProcessCmQueue,
  resolveCreativeDetailPipelineAction,
} from '../../utils/creativePipeline';
import { getTaskListPath } from '../../utils/taskDetail';
import { canDeleteTask, canEditTask } from '../../utils/taskStatusLock';
import styles from './TaskDetailActions.module.scss';

interface TaskDetailActionsProps {
  task: MyTask;
}

export function TaskDetailActions({ task }: TaskDetailActionsProps) {
  const navigate = useNavigate();
  const { can, role } = usePermission();
  const userId = useAppSelector((state) => state.auth.user?.id);
  const canEvaluate = can('EVALUATE_TASK');
  const canEdit = canEditTask(role);
  const canDelete = canDeleteTask(role);

  const pipelineAction = useMemo(
    () => resolveCreativeDetailPipelineAction(task, role, userId),
    [task, role, userId],
  );

  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [evaluateOpen, setEvaluateOpen] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);

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
  const handleClosePipeline = () => setPipelineOpen(false);

  const openAssignCm = pipelineOpen && pipelineAction?.action === 'assign_cm';
  const openAssignStaff = pipelineOpen && pipelineAction?.action === 'assign_staff';
  const openPipelineEdit = pipelineOpen && pipelineAction?.action === 'edit';

  const headReadOnly = !canProcessChQueue(role);
  const managerReadOnly = !canProcessCmQueue(role);

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.primaryActions}>
          {pipelineAction ? (
            <Button
              type="primary"
              icon={<TeamOutlined />}
              onClick={() => setPipelineOpen(true)}
              block
            >
              {pipelineAction.label}
            </Button>
          ) : null}
          <Button icon={<SyncOutlined />} onClick={() => setStatusOpen(true)} block>
            Update status
          </Button>
          {canEdit ? (
            <Button icon={<EditOutlined />} onClick={() => setEditOpen(true)} block>
              Edit task
            </Button>
          ) : null}
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

      {canEdit && role === ROLES.HEAD ? (
        <EditHeadTaskModal open={editOpen} task={task} onClose={handleCloseEdit} />
      ) : null}
      {canEdit && role !== ROLES.HEAD ? (
        <EditTaskModal
          open={editOpen}
          task={task}
          role={role ?? ROLES.EMPLOYEE}
          canEvaluate={canEvaluate}
          onClose={handleCloseEdit}
        />
      ) : null}

      <UpdateTaskStatusModal open={statusOpen} task={task} onClose={handleCloseStatus} />

      {canEvaluate ? (
        <EvaluateTaskModal open={evaluateOpen} task={task} onClose={handleCloseEvaluate} />
      ) : null}

      {/* Mount only the matching drawer to avoid extra capacity/staff fetches. */}
      <CreativeHeadAssignDrawer
        open={openAssignCm}
        task={openAssignCm ? task : null}
        readOnly={headReadOnly}
        onClose={handleClosePipeline}
      />
      <CreativeManagerAssignDrawer
        open={openAssignStaff}
        task={openAssignStaff ? task : null}
        readOnly={managerReadOnly}
        onClose={handleClosePipeline}
      />
      <CreativeEditDrawer
        open={openPipelineEdit}
        task={openPipelineEdit ? task : null}
        onClose={handleClosePipeline}
      />
    </>
  );
}
