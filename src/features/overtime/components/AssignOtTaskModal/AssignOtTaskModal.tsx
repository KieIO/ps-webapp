import { Alert, Button, Empty, Modal, Radio, Space, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import {
  CONFIRMATION_LABELS,
  type TaskConfirmationStatus,
} from '@/shared/constants/taskConfirmation';
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
  const assignableQuery = useAssignableOtTasks(overtime.id, open);
  const assignMutation = useAssignOtTask();

  const handleClose = () => {
    setSelectedTaskId(null);
    onClose();
  };

  const linkTask = (taskId: string) => {
    assignMutation.mutate(
      { id: overtime.id, payload: { taskId } },
      {
        onSuccess: () => {
          setSelectedTaskId(null);
          onAssigned?.();
          onClose();
        },
      },
    );
  };

  const tasks = assignableQuery.data ?? [];

  return (
    <Modal
      title="Gán task OT"
      open={open}
      onCancel={handleClose}
      width={640}
      destroyOnHidden
      footer={
        tasks.length === 0 && !assignableQuery.isLoading && !assignableQuery.isError ? (
          <Button onClick={handleClose}>Huỷ</Button>
        ) : (
          <Space>
            <Button onClick={handleClose}>Huỷ</Button>
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
            description="Chưa có task phù hợp trong project. Tạo task ở Task management rồi quay lại gán."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
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
  );
}
