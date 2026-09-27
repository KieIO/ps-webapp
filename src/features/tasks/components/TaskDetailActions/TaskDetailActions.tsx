import { useMemo, useState, type ReactNode } from 'react';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  RetweetOutlined,
  StarOutlined,
  SyncOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Divider, Modal, Popconfirm, Tooltip } from 'antd';
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
import { useUpdateMyTaskStatus } from '../../hooks/useUpdateMyTaskStatus';
import type { MyTask } from '../../schemas/task.schema';
import {
  canCmRefuseCreativeAssignment,
  canProcessChQueue,
  canProcessCmQueue,
  canStaffConfirmOrDeclineCreative,
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
import { canChangeTaskStatus, canDeleteTask, canEditTask } from '../../utils/taskStatusLock';
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
  const updateStatus = useUpdateMyTaskStatus();
  const isAssignee = Boolean(userId && task.staff.some((member) => member.userId === userId));

  const pipelineAction = useMemo(
    () => resolveCreativeDetailPipelineAction(task, role, userId),
    [task, role, userId],
  );
  const parentLockedByRevision = areParentActionsLockedByActiveRevision(task);
  const showStaffConfirmDecline = useMemo(
    () => canStaffConfirmOrDeclineCreative(task, userId, role) && !parentLockedByRevision,
    [task, userId, role, parentLockedByRevision],
  );
  const showCmRefuse = useMemo(
    () => canCmRefuseCreativeAssignment(task, userId, role) && !parentLockedByRevision,
    [task, userId, role, parentLockedByRevision],
  );
  /** After Confirm — next step is Finish (OT still needs the status modal for hours). */
  const showStaffFinish =
    isAssignee && task.staffConfirmation === 'confirmed' && !parentLockedByRevision;
  /**
   * Guided CTAs replace the generic status picker so Confirm/Từ chối/Hoàn thành
   * are not duplicated inside Update status.
   */
  const showUpdateStatus =
    canChangeTaskStatus(task, role) &&
    !showStaffConfirmDecline &&
    !showCmRefuse &&
    !showStaffFinish;

  const revisionsQuery = useTaskRevisions(task.id, {
    enabled: !isRevisionTask(task),
  });
  const revisionChildren = revisionsQuery.data?.items ?? [];

  const revisionBlockReason = useMemo(
    () => getRequestRevisionBlockReason(task, revisionChildren, canEvaluate),
    [task, revisionChildren, canEvaluate],
  );
  const revisionAllowed = canRequestRevision(task, revisionChildren, canEvaluate);
  const parentLockReason = parentLockedByRevision
    ? PARENT_ACTIONS_LOCKED_BY_ACTIVE_REVISION
    : undefined;

  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  /** 'finish' = Hoàn thành CTA → modal with note, status locked to finished. */
  const [statusModalMode, setStatusModalMode] = useState<'update' | 'finish'>('update');
  const [evaluateOpen, setEvaluateOpen] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);

  const { mutate: deleteTask, isPending: isDeleting } = useDeleteMyTask();
  const statusPending = updateStatus.isPending && updateStatus.variables?.id === task.id;

  const handleDelete = () => {
    deleteTask(task.id, {
      onSuccess: () => {
        navigate(getTaskListPath(task.taskCategory));
      },
    });
  };

  const runStaffStatus = (staffConfirmation: 'confirmed' | 'decline') => {
    updateStatus.mutate({
      id: task.id,
      staffConfirmation,
      staffNote: task.staffNote ?? '',
    });
  };

  const openFinishModal = () => {
    setStatusModalMode('finish');
    setStatusOpen(true);
  };

  const openUpdateStatusModal = () => {
    setStatusModalMode('update');
    setStatusOpen(true);
  };

  const confirmStaffDecline = () => {
    Modal.confirm({
      title: 'Từ chối task này?',
      content:
        'Task sẽ trả về Creative Manager để giao lại. Bạn vẫn có thể mở chi tiết task sau đó.',
      okText: 'Từ chối',
      okButtonProps: { danger: true },
      cancelText: 'Quay lại',
      centered: true,
      onOk: () => runStaffStatus('decline'),
    });
  };

  const confirmCmRefuse = () => {
    Modal.confirm({
      title: 'Từ chối nhận task này?',
      content: 'Task sẽ trả về hàng chờ Creative Head để giao lại CM.',
      okText: 'Từ chối',
      okButtonProps: { danger: true },
      cancelText: 'Quay lại',
      centered: true,
      onOk: () => runStaffStatus('decline'),
    });
  };

  const handleCloseEdit = () => setEditOpen(false);
  const handleCloseStatus = () => {
    setStatusOpen(false);
    setStatusModalMode('update');
  };
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
          {showStaffConfirmDecline ? (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={statusPending}
                disabled={updateStatus.isPending}
                onClick={() => runStaffStatus('confirmed')}
                block
              >
                Confirm
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                loading={statusPending}
                disabled={updateStatus.isPending}
                onClick={confirmStaffDecline}
                block
              >
                Từ chối
              </Button>
            </>
          ) : null}
          {showStaffFinish ? (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={statusPending}
              disabled={updateStatus.isPending}
              onClick={openFinishModal}
              block
            >
              Hoàn thành
            </Button>
          ) : null}
          {showCmRefuse ? (
            <Button
              danger
              icon={<CloseOutlined />}
              loading={statusPending}
              disabled={updateStatus.isPending}
              onClick={confirmCmRefuse}
              block
            >
              Từ chối nhận
            </Button>
          ) : null}
          {showUpdateStatus
            ? renderLockedAction('Update status', <SyncOutlined />, openUpdateStatusModal)
            : null}
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

      <UpdateTaskStatusModal
        open={statusOpen}
        task={task}
        onClose={handleCloseStatus}
        lockedStatus={statusModalMode === 'finish' ? 'finished' : undefined}
      />

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
