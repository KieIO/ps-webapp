import { useMemo, useState, type ReactNode } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  RetweetOutlined,
  StarOutlined,
  SyncOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Divider, Popconfirm, Tooltip } from 'antd';
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
import { RequestRevisionDrawer } from '../RequestRevisionDrawer/RequestRevisionDrawer';
import { UpdateTaskStatusModal } from '../UpdateTaskStatusModal/UpdateTaskStatusModal';
import { useDeleteMyTask } from '../../hooks/useDeleteMyTask';
import { useTaskRevisions } from '../../hooks/useTaskRevisions';
import type { MyTask } from '../../schemas/task.schema';
import {
  canProcessChQueue,
  canProcessCmQueue,
  resolveCreativeDetailPipelineAction,
} from '../../utils/creativePipeline';
import { getTaskListPath } from '../../utils/taskDetail';
import {
  canRequestRevision,
  getRequestRevisionBlockReason,
  isRevisionTask,
  areParentActionsLockedByActiveRevision,
  PARENT_ACTIONS_LOCKED_BY_ACTIVE_REVISION,
  REQUEST_REVISION_BLOCK_MESSAGES,
} from '../../utils/taskRevision';
import { canDeleteTask, canEditTask } from '../../utils/taskStatusLock';
import styles from './TaskDetailActions.module.scss';

interface TaskDetailActionsProps {
  task: MyTask;
  onOpenRevisionTab?: () => void;
}

export function TaskDetailActions({ task, onOpenRevisionTab }: TaskDetailActionsProps) {
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

  const revisionsQuery = useTaskRevisions(task.id, {
    enabled: !isRevisionTask(task),
  });
  const revisionChildren = revisionsQuery.data?.items ?? [];

  const revisionBlockReason = useMemo(
    () => getRequestRevisionBlockReason(task, revisionChildren, canEvaluate),
    [task, revisionChildren, canEvaluate],
  );
  const revisionAllowed = canRequestRevision(task, revisionChildren, canEvaluate);
  const parentLockedByRevision = areParentActionsLockedByActiveRevision(task);
  const parentLockReason = parentLockedByRevision
    ? PARENT_ACTIONS_LOCKED_BY_ACTIVE_REVISION
    : undefined;

  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [evaluateOpen, setEvaluateOpen] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);

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
  const handleCloseRevision = () => setRevisionOpen(false);

  const openAssignCm = pipelineOpen && pipelineAction?.action === 'assign_cm';
  const openAssignStaff = pipelineOpen && pipelineAction?.action === 'assign_staff';
  const openPipelineEdit = pipelineOpen && pipelineAction?.action === 'edit';

  const headReadOnly = !canProcessChQueue(role);
  const managerReadOnly = !canProcessCmQueue(role);

  const showRevisionCta = canEvaluate && !isRevisionTask(task);
  // Only treat "no cached revisions yet" as pending — avoid disable flicker on background refetch.
  const revisionsPending = revisionsQuery.isLoading;
  const revisionDisabledReason =
    revisionBlockReason != null ? REQUEST_REVISION_BLOCK_MESSAGES[revisionBlockReason] : undefined;

  const renderLockedAction = (label: string, icon: ReactNode, onClick: () => void) => (
    <Tooltip
      title={
        parentLockReason ? (
          <span>
            {parentLockReason}{' '}
            {onOpenRevisionTab ? (
              <button
                type="button"
                className={styles.lockTooltipAction}
                onClick={onOpenRevisionTab}
              >
                Mở tab Revision
              </button>
            ) : null}
          </span>
        ) : undefined
      }
    >
      <span className={styles.revisionCtaWrap}>
        <Button icon={icon} onClick={onClick} disabled={parentLockedByRevision} block>
          {label}
        </Button>
      </span>
    </Tooltip>
  );

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
          {renderLockedAction('Update status', <SyncOutlined />, () => setStatusOpen(true))}
          {canEdit
            ? renderLockedAction('Edit task', <EditOutlined />, () => setEditOpen(true))
            : null}
          {canEvaluate
            ? renderLockedAction('Evaluate', <StarOutlined />, () => setEvaluateOpen(true))
            : null}
          {showRevisionCta ? (
            <Tooltip
              title={!revisionAllowed && !revisionsPending ? revisionDisabledReason : undefined}
            >
              <span className={styles.revisionCtaWrap}>
                <Button
                  icon={<RetweetOutlined />}
                  onClick={() => setRevisionOpen(true)}
                  loading={revisionsPending}
                  disabled={!revisionAllowed}
                  block
                >
                  Yêu cầu revision
                </Button>
              </span>
            </Tooltip>
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

      {showRevisionCta ? (
        <RequestRevisionDrawer
          open={revisionOpen}
          task={task}
          revisionChildren={revisionChildren}
          onClose={handleCloseRevision}
        />
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
