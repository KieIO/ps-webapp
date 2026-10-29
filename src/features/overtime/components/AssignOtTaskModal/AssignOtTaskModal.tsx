import { Alert, Button, Empty, Modal, Radio, Space, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import { useProject } from '@/features/projects/hooks/useProjectList';
import {
  CreateTaskDrawer,
  type CreateTaskDrawerPreset,
} from '@/features/tasks/components/CreateTaskDrawer/CreateTaskDrawer';
import {
  CONFIRMATION_LABELS,
  type TaskConfirmationStatus,
} from '@/shared/constants/taskConfirmation';
import { formatOtReasonCategories } from '../../constants';
import { useAssignableOtTasks, useAssignOtTask } from '../../hooks/useOvertime';
import type { OvertimeRecord } from '../../schemas/overtime.schema';
import styles from './AssignOtTaskModal.module.scss';

const staffConfirmationLabel = (value: string): string =>
  CONFIRMATION_LABELS[value as TaskConfirmationStatus] ?? value;

interface AssignOtTaskModalProps {
  open: boolean;
  overtime: OvertimeRecord;
  onClose: () => void;
  onAssigned?: () => void;
}

export function AssignOtTaskModal({ open, overtime, onClose, onAssigned }: AssignOtTaskModalProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const assignableQuery = useAssignableOtTasks(overtime.id, open);
  const assignMutation = useAssignOtTask();
  // Same project create drawer as /tasks/project — resolve PM from project, not OT requester.
  const { data: otProject } = useProject(overtime.project.id);

  const createPreset = useMemo((): CreateTaskDrawerPreset => {
    const categoriesLabel = formatOtReasonCategories(overtime.reasonCategories);
    const projectPm = otProject?.pm;

    return {
      projectName: overtime.project.name,
      projectManager:
        projectPm?.code && projectPm?.name
          ? {
              code: projectPm.code,
              name: projectPm.name,
              userId: projectPm.userId,
            }
          : undefined,
      date: dayjs(overtime.otDate).hour(12).minute(0).second(0),
      description: [
        `OT ${dayjs(overtime.otDate).format(DATE_FORMAT)} · ${overtime.startTime}–${overtime.endTime}`,
        categoriesLabel ? `Lý do: ${categoriesLabel}` : null,
        overtime.reason ? `Mô tả: ${overtime.reason}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
      lockProject: true,
    };
  }, [overtime, otProject?.pm]);

  const handleClose = () => {
    setSelectedTaskId(null);
    setCreateOpen(false);
    onClose();
  };

  const linkTask = (taskId: string) => {
    assignMutation.mutate(
      { id: overtime.id, payload: { taskId } },
      {
        onSuccess: () => {
          setSelectedTaskId(null);
          setCreateOpen(false);
          onAssigned?.();
          onClose();
        },
      },
    );
  };

  const tasks = assignableQuery.data ?? [];

  return (
    <>
      <Modal
        title="Gán task OT"
        open={open && !createOpen}
        onCancel={handleClose}
        width={640}
        destroyOnHidden
        footer={
          tasks.length === 0 && !assignableQuery.isLoading && !assignableQuery.isError ? (
            <Button onClick={handleClose}>Huỷ</Button>
          ) : (
            <Space>
              <Button onClick={handleClose}>Huỷ</Button>
              <Button onClick={() => setCreateOpen(true)}>Tạo task mới</Button>
              <Button
                type="primary"
                disabled={!selectedTaskId}
                loading={assignMutation.isPending}
                onClick={() => {
                  if (selectedTaskId) linkTask(selectedTaskId);
                }}
              >
                Gán task đã chọn
              </Button>
            </Space>
          )
        }
      >
        <div className={styles.body}>
          <Alert
            type="info"
            showIcon
            className={styles.alert}
            message={`${overtime.project.name} · ${overtime.assignee.name} · ${dayjs(overtime.otDate).format(DATE_FORMAT)} ${overtime.startTime}–${overtime.endTime}`}
            description="Chọn task cùng project, chưa hoàn thành, và chưa gán người khác. Task trống sẽ được gán cho staff OT."
          />

          {assignableQuery.isLoading ? (
            <div className={styles.loading}>
              <Spin />
            </div>
          ) : assignableQuery.isError ? (
            <Alert
              type="error"
              showIcon
              message="Không tải được danh sách task"
              action={
                <Button size="small" onClick={() => void assignableQuery.refetch()}>
                  Thử lại
                </Button>
              }
            />
          ) : tasks.length === 0 ? (
            <Empty
              description="Chưa có task phù hợp. Hãy tạo task mới với đầy đủ thông tin."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={() => setCreateOpen(true)}>
                Tạo task mới
              </Button>
            </Empty>
          ) : (
            <Radio.Group
              className={styles.list}
              value={selectedTaskId}
              onChange={(event) => setSelectedTaskId(event.target.value)}
            >
              {tasks.map((task) => (
                <label key={task.id} className={styles.item}>
                  <Radio value={task.id} />
                  <div className={styles.itemBody}>
                    <Typography.Text strong>{task.taskName}</Typography.Text>
                    <Typography.Text type="secondary" className={styles.meta}>
                      {task.taskCode}
                      {task.date ? ` · ${dayjs(task.date).format(DATE_FORMAT)}` : ''}
                      {` · ${task.staffName || 'Chưa gán'}`}
                      {` · ${staffConfirmationLabel(task.staffConfirmation)}`}
                    </Typography.Text>
                  </div>
                </label>
              ))}
            </Radio.Group>
          )}
        </div>
      </Modal>

      <CreateTaskDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        preset={createPreset}
        onCreated={(taskId) => {
          linkTask(taskId);
        }}
      />
    </>
  );
}
